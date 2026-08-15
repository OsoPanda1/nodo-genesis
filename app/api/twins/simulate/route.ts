import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { getTwinInstance } from '@/lib/twins/twin-store';
import { simulateTwin } from '@/lib/twins/twin-simulator';
import type { TwinInstanceRecord } from '@/lib/twins/twin-types';
import { twinSimulateSchema, type TwinSimulateInput } from '@/lib/twins/api-contracts';

/* Ruta migrada al route-guard único y a contrato zod (twinSimulateSchema). */

export const POST = guardedRoute<TwinSimulateInput>(
  {
    route: 'api:twins:simulate',
    methods: ['POST'],
    rateLimit: 60,
    schema: twinSimulateSchema,
  },
  async ({ body }) => {
    const instance = body.id ? getTwinInstance(body.id) : undefined;
    const candidate: TwinInstanceRecord = instance ?? {
      id: body.id ?? 'sim-unknown',
      modelId: body.modelId ?? 'dtmi:rdm:twin:Building;1',
      name: body.name ?? 'Simulación',
      properties: body.properties,
      telemetry: body.telemetry,
      status: 'healthy',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = simulateTwin(candidate);
    return NextResponse.json({ ok: true, result });
  },
);
