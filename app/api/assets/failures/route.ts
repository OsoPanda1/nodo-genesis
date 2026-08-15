import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { listAssets, getAsset } from '@/lib/assets/asset-registry';
import { failureProbability, fleetFailureRisk } from '@/lib/assets/asset-failure-model';

/* Ruta migrada al route-guard único (antes duplicaba enforceTrust
   con assertServerOnly + verifyOrigin + rateLimit). */

export const GET = guardedRoute(
  {
    route: 'api:assets:failures',
    methods: ['GET'],
    rateLimit: 40,
    json: false,
  },
  async ({ req }) => {
    const assets = listAssets();
    const assetId = req.nextUrl.searchParams.get('assetId');
    if (assetId) {
      const asset = getAsset(assetId);
      if (!asset) return NextResponse.json({ ok: false, error: 'Activo no encontrado.' }, { status: 404 });
      return NextResponse.json({ ok: true, failure: failureProbability(asset) });
    }
    return NextResponse.json({ ok: true, fleet: fleetFailureRisk(assets) });
  },
);
