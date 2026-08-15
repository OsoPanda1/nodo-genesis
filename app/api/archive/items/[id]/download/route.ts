import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { archiveDownloadSchema, type ArchiveDownloadInput } from '@/lib/core/contracts/archive';
import { requestPublicDownload } from '@/lib/archive/archive-service';

export const runtime = 'nodejs';

/** Extrae el segmento dinámico [id] del pathname. */
function idFromPath(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean);
  return parts[parts.length - 2] ?? '';
}

/* ------------------------------------------------------------------ */
/* POST /api/archive/items/[id]/download — URL firmada del derivado    */
/* ------------------------------------------------------------------ */
export const POST = guardedRoute<ArchiveDownloadInput>(
  {
    route: 'api:archive:items:download',
    methods: ['POST'],
    rateLimit: 15,
    schema: archiveDownloadSchema,
    cacheControl: 'no-store',
  },
  async ({ req, body }) => {
    const id = idFromPath(req.nextUrl.pathname);
    if (!id) return NextResponse.json({ ok: false, error: 'NO_ENCONTRADO' }, { status: 404 });

    const result = await requestPublicDownload(id, body.fileRole);
    if (!result.ok) {
      const status = result.status ?? 400;
      return NextResponse.json({ ok: false, error: result.reason }, { status });
    }
    return NextResponse.json({
      ok: true,
      url: result.url,
      expiresAt: result.expiresAt,
      fileName: result.fileName,
      mimeType: result.mimeType,
    });
  },
);
