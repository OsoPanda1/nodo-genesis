import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { wireObservabilityToBus } from '@/lib/observability/bridge';
import { sloManager, redMetrics, eventGraph } from '@/lib/observability';
import { guardian } from '@/lib/guardian';
import { verifyInternalKey, hasInternalKey } from '@/lib/security/keys';

export const dynamic = 'force-dynamic';

/* Conecta el fabric de observabilidad al bus YUN (idempotente). */
wireObservabilityToBus();

/* ------------------------------------------------------------------ */
/* GET /api/observability/status — estado del fabric cognitivo YUN     */
/* ------------------------------------------------------------------ */
/* Resumen de SLO/presupuestos de error, métricas RED por ruta, grafo  */
/* causal de eventos y estado del Guardian Kernel.                     */
/* ------------------------------------------------------------------ */
export const GET = guardedRoute(
  {
    route: 'api:observability:status',
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

    return NextResponse.json({
      ok: true,
      slos: sloManager.reports(),
      red: redMetrics.status(),
      graph: eventGraph.summary(),
      guardian: guardian.status(),
      auditTail: guardian.auditTrail(10),
    });
  },
);
