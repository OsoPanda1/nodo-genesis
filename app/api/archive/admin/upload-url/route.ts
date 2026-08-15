import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { archiveUploadUrlSchema, type ArchiveUploadUrlInput } from '@/lib/core/contracts/archive';
import { assertArchiveAction, readRoleHeader } from '@/lib/archive/archive-permissions';
import { findItemById } from '@/lib/archive/archive-repository';
import { buildObjectPath, createSignedUploadUrl } from '@/lib/archive/archive-storage';

export const runtime = 'nodejs';

/* ------------------------------------------------------------------ */
/* POST /api/archive/admin/upload-url — URL firmada de carga           */
/* ------------------------------------------------------------------ */
export const POST = guardedRoute<ArchiveUploadUrlInput>(
  {
    route: 'api:archive:admin:upload-url',
    methods: ['POST'],
    rateLimit: 20,
    schema: archiveUploadUrlSchema,
    cacheControl: 'no-store',
  },
  async ({ req, body }) => {
    const role = readRoleHeader(req.headers);
    const denied = assertArchiveAction(role, 'upload_file');
    if (!denied.ok) return NextResponse.json({ ok: false, error: denied.reason }, { status: 403 });

    if (!findItemById(body.itemId)) {
      return NextResponse.json({ ok: false, error: 'Pieza no encontrada.' }, { status: 404 });
    }

    const bucket =
      body.fileRole === 'original' ? 'archive-originals'
      : body.fileRole === 'thumbnail' || body.fileRole === 'access_copy' ? 'archive-public'
      : 'archive-originals';

    const objectPath = buildObjectPath(bucket, body.itemId, body.fileName);
    const signed = await createSignedUploadUrl({
      bucket,
      objectPath,
      mimeType: body.mimeType,
      byteSize: body.byteSize,
    });
    if (!signed.ok) return NextResponse.json({ ok: false, error: signed.reason }, { status: 413 });

    return NextResponse.json({
      ok: true,
      url: signed.url,
      bucket,
      objectPath,
      expiresAt: signed.expiresAt,
    });
  },
);
