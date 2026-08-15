import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { listStories, tourismStoryQuerySchema, listFoodItems, tourismStats } from '@/lib/tourism';

/* Catálogo turístico vivo: memoria oral, gastronomía y resumen (GET). */

export const GET = guardedRoute(
  {
    route: 'api:turismo:cultura',
    methods: ['GET'],
    rateLimit: 60,
    json: false,
  },
  async ({ req }) => {
    const kind = req.nextUrl.searchParams.get('kind') ?? undefined;
    const parsed = tourismStoryQuerySchema.safeParse({ kind });
    const stories = listStories(parsed.success ? parsed.data : {});
    const foodItems = listFoodItems();
    const stats = tourismStats();
    return NextResponse.json({ ok: true, stories, foodItems, stats });
  },
);
