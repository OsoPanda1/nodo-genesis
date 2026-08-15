import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { listPublishedItems } from '@/lib/archive/archive-service';

export const runtime = 'nodejs';

/* ------------------------------------------------------------------ */
/* GET /api/archive/items — listado público paginado                   */
/* ------------------------------------------------------------------ */
export const GET = guardedRoute(
  {
    route: 'api:archive:items',
    methods: ['GET'],
    rateLimit: 60,
    json: false,
  },
  async ({ req }) => {
    const limitRaw = Number(req.nextUrl.searchParams.get('limit') ?? 48);
    const offsetRaw = Number(req.nextUrl.searchParams.get('offset') ?? 0);
    const limit = Number.isFinite(limitRaw) ? Math.min(48, Math.max(1, Math.floor(limitRaw))) : 48;
    const offset = Number.isFinite(offsetRaw) ? Math.max(0, Math.floor(offsetRaw)) : 0;

    const items = listPublishedItems(limit, offset);
    return NextResponse.json({ ok: true, total: items.length, items });
  },
);
