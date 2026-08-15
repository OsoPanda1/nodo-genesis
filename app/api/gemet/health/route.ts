import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { gemetStatus } from '@/lib/gemet';

export const runtime = 'nodejs';

/* ------------------------------------------------------------------ */
/* GET /api/gemet/health — salud del grafo de conocimiento federado    */
/* ------------------------------------------------------------------ */
/* Requiere scope `gemet:read`. Reporta nodos, réplicas y caché.       */
/* ------------------------------------------------------------------ */
export const GET = guardedRoute(
  {
    route: 'api:gemet:health',
    methods: ['GET'],
    rateLimit: 60,
    json: false,
    identityScopes: ['gemet:read'],
    cacheControl: 'no-store',
  },
  async () => {
    return NextResponse.json({ ok: true, status: gemetStatus() });
  },
);
