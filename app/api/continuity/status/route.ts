import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { continuityStatus } from '@/lib/continuity';

/* ------------------------------------------------------------------ */
/* GET /api/continuity/status — estado del Bastión de Emergencia       */
/* Devuelve modo, época, capacidades, quórum del sentinel, lease y     */
/* estado del journal. Punto de lectura para el monitor y el operador. */
/* ------------------------------------------------------------------ */
export const dynamic = 'force-dynamic';

export const GET = guardedRoute(
  {
    route: 'api:continuity:status',
    methods: ['GET'],
    rateLimit: 60,
    json: false,
    cacheControl: 'no-store',
  },
  async () => {
    return NextResponse.json(continuityStatus());
  },
);
