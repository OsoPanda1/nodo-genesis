/* ================================================================== */
/* AUDIT CITEMESH — Emisión estructurada al bus unificado             */
/* ================================================================== */
/* Punto único de telemetría de la malla federada autopoiética.        */
/* Publica en el bus YUN unificado (publishEvent) con dominio          */
/* 'citemesh' y traza heredada. El bus nunca debe bloquear la          */
/* operación original: la emisión se aísla por completo.               */
/* ================================================================== */

import { publishEvent, type EventSeverity } from '@/lib/core/events';

export const CITEMESH_SOURCE = 'citemesh-orchestrator';
export const CITEMESH_DOMAIN = 'citemesh';

export interface EmitCitemeshAuditOptions {
  traceId?: string;
  cell?: string;
  severity?: EventSeverity;
}

/** Publica un evento de auditoría de la malla en el bus YUN unificado. */
export function emitCitemeshAudit(
  type: string,
  data: Record<string, unknown>,
  options?: EmitCitemeshAuditOptions,
): void {
  try {
    publishEvent({
      type,
      source: CITEMESH_SOURCE,
      domain: CITEMESH_DOMAIN,
      data,
      severity: options?.severity ?? 'info',
      traceId: options?.traceId,
      meta: options?.cell ? { federation: options.cell } : undefined,
    });
  } catch {
    /* el bus nunca debe bloquear la operación original */
  }
}
