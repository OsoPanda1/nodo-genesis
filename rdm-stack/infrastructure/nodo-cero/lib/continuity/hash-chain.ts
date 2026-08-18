/* ================================================================== */
/* CONTINUITY — Hash-chain del journal inmutable                      */
/* ================================================================== */
/* Serialización canónica y encadenado SHA-256 para el Emergency       */
/* Journal. El hash encadenado detecta alteración secuencial; NO       */
/* sustituye una firma digital, control de acceso, réplica externa ni  */
/* almacenamiento WORM. Firma checkpoints con clave fuera del nodo.    */
/* ================================================================== */

import crypto from 'node:crypto';

/** Serializa cualquier valor a JSON canónico (claves ordenadas). */
export function stableJson(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(stableJson).join(',')}]`;
  }

  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableJson(record[key])}`)
    .join(',')}}`;
}

export function sha256(input: string | Uint8Array): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

export function calculateJournalHash(input: {
  previousHash: string | null;
  eventId: string;
  idempotencyKey: string;
  payloadHash: string;
  policyVersion: string;
  fencingEpoch: number;
  occurredAt: string;
}): string {
  return sha256(
    stableJson({
      previousHash: input.previousHash ?? null,
      eventId: input.eventId,
      idempotencyKey: input.idempotencyKey,
      payloadHash: input.payloadHash,
      policyVersion: input.policyVersion,
      fencingEpoch: input.fencingEpoch,
      occurredAt: input.occurredAt,
    }),
  );
}

/** Verifica la integridad de una cadena de entradas (order matters). */
export function verifyChain(
  entries: Array<{
    previousHash: string | null;
    entryHash: string;
  }>,
): { ok: boolean; brokenAt?: number } {
  let previous: string | null = null;
  for (let i = 0; i < entries.length; i += 1) {
    const entry = entries[i];
    if (entry.previousHash !== previous) {
      return { ok: false, brokenAt: i };
    }
    previous = entry.entryHash;
  }
  return { ok: true };
}
