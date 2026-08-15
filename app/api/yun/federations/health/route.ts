import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { allFederationHealth } from '@/lib/yun';

/* ------------------------------------------------------------------ */
/* GET /api/yun/federations/health — salud de la heptafederación       */
/* Estado Fed1..Fed7 (HEALTHY/DEGRADED/DOWN) del Quantum Semantic Core. */
/* ------------------------------------------------------------------ */
export const dynamic = 'force-dynamic';

export const GET = guardedRoute(
  {
    route: 'api:yun:federations:health',
    methods: ['GET'],
    rateLimit: 60,
    json: false,
    cacheControl: 'no-store',
    identityScopes: ['hepta:read'],
  },
  async () => {
    return NextResponse.json({ federations: allFederationHealth() });
  },
);
