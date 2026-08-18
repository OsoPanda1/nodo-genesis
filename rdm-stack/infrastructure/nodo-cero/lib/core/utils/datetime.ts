/* ================================================================== */
/* UTILS — Fecha y hora (canónico)                                    */
/* ================================================================== */
/* Marcas de tiempo ISO del Nodo. Centraliza la generación para no     */
/* duplicar now() / daysAgo() en cada dominio.                         */
/* ================================================================== */

export function nowIso(): string {
  return new Date().toISOString();
}

export function minutesAgoISO(minutes: number, from: Date = new Date()): string {
  return new Date(from.getTime() - minutes * 60_000).toISOString();
}

/** Fecha ISO de N días atrás (redondeo a minuto, para métricas). */
export function daysAgoISO(days: number, from: Date = new Date()): string {
  const d = new Date(from.getTime() - days * 86_400_000);
  d.setSeconds(0, 0);
  return d.toISOString();
}
