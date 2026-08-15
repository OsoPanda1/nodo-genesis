/* ================================================================== */
/* PAGOS — Repositorio durable (Postgres)                              */
/* ================================================================== */
/* Ledger persistente de intenciones, comercios (saldo + secreto) y     */
/* retiros. El secreto del comercio se guarda solo en la DB server-only.*/
/* ================================================================== */

import 'server-only';
import { isPostgresConfigured, sql } from '@/lib/core/persistence';
import type { MerchantAccount, PaymentIntent, PayoutRecord } from './engine';

export async function upsertIntent(p: PaymentIntent): Promise<void> {
  if (!isPostgresConfigured()) return;
  const db = sql();
  await db`
    insert into public.payment_intents
      (ref, type, amount, currency, method, concept, merchant_id, status, idempotency_key, created_at, confirmed_at)
    values (
      ${p.ref}, ${p.type}, ${p.amount}, ${p.currency}, ${p.method}, ${p.concept},
      ${p.merchantId}, ${p.status}, ${p.idempotencyKey ?? null}, ${p.createdAt}, ${p.confirmedAt}
    )
    on conflict (ref) do update set
      status = excluded.status, confirmed_at = excluded.confirmed_at
  `;
}

export async function upsertMerchant(m: MerchantAccount): Promise<void> {
  if (!isPostgresConfigured()) return;
  const db = sql();
  await db`
    insert into public.payment_merchants (merchant_id, balance, secret, updated_at)
    values (${m.merchantId}, ${m.balance}, ${m.secret}, now())
    on conflict (merchant_id) do update set balance = excluded.balance, updated_at = now()
  `;
}

export async function insertPayout(p: PayoutRecord): Promise<void> {
  if (!isPostgresConfigured()) return;
  const db = sql();
  await db`
    insert into public.payment_payouts (id, merchant_id, amount, method, status, created_at)
    values (${p.id}, ${p.merchantId}, ${p.amount}, ${p.method}, ${p.status}, ${p.createdAt})
    on conflict (id) do update set status = excluded.status
  `;
}

export async function loadIntents(): Promise<PaymentIntent[]> {
  if (!isPostgresConfigured()) return [];
  const rows = await sql()<
    Array<{
      ref: string; type: PaymentIntent['type']; amount: string; currency: PaymentIntent['currency'];
      method: PaymentIntent['method']; concept: string | null; merchant_id: string | null;
      status: PaymentIntent['status']; idempotency_key: string | null; created_at: string; confirmed_at: string | null;
    }>
  >`select * from public.payment_intents order by created_at asc limit 10000`;
  return rows.map((r) => ({
    ref: r.ref,
    type: r.type,
    amount: Number(r.amount),
    currency: r.currency,
    method: r.method,
    concept: r.concept ?? '',
    merchantId: r.merchant_id,
    status: r.status,
    idempotencyKey: r.idempotency_key ?? undefined,
    createdAt: Number(r.created_at),
    confirmedAt: r.confirmed_at != null ? Number(r.confirmed_at) : null,
  }));
}

export async function loadMerchants(): Promise<Array<{ account: MerchantAccount }>> {
  if (!isPostgresConfigured()) return [];
  const db = sql();
  const merchants = await db<Array<{ merchant_id: string; balance: string; secret: string | null }>>`
    select * from public.payment_merchants
  `;
  const payouts = await db<
    Array<{ id: string; merchant_id: string; amount: string; method: PayoutRecord['method']; status: PayoutRecord['status']; created_at: string }>
  >`select * from public.payment_payouts`;
  return merchants.map((m) => ({
    account: {
      merchantId: m.merchant_id,
      balance: Number(m.balance),
      secret: m.secret,
      payouts: payouts
        .filter((p) => p.merchant_id === m.merchant_id)
        .map((p) => ({
          id: p.id,
          merchantId: p.merchant_id,
          amount: Number(p.amount),
          method: p.method,
          status: p.status,
          createdAt: Number(p.created_at),
        })),
    },
  }));
}
