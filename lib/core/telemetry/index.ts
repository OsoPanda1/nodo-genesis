import {
  TELEMETRY_CONTRACT_VERSION,
  telemetryEventSchema,
  type TelemetryEvent,
  type TelemetryLevel,
  type TelemetryScope,
} from '@/lib/core/contracts/telemetry';
import { sanitizeTelemetryDetails } from './sanitize';

export type TelemetryTransport = (
  event: TelemetryEvent,
) => void | Promise<void>;

export interface RecordTelemetryInput {
  level: TelemetryLevel;
  scope?: TelemetryScope;
  source: string;
  event: string;
  message: string;
  route?: string;
  traceId?: string;
  requestId?: string;
  sessionId?: string;
  userId?: string;
  details?: Record<string, unknown>;
}

const MAX_PENDING_EVENTS = 100;

let activeTransport: TelemetryTransport | null = null;
const pendingEvents: TelemetryEvent[] = [];

/**
 * Genera un identificador único sin introducir dependencias externas.
 * Opera tanto en navegador como en runtimes modernos de Node/Vercel.
 */
function createTelemetryId(): string {
  if (
    typeof globalThis.crypto !== 'undefined' &&
    typeof globalThis.crypto.randomUUID === 'function'
  ) {
    return globalThis.crypto.randomUUID();
  }

  const random = Math.random().toString(36).slice(2);
  const now = Date.now().toString(36);

  return `tel_${now}_${random}`;
}

/**
 * Configura el transporte que recibirá eventos de telemetría.
 * Si existen eventos acumulados antes de configurar el transporte,
 * se entregan de forma ordenada al nuevo destino.
 */
export function setTelemetryTransport(
  transport: TelemetryTransport | null,
): void {
  activeTransport = transport;

  if (!transport || pendingEvents.length === 0) {
    return;
  }

  const eventsToFlush = pendingEvents.splice(0, pendingEvents.length);

  for (const event of eventsToFlush) {
    void Promise.resolve(transport(event)).catch(() => {
      enqueuePendingEvent(event);
    });
  }
}

/**
 * Devuelve el transporte actual, principalmente para pruebas e integración.
 */
export function getTelemetryTransport(): TelemetryTransport | null {
  return activeTransport;
}

/**
 * Registra un evento de telemetría validado y sanitizado.
 * Nunca lanza errores: la observabilidad no debe romper el flujo principal.
 */
export function recordTelemetry(
  input: RecordTelemetryInput,
): TelemetryEvent {
  const event = telemetryEventSchema.parse({
    id: createTelemetryId(),
    version: TELEMETRY_CONTRACT_VERSION,
    occurredAt: new Date().toISOString(),
    level: input.level,
    scope: input.scope ?? 'system',
    source: input.source,
    event: input.event,
    message: input.message,
    route: input.route,
    traceId: input.traceId,
    requestId: input.requestId,
    sessionId: input.sessionId,
    userId: input.userId,
    details: sanitizeTelemetryDetails(input.details),
  });

  dispatchTelemetryEvent(event);

  return event;
}

/**
 * Emite un evento preconstruido. Es útil para adaptadores de infraestructura.
 */
export function emitTelemetry(event: TelemetryEvent): void {
  const normalizedEvent = telemetryEventSchema.parse({
    ...event,
    details: sanitizeTelemetryDetails(event.details),
  });

  dispatchTelemetryEvent(normalizedEvent);
}

/**
 * Crea una función registradora ligada a una fuente y un scope.
 * Reduce repetición en dominios como Isabella, YUN, CITEMESH o GEMET.
 */
export function createTelemetryLogger(
  source: string,
  scope: TelemetryScope = 'system',
): (input: Omit<RecordTelemetryInput, 'source' | 'scope'>) => TelemetryEvent {
  return (input) =>
    recordTelemetry({
      ...input,
      source,
      scope,
    });
}

/**
 * Consulta eventos que esperan a que se configure un transporte.
 * Retorna una copia para evitar mutación externa.
 */
export function getPendingTelemetryEvents(): readonly TelemetryEvent[] {
  return [...pendingEvents];
}

/**
 * Elimina eventos pendientes. Útil exclusivamente para pruebas controladas
 * o reinicios explícitos del runtime.
 */
export function clearPendingTelemetryEvents(): void {
  pendingEvents.splice(0, pendingEvents.length);
}

function dispatchTelemetryEvent(event: TelemetryEvent): void {
  if (!activeTransport) {
    enqueuePendingEvent(event);
    return;
  }

  void Promise.resolve(activeTransport(event)).catch(() => {
    enqueuePendingEvent(event);
  });
}

function enqueuePendingEvent(event: TelemetryEvent): void {
  if (pendingEvents.length >= MAX_PENDING_EVENTS) {
    pendingEvents.shift();
  }

  pendingEvents.push(event);
}

/**
 * Exporta contratos para que los consumidores puedan importar todo desde
 * '@/lib/core/telemetry'.
 */
export {
  TELEMETRY_CONTRACT_VERSION,
  telemetryEventSchema,
};

export type {
  TelemetryEvent,
  TelemetryLevel,
  TelemetryScope,
};

/**
 * Telemetría especializada del subsistema de voz de Isabella.
 * Requiere que exista el archivo:
 * lib/core/telemetry/isabella-voice.ts
 */
export * from './isabella-voice';
