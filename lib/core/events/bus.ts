/* ================================================================== */
/* EVENTS — Bus YUN unificado                                         */
/* ================================================================== */
/* Núcleo transversal de eventos del Nodo. Unifica los antiguos buses  */
/* dispersos (isabella, city, messaging, monitor, notifications) en    */
/* un único punto de emisión con:                                      */
/*                                                                     */
/*   - Envelope estándar con correlationId / causationId / traceId.    */
/*   - Cola de mensajes no entregados (DLQ) acotada.                   */
/*   - Suscripción por tipo o global con cancelación.                  */
/*   - Historial acotado consultable (telemetría).                     */
/*                                                                     */
/* SOLO SERVIDOR: usa node:async_hooks. Los consumidores de cliente    */
/* deben importar este módulo con import() dinámico o evitar            */
/* importarlo estáticamente.                                            */
/* ================================================================== */

import { uuid, nowIso } from '@/lib/core/utils';
import { eventContext } from './context';
import { YunEventEnvelope, PublishEventInput, EventListener } from './types';

const MAX_HISTORY = 1000;
const MAX_DLQ = 200;

interface DlqEntry {
  event: YunEventEnvelope;
  error: string;
  at: string;
}

interface BusStore {
  history: YunEventEnvelope[];
  dlq: DlqEntry[];
  listeners: EventListener[];
}

const BUS_KEY = '__rdmUnifiedEventBus';

function getStore(): BusStore {
  const g = globalThis as unknown as Record<string, unknown>;
  g[BUS_KEY] ??= { history: [], dlq: [], listeners: [] } satisfies BusStore;
  return g[BUS_KEY] as BusStore;
}

let seq = 0;

/** Publica un evento en el bus. Si el contexto de traza está activo,
 *  hereda traceId y correlationId automáticamente. */
export function publishEvent(input: PublishEventInput): YunEventEnvelope {
  const ctx = eventContext.getStore();
  const correlationId = input.correlationId ?? ctx?.correlationId ?? uuid();
  const traceId = input.traceId ?? ctx?.traceId ?? uuid();
  const event: YunEventEnvelope = {
    id: `evt-${Date.now().toString(36)}-${(seq = (seq + 1) % 0xffff).toString(36)}`,
    type: input.type,
    source: input.source,
    domain: input.domain,
    version: input.version ?? 1,
    correlationId,
    causationId: input.causationId ?? '',
    traceId,
    severity: input.severity ?? 'info',
    timestamp: nowIso(),
    data: input.data,
    meta: {
      federation: input.meta?.federation,
      entityId: input.meta?.entityId,
    },
  };

  const store = getStore();
  store.history.push(event);
  if (store.history.length > MAX_HISTORY) {
    store.history.splice(0, store.history.length - MAX_HISTORY);
  }

  for (const listener of [...store.listeners]) {
    try {
      listener(event);
    } catch (err) {
      pushDlq(event, err instanceof Error ? err.message : String(err));
    }
  }

  return event;
}

/** Emite un evento marcado como fallido en la DLQ (consumidores rotos). */
export function reportFailure(
  input: Omit<PublishEventInput, 'correlationId' | 'causationId' | 'traceId'>,
  error: string,
): void {
  const event = publishEvent({ ...input, severity: 'critical' });
  pushDlq(event, error);
}

function pushDlq(event: YunEventEnvelope, error: string): void {
  const store = getStore();
  store.dlq.push({ event, error, at: nowIso() });
  if (store.dlq.length > MAX_DLQ) store.dlq.shift();
}

/** Suscribe un listener global. Devuelve función para cancelar. */
export function subscribe(listener: EventListener): () => void {
  const store = getStore();
  store.listeners.push(listener);
  return () => {
    store.listeners = store.listeners.filter(l => l !== listener);
  };
}

/** Suscribe un listener filtrando por tipo de evento. */
export function onEvent(type: string, listener: EventListener): () => void {
  return subscribe(event => {
    if (event.type === type) listener(event);
  });
}

/** Historial acotado del bus, opcionalmente filtrado. */
export function eventHistory(
  limit = 200,
  options: { type?: string; domain?: string; traceId?: string } = {},
): YunEventEnvelope[] {
  const { history } = getStore();
  const filtered = history.filter(e => {
    if (options.type && e.type !== options.type) return false;
    if (options.domain && e.domain !== options.domain) return false;
    if (options.traceId && e.traceId !== options.traceId) return false;
    return true;
  });
  return filtered.slice(-limit).reverse();
}

/** Estado de la DLQ (eventos con consumidores fallidos). */
export function dlqSnapshot(limit = 100): DlqEntry[] {
  return getStore().dlq.slice(-limit).reverse();
}

export function dlqCount(): number {
  return getStore().dlq.length;
}

/** Estado agregado para el monitor general. */
export function busStats(): { history: number; dlq: number; listeners: number } {
  const store = getStore();
  return {
    history: store.history.length,
    dlq: store.dlq.length,
    listeners: store.listeners.length,
  };
}

/** Limpia historial y DLQ (uso en pruebas). */
export function resetBusForTests(): void {
  const store = getStore();
  store.history = [];
  store.dlq = [];
  store.listeners = [];
}
