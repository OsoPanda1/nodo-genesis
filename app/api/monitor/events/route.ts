import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { monitor } from '@/lib/monitoring/monitor';
import type { EventSeverity } from '@/lib/monitoring/events';
import { verifyInternalKey, hasInternalKey } from '@/lib/security/keys';

export const dynamic = 'force-dynamic';

/* ------------------------------------------------------------------ */
/* GET /api/monitor/events?type=&source=&minSeverity=&sinceMs=&limit= */
/* Consulta de eventos correlacionados del sistema.                   */
/* ------------------------------------------------------------------ */
/* Ruta migrada al route-guard único. La clave interna MONITOR_API_KEY */
/* se conserva dentro del handler (condicionada a hasInternalKey).     */
/* ------------------------------------------------------------------ */
export const GET = guardedRoute(
  {
    route: 'api:monitor:events',
    methods: ['GET'],
    rateLimit: 120,
    json: false,
  },
  async ({ req }) => {
    if (hasInternalKey('MONITOR_API_KEY')) {
      const key = req.headers.get('x-rdm-api-key');
      if (!verifyInternalKey('MONITOR_API_KEY', key)) {
        return NextResponse.json({ ok: false, error: 'Clave de monitor no autorizada.' }, { status: 401 });
      }
    }

    const params = req.nextUrl.searchParams;
    const minSeverity = (params.get('minSeverity') ?? undefined) as EventSeverity | undefined;
    const limit = Math.min(500, Number(params.get('limit') ?? 200));

    const events = monitor.events.query({
      type: params.get('type') ?? undefined,
      source: params.get('source') ?? undefined,
      minSeverity,
      sinceMs: params.get('sinceMs') ? Number(params.get('sinceMs')) : undefined,
      limit,
      correlationId: params.get('correlationId') ?? undefined,
    });

    return NextResponse.json({ ok: true, count: events.length, events });
  },
);
