import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { listAssets, getAsset, registerAsset } from '@/lib/assets/asset-registry';
import { computeAssetHealth } from '@/lib/assets/asset-health-engine';
import { assetRegisterSchema, type AssetRegisterInput } from '@/lib/core/contracts';

/* Ruta ejemplar migrada al route-guard único (antes duplicaba
   enforceTrust con assertServerOnly + verifyOrigin + rateLimit). */

export const GET = guardedRoute(
  {
    route: 'api:assets:register',
    methods: ['GET'],
    rateLimit: 30,
    json: false,
  },
  async ({ req }) => {
    const id = req.nextUrl.searchParams.get('id');
    if (id) {
      const asset = getAsset(id);
      if (!asset) return NextResponse.json({ ok: false, error: 'Activo no encontrado.' }, { status: 404 });
      return NextResponse.json({ ok: true, asset, health: computeAssetHealth(asset) });
    }
    const assets = listAssets().map((a) => ({ asset: a, health: computeAssetHealth(a) }));
    return NextResponse.json({ ok: true, assets });
  },
);

export const POST = guardedRoute<AssetRegisterInput>(
  {
    route: 'api:assets:register',
    methods: ['POST'],
    rateLimit: 30,
    schema: assetRegisterSchema,
  },
  async ({ body }) => {
    const asset = registerAsset({
      code: body.code ?? `AST-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      name: body.name,
      category: body.category,
      criticality: body.criticality,
      status: body.status,
      condition: body.condition,
      strategy: body.strategy,
      location: body.location ?? { zone: 'Sin asignar' },
      manufacturer: body.manufacturer,
      model: body.model,
      serialNumber: body.serialNumber,
      designLifeYears: body.designLifeYears,
      telemetry: body.telemetry ?? { temperatureC: 0, runtimeHours: 0, loadPercent: 0, lastUpdated: new Date().toISOString() },
      tags: body.tags,
    });

    return NextResponse.json({ ok: true, asset }, { status: 201 });
  },
);
