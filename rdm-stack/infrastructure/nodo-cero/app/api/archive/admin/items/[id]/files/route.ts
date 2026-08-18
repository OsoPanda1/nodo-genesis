import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { uploadArchiveFileSchema, type UploadArchiveFileInput } from '@/lib/core/contracts/archive';
import { registerFile } from '@/lib/archive/archive-service';
import { readRoleHeader } from '@/lib/archive/archive-permissions';

export const runtime = 'nodejs';

/* ------------------------------------------------------------------ */
/* POST /api/archive/admin/items/[id]/files — registro de un archivo   */
/* ------------------------------------------------------------------ */
/* Tras subir el objeto a Storage (o confirmar la carga demo), este    */
/* endpoint registra el archivo en el expediente con su hash SHA-256.  */
export const POST = guardedRoute<UploadArchiveFileInput>(
  {
    route: 'api:archive:admin:items:files',
    methods: ['POST'],
    rateLimit: 20,
    schema: uploadArchiveFileSchema,
    cacheControl: 'no-store',
  },
  async ({ req, body }) => {
    const role = readRoleHeader(req.headers);
    if (!role) return NextResponse.json({ ok: false, error: 'Rol editorial no declarado.' }, { status: 403 });
    const actor = { userId: role, role };

    const result = registerFile(actor, body);
    if (!result.ok) {
      const status =
        result.reason === 'SHA256_INVALID' ? 400
        : result.reason === 'Pieza no encontrada.' ? 404
        : 403;
      return NextResponse.json({ ok: false, error: result.reason }, { status });
    }
    return NextResponse.json({ ok: true, id: result.file.id, fileRole: result.file.fileRole }, { status: 201 });
  },
);
