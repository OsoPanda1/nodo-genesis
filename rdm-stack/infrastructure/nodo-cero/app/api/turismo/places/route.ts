import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { listPlaces, tourismPlaceQuerySchema } from '@/lib/tourism';

/* Catálogo turístico vivo: atractivos de Real del Monte (GET público). */

export const GET = guardedRoute(
  {
    route: 'api:turismo:places',
    methods: ['GET'],
    rateLimit: 60,
    json: false,
  },
  async ({ req }) => {
    const raw = {
      category: req.nextUrl.searchParams.get('category') ?? undefined,
      confidence: req.nextUrl.searchParams.get('confidence') ?? undefined,
      q: req.nextUrl.searchParams.get('q') ?? undefined,
    };
    const parsed = tourismPlaceQuerySchema.safeParse(raw);
    const places = listPlaces(parsed.success ? parsed.data : {});
    return NextResponse.json({ ok: true, count: places.length, places });
  },
);
