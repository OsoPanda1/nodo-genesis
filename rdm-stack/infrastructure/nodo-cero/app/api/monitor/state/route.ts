import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { monitor } from '@/lib/monitoring/monitor';
import { wireMonitorToUnifiedBus } from '@/lib/monitoring/bridge';
import { wireObservabilityToBus } from '@/lib/observability/bridge';
import { verifyInternalKey, hasInternalKey } from '@/lib/security/keys';

export const dynamic = 'force-dynamic';

/* Conecta el bus YUN unificado al correlator del monitor (idempotente):
   los eventos de dominio y de rutas quedan consultables aquí. */
wireMonitorToUnifiedBus();

/* Conecta el bus YUN al fabric de observabilidad (SLO, RED, grafo). */
wireObservabilityToBus();

/* ------------------------------------------------------------------ */
/* GET /api/monitor/state — estado completo del sistema                */
/* Protegida con MONITOR_API_KEY (si está configurada).               */
/* ------------------------------------------------------------------ */
/* Ruta migrada al route-guard único. El guard ahora aplica también    */
/* verifyOrigin (comportamiento intencional). La clave interna         */
/* MONITOR_API_KEY se conserva dentro del handler.                     */
/* ------------------------------------------------------------------ */
export const GET = guardedRoute(
  {
    route: 'api:monitor:state',
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

    const snapshot = monitor.statusSnapshot();
    return NextResponse.json({
      ok: true,
      ...snapshot,
    });
  },
);
