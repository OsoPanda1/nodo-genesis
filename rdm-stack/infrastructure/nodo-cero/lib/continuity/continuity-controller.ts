/* ================================================================== */
/* CONTINUITY — Continuity Controller (estado global del bastión)     */
/* ================================================================== */
/* Orquesta la máquina de estados, el quórum del sentinel, el lease,   */
/* el journal y el recovery. Es la fachada que consumen las rutas API  */
/* y el monitor.                                                       */
/* ================================================================== */

import { nowIso, uuid } from '@/lib/core/utils';
import { YunBeMode, ContinuityState, EmergencyIntent } from './types';
import { canTransition, transitionError } from './state-machine';
import {
  recordSignal,
  hasQuorum,
  independentSignals,
  QUORUM_SUSPECT,
  sentinelStatus,
  resetSignalsForTests,
} from './sentinel';
import {
  promoteEpoch,
  issueFencingToken,
  isValidFencingToken,
  isLeaseActive,
  assumeLeadership,
  heartbeatLease,
  leaseStatus,
  resetLeaseForTests,
} from './lease-manager';
import {
  appendJournalEntry,
  journalSnapshot,
  resetJournalForTests,
} from './journal';
import {
  enqueueIntent,
  outboxSize,
  resetOutboxForTests,
} from './outbox';
import {
  runReconciliation,
  recoveryStatus,
} from './recovery-orchestrator';
import { decideEmergencyDisposition, capabilitiesForMode } from './continuity-guard';

interface RuntimeState {
  mode: YunBeMode;
  instanceId: string;
  policyVersion: string;
  policyDigest: string;
  updatedAt: string;
}

const POLICY_VERSION = '2026.1';
const POLICY_DIGEST_PREFIX = 'sha256:';

let runtime: RuntimeState = {
  mode: 'DORMANT',
  instanceId: `yun-be-${process.env.RENDER_INSTANCE_ID ?? 'nodo-cero'}`,
  policyVersion: POLICY_VERSION,
  policyDigest: `${POLICY_DIGEST_PREFIX}0000000000000000000000000000000000000000000000000000000000000000`,
  updatedAt: nowIso(),
};

export function getContinuityState(): ContinuityState {
  const lease = leaseStatus();
  return {
    mode: runtime.mode,
    epoch: lease.epoch,
    instanceId: runtime.instanceId,
    policyVersion: runtime.policyVersion,
    policyDigest: runtime.policyDigest,
    primaryLastHeartbeatAt: lease.active && lease.leaderInstanceId ? nowIso() : undefined,
    leaseExpiresAt: lease.leaseExpiresAt ? new Date(lease.leaseExpiresAt).toISOString() : undefined,
    lastVerifiedSnapshotAt: journalSnapshot().count > 0 ? journalSnapshot().entries[journalSnapshot().count - 1].receivedAt : undefined,
    updatedAt: runtime.updatedAt,
  };
}

function applyMode(next: YunBeMode): { ok: boolean; error?: string } {
  const err = transitionError(runtime.mode, next);
  if (err) return { ok: false, error: err };
  runtime = { ...runtime, mode: next, updatedAt: nowIso() };
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Ciclo del sentinel: evalúa señales y transiciones autónomas         */
/* ------------------------------------------------------------------ */

export function evaluateSignals(): {
  transition: string | null;
  signals: string[];
} {
  const sources = independentSignals();

  if (runtime.mode === 'DORMANT') {
    if (sources.length >= QUORUM_SUSPECT) applyMode('SUSPECT');
    else if (sources.length === 0) return { transition: null, signals: sources };
  }

  if (runtime.mode === 'SUSPECT' && hasQuorum()) applyMode('ISOLATED');

  return { transition: `mode=${runtime.mode}`, signals: sources };
}

/* ------------------------------------------------------------------ */
/* API pública de operación                                           */
/* ------------------------------------------------------------------ */

/** Registra una señal de fallo desde una fuente externa. */
export function reportFailureSignal(source: Parameters<typeof recordSignal>[0], detail: string): void {
  recordSignal(source, detail);
  evaluateSignals();
}

/** Heartbeat del primario: renueva el lease y vuelve a DORMANT si procede. */
export function primaryHeartbeat(): { ok: boolean; mode: YunBeMode } {
  /* Renueva el lease del primario sin cambiar la época (el epoch solo
     sube con promociones/fencing). */
  heartbeatLease(60_000);
  if (runtime.mode === 'ACTIVE_ISLAND' || runtime.mode === 'ISOLATED' || runtime.mode === 'SUSPECT') {
    applyMode('RECOVERY_PENDING');
  }
  return { ok: true, mode: runtime.mode };
}

/** Promoción controlada a ACTIVE_ISLAND (exige quórum + READY + fencing). */
export function activateIsland(options: { operatorConfirmed?: boolean } = {}): {
  ok: boolean;
  mode?: YunBeMode;
  error?: string;
  fencingToken?: string;
} {
  if (runtime.mode === 'ACTIVE_ISLAND') {
    const token = issueFencingToken(runtime.instanceId);
    return { ok: true, mode: runtime.mode, fencingToken: token?.token };
  }

  if (options.operatorConfirmed) {
    recordSignal('operator', 'Confirmación manual del operador (MFA).');
  }

  const quorum = hasQuorum();
  const leaseActive = isLeaseActive();
  const ready = runtime.mode === 'READY' || runtime.mode === 'DORMANT';

  if (!quorum) {
    return { ok: false, error: 'Sin quórum de señales independientes (mínimo 2). No se promueve.' };
  }
  if (leaseActive) {
    return { ok: false, error: 'El lease del primario sigue activo: no se promueve (evita split-brain).' };
  }
  if (!ready) {
    return { ok: false, error: `El bastión no está READY (modo actual: ${runtime.mode}).` };
  }

  const epoch = promoteEpoch();
  /* El bastión asume el liderazgo de la época nueva (sin subirla de nuevo)
     y así puede emitir su fencing token y rechazar al primario antiguo. */
  assumeLeadership(runtime.instanceId);
  const token = issueFencingToken(runtime.instanceId);

  /* La máquina de estados no permite DORMANT→ACTIVE_ISLAND directo: la
     promoción exige pasar por READY (réplicas y políticas válidas). */
  if (runtime.mode === 'DORMANT') {
    const toReady = applyMode('READY');
    if (!toReady.ok) return { ok: false, error: toReady.error };
  }
  const applied = applyMode('ACTIVE_ISLAND');
  if (!applied.ok) return { ok: false, error: applied.error };
  if (!token) return { ok: false, error: 'No se pudo emitir fencing token (lease inválido).' };

  recordSignal('lease', `Promoción con fencing epoch ${epoch}.`);
  return { ok: true, mode: runtime.mode, fencingToken: token.token };
}

/** Aisla al primario (orden firmada de ANUBIS o del operador). */
export function isolatePrimary(): { ok: boolean; mode?: YunBeMode; error?: string } {
  const applied = applyMode('ISOLATED');
  if (!applied.ok) return { ok: false, error: applied.error };
  return { ok: true, mode: runtime.mode };
}

/** Reanuda el modo normal tras reconciliación (cierre de incidente). */
export function resumeNormal(): { ok: boolean; mode?: YunBeMode; error?: string } {
  const applied = applyMode('DORMANT');
  if (!applied.ok) return { ok: false, error: applied.error };
  return { ok: true, mode: runtime.mode };
}

/* ------------------------------------------------------------------ */
/* Intenciones                                                        */
/* ------------------------------------------------------------------ */

export function submitIntent(intent: EmergencyIntent): {
  ok: boolean;
  disposition?: string;
  journalEventId?: string;
  reconciliationRequired?: boolean;
  mode?: YunBeMode;
  error?: string;
} {
  const state = getContinuityState();
  const disposition = decideEmergencyDisposition(state, intent);

  /* Incluso las denegadas se journalizan (auditoría de denegación). */
  const appended = appendJournalEntry(intent, {
    policyVersion: runtime.policyVersion,
    fencingEpoch: state.epoch,
    disposition,
  });

  if (!appended.accepted) {
    return {
      ok: false,
      error: appended.reason,
      mode: state.mode,
    };
  }

  if (disposition === 'DENIED') {
    return {
      ok: true,
      disposition,
      journalEventId: appended.entry.eventId,
      mode: state.mode,
      error: 'Intención denegada en modo isla (fail-closed). Registrada en el journal.',
    };
  }

  if (disposition === 'QUEUED') {
    enqueueIntent(appended.entry);
  }

  return {
    ok: true,
    disposition,
    journalEventId: appended.entry.eventId,
    reconciliationRequired: disposition === 'QUEUED',
    mode: state.mode,
  };
}

/** Valida el fencing token de un escritor (fail-closed). */
export function verifyWriterFencing(token: string | null | undefined): { ok: boolean; reason?: string } {
  if (!isValidFencingToken(token)) {
    return { ok: false, reason: 'fencing token inválido o de época anterior' };
  }
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Reconciliación                                                     */
/* ------------------------------------------------------------------ */

export function reconcile(input: {
  primaryRecovered: boolean;
  replayReceipts?: Array<{ idempotencyKey: string; status: 'APPLIED' | 'DUPLICATE' | 'REJECTED' | 'CONFLICT' }>;
  dualApproval?: boolean;
}) {
  const report = runReconciliation(input);

  /* Cierre de incidente: la máquina de estados exige pasar por
     RECONCILING antes de volver a DORMANT (audit + aprobación dual). */
  if (report.closed) {
    if (runtime.mode === 'ACTIVE_ISLAND' || runtime.mode === 'ISOLATED' || runtime.mode === 'RECOVERY_PENDING') {
      const toReconciling = applyMode('RECONCILING');
      if (toReconciling.ok) applyMode('DORMANT');
    }
  } else if (report.requiresDualApproval && input.primaryRecovered) {
    applyMode('RECONCILING');
  }

  return report;
}

/* ------------------------------------------------------------------ */
/* Telemetría                                                         */
/* ------------------------------------------------------------------ */

export function continuityStatus() {
  const state = getContinuityState();
  const capabilities = capabilitiesForMode(state.mode);
  return {
    ok: true,
    service: 'yun-be',
    version: '0.1.0',
    mode: state.mode,
    epoch: state.epoch,
    instanceId: state.instanceId,
    policyVersion: state.policyVersion,
    policyDigest: state.policyDigest,
    capabilities,
    sentinel: sentinelStatus(),
    lease: leaseStatus(),
    journal: recoveryStatus(),
    updatedAt: state.updatedAt,
    trace_id: uuid(),
  };
}

export function resetContinuityForTests(): void {
  runtime = {
    mode: 'DORMANT',
    instanceId: `yun-be-test`,
    policyVersion: POLICY_VERSION,
    policyDigest: `${POLICY_DIGEST_PREFIX}0000000000000000000000000000000000000000000000000000000000000000`,
    updatedAt: nowIso(),
  };
  resetSignalsForTests();
  resetLeaseForTests();
  resetJournalForTests();
  resetOutboxForTests();
}
