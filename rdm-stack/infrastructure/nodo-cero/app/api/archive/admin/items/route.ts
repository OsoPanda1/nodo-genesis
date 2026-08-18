import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { createArchiveItemSchema, type CreateArchiveItemInput } from '@/lib/core/contracts/archive';
import { createItem } from '@/lib/archive/archive-service';
import { readRoleHeader } from '@/lib/archive/archive-permissions';

export const runtime = 'nodejs';

/* ------------------------------------------------------------------ */
/* POST /api/archive/admin/items — creación de borrador (archivista)   */
/* ------------------------------------------------------------------ */
export const POST = guardedRoute<CreateArchiveItemInput>(
  {
    route: 'api:archive:admin:items',
    methods: ['POST'],
    rateLimit: 10,
    schema: createArchiveItemSchema,
    cacheControl: 'no-store',
  },
  async ({ req, body }) => {
    const role = readRoleHeader(req.headers);
    if (!role) return NextResponse.json({ ok: false, error: 'Rol editorial no declarado.' }, { status: 403 });
    const actor = { userId: role, role };

    const result = createItem(actor, body);
    if (!result.ok) {
      const status = result.reason === 'SLUG_ALREADY_IN_USE' ? 409 : 403;
      return NextResponse.json({ ok: false, error: result.reason }, { status });
    }
    return NextResponse.json({ ok: true, id: result.item.id, status: result.item.status }, { status: 201 });
  },
);
