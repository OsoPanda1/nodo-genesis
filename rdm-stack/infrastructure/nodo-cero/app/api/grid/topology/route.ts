import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { seedGridLinks, seedPowerNodes, seedWaterNodes } from '@/lib/grid/grid-network';

/* Ruta migrada al route-guard único (antes duplicaba enforceTrust con
   assertServerOnly + verifyOrigin + rateLimit). */

export const GET = guardedRoute(
  {
    route: 'api:grid:topology',
    methods: ['GET'],
    rateLimit: 40,
    json: false,
  },
  async () => {
    const power = seedPowerNodes();
    const water = seedWaterNodes();
    return NextResponse.json({ ok: true, nodes: [...power, ...water], links: seedGridLinks(power, water) });
  },
);
