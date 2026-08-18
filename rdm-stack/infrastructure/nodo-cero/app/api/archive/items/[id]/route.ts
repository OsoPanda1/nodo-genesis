import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { getPublishedItemById, getPublishedItemBySlug } from '@/lib/archive/archive-service';

export const runtime = 'nodejs';

/** Extrae el segmento dinámico [id] del pathname (guardedRoute no
 *  propaga `params`, así que se deriva de la URL de la petición). */
function idFromPath(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean);
  return parts[parts.length - 1] ?? '';
}

/* ------------------------------------------------------------------ */
/* GET /api/archive/items/[id] — ficha pública (id o slug)             */
/* ------------------------------------------------------------------ */
export const GET = guardedRoute(
  {
    route: 'api:archive:items:byId',
    methods: ['GET'],
    rateLimit: 60,
    json: false,
  },
  async ({ req }) => {
    const id = idFromPath(req.nextUrl.pathname);
    if (!id) return NextResponse.json({ ok: false, error: 'NO_ENCONTRADO' }, { status: 404 });

    const byId = getPublishedItemById(id);
    const bySlug = byId ? null : getPublishedItemBySlug(id);
    const item = byId ?? bySlug;
    if (!item) {
      return NextResponse.json({ ok: false, error: 'NO_ENCONTRADO' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, item });
  },
);
