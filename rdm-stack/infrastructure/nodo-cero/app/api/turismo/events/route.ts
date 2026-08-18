import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { listEvents, tourismEventQuerySchema } from '@/lib/tourism';

/* Catálogo turístico vivo: festividades y eventos (GET público). */

export const GET = guardedRoute(
  {
    route: 'api:turismo:events',
    methods: ['GET'],
    rateLimit: 60,
    json: false,
  },
  async ({ req }) => {
    const raw = {
      category: req.nextUrl.searchParams.get('category') ?? undefined,
      confidence: req.nextUrl.searchParams.get('confidence') ?? undefined,
      upcoming: req.nextUrl.searchParams.get('upcoming') === 'true' ? true : undefined,
      q: req.nextUrl.searchParams.get('q') ?? undefined,
    };
    const parsed = tourismEventQuerySchema.safeParse(raw);
    const events = listEvents(parsed.success ? parsed.data : {});
    return NextResponse.json({ ok: true, count: events.length, events });
  },
);
