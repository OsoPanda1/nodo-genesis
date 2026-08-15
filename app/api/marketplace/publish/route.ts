import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { publishListing } from '@/lib/marketplace/marketplace-store';
import { publishListingSchema, type PublishListingInput } from '@/lib/core/contracts';
import type { PriceModel } from '@/lib/marketplace/marketplace-types';

/* Ruta ejemplar migrada al route-guard único (antes duplicaba
   enforceTrust con assertServerOnly + verifyOrigin + rateLimit). */

export const POST = guardedRoute<PublishListingInput>(
  {
    route: 'api:marketplace:publish',
    methods: ['POST'],
    rateLimit: 20,
    schema: publishListingSchema,
  },
  async ({ body }) => {
    const listing = publishListing({
      type: body.type,
      title: body.title,
      description: body.description,
      provider: body.provider,
      publisher: body.publisher || body.provider,
      status: body.status,
      price: body.price as unknown as PriceModel,
      tags: body.tags,
      compatibleDomains: body.compatibleDomains,
    });

    return NextResponse.json({ ok: true, listing }, { status: 201 });
  },
);
