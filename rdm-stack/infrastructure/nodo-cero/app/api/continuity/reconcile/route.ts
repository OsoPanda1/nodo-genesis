import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { reconcile } from '@/lib/continuity';
import { reconcileSchema, type ReconcileInput } from '@/lib/core/contracts';
import { hasInternalKey, getInternalKey } from '@/lib/security/keys';

/* ------------------------------------------------------------------ */
/* POST /api/continuity/reconcile — reconciliación del incidente       */
/* Protocolo en 8 pasos: NUNCA cierra automáticamente al primer 200.   */
/* Requiere aprobación dual (operación + seguridad) para resolver      */
/* conflictos y cerrar el incidente. Los recibos de replay se validan  */
/* por idempotencia (mismo idempotency_key/event_id/trace_id).         */
/* ------------------------------------------------------------------ */
export const dynamic = 'force-dynamic';

export const POST = guardedRoute<ReconcileInput>(
  {
    route: 'api:continuity:reconcile',
    methods: ['POST'],
    rateLimit: 5,
    schema: reconcileSchema,
    requireNonce: true,
    nonceScope: 'api:continuity:reconcile',
    zeroTrustApiKeys:
      hasInternalKey('CROWN_API_KEY') && getInternalKey('CROWN_API_KEY')
        ? [getInternalKey('CROWN_API_KEY') as string]
        : undefined,
  },
  async ({ body }) => {
    const report = reconcile({
      primaryRecovered: body.primaryRecovered,
      dualApproval: body.dualApproval,
      replayReceipts: body.replayReceipts,
    });
    return NextResponse.json({
      ok: true,
      reconciliationId: report.reconciliationId,
      closed: report.closed,
      requiresDualApproval: report.requiresDualApproval,
      replayed: report.replayed,
      frozenSegment: report.frozenSegment,
      unresolved: report.unresolved,
      note: report.note,
    });
  },
);
