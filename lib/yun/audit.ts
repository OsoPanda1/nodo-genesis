/* ================================================================== */
/* AUDIT YUN QSC — Emisión estructurada al bus unificado              */
/* ================================================================== */
/* Punto único de telemetría del YUN Quantum Semantic Core. Publica    */
/* en el bus YUN (publishEvent) con dominio 'yun' y traza heredada.    */
/* El bus nunca debe bloquear la operación original: la emisión se     */
/* aísla por completo.                                                 */
/* ================================================================== */

import { publishEvent, type EventSeverity } from '@/lib/core/events';

export const YUN_SOURCE = 'yun-quantum-semantic-core';
export const YUN_DOMAIN = 'yun';

export interface EmitYunAuditOptions {
  traceId?: string;
  federation?: string;
  severity?: EventSeverity;
}

/** Publica un evento de auditoría del QSC en el bus YUN unificado. */
export function emitYunAudit(
  type: string,
  data: Record<string, unknown>,
  options?: EmitYunAuditOptions,
): void {
  try {
    publishEvent({
      type,
      source: YUN_SOURCE,
      domain: YUN_DOMAIN,
      data,
      severity: options?.severity ?? 'info',
      traceId: options?.traceId,
      meta: options?.federation ? { federation: options.federation } : undefined,
    });
  } catch {
    /* el bus nunca debe bloquear la operación original */
  }
}
