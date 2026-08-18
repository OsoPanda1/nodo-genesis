import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import {
  isCryptoProviderError,
  parseEnvelope,
  validateSemanticPolicy,
  verifyEnvelope,
  yunEnvelopeVerifySchema,
  CRYPTO_PROVIDER_NOT_CONFIGURED,
  type YunEnvelopeVerifyInput,
} from '@/lib/yun';

/* ------------------------------------------------------------------ */
/* POST /api/yun/envelope/verify — verifica un sobre semántico         */
/* Regla AND (fail-closed): clásica AND post-cuántica AND política     */
/* semántica AND hash. Sin proveedor auditado, responde 503 con        */
/* CRYPTO_PROVIDER_NOT_CONFIGURED (nunca acepta).                      */
/* ------------------------------------------------------------------ */

export const POST = guardedRoute<YunEnvelopeVerifyInput>(
  {
    route: 'api:yun:envelope:verify',
    methods: ['POST'],
    rateLimit: 20,
    schema: yunEnvelopeVerifySchema,
    cacheControl: 'no-store',
    identityScopes: ['yun:read'],
  },
  async ({ body }) => {
    let envelope;
    try {
      envelope = parseEnvelope(body.envelope);
    } catch {
      return NextResponse.json({ ok: false, valid: false }, { status: 400 });
    }

    const policy = validateSemanticPolicy(envelope.semantic, envelope);
    if (policy.status !== 'ok') {
      return NextResponse.json({ ok: true, valid: false, status: policy.status });
    }

    try {
      const valid = await verifyEnvelope(envelope);
      return NextResponse.json({ ok: true, valid, status: valid ? 'VALID' : 'INVALID' });
    } catch (error) {
      if (isCryptoProviderError(error) && error.code === CRYPTO_PROVIDER_NOT_CONFIGURED) {
        return NextResponse.json(
          { ok: false, valid: false, error: error.message, code: CRYPTO_PROVIDER_NOT_CONFIGURED },
          { status: 503 },
        );
      }
      throw error;
    }
  },
);
