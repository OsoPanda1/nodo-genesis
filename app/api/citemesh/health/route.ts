import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { meshStatus } from '@/lib/citemesh';

export const runtime = 'nodejs';

/* ------------------------------------------------------------------ */
/* GET /api/citemesh/health — salud de la malla federada               */
/* ------------------------------------------------------------------ */
/* Requiere scope `citemesh:read`. Reporta nodos, vivos por celda y    */
/* tamaño del ledger.                                                  */
/* ------------------------------------------------------------------ */
export const GET = guardedRoute(
  {
    route: 'api:citemesh:health',
    methods: ['GET'],
    rateLimit: 60,
    json: false,
    identityScopes: ['citemesh:read'],
    cacheControl: 'no-store',
  },
  async () => {
    return NextResponse.json({ ok: true, status: meshStatus() });
  },
);
