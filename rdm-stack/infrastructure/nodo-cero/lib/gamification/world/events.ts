/* ================================================================== */
/* GAMIFICATION YUN — World Runtime · Puente a bus YUN + Isabella     */
/* ================================================================== */
/* Cada adjudicación / propuesta se publica al bus YUN y se registra  */
/* en la memoria territorial de Isabella (MNEMOS). La memoria no debe */
/* bloquear el flujo del runtime.                                     */
/* ================================================================== */

import { publishEvent } from '@/lib/core/events';
import { uuid } from '@/lib/core/utils';
import { addMemoryItem } from '@/lib/isabella/memory';
import type { WorldEventResult, WorldProposalRecord } from './contracts';

export function recordWorldAdjudication(input: {
  result: WorldEventResult;
  actorId: string;
  eventType: string;
}): void {
  const { result, actorId, eventType } = input;

  publishEvent({
    type: `world.${eventType}.${result.outcome}`,
    domain: 'gameplay',
    traceId: uuid(),
    source: 'yun-world-runtime',
    severity: result.accepted ? 'info' : 'warning',
    data: {
      outcome: result.outcome,
      eventId: result.eventId,
      sessionId: result.sessionId,
      worldId: result.worldId,
      worldRevision: result.worldRevision,
      effects: result.effects,
      reason: result.reason,
      actorId,
    },
    meta: { entityId: result.sessionId },
  });

  try {
    addMemoryItem({
      scope: 'territorial',
      content: `world-event:${eventType}:${result.outcome}:${result.effects.map((e) => e.kind).join(',') || 'none'}`,
      tags: ['world-runtime', 'gamificacion', eventType, result.outcome],
      relevance: result.accepted ? 0.6 : 0.4,
      actorId,
      sessionId: result.sessionId,
    });
  } catch {
    /* la memoria no debe bloquear la adjudicación */
  }
}

export function recordWorldProposalEvent(
  proposal: WorldProposalRecord,
  action: 'created' | 'approved' | 'rejected' | 'published',
): void {
  publishEvent({
    type: `world.proposal.${action}`,
    domain: 'gameplay',
    traceId: uuid(),
    source: 'yun-world-runtime',
    severity: action === 'rejected' ? 'warning' : 'info',
    data: {
      proposalId: proposal.proposalId,
      worldId: proposal.worldId,
      origin: proposal.origin,
      source: proposal.provenance.source,
      status: proposal.status,
      intent: proposal.intent.slice(0, 200),
      riskClassification: proposal.riskClassification,
    },
    meta: { entityId: proposal.proposalId },
  });

  try {
    addMemoryItem({
      scope: 'territorial',
      content: `world-proposal:${action}:${proposal.intent.slice(0, 160)}`,
      tags: ['world-runtime', 'proposal', action, proposal.provenance.source],
      relevance: 0.7,
      actorId: proposal.requestedBy,
      sessionId: proposal.proposalId,
    });
  } catch {
    /* no bloquear */
  }
}
