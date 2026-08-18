import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { activateIsland } from '@/lib/continuity';
import { activateIslandSchema } from '@/lib/core/contracts';
import { hasInternalKey, getInternalKey } from '@/lib/security/keys';

/* ------------------------------------------------------------------ */
/* POST /api/continuity/activate — promoción a ACTIVE_ISLAND           */
/* Exige: quórum de señales independientes + lease del primario        */
/* expirado + bastión READY. Devuelve el fencing token de la época     */
/* nueva. La confirmación del operador se registra como señal 'operator'. */
/* ------------------------------------------------------------------ */
export const dynamic = 'force-dynamic';

export const POST = guardedRoute<{ operatorConfirmed?: boolean }>(
  {
    route: 'api:continuity:activate',
    methods: ['POST'],
    rateLimit: 5,
    schema: activateIslandSchema,
    requireNonce: true,
    nonceScope: 'api:continuity:activate',
    zeroTrustApiKeys:
      hasInternalKey('CROWN_API_KEY') && getInternalKey('CROWN_API_KEY')
        ? [getInternalKey('CROWN_API_KEY') as string]
        : undefined,
  },
  async ({ body }) => {
    const result = activateIsland({ operatorConfirmed: Boolean(body.operatorConfirmed) });
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error, mode: result.mode ?? null }, { status: 409 });
    }
    return NextResponse.json({
      ok: true,
      mode: result.mode,
      fencingToken: result.fencingToken,
    });
  },
);
