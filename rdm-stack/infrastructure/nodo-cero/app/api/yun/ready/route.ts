import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { yunReadyState } from '@/lib/yun';

/* ------------------------------------------------------------------ */
/* GET /api/yun/ready — prontitud operativa del Quantum Semantic Core  */
/* 200 solo si el proveedor criptográfico está disponible y hay al     */
/* menos una federación operativa; 503 en caso contrario (readiness).  */
/* ------------------------------------------------------------------ */
export const dynamic = 'force-dynamic';

export const GET = guardedRoute(
  {
    route: 'api:yun:ready',
    methods: ['GET'],
    rateLimit: 60,
    json: false,
    cacheControl: 'no-store',
  },
  async () => {
    const state = yunReadyState();
    return NextResponse.json(state, { status: state.ready ? 200 : 503 });
  },
);
