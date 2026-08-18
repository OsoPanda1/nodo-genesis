/* ================================================================== */
/* BOOKPI — Índice encadenado en memoria (fallback sin DB)            */
/* ================================================================== */
/* Almacén de respaldo que mantiene la cadena BookPI en memoria.      */
/* Cuando existe Prisma/PostgreSQL, las entradas persisten en DB; en   */
/* su ausencia (entornos de prueba) se usa este índice.                */
/* ================================================================== */

import { BookPIEntry } from "../contracts";

const BOOKPI_INDEX_KEY = "__rdmTamvBookpiIndex";

export interface BookpiStore {
  entries: BookPIEntry[];
}

function getStore(): BookpiStore {
  const g = globalThis as unknown as Record<string, unknown>;
  g[BOOKPI_INDEX_KEY] ??= { entries: [] } satisfies BookpiStore;
  return g[BOOKPI_INDEX_KEY] as BookpiStore;
}

export function lastEntry(): BookPIEntry | null {
  const { entries } = getStore();
  return entries.length > 0 ? entries[entries.length - 1]! : null;
}

export function appendEntry(entry: BookPIEntry): BookPIEntry {
  const store = getStore();
  store.entries.push(entry);
  if (store.entries.length > 5000) {
    store.entries.splice(0, store.entries.length - 5000);
  }
  return entry;
}

export function listEntries(limit = 50, domain?: string): BookPIEntry[] {
  const { entries } = getStore();
  const filtered = domain ? entries.filter((e) => e.domain === domain) : entries;
  return filtered.slice(-limit).reverse();
}

export function resetBookpiForTests(): void {
  getStore().entries = [];
}
