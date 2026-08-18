/* ================================================================== */
/* BOOKPI — Registro encadenado SHA-256 (real, node:crypto)           */
/* ================================================================== */
/* Sustituye al pseudoHash FNV-1a decorativo anterior. Cada entrada    */
/* es sellada con SHA-256 del cuerpo canónico + hash previo.          */
/* ================================================================== */

import { createHash } from "node:crypto";
import { BookPIEntry, BookPIWriteRequest } from "../contracts";

/** SHA-256 hex de una cadena. */
export function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

/** Cuerpo canónico de la entrada (orden determinista para el sellado). */
function canonicalBody(entry: Omit<BookPIEntry, "hash" | "prevHash">): string {
  return JSON.stringify({
    id: entry.id,
    type: entry.type,
    source: entry.source,
    domain: entry.domain,
    timestamp: entry.timestamp,
    data: entry.data,
  });
}

export interface SealInput {
  id: string;
  type: string;
  source: string;
  domain: string;
  timestamp: string;
  data: Record<string, unknown>;
  prevHash: string | null;
}

/** Sella una entrada BookPI: hash = sha256(cuerpo + "|" + prevHash). */
export function sealBookPIEntry(input: SealInput): string {
  const body = canonicalBody({
    id: input.id,
    type: input.type,
    source: input.source,
    domain: input.domain,
    timestamp: input.timestamp,
    data: input.data,
  });
  return sha256(`${body}|${input.prevHash ?? "genesis"}`);
}

/** Valida la cadena: cada hash debe coincidir con su cuerpo + previo. */
export function verifyChain(entries: BookPIEntry[]): boolean {
  let prevHash: string | null = null;
  for (const entry of entries) {
    const expected = sealBookPIEntry({
      id: entry.id,
      type: entry.type,
      source: entry.source,
      domain: entry.domain,
      timestamp: entry.timestamp,
      data: entry.data,
      prevHash,
    });
    if (entry.hash !== expected) return false;
    if (entry.prevHash !== prevHash) return false;
    prevHash = entry.hash;
  }
  return true;
}

/** Convierte una escritura BookPI en entrada sellada con timestamp. */
export function sealWrite(input: BookPIWriteRequest & { prevHash: string | null }): BookPIEntry {
  const id = `evt-${Date.now().toString(36)}-${Math.floor(Math.random() * 0xffff).toString(36)}`;
  const entry: Omit<BookPIEntry, "hash" | "prevHash"> = {
    id,
    type: input.type,
    source: input.source,
    domain: input.domain,
    timestamp: new Date().toISOString(),
    data: input.data,
  };
  const hash = sealBookPIEntry({ ...entry, prevHash: input.prevHash });
  return { ...entry, hash, prevHash: input.prevHash };
}
