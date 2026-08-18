import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { listAssets } from '@/lib/assets/asset-registry';
import { computeApmScore } from '@/lib/assets/asset-apm-score';
import { generateWorkOrders, workOrderStats } from '@/lib/assets/asset-work-orders';

/* Ruta migrada al route-guard único (antes duplicaba enforceTrust
   con assertServerOnly + verifyOrigin + rateLimit). */

export const GET = guardedRoute(
  {
    route: 'api:assets:score',
    methods: ['GET'],
    rateLimit: 40,
    json: false,
  },
  async () => {
    const assets = listAssets();
    const score = computeApmScore(assets);
    const orders = generateWorkOrders(assets);
    return NextResponse.json({
      ok: true,
      score,
      workOrders: orders,
      workOrderStats: workOrderStats(orders),
    });
  },
);
