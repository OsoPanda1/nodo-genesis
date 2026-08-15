import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { buildCityScorecard, scorecardToKpis } from '@/lib/city/city-scorecard';
import { buildCityIocState } from '@/lib/city/city-ioc-state';
import { listIncidents } from '@/lib/city/city-event-bus';

/* Ruta migrada al route-guard único (antes duplicaba enforceTrust
   con assertServerOnly + verifyOrigin + rateLimit). */

export const GET = guardedRoute(
  {
    route: 'api:city:scorecard',
    methods: ['GET'],
    rateLimit: 40,
    json: false,
  },
  async () => {
    const incidents = listIncidents();
    const iocState = buildCityIocState(incidents);
    const scorecard = buildCityScorecard({ incidents, iocState });

    return NextResponse.json({
      ok: true,
      scorecard,
      kpis: scorecardToKpis(scorecard),
    });
  },
);
