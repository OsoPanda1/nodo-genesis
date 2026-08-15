import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { publishCityEvent, recentCityEvents } from '@/lib/city/city-event-bus';
import { cityEventSchema, type CityEventInput } from '@/lib/city/api-contracts';

/* Ruta migrada al route-guard único y a contrato zod (cityEventSchema). */

export const GET = guardedRoute(
  {
    route: 'api:city:events',
    methods: ['GET'],
    rateLimit: 60,
    json: false,
  },
  async ({ req }) => {
    const limit = Number(req.nextUrl.searchParams.get('limit') ?? 25);
    return NextResponse.json({ ok: true, events: recentCityEvents(Math.min(200, Math.max(1, limit))) });
  },
);

export const POST = guardedRoute<CityEventInput>(
  {
    route: 'api:city:events',
    methods: ['POST'],
    rateLimit: 60,
    schema: cityEventSchema,
  },
  async ({ body }) => {
    const event = publishCityEvent({
      type: body.type,
      domain: body.domain,
      severity: body.severity,
      payload: body.payload,
    });
    return NextResponse.json({ ok: true, event }, { status: 201 });
  },
);
