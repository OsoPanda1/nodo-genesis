/* ================================================================== */
/* PAGOS YUN — Pruebas del motor ledger y contratos                    */
/* ================================================================== */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  resetPaymentsForTests,
  createPayment,
  confirmPayment,
  getPayment,
  requestPayout,
  merchantBalance,
  merchantSecret,
  verifyMerchantSecret,
  ledgerSummary,
} from '@/lib/payments/engine';
import { userPaymentSchema, merchantPayoutSchema } from '@/lib/payments/contracts';

describe('pagos · contratos zod', () => {
  it('acepta una donación válida y aplica el tipo por defecto', () => {
    const parsed = userPaymentSchema.safeParse({ amount: 100, method: 'paypal' });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.type).toBe('donation');
  });

  it('rechaza montos inválidos (cero, negativo, no entero)', () => {
    expect(userPaymentSchema.safeParse({ amount: 0, method: 'card' }).success).toBe(false);
    expect(userPaymentSchema.safeParse({ amount: -5, method: 'card' }).success).toBe(false);
    expect(userPaymentSchema.safeParse({ amount: 10.5, method: 'card' }).success).toBe(false);
  });

  it('rechaza métodos de pago y de retiro no soportados', () => {
    expect(userPaymentSchema.safeParse({ amount: 50, method: 'cheque' }).success).toBe(false);
    expect(merchantPayoutSchema.safeParse({ merchantId: 'abc', amount: 10, method: 'crypto' }).success).toBe(false);
  });

  it('rechaza un retiro de comercio sin identificador', () => {
    expect(merchantPayoutSchema.safeParse({ merchantId: '', amount: 10 }).success).toBe(false);
  });
});

describe('pagos · motor ledger', () => {
  beforeEach(() => resetPaymentsForTests());

  it('crea una intención pendiente con referencia única', () => {
    const a = createPayment({ type: 'donation', amount: 50, method: 'spei' });
    const b = createPayment({ type: 'donation', amount: 25, method: 'paypal' });
    expect(a.ref).not.toBe(b.ref);
    expect(a.status).toBe('pending');
    expect(getPayment(a.ref)?.amount).toBe(50);
  });

  it('confirma un pago y actualiza el ledger', () => {
    const intent = createPayment({ type: 'donation', amount: 120, method: 'card' });
    const confirmed = confirmPayment(intent.ref);
    expect(confirmed?.status).toBe('confirmed');
    expect(getPayment(intent.ref)?.confirmedAt).not.toBeNull();
    expect(ledgerSummary().confirmedPayments).toBe(1);
    expect(ledgerSummary().totalConfirmedAmount).toBe(120);
  });

  it('no confirma dos veces ni confirma referencias inexistentes', () => {
    const intent = createPayment({ type: 'donation', amount: 30, method: 'crypto' });
    confirmPayment(intent.ref);
    expect(confirmPayment(intent.ref)).toBeNull();
    expect(confirmPayment('RDM-NOPE')).toBeNull();
  });

  it('acredita el saldo del comercio en compras confirmadas', () => {
    const intent = createPayment({
      type: 'purchase',
      amount: 300,
      method: 'card',
      merchantId: 'pasteria-cornish',
    });
    confirmPayment(intent.ref);
    expect(merchantBalance('pasteria-cornish')).toBe(300);
  });

  it('solicita un retiro cuando hay saldo y lo rechaza si no alcanza', () => {
    const a = createPayment({ type: 'purchase', amount: 500, method: 'paypal', merchantId: 'tienda-artesanal' });
    const b = createPayment({ type: 'purchase', amount: 500, method: 'paypal', merchantId: 'tienda-artesanal' });
    confirmPayment(a.ref);
    confirmPayment(b.ref);
    expect(merchantBalance('tienda-artesanal')).toBe(1000);

    const ok = requestPayout({ merchantId: 'tienda-artesanal', amount: 400, method: 'spei' });
    expect(ok.ok).toBe(true);
    expect(merchantBalance('tienda-artesanal')).toBe(600);

    const fail = requestPayout({ merchantId: 'tienda-artesanal', amount: 9999, method: 'spei' });
    expect(fail.ok).toBe(false);
    expect(fail.reason).toContain('insuficiente');
  });

  it('sanea conceptos con caracteres peligrosos', () => {
    const intent = createPayment({ type: 'donation', amount: 10, method: 'crypto', concept: '<script>hola</script>' });
    expect(intent.concept).not.toContain('<');
    expect(intent.concept).not.toContain('>');
  });

  it('agrega métricas de tipo en el resumen', () => {
    createPayment({ type: 'donation', amount: 10, method: 'card' });
    createPayment({ type: 'purchase', amount: 20, method: 'card', merchantId: 'cafe-minero' });
    for (const p of ledgerSummary().recent) confirmPayment(p.ref);
    const summary = ledgerSummary();
    expect(summary.byType.donation).toBe(1);
    expect(summary.byType.purchase).toBe(1);
  });
});

describe('pagos · endurecimiento (idempotencia + clave de comercio)', () => {
  beforeEach(() => resetPaymentsForTests());

  it('reutiliza la intención si la idempotencyKey ya se usó (no duplica)', () => {
    const first = createPayment({ type: 'donation', amount: 80, method: 'card', idempotencyKey: 'key-donacion-0001' });
    const retry = createPayment({ type: 'donation', amount: 80, method: 'card', idempotencyKey: 'key-donacion-0001' });
    expect(retry.ref).toBe(first.ref);
    expect(ledgerSummary().totalPayments).toBe(1);
  });

  it('distingue claves de idempotencia distintas', () => {
    const a = createPayment({ type: 'donation', amount: 80, method: 'card', idempotencyKey: 'key-a-0000000001' });
    const b = createPayment({ type: 'donation', amount: 80, method: 'card', idempotencyKey: 'key-b-0000000001' });
    expect(a.ref).not.toBe(b.ref);
  });

  it('emite una clave secreta única por comercio y la verifica', () => {
    const key = merchantSecret('pasteria-cornish');
    expect(key.startsWith('mk_')).toBe(true);
    expect(verifyMerchantSecret('pasteria-cornish', key)).toBe(true);
    expect(verifyMerchantSecret('pasteria-cornish', 'mk_falsa')).toBe(false);
    expect(verifyMerchantSecret('comercio-inexistente', key)).toBe(false);
  });

  it('rechaza un retiro si la clave de comercio no coincide (anti-IDOR)', () => {
    const a = createPayment({ type: 'purchase', amount: 300, method: 'card', merchantId: 'tienda-artesanal' });
    const b = createPayment({ type: 'purchase', amount: 200, method: 'card', merchantId: 'tienda-artesanal' });
    confirmPayment(a.ref);
    confirmPayment(b.ref);
    expect(merchantBalance('tienda-artesanal')).toBe(500);

    const wrong = requestPayout({ merchantId: 'tienda-artesanal', amount: 100, method: 'spei' }, 'mk_inválida');
    expect(wrong.ok).toBe(false);
    expect(wrong.reason).toContain('inválida');
    expect(merchantBalance('tienda-artesanal')).toBe(500);

    const right = requestPayout({ merchantId: 'tienda-artesanal', amount: 100, method: 'spei' }, merchantSecret('tienda-artesanal'));
    expect(right.ok).toBe(true);
    expect(merchantBalance('tienda-artesanal')).toBe(400);
  });
});
