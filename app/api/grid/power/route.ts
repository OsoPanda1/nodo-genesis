import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { seedPowerNodes } from '@/lib/grid/grid-network';
import { computePowerBalance } from '@/lib/grid/grid-balance';

/* Ruta migrada al route-guard único (antes duplicaba enforceTrust
   con assertServerOnly + verifyOrigin + rateLimit). */

export const GET = guardedRoute(
  {
    route: 'api:grid:power',
    methods: ['GET'],
    rateLimit: 40,
    json: false,
  },
  async () => {
    const power = seedPowerNodes();
    return NextResponse.json({ ok: true, nodes: power, balance: computePowerBalance(power) });
  },
);
