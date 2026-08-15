import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { isolatePrimary } from '@/lib/continuity';
import { isolatePrimarySchema } from '@/lib/core/contracts';
import { hasInternalKey, getInternalKey } from '@/lib/security/keys';

/* ------------------------------------------------------------------ */
/* POST /api/continuity/isolate-primary — aisla el primario            */
/* Orden firmada (ANUBIS/operador) para transitar a ISOLATED. Evita    */
/* split-brain antes de evaluar quórum de promoción.                   */
/* ------------------------------------------------------------------ */
export const dynamic = 'force-dynamic';

export const POST = guardedRoute<{ reason?: string }>(
  {
    route: 'api:continuity:isolate-primary',
    methods: ['POST'],
    rateLimit: 5,
    schema: isolatePrimarySchema,
    requireNonce: true,
    nonceScope: 'api:continuity:isolate-primary',
    zeroTrustApiKeys:
      hasInternalKey('CROWN_API_KEY') && getInternalKey('CROWN_API_KEY')
        ? [getInternalKey('CROWN_API_KEY') as string]
        : undefined,
  },
  async ({ body }) => {
    const result = isolatePrimary();
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 409 });
    }
    return NextResponse.json({
      ok: true,
      mode: result.mode,
      reason: body.reason ?? 'Aislamiento del primario ordenado por CROWN.',
    });
  },
);
