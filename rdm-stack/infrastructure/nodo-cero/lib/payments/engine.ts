/* ================================================================== */
/* PAGOS YUN — Motor ledger del territorio                             */
/* ================================================================== */
/* Registro en memoria (server-only) de intenciones de pago y saldos   */
/* de comercios. Emite eventos al bus YUN unificado para que el fabric */
/* cognitivo (observabilidad/guardian) los correlacione.               */
/*                                                                     */
/* En modo demo el asentamiento es instantáneo; la interfaz queda      */
/* lista para conectar un proveedor real (Stripe/PayPal/SPEI).         */
/* ================================================================== */

import { publishEvent } from '@/lib/core/events';
import { constantTimeCompare } from '@/lib/security/trust';
import type { UserPayment, MerchantPayout, PAYMENT_TYPES, PAYMENT_METHODS, CURRENCIES } from './contracts';
import crypto from 'node:crypto';
import { registerHydrator, schedulePersist } from '@/lib/core/persistence';
import { insertPayout, loadIntents, loadMerchants, upsertIntent, upsertMerchant } from './repository';

export type PaymentStatus = 'pending' | 'confirmed' | 'declined';

/** Entrada aceptada por el motor: el schema zod aplica defaults, por lo
 *  que type/currency son opcionales aquí. */
export type CreatePaymentInput = Omit<UserPayment, 'currency' | 'type'> &
  Partial<Pick<UserPayment, 'currency' | 'type'>>;

export interface PaymentIntent {
  ref: string;
  type: (typeof PAYMENT_TYPES)[number];
  amount: number;
  currency: (typeof CURRENCIES)[number];
  method: (typeof PAYMENT_METHODS)[number];
  concept: string;
  merchantId: string | null;
  status: PaymentStatus;
  createdAt: number;
  confirmedAt: number | null;
  idempotencyKey?: string;
}

export interface PayoutRecord {
  id: string;
  merchantId: string;
  amount: number;
  method: 'spei' | 'paypal';
  status: 'requested' | 'paid' | 'declined';
  createdAt: number;
}

export interface MerchantAccount {
  merchantId: string;
  balance: number;
  payouts: PayoutRecord[];
  /** Clave secreta del comercio (solo demo en memoria). Permite verificar
   *  que quien solicita un retiro es el dueño del comercio (anti-IDOR). */
  secret: string | null;
}

interface PaymentsStore {
  payments: PaymentIntent[];
  merchants: Map<string, MerchantAccount>;
}

const STORE_KEY = '__rdmPaymentsLedger';

function getStore(): PaymentsStore {
  const g = globalThis as unknown as Record<string, unknown>;
  g[STORE_KEY] ??= { payments: [], merchants: new Map() } satisfies PaymentsStore;
  return g[STORE_KEY] as PaymentsStore;
}

let seq = 0;

function nextRef(): string {
  seq = (seq + 1) % 0xffff;
  return `RDM-${Date.now().toString(36).toUpperCase()}${seq.toString(36).toUpperCase()}`;
}

function newSecret(): string {
  const rand = crypto.randomBytes(24).toString('hex');
  return `mk_${rand}`;
}

function sanitize(concept?: string): string {
  return (concept ?? '').replace(/[<>]/g, '').trim().slice(0, 80);
}

/** Crea una intención de pago (pendiente) y la emite al bus. Idempotente:
 *  si la petición trae idempotencyKey y ya existe una intención con esa
 *  clave, devuelve la existente sin duplicar el cargo. */
export function createPayment(input: CreatePaymentInput): PaymentIntent {
  const store = getStore();

  if (input.idempotencyKey) {
    const existing = store.payments.find(p => p.idempotencyKey === input.idempotencyKey);
    if (existing) return existing;
  }

  const intent: PaymentIntent = {
    ref: nextRef(),
    type: input.type ?? 'donation',
    amount: input.amount,
    currency: input.currency ?? 'MXN',
    method: input.method,
    concept: sanitize(input.concept),
    merchantId: input.merchantId ? input.merchantId.trim().slice(0, 64) : null,
    status: 'pending',
    createdAt: Date.now(),
    confirmedAt: null,
    idempotencyKey: input.idempotencyKey,
  };
  store.payments.push(intent);
  publishEvent({
    type: 'payments.payment.created',
    source: 'yun-payments',
    domain: 'payments',
    severity: 'info',
    data: {
      ref: intent.ref,
      type: intent.type,
      amount: intent.amount,
      currency: intent.currency,
      method: intent.method,
      merchantId: intent.merchantId,
      idempotent: Boolean(input.idempotencyKey),
    },
    meta: { entityId: intent.ref },
  });
  return intent;
}

/** Asienta una intención pendiente (simulado). Si es compra y apunta a
 *  un comercio, acredita el monto al saldo del comercio. */
export function confirmPayment(ref: string): PaymentIntent | null {
  const store = getStore();
  const intent = store.payments.find(p => p.ref === ref);
  if (!intent || intent.status !== 'pending') return null;
  intent.status = 'confirmed';
  intent.confirmedAt = Date.now();

  if (intent.merchantId) {
    const account = merchantAccount(intent.merchantId);
    account.balance += intent.amount;
  }

  publishEvent({
    type: 'payments.payment.confirmed',
    source: 'yun-payments',
    domain: 'payments',
    severity: 'info',
    data: { ref: intent.ref, amount: intent.amount, currency: intent.currency },
    meta: { entityId: intent.ref },
  });
  return intent;
}

export function getPayment(ref: string): PaymentIntent | null {
  return getStore().payments.find(p => p.ref === ref) ?? null;
}

function merchantAccount(merchantId: string): MerchantAccount {
  const store = getStore();
  let account = store.merchants.get(merchantId);
  if (!account) {
    account = { merchantId, balance: 0, payouts: [], secret: newSecret() };
    store.merchants.set(merchantId, account);
  }
  return account;
}

/** Devuelve la clave secreta del comercio (la emite en la primera alta).
 *  El dueño la usa para firmar los retiros (nunca se expone en listados). */
export function merchantSecret(merchantId: string): string {
  return merchantAccount(merchantId).secret ?? '';
}

/** Verifica la clave de un comercio en tiempo constante (anti-IDOR). */
export function verifyMerchantSecret(merchantId: string, secret: string): boolean {
  const account = merchantAccount(merchantId);
  if (!account.secret || !secret) return false;
  return constantTimeCompare(account.secret, secret);
}

export function merchantBalance(merchantId: string): number {
  return getStore().merchants.get(merchantId)?.balance ?? 0;
}

/** Solicita un retiro de saldo al comercio (no excede el saldo). Si se
 *  provee `merchantSecret`, exige que coincida con la clave del comercio
 *  (previene retirar saldo ajeno por adivinar el merchantId). */
export function requestPayout(input: MerchantPayout, secret?: string): { ok: boolean; reason?: string; payout?: PayoutRecord } {
  const account = merchantAccount(input.merchantId);
  if (secret !== undefined && !verifyMerchantSecret(input.merchantId, secret)) {
    return { ok: false, reason: 'Clave de comercio inválida.' };
  }
  if (account.balance < input.amount) {
    return { ok: false, reason: 'Saldo insuficiente.' };
  }
  account.balance -= input.amount;
  const payout: PayoutRecord = {
    id: `PO-${Date.now().toString(36)}${(seq = (seq + 1) % 0xffff).toString(36)}`,
    merchantId: input.merchantId,
    amount: input.amount,
    method: input.method,
    status: 'requested',
    createdAt: Date.now(),
  };
  account.payouts.push(payout);
  publishEvent({
    type: 'payments.payout.requested',
    source: 'yun-payments',
    domain: 'payments',
    severity: 'info',
    data: { id: payout.id, merchantId: payout.merchantId, amount: payout.amount, method: payout.method },
    meta: { entityId: payout.id },
  });
  return { ok: true, payout };
}

/** Resumen agregado para el monitor y el panel de administración. */
export function ledgerSummary() {
  const store = getStore();
  const confirmed = store.payments.filter(p => p.status === 'confirmed');
  const byType: Record<string, number> = {};
  for (const p of confirmed) byType[p.type] = (byType[p.type] ?? 0) + 1;
  return {
    totalPayments: store.payments.length,
    confirmedPayments: confirmed.length,
    totalConfirmedAmount: confirmed.reduce((acc, p) => acc + p.amount, 0),
    pendingPayments: store.payments.length - confirmed.length,
    byType,
    merchants: store.merchants.size,
    totalMerchantBalance: [...store.merchants.values()].reduce((acc, m) => acc + m.balance, 0),
    recent: store.payments.slice(-8).reverse().map(p => ({
      ref: p.ref,
      type: p.type,
      amount: p.amount,
      currency: p.currency,
      method: p.method,
      status: p.status,
    })),
  };
}

/** Limpia el ledger (uso en pruebas). */
export function resetPaymentsForTests(): void {
  getStore().payments = [];
  getStore().merchants.clear();
}
