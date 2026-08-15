import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { buildCityIocState } from '@/lib/city/city-ioc-state';
import { listIncidents, recentCityEvents } from '@/lib/city/city-event-bus';

/* Ruta migrada al route-guard único (antes duplicaba enforceTrust
   con assertServerOnly + verifyOrigin + rateLimit). */

export const GET = guardedRoute(
  {
    route: 'api:city:ioc',
    methods: ['GET'],
    rateLimit: 40,
    json: false,
  },
  async () => {
    const incidents = listIncidents();
    return NextResponse.json({
      ok: true,
      state: buildCityIocState(incidents),
      incidents,
      events: recentCityEvents(12),
    });
  },
);
