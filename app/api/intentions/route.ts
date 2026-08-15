import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { submitIntent } from '@/lib/continuity';
import { emergencyIntentSchema, type EmergencyIntentInput } from '@/lib/core/contracts';

/* ------------------------------------------------------------------ */
/* POST /api/intentions — registra una intención de dominio            */
/* Decide la disposición según el modo del bastión (fail-closed en     */
/* ACTIVE_ISLAND). Si la disposición es QUEUED, queda en el outbox     */
/* para reconciliar por idempotencia tras recuperar el primario.       */
/* ------------------------------------------------------------------ */
export const dynamic = 'force-dynamic';

export const POST = guardedRoute<EmergencyIntentInput>(
  {
    route: 'api:intentions',
    methods: ['POST'],
    rateLimit: 30,
    schema: emergencyIntentSchema,
  },
  async ({ body }) => {
    const result = submitIntent({
      eventId: body.eventId,
      idempotencyKey: body.idempotencyKey,
      traceId: body.traceId,
      domain: body.domain,
      federationId: body.federationId,
      eventType: body.eventType,
      classification: body.classification,
      payload: body.payload,
      occurredAt: body.occurredAt,
      actorSubjectId: body.actorSubjectId,
    });

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 409 });
    }

    return NextResponse.json({
      ok: true,
      disposition: result.disposition,
      journalEventId: result.journalEventId,
      reconciliationRequired: result.reconciliationRequired,
      mode: result.mode,
    });
  },
);
