import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { requestPublicPreview } from '@/lib/archive/archive-service';
import type { ArchiveFileRole } from '@/lib/archive/archive-types';

export const runtime = 'nodejs';

/** Extrae el segmento dinámico [id] del pathname. */
function idFromPath(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean);
  return parts[parts.length - 2] ?? '';
}

/* ------------------------------------------------------------------ */
/* GET /api/archive/items/[id]/preview — URL firmada solo para leer    */
/* ------------------------------------------------------------------ */
/* Entrega una URL firmada del derivado público en modo inline para    */
/* previsualizar (iframes, visor nativo de PDF, transcripción). No     */
/* registra evento de descarga ni requiere permiso de descarga: es la   */
/* consulta en línea que sí admite el material `view_only`.             */
export const GET = guardedRoute(
  {
    route: 'api:archive:items:preview',
    methods: ['GET'],
    rateLimit: 60,
    json: false,
    cacheControl: 'no-store',
  },
  async ({ req }) => {
    const id = idFromPath(req.nextUrl.pathname);
    if (!id) return NextResponse.json({ ok: false, error: 'NO_ENCONTRADO' }, { status: 404 });

    const fileRole = (req.nextUrl.searchParams.get('fileRole') as ArchiveFileRole | null) ?? 'access_copy';
    if (fileRole === 'original') {
      return NextResponse.json({ ok: false, error: 'El original nunca se expone al público.' }, { status: 403 });
    }

    const result = await requestPublicPreview(id, fileRole);
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
