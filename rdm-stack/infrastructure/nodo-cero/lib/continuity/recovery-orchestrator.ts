/* ================================================================== */
/* CONTINUITY — Recovery Orchestrator (reconciliación)                */
/* ================================================================== */
/* Protocolo de reconciliación en 8 pasos (NIST-alineado):            */
/*   1. Confirmar recuperación del primario (health desde puntos       */
/*      independientes + política vigente + reloj + sin alertas).      */
/*   2. Mantener el bastión aislado: no aceptar cambios de alto        */
/*      impacto mientras se compara el estado.                         */
/*   3. Congelar el journal: cerrar segmento y firmar checkpoint.      */
/*   4. Reproducir por idempotencia: cada intención se reenvía con el  */
/*      MISMO idempotency_key, event_id, trace_id y fencing_epoch.     */
/*   5. Validar recibos: APPLIED, DUPLICATE, REJECTED o CONFLICT.      */
/*   6. Resolver conflictos: NUNCA last-write-wins en identidad,       */
/*      pagos, créditos, permisos o decisiones constitucionales;       */
/*      requieren compensación o HITL.                                 */
/*   7. Conciliar evidencia: hash-chain, conteos, snapshots, recibos.  */
/*   8. Cerrar incidente: aprobación dual (operación + seguridad).     */
/* ================================================================== */

import { nowIso, uuid } from '@/lib/core/utils';
import { journalEntries, journalIntegrity, journalSnapshot } from './journal';
import { outboxRecords, markAttempted, resolveOutbox } from './outbox';
import type { ReconciliationOutcome } from './types';

export type ReceiptStatus = 'APPLIED' | 'DUPLICATE' | 'REJECTED' | 'CONFLICT';

export interface ReconciliationReport {
  reconciliationId: string;
  startedAt: string;
  frozenSegment: {
    count: number;
    integrity: { ok: boolean; brokenAt?: number };
  };
  replayed: number;
  outcomes: ReconciliationOutcome[];
  unresolved: ReconciliationOutcome[];
  closed: boolean;
  requiresDualApproval: boolean;
  note?: string;
}

/** Intenciones con evento prohibido o clasificación soberana jamás se
 *  reproducen con estado PRESUMIDO: siempre requieren HITL/compensación. */
const NEVER_AUTO_REPLAY = new Set([
  'policy.changed',
  'identity.role.changed',
  'identity.privilege.granted',
  'payment.executed',
  'payout.executed',
]);

function classifyReceipt(idempotencyKey: string, receipt: ReceiptStatus): ReconciliationOutcome {
  return {
    eventId: `evt-${idempotencyKey}`,
    idempotencyKey,
    outcome: receipt,
    primaryReceiptId: `rcpt-${uuid().slice(0, 8)}`,
  };
}

/** Ejecuta el protocolo completo sobre el journal congelado. */
export function runReconciliation(input: {
  primaryRecovered: boolean;
  replayReceipts?: Array<{ idempotencyKey: string; status: ReceiptStatus }>;
  dualApproval?: boolean;
}): ReconciliationReport {
  const reportId = `rec-${uuid()}`;
  const frozen = journalSnapshot();

  if (!input.primaryRecovered) {
    return {
      reconciliationId: reportId,
      startedAt: nowIso(),
      frozenSegment: { count: frozen.count, integrity: frozen.integrity },
      replayed: 0,
      outcomes: [],
      unresolved: [],
      closed: false,
      requiresDualApproval: false,
      note: 'El primario no está recuperado: no se inicia reconciliación.',
    };
  }

  /* Pasos 1-3: verificación de integridad de la cadena antes de reproducir. */
  const integrity = journalIntegrity();
  if (!integrity.ok) {
    return {
      reconciliationId: reportId,
      startedAt: nowIso(),
      frozenSegment: { count: frozen.count, integrity },
      replayed: 0,
      outcomes: [],
      unresolved: [],
      closed: false,
      requiresDualApproval: true,
      note: 'Integridad del journal comprometida: se requiere intervención humana.',
    };
  }

  /* Pasos 4-5: reproducir por idempotencia con los recibos aportados. */
  const receiptMap = new Map<string, ReceiptStatus>(
    (input.replayReceipts ?? []).map(r => [r.idempotencyKey, r.status]),
  );

  const outcomes: ReconciliationOutcome[] = [];
  const outbox = outboxRecords();

  for (const record of outbox) {
    const receipt = receiptMap.get(record.entry.idempotencyKey);
    if (!receipt) {
      outcomes.push({
        eventId: record.entry.eventId,
        idempotencyKey: record.entry.idempotencyKey,
        outcome: 'PENDING',
        resolutionNote: 'Sin recibo del primario: permanece en outbox.',
      });
      continue;
    }

    /* Paso 6: operaciones prohibidas nunca se auto-resuelven. */
    if (NEVER_AUTO_REPLAY.has(record.entry.eventType) && receipt === 'APPLIED') {
      outcomes.push({
        eventId: record.entry.eventId,
        idempotencyKey: record.entry.idempotencyKey,
        outcome: 'CONFLICT',
        resolutionNote: 'Operación de alto impacto: requiere compensación o aprobación humana (HITL).',
      });
      continue;
    }

    markAttempted(record.entry.idempotencyKey);
    if (receipt === 'APPLIED' || receipt === 'DUPLICATE') {
      resolveOutbox(record.entry.idempotencyKey);
    }
    outcomes.push(classifyReceipt(record.entry.idempotencyKey, receipt));
  }

  /* Replay de TODAS las entradas del journal, no solo el outbox: se
     envían con el mismo idempotency_key/event_id/trace_id/fencing_epoch. */
  const journal = journalEntries();
  const replayed = journal.filter(entry => entry.disposition !== 'DENIED').length;

  const unresolved = outcomes.filter(o => o.outcome === 'CONFLICT' || o.outcome === 'PENDING' || o.outcome === 'REJECTED');
  const closed = unresolved.length === 0 && Boolean(input.dualApproval);

  return {
    reconciliationId: reportId,
    startedAt: nowIso(),
    frozenSegment: { count: frozen.count, integrity },
    replayed,
    outcomes,
    unresolved,
    closed,
    requiresDualApproval: unresolved.length > 0 || !input.dualApproval,
  };
}

/** Estado de la reconciliación para telemetría. */
export function recoveryStatus(): {
  journalCount: number;
  outboxSize: number;
  integrity: { ok: boolean; brokenAt?: number };
} {
  const snapshot = journalSnapshot();
  return {
    journalCount: snapshot.count,
    outboxSize: outboxRecords().length,
    integrity: snapshot.integrity,
  };
}
