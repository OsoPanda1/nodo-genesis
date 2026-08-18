/* ================================================================== */
/* IDENTIDAD — Repositorio durable (Postgres)                          */
/* ================================================================== */
/* Persiste el registro soberano de vecinos y comercios en Postgres.   */
/* Solo se invoca desde write-behind (mutaciones) y desde la           */
/* hidratación de arranque. Degrada a no-op si no hay DB configurada.  */
/* ================================================================== */

import 'server-only';
import { isPostgresConfigured, sql } from '@/lib/core/persistence';
import type { RegisteredUserRecord } from './store';

export async function upsertActor(record: RegisteredUserRecord): Promise<void> {
  if (!isPostgresConfigured()) return;
  const db = sql();
  await db`
    insert into public.identity_actors
      (id, kind, name, email, role, business_name, category, created_at)
    values (
      ${record.id}, ${record.kind}, ${record.name}, ${record.email},
      ${record.role ?? null}, ${record.businessName ?? null}, ${record.category ?? null},
      ${new Date(record.createdAt).toISOString()}
    )
    on conflict (id) do update set
      name = excluded.name,
      role = excluded.role,
      business_name = excluded.business_name,
      category = excluded.category
  `;
}

export async function loadActors(): Promise<RegisteredUserRecord[]> {
  if (!isPostgresConfigured()) return [];
  const db = sql();
  const rows = await db<
    Array<{
      id: string;
      kind: 'user' | 'business';
      name: string;
      email: string;
      role: string | null;
      business_name: string | null;
      category: string | null;
      created_at: string;
    }>
  >`select * from public.identity_actors`;
  return rows.map((r) => ({
    id: r.id,
    kind: r.kind,
    name: r.name,
    email: r.email,
    role: r.role ?? undefined,
    businessName: r.business_name ?? undefined,
    category: r.category ?? undefined,
    createdAt: new Date(r.created_at).getTime(),
  }));
}
