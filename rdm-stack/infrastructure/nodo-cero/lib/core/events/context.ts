/* ================================================================== */
/* EVENTS — Contexto de traza (AsyncLocalStorage)                     */
/* ================================================================== */
/* Propaga correlationId / traceId a través de la ejecución asíncrona  */
/* sin pasarlos por cada parámetro. Solo servidor (node:async_hooks).  */
/* ================================================================== */

import { AsyncLocalStorage } from 'node:async_hooks';
import { uuid } from '@/lib/core/utils';

export interface TraceContext {
  traceId: string;
  correlationId: string;
}

export const eventContext = new AsyncLocalStorage<TraceContext>();

/** Ejecuta `fn` dentro de un contexto de traza. Hereda el contexto
 *  padre cuando existe, o genera una nueva raíz de transacción. */
export function runWithTrace<T>(
  ctx: { traceId?: string; correlationId?: string },
  fn: () => T,
): T {
  const parent = eventContext.getStore();
  return eventContext.run(
    {
      traceId: ctx.traceId ?? parent?.traceId ?? uuid(),
      correlationId: ctx.correlationId ?? parent?.correlationId ?? uuid(),
    },
    fn,
  );
}

/** Contexto de traza activo, o `null` si no hay raíz en curso. */
export function currentTrace(): TraceContext | null {
  return eventContext.getStore() ?? null;
}

export function newTraceId(): string {
  return uuid();
}
