/* ================================================================== */
/* CONTINUITY — Emergency Journal (append-only + hash-chain)          */
/* ================================================================== */
/* Journal local inmutable del bastión. Nunca descarta un evento       */
/* aceptado. Cada entrada se encadena con SHA-256 (hash-chain) y se    */
/* preserva la idempotencia (idempotencyKey único). En producción el   */
/* payload se cifra (payload_ciphertext) y los metadatos mínimos       */
/* permiten auditoría y reconciliación sin fugar contenido.            */
/* ================================================================== */

import { uuid, nowIso } from '@/lib/core/utils';
import { calculateJournalHash, sha256, stableJson } from './hash-chain';
import type { EmergencyDisposition, EmergencyIntent, JournalEntry } from './types';

interface AppendOptions {
  policyVersion: string;
  fencingEpoch: number;
  disposition: EmergencyDisposition;
}

const entries: JournalEntry[] = [];
const byIdempotency = new Map<string, JournalEntry>();

export function appendJournalEntry(
  intent: EmergencyIntent,
  options: AppendOptions,
): { entry: JournalEntry; accepted: boolean; reason?: string } {
  if (byIdempotency.has(intent.idempotencyKey)) {
    return { entry: byIdempotency.get(intent.idempotencyKey) as JournalEntry, accepted: false, reason: 'intención duplicada (idempotencia)' };
  }

  const previousHash = entries.length > 0 ? entries[entries.length - 1].entryHash : null;
  const payloadHash = sha256(stableJson(intent.payload));
  const receivedAt = nowIso();

  const entry: JournalEntry = {
    sequenceId: entries.length + 1,
    eventId: intent.eventId,
    idempotencyKey: intent.idempotencyKey,
    traceId: intent.traceId,
    domain: intent.domain,
    eventType: intent.eventType,
    classification: intent.classification,
    payload: intent.payload,
    policyVersion: options.policyVersion,
    fencingEpoch: options.fencingEpoch,
    disposition: options.disposition,
    previousHash,
    entryHash: calculateJournalHash({
      previousHash,
      eventId: intent.eventId,
      idempotencyKey: intent.idempotencyKey,
      payloadHash,
      policyVersion: options.policyVersion,
      fencingEpoch: options.fencingEpoch,
      occurredAt: intent.occurredAt,
    }),
    occurredAt: intent.occurredAt,
    receivedAt,
    actorSubjectId: intent.actorSubjectId,
  };

  entries.push(entry);
  byIdempotency.set(intent.idempotencyKey, entry);
  return { entry, accepted: true };
}

export function journalEntries(limit = 500): JournalEntry[] {
  return entries.slice(-limit);
}

export function journalCount(): number {
  return entries.length;
}

export function journalIntegrity(): { ok: boolean; brokenAt?: number } {
  return verifyJournalChain(entries);
}

export function journalSnapshot(): {
  entries: JournalEntry[];
  count: number;
  integrity: { ok: boolean; brokenAt?: number };
} {
  return {
    entries: [...entries],
    count: entries.length,
    integrity: verifyJournalChain(entries),
  };
}

function verifyJournalChain(list: JournalEntry[]): { ok: boolean; brokenAt?: number } {
  let previous: string | null = null;
  for (let i = 0; i < list.length; i += 1) {
    const entry = list[i];
    if (entry.previousHash !== previous) {
      return { ok: false, brokenAt: i };
    }
    previous = entry.entryHash;
  }
  return { ok: true };
}

export function resetJournalForTests(): void {
  entries.length = 0;
  byIdempotency.clear();
}
