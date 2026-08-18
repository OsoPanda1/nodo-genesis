import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { assertArchiveAction, readRoleHeader } from '@/lib/archive/archive-permissions';
import { listAudit } from '@/lib/archive/archive-repository';

export const runtime = 'nodejs';

/* ------------------------------------------------------------------ */
/* GET /api/archive/admin/audit — auditoría y trazabilidad (admin)     */
/* ------------------------------------------------------------------ */
export const GET = guardedRoute(
  {
    route: 'api:archive:admin:audit',
    methods: ['GET'],
    rateLimit: 20,
    json: false,
  },
  async ({ req }) => {
    const role = readRoleHeader(req.headers);
    const denied = assertArchiveAction(role, 'read_audit');
    if (!denied.ok) return NextResponse.json({ ok: false, error: denied.reason }, { status: 403 });

    const limitRaw = Number(req.nextUrl.searchParams.get('limit') ?? 200);
    const limit = Number.isFinite(limitRaw) ? Math.min(500, Math.max(1, Math.floor(limitRaw))) : 200;

    return NextResponse.json({ ok: true, audit: listAudit(limit) });
  },
);
