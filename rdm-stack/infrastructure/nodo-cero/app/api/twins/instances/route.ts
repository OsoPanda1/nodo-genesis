import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { getTwinInstance, getTwinInstances, upsertTwinInstance } from '@/lib/twins/twin-store';
import { twinInstanceSchema, type TwinInstanceInput } from '@/lib/twins/api-contracts';

/* Ruta migrada al route-guard único y a contrato zod (twinInstanceSchema). */

export const GET = guardedRoute(
  {
    route: 'api:twins:instances',
    methods: ['GET'],
    rateLimit: 40,
    json: false,
  },
  async ({ req }) => {
    const id = req.nextUrl.searchParams.get('id');
    if (id) {
      const instance = getTwinInstance(id);
      return NextResponse.json({ ok: Boolean(instance), instance });
    }
    return NextResponse.json({ ok: true, instances: getTwinInstances() });
  },
);

export const POST = guardedRoute<TwinInstanceInput>(
  {
    route: 'api:twins:instances',
    methods: ['POST'],
    rateLimit: 40,
    schema: twinInstanceSchema,
  },
  async ({ body }) => {
    const instance = {
      id: body.id,
      modelId: body.modelId,
      name: body.name,
      externalRef: body.externalRef,
      lat: body.lat,
      lng: body.lng,
      properties: body.properties,
      telemetry: body.telemetry,
      status: body.status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    upsertTwinInstance(instance);
    return NextResponse.json({ ok: true, instance });
  },
);
