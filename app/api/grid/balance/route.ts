import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { seedPowerNodes, seedWaterNodes } from '@/lib/grid/grid-network';
import { computePowerBalance, computeWaterBalance } from '@/lib/grid/grid-balance';

/* Ruta migrada al route-guard único (antes duplicaba enforceTrust
   con assertServerOnly + verifyOrigin + rateLimit). */

export const GET = guardedRoute(
  {
    route: 'api:grid:balance',
    methods: ['GET'],
    rateLimit: 40,
    json: false,
  },
  async () => {
    const power = seedPowerNodes();
    const water = seedWaterNodes();
    return NextResponse.json({
      ok: true,
      power: computePowerBalance(power),
      water: computeWaterBalance(water),
    });
  },
);
