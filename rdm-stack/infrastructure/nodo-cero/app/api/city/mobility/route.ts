import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { buildMobilityState, seedTrafficSegments } from '@/lib/city/city-mobility-engine';

/* Ruta migrada al route-guard único (antes duplicaba enforceTrust
   con assertServerOnly + verifyOrigin + rateLimit). */

export const GET = guardedRoute(
  {
    route: 'api:city:mobility',
    methods: ['GET'],
    rateLimit: 40,
    json: false,
  },
  async () => {
    return NextResponse.json({ ok: true, mobility: buildMobilityState(seedTrafficSegments()) });
  },
);
