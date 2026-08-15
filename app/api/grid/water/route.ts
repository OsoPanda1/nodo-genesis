import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { seedWaterNodes } from '@/lib/grid/grid-network';
import { computeWaterBalance } from '@/lib/grid/grid-balance';

/* Ruta migrada al route-guard único (antes duplicaba enforceTrust con
   assertServerOnly + verifyOrigin + rateLimit). */

export const GET = guardedRoute(
  {
    route: 'api:grid:water',
    methods: ['GET'],
    rateLimit: 40,
    json: false,
  },
  async () => {
    const water = seedWaterNodes();
    return NextResponse.json({ ok: true, nodes: water, balance: computeWaterBalance(water) });
  },
);
