/* ================================================================== */
/* CONTINUITY — Guard de disposición en Modo Isla                     */
/* ================================================================== */
/* Decide qué ocurre con cada intención cuando YUN BE está en modo     */
/* ACTIVE_ISLAND: aceptar, encolar como intención o denegar.           */
/* Fail-closed: ante cualquier duda, se deniega.                       */
/* ================================================================== */

import type { ContinuityState, EmergencyIntent, EmergencyDisposition } from './types';

/** Operaciones de alto impacto: jamás se ejecutan en modo isla. */
const DENY_IN_ISLAND = new Set<string>([
  'policy.changed',
  'identity.role.changed',
  'identity.privilege.granted',
  'payment.executed',
  'payout.executed',
  'deployment.started',
  'migration.applied',
]);

/** Operaciones preservadas como intención idempotente para reconciliar. */
const QUEUE_IN_ISLAND = new Set<string>([
  'commerce.order.requested',
  'knowledge.cell.proposed',
  'federation.state.change.requested',
]);

export function decideEmergencyDisposition(
  state: ContinuityState,
  intent: EmergencyIntent,
): EmergencyDisposition {
  if (state.mode !== 'ACTIVE_ISLAND') return 'ACCEPTED';

  if (DENY_IN_ISLAND.has(intent.eventType)) return 'DENIED';

  if (intent.classification === 'RESTRICTED' || intent.classification === 'SOVEREIGN') {
    return 'DENIED';
  }

  if (QUEUE_IN_ISLAND.has(intent.eventType)) return 'QUEUED';

  /* Defecto: denegado. Nunca se simula normalidad sin evidencia. */
  return 'DENIED';
}

/** Capacidades operativas derivadas del modo (para Isabella/UX). */
export function capabilitiesForMode(mode: ContinuityState['mode']): {
  reads: boolean;
  writes: 'full' | 'queued' | 'denied';
} {
  switch (mode) {
    case 'ACTIVE_ISLAND':
      return { reads: true, writes: 'queued' };
    case 'ISOLATED':
    case 'RECOVERY_PENDING':
    case 'RECONCILING':
      return { reads: true, writes: 'queued' };
    case 'DORMANT':
    case 'READY':
    case 'SUSPECT':
      return { reads: true, writes: 'full' };
  }
}
