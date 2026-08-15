import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { listListings } from '@/lib/marketplace/marketplace-store';
import { searchListings } from '@/lib/marketplace/marketplace-search';
import { marketplaceSummary } from '@/lib/marketplace/marketplace-license';

/* Ruta migrada al route-guard único (antes duplicaba enforceTrust con
   assertServerOnly + verifyOrigin + rateLimit). */

export const GET = guardedRoute(
  {
    route: 'api:marketplace:offers',
    methods: ['GET'],
    rateLimit: 60,
    json: false,
  },
  async ({ req }) => {
    const params = {
      type: req.nextUrl.searchParams.get('type') ?? undefined,
      status: req.nextUrl.searchParams.get('status') ?? undefined,
      tag: req.nextUrl.searchParams.get('tag') ?? undefined,
      query: req.nextUrl.searchParams.get('query') ?? undefined,
      maxPriceUsd: req.nextUrl.searchParams.get('maxPriceUsd') ? Number(req.nextUrl.searchParams.get('maxPriceUsd')) : undefined,
    };
    return NextResponse.json({
      ok: true,
      offers: searchListings(params),
      summary: marketplaceSummary(listListings()),
    });
  },
);
