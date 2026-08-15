import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { yunSemanticCoreStatus } from '@/lib/yun';

/* ------------------------------------------------------------------ */
/* GET /api/yun/status — estado del Quantum Semantic Core              */
/* Devuelve versión, proveedor criptográfico (fail-closed) y contadores */
/* del núcleo.                                                         */
/* ------------------------------------------------------------------ */
export const dynamic = 'force-dynamic';

export const GET = guardedRoute(
  {
    route: 'api:yun:status',
    methods: ['GET'],
    rateLimit: 60,
    json: false,
    cacheControl: 'no-store',
    identityScopes: ['yun:read'],
  },
  async () => {
    return NextResponse.json(yunSemanticCoreStatus());
  },
);
