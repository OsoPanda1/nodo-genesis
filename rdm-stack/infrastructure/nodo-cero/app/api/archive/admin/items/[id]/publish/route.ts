import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { archivePublicationSchema, type ArchivePublicationInput } from '@/lib/core/contracts/archive';
import { publishItem } from '@/lib/archive/archive-service';
import { actorFromRequest } from '@/lib/archive/archive-route-actor';

export const runtime = 'nodejs';

function idFromPath(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean);
  return parts[parts.length - 2] ?? '';
}

/* ------------------------------------------------------------------ */
/* POST /api/archive/admin/items/[id]/publish — publicar pieza         */
/* ------------------------------------------------------------------ */
export const POST = guardedRoute<ArchivePublicationInput>(
  {
    route: 'api:archive:admin:items:publish',
    methods: ['POST'],
    rateLimit: 10,
    schema: archivePublicationSchema,
    cacheControl: 'no-store',
  },
  async ({ req, body }) => {
    const actor = actorFromRequest(req.headers);
    if (!actor) return NextResponse.json({ ok: false, error: 'Rol editorial no declarado.' }, { status: 403 });
    const id = idFromPath(req.nextUrl.pathname);
    const result = publishItem(actor, id, body.changeReason);
    if (!result.ok) {
      const status = result.reason === 'Pieza no encontrada.' ? 404 : 409;
      return NextResponse.json({ ok: false, error: result.reason }, { status });
    }
    return NextResponse.json({ ok: true, id: result.item.id, status: result.item.status, publishedAt: result.item.publishedAt });
  },
);
