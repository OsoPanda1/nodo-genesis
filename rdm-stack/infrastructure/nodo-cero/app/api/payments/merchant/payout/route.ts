import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { merchantPayoutSchema, type MerchantPayout } from '@/lib/payments/contracts';
import { requestPayout, merchantBalance, verifyMerchantSecret } from '@/lib/payments/engine';

export const runtime = 'nodejs';

/* ------------------------------------------------------------------ */
/* POST /api/payments/merchant/payout — retiro de un comercio          */
/* ------------------------------------------------------------------ */
/* Exige la clave secreta del comercio en `x-rdm-merchant-secret` para */
/* impedir retirar saldo ajeno (IDOR): adivinar el merchantId ya no    */
/* basta. Valida el saldo y registra la solicitud de retiro.           */
/* ------------------------------------------------------------------ */
export const POST = guardedRoute<MerchantPayout>(
  {
    route: 'api:payments:merchant:payout',
    methods: ['POST'],
    rateLimit: 10,
    schema: merchantPayoutSchema,
    cacheControl: 'no-store',
  },
  async ({ req, body }) => {
    const secret = req.headers.get('x-rdm-merchant-secret') ?? '';
    if (!verifyMerchantSecret(body.merchantId, secret)) {
      return NextResponse.json(
        { ok: false, error: 'Clave de comercio inválida. Cada retiro debe firmarse con la clave del comercio.' },
        { status: 401 },
      );
    }

    const result = requestPayout(body, secret);
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.reason }, { status: 409 });
    }
    return NextResponse.json({
      ok: true,
      payoutId: result.payout?.id,
      merchantId: result.payout?.merchantId,
      amount: result.payout?.amount,
      method: result.payout?.method,
      status: result.payout?.status,
      balanceRemaining: result.payout ? merchantBalance(result.payout.merchantId) : 0,
    });
  },
);
