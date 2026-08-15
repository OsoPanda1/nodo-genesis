import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { userPaymentSchema, type UserPayment } from '@/lib/payments/contracts';
import { createPayment, confirmPayment, merchantSecret } from '@/lib/payments/engine';

export const runtime = 'nodejs';

/* ------------------------------------------------------------------ */
/* POST /api/payments/checkout — pago de usuario (donación/compra)     */
/* ------------------------------------------------------------------ */
/* Crea la intención de pago validada por contrato zod (con soporte de */
/* idempotencia) y la asienta de forma instantánea (modo demo).        */
/* Devuelve referencia verificable y, en compras, la clave secreta del */
/* comercio que el dueño usará para firmar sus retiros.                */
/* ------------------------------------------------------------------ */
export const POST = guardedRoute<UserPayment>(
  {
    route: 'api:payments:checkout',
    methods: ['POST'],
    rateLimit: 15,
    schema: userPaymentSchema,
    cacheControl: 'no-store',
  },
  async ({ body }) => {
    const intent = createPayment(body);
    const confirmed = confirmPayment(intent.ref);
    const merchantKey = intent.merchantId ? merchantSecret(intent.merchantId) : undefined;
    return NextResponse.json({
      ok: true,
      ref: confirmed?.ref ?? intent.ref,
      status: confirmed?.status ?? intent.status,
      amount: intent.amount,
      currency: intent.currency,
      method: intent.method,
      merchantKey,
      serverTime: Date.now(),
    });
  },
);
