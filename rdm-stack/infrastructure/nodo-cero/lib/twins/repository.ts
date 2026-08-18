/* ================================================================== */
/* GEMELOS DIGITALES — Repositorio durable (Postgres)                  */
/* ================================================================== */
/* Modelos DTDL como documento jsonb; instancias y aristas como filas  */
/* estructuradas (consultables por modelo/estado/relación).           */
/* ================================================================== */

import 'server-only';
import type { JSONValue } from 'postgres';
import { isPostgresConfigured, sql } from '@/lib/core/persistence';
import type { TwinGraphEdge, TwinInstanceRecord, TwinModelRecord } from './twin-types';

export async function upsertModel(model: TwinModelRecord): Promise<void> {
  if (!isPostgresConfigured()) return;
  const db = sql();
  await db`
    insert into public.twin_models (id, data, created_at, updated_at)
    values (${model.id}, ${db.json(model as unknown as JSONValue)}, ${model.createdAt}, ${model.updatedAt})
    on conflict (id) do update set data = excluded.data, updated_at = excluded.updated_at
  `;
}

export async function upsertInstance(i: TwinInstanceRecord): Promise<void> {
  if (!isPostgresConfigured()) return;
  const db = sql();
  await db`
    insert into public.twin_instances
      (id, model_id, name, external_ref, lat, lng, properties, telemetry, status, created_at, updated_at)
    values (
      ${i.id}, ${i.modelId}, ${i.name}, ${i.externalRef ?? null}, ${i.lat ?? null}, ${i.lng ?? null},
      ${db.json(i.properties as unknown as JSONValue)}, ${db.json(i.telemetry as unknown as JSONValue)}, ${i.status}, ${i.createdAt}, ${i.updatedAt}
    )
    on conflict (id) do update set
      name = excluded.name, external_ref = excluded.external_ref,
      lat = excluded.lat, lng = excluded.lng,
      properties = excluded.properties, telemetry = excluded.telemetry,
      status = excluded.status, updated_at = excluded.updated_at
  `;
}

export async function upsertEdge(e: TwinGraphEdge): Promise<void> {
  if (!isPostgresConfigured()) return;
  const db = sql();
  await db`
    insert into public.twin_edges (id, from_id, to_id, kind, weight)
    values (${e.id}, ${e.from}, ${e.to}, ${e.kind}, ${e.weight ?? null})
    on conflict (id) do update set kind = excluded.kind, weight = excluded.weight
  `;
}

export async function loadModels(): Promise<TwinModelRecord[]> {
  if (!isPostgresConfigured()) return [];
  const rows = await sql()<Array<{ data: TwinModelRecord }>>`select data from public.twin_models`;
  return rows.map((r) => r.data);
}

export async function loadInstances(): Promise<TwinInstanceRecord[]> {
  if (!isPostgresConfigured()) return [];
  const rows = await sql()<
    Array<{
      id: string; model_id: string; name: string; external_ref: string | null;
      lat: number | null; lng: number | null; properties: Record<string, unknown>;
      telemetry: Record<string, unknown>; status: TwinInstanceRecord['status'];
      created_at: string; updated_at: string;
    }>
  >`select * from public.twin_instances`;
  return rows.map((r) => ({
    id: r.id,
    modelId: r.model_id,
    name: r.name,
    externalRef: r.external_ref ?? undefined,
    lat: r.lat ?? undefined,
    lng: r.lng ?? undefined,
    properties: r.properties,
    telemetry: r.telemetry,
    status: r.status,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

export async function loadEdges(): Promise<TwinGraphEdge[]> {
  if (!isPostgresConfigured()) return [];
  const rows = await sql()<
    Array<{ id: string; from_id: string; to_id: string; kind: TwinGraphEdge['kind']; weight: number | null }>
  >`select * from public.twin_edges`;
  return rows.map((r) => ({ id: r.id, from: r.from_id, to: r.to_id, kind: r.kind, weight: r.weight ?? undefined }));
}
