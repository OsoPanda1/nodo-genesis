/* ================================================================== */
/* UTILS — ID (canónico)                                              */
/* ================================================================== */
/* Generación de identificadores del Nodo. Implementación canónica     */
/* (antes en lib/isabella/utils.ts).                                  */
/* ================================================================== */

export function uuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
