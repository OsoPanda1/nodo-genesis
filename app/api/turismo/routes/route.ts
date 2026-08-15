import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { listRoutes, tourismRouteQuerySchema } from '@/lib/tourism';

/* Catálogo turístico vivo: rutas con paradas (GET público). */

export const GET = guardedRoute(
  {
    route: 'api:turismo:routes',
    methods: ['GET'],
    rateLimit: 60,
    json: false,
  },
  async ({ req }) => {
    const raw = {
      difficulty: req.nextUrl.searchParams.get('difficulty') ?? undefined,
      confidence: req.nextUrl.searchParams.get('confidence') ?? undefined,
      q: req.nextUrl.searchParams.get('q') ?? undefined,
    };
    const parsed = tourismRouteQuerySchema.safeParse(raw);
    const routes = listRoutes(parsed.success ? parsed.data : {});
    return NextResponse.json({ ok: true, count: routes.length, routes });
  },
);
