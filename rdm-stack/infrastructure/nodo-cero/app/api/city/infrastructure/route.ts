import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { computeInfrastructureHealth } from '@/lib/city/city-infrastructure-engine';
import { buildCityIocState } from '@/lib/city/city-ioc-state';
import { buildMobilityState, seedTrafficSegments } from '@/lib/city/city-mobility-engine';
import { listIncidents } from '@/lib/city/city-event-bus';

/* Ruta migrada al route-guard único (antes duplicaba enforceTrust
   con assertServerOnly + verifyOrigin + rateLimit). */

export const GET = guardedRoute(
  {
    route: 'api:city:infrastructure',
    methods: ['GET'],
    rateLimit: 40,
    json: false,
  },
  async () => {
    const incidents = listIncidents();
    const ioc = buildCityIocState(incidents);
    const mobility = buildMobilityState(seedTrafficSegments());
    const health = computeInfrastructureHealth({
      energyLoadPercent: ioc.energyLoadPercent,
      waterPressureAlerts: ioc.waterPressureAlerts,
      congestionIndex: mobility.congestionIndex,
      openWorkOrders: ioc.openWorkOrders,
      incidents,
    });

    return NextResponse.json({ ok: true, health, mobility, ioc });
  },
);
