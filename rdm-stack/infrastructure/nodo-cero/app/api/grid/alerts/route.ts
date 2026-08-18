import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { seedGridLinks, seedPowerNodes, seedWaterNodes } from '@/lib/grid/grid-network';
import { buildGridAlerts } from '@/lib/grid/grid-alerts';

/* Ruta migrada al route-guard único (antes duplicaba enforceTrust
   con assertServerOnly + verifyOrigin + rateLimit). */

export const GET = guardedRoute(
  {
    route: 'api:grid:alerts',
    methods: ['GET'],
    rateLimit: 40,
    json: false,
  },
  async () => {
    const power = seedPowerNodes();
    const water = seedWaterNodes();
    const alerts = buildGridAlerts(power, water, seedGridLinks(power, water));
    return NextResponse.json({
      ok: true,
      alerts,
      critical: alerts.filter((a) => a.level === 'critical').length,
      warning: alerts.filter((a) => a.level === 'warning').length,
    });
  },
);
