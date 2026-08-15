import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { archiveCollections } from '@/lib/archive/archive-service';

export const runtime = 'nodejs';

/* ------------------------------------------------------------------ */
/* GET /api/archive/collections — colecciones públicas                 */
/* ------------------------------------------------------------------ */
export const GET = guardedRoute(
  {
    route: 'api:archive:collections',
    methods: ['GET'],
    rateLimit: 60,
    json: false,
  },
  async () => {
    const collections = archiveCollections(true).map(c => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      description: c.description,
      coverImagePath: c.coverImagePath,
    }));
    return NextResponse.json({ ok: true, collections });
  },
);
