import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { citemeshRoutePacketSchema, type CitemeshRoutePacket } from '@/lib/citemesh';
import { routePacket } from '@/lib/citemesh';

export const runtime = 'nodejs';

/* ------------------------------------------------------------------ */
/* POST /api/citemesh/route — enrutado de un paquete firmado           */
/* ------------------------------------------------------------------ */
/* Exige scope `citemesh:write`. Enruta hacia la celda destino con     */
/* degradación por failover si la celda no tiene nodo operativo.       */
/* ------------------------------------------------------------------ */
export const POST = guardedRoute<CitemeshRoutePacket>(
  {
    route: 'api:citemesh:route',
    methods: ['POST'],
    rateLimit: 30,
    schema: citemeshRoutePacketSchema,
    identityScopes: ['citemesh:write'],
    cacheControl: 'no-store',
  },
  async ({ body }) => {
    const outcome = routePacket(body);
    return NextResponse.json({ ok: outcome.ok, outcome }, { status: outcome.ok ? 200 : 502 });
  },
);
