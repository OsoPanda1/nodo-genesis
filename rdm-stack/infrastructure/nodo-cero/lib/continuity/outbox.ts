/* ================================================================== */
/* CONTINUITY — Outbox & Intenciones                                  */
/* ================================================================== */
/* Cola de intenciones registradas durante ACTIVE_ISLAND. El bastión   */
/* NO confirma operaciones: registra intención con idempotencia para   */
/* reconciliar después. "Intención registrada" ≠ "operación exitosa".  */
/* ================================================================== */

import { uuid, nowIso } from '@/lib/core/utils';
import type { EmergencyIntent, JournalEntry } from './types';

export interface OutboxRecord {
  outboxId: string;
  entry: JournalEntry;
  enqueuedAt: string;
  attemptCount: number;
}

const outbox: OutboxRecord[] = [];
const byOutboxId = new Map<string, OutboxRecord>();

export function enqueueIntent(entry: JournalEntry): OutboxRecord {
  if (byOutboxId.has(entry.idempotencyKey)) {
    return byOutboxId.get(entry.idempotencyKey) as OutboxRecord;
  }
  const record: OutboxRecord = {
    outboxId: `out-${uuid()}`,
    entry,
    enqueuedAt: nowIso(),
    attemptCount: 0,
  };
  outbox.push(record);
  byOutboxId.set(entry.idempotencyKey, record);
  return record;
}

export function outboxSize(): number {
  return outbox.length;
}

export function outboxRecords(limit = 200): OutboxRecord[] {
  return outbox.slice(-limit);
}

export function markAttempted(idempotencyKey: string): void {
  const record = byOutboxId.get(idempotencyKey);
  if (record) record.attemptCount += 1;
}

/** Confirma el reenvío al primario (aplica DUPLICATE/APPLIED o elimina). */
export function resolveOutbox(idempotencyKey: string): boolean {
  const record = byOutboxId.get(idempotencyKey);
  if (!record) return false;
  byOutboxId.delete(idempotencyKey);
  const idx = outbox.findIndex(r => r.outboxId === record.outboxId);
  if (idx !== -1) outbox.splice(idx, 1);
  return true;
}

export function resetOutboxForTests(): void {
  outbox.length = 0;
  byOutboxId.clear();
}
