import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { listAssets } from '@/lib/assets/asset-registry';
import { maintenancePlan, buildMaintenanceRecommendation } from '@/lib/assets/asset-predictive-maintenance';

/* Ruta migrada al route-guard único (antes duplicaba enforceTrust
   con assertServerOnly + verifyOrigin + rateLimit). */

export const GET = guardedRoute(
  {
    route: 'api:assets:maintenance',
    methods: ['GET'],
    rateLimit: 40,
    json: false,
  },
  async () => {
    const assets = listAssets();
    const plan = maintenancePlan(assets);
    return NextResponse.json({ ok: true, ...plan, recommendations: assets.map(buildMaintenanceRecommendation) });
  },
);
