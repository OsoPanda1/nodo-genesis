import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { listAssets } from '@/lib/assets/asset-registry';
import { assetHealthSummary } from '@/lib/assets/asset-health-engine';

/* Ruta migrada al route-guard único (antes duplicaba enforceTrust
   con assertServerOnly + verifyOrigin + rateLimit). */

export const GET = guardedRoute(
  {
    route: 'api:assets:health',
    methods: ['GET'],
    rateLimit: 40,
    json: false,
  },
  async () => {
    return NextResponse.json({ ok: true, health: assetHealthSummary(listAssets()) });
  },
);
