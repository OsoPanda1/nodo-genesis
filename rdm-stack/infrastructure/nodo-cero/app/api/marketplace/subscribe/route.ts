import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { getListing, listSubscriptions } from '@/lib/marketplace/marketplace-store';
import { acquireListing } from '@/lib/marketplace/marketplace-search';
import { subscribeSchema, type SubscribeInput } from '@/lib/marketplace/api-contracts';

/* Ruta migrada al route-guard único y a contrato zod (subscribeSchema). */

export const GET = guardedRoute(
  {
    route: 'api:marketplace:subscribe',
    methods: ['GET'],
    rateLimit: 30,
    json: false,
  },
  async ({ req }) => {
    const licensee = req.nextUrl.searchParams.get('licensee') ?? 'yun-node';
    const subs = listSubscriptions().filter((s) => s.licensee === licensee);
    const withListings = subs
      .map((sub) => {
        const listing = getListing(sub.listingId);
        return listing ? { subscription: sub, listing } : null;
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
    return NextResponse.json({ ok: true, subscriptions: withListings });
  },
);

export const POST = guardedRoute<SubscribeInput>(
  {
    route: 'api:marketplace:subscribe',
    methods: ['POST'],
    rateLimit: 30,
    schema: subscribeSchema,
  },
  async ({ body }) => {
    const result = acquireListing(body.listingId, body.licensee);
    if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    return NextResponse.json({ ...result }, { status: 201 });
  },
);
