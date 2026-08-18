import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { getListing, listListings } from '@/lib/marketplace/marketplace-store';

/* Ruta migrada al route-guard único (antes duplicaba enforceTrust con
   assertServerOnly + verifyOrigin + rateLimit). */

export const GET = guardedRoute(
  {
    route: 'api:marketplace:models',
    methods: ['GET'],
    rateLimit: 60,
    json: false,
  },
  async ({ req }) => {
    const id = req.nextUrl.searchParams.get('id');
    if (id) {
      const listing = getListing(id);
      if (!listing) return NextResponse.json({ ok: false, error: 'Listado no encontrado.' }, { status: 404 });
      return NextResponse.json({ ok: true, listing });
    }
    const type = req.nextUrl.searchParams.get('type');
    const listings = type ? listListings().filter((l) => l.type === type) : listListings();
    return NextResponse.json({ ok: true, listings });
  },
);
