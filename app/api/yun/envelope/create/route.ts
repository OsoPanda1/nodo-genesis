import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import {
  createEnvelope,
  yunEnvelopeCreateSchema,
  type YunEnvelopeCreateInput,
} from '@/lib/yun';

/* ------------------------------------------------------------------ */
/* POST /api/yun/envelope/create — crea un sobre semántico YUN         */
/* Construye el sobre con contexto semántico, hash de integridad       */
/* canónico y contadores. El sellado híbrido se expone en /seal.        */
/* ------------------------------------------------------------------ */

export const POST = guardedRoute<YunEnvelopeCreateInput>(
  {
    route: 'api:yun:envelope:create',
    methods: ['POST'],
    rateLimit: 20,
    schema: yunEnvelopeCreateSchema,
    cacheControl: 'no-store',
    identityScopes: ['yun:write'],
  },
  async ({ body }) => {
    const envelope = await createEnvelope(body);
    return NextResponse.json({ ok: true, envelope }, { status: 201 });
  },
);
