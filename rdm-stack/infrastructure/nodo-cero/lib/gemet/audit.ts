/* ================================================================== */
/* AUDIT GEMET — Emisión estructurada al bus unificado               */
/* ================================================================== */
/* Punto único de telemetría del Grafo de Conocimiento Federado.       */
/* Publica en el bus YUN unificado (publishEvent) con dominio          */
/* 'gemet' y traza heredada. El bus nunca debe bloquear la operación.   */
/* ================================================================== */

import { publishEvent, type EventSeverity } from '@/lib/core/events';

export const GEMET_SOURCE = 'gemet-graph';
export const GEMET_DOMAIN = 'gemet';

export interface EmitGemetAuditOptions {
  traceId?: string;
  ontology?: string;
  severity?: EventSeverity;
}

/** Publica un evento de auditoría del grafo en el bus YUN unificado. */
export function emitGemetAudit(
  type: string,
  data: Record<string, unknown>,
  options?: EmitGemetAuditOptions,
): void {
  try {
    publishEvent({
      type,
      source: GEMET_SOURCE,
      domain: GEMET_DOMAIN,
      data,
      severity: options?.severity ?? 'info',
      traceId: options?.traceId,
      meta: options?.ontology ? { federation: options.ontology } : undefined,
    });
  } catch {
    /* el bus nunca debe bloquear la operación original */
  }
}
