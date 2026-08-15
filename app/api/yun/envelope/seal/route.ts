import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import {
  isCryptoProviderError,
  sealEnvelope,
  yunEnvelopeSealSchema,
  CRYPTO_PROVIDER_NOT_CONFIGURED,
  type YunEnvelopeSealInput,
} from '@/lib/yun';

/* ------------------------------------------------------------------ */
/* POST /api/yun/envelope/seal — sella un sobre semántico YUN          */
/* Cifra el cuerpo (KEM/AEAD) y firma híbrido (clásica + post-cuántica) */
/* con el proveedor auditado. Sin proveedor responde 503 con           */
/* CRYPTO_PROVIDER_NOT_CONFIGURED (fail-closed).                       */
/* ------------------------------------------------------------------ */

export const POST = guardedRoute<YunEnvelopeSealInput>(
  {
    route: 'api:yun:envelope:seal',
    methods: ['POST'],
    rateLimit: 20,
    schema: yunEnvelopeSealSchema,
    cacheControl: 'no-store',
    identityScopes: ['yun:write'],
  },
  async ({ body }) => {
    try {
      const envelope = await sealEnvelope(body);
      return NextResponse.json({ ok: true, envelope }, { status: 201 });
    } catch (error) {
      if (isCryptoProviderError(error) && error.code === CRYPTO_PROVIDER_NOT_CONFIGURED) {
        return NextResponse.json(
          { ok: false, error: error.message, code: CRYPTO_PROVIDER_NOT_CONFIGURED },
          { status: 503 },
        );
      }
      throw error;
    }
  },
);
