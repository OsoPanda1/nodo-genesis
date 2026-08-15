import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import {
  registerSchema,
  type RegisterInput,
  BUSINESS_PLANS,
  PREMIUM_USER_PLAN,
} from '@/lib/identity/contracts';
import { registerUser, registerBusiness, type SubscriptionState } from '@/lib/identity/store';
import { getPayment } from '@/lib/payments/engine';

export const runtime = 'nodejs';

/* ------------------------------------------------------------------ */
/* POST /api/auth/register — alta de vecino o negocio del territorio   */
/* ------------------------------------------------------------------ */
/* Gating server-authoritative: un comercio SÓLO se da de alta y se    */
/* publica si su suscripción (250 MXN/1 mes o 1200 MXN/6 meses) fue     */
/* pagada y verificada contra el ledger. El usuario Premium (129 MXN)   */
/* verifica su pago del mismo modo. Nunca se confía en el cliente.      */
/* ------------------------------------------------------------------ */
export const POST = guardedRoute<RegisterInput>(
  {
    route: 'api:auth:register',
    methods: ['POST'],
    rateLimit: 10,
    schema: registerSchema,
    cacheControl: 'no-store',
  },
  async ({ body }) => {
    /* ---------------- Vecino / usuario ---------------- */
    if (body.kind === 'user') {
      let subscription: SubscriptionState | undefined;

      if (body.premium) {
        const verified = verifyPayment(body.premium.paymentRef, PREMIUM_USER_PLAN.price);
        if (!verified.ok) {
          return NextResponse.json({ ok: false, error: verified.error }, { status: 402 });
        }
        const startedAt = Date.now();
        subscription = {
          plan: 'premium',
          paymentRef: body.premium.paymentRef,
          amount: PREMIUM_USER_PLAN.price,
          months: PREMIUM_USER_PLAN.months,
          startedAt,
          expiresAt: startedAt + PREMIUM_USER_PLAN.months * 30 * 24 * 60 * 60 * 1000,
          status: 'active',
        };
      }

      const result = registerUser(body, subscription);
      if (!result.ok) return NextResponse.json({ ok: false, error: result.reason }, { status: 409 });
      return NextResponse.json(
        { ok: true, kind: 'user', id: result.user.id, premium: result.user.premium },
        { status: 201 },
      );
    }

    /* ---------------- Comercio ---------------- */
    /* Sin suscripción pagada y verificada NO hay alta ni publicación. */
    const plan = BUSINESS_PLANS[body.subscription.plan];
    const verified = verifyPayment(body.subscription.paymentRef, plan.price);
    if (!verified.ok) {
      return NextResponse.json({ ok: false, error: verified.error }, { status: 402 });
    }

    const startedAt = Date.now();
    const subscription: SubscriptionState = {
      plan: body.subscription.plan,
      paymentRef: body.subscription.paymentRef,
      amount: plan.price,
      months: plan.months,
      startedAt,
      expiresAt: startedAt + plan.months * 30 * 24 * 60 * 60 * 1000,
      status: 'active',
    };

    const result = registerBusiness(body, subscription);
    if (!result.ok) return NextResponse.json({ ok: false, error: result.reason }, { status: 409 });
    return NextResponse.json(
      {
        ok: true,
        kind: 'business',
        id: result.user.id,
        published: true,
        plan: subscription.plan,
        expiresAt: subscription.expiresAt,
      },
      { status: 201 },
    );
  },
);

/* Verifica que la referencia de pago exista, esté confirmada, sea de tipo
 * suscripción y cubra al menos el precio del plan. Fail-closed. */
function verifyPayment(ref: string, expectedAmount: number): { ok: true } | { ok: false; error: string } {
  const payment = getPayment(ref);
  if (!payment) return { ok: false, error: 'PAYMENT_NOT_FOUND' };
  if (payment.status !== 'confirmed') return { ok: false, error: 'PAYMENT_NOT_CONFIRMED' };
  if (payment.type !== 'subscription') return { ok: false, error: 'PAYMENT_NOT_SUBSCRIPTION' };
  if (payment.amount < expectedAmount) return { ok: false, error: 'PAYMENT_AMOUNT_MISMATCH' };
  return { ok: true };
}
