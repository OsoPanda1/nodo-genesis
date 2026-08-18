/* ================================================================== */
/* EVENTS — Tipos del bus TAMV (envelope + severidad)                 */
/* ================================================================== */

export type EventSeverity = "info" | "warning" | "critical";

/** Sobre estándar de eventos del core TAMV. Inspirado en el bus YUN
 *  de nodo-cero (correlationId / causationId / traceId).              */
export interface TamvEventEnvelope {
  /** Identificador único del evento. */
  id: string;
  /** Tipo de evento, formato `<dominio>.<accion>` (p.ej. `bookpi.write`). */
  type: string;
  /** Componente emisor (p.ej. `tamv-core`, `guardian-svc`). */
  source: string;
  /** Dominio de negocio (p.ej. `bookpi`, `guardian`, `isabella`). */
  domain: string;
  /** Versión del esquema de `data`. */
  version: number;
  /** Raíz de la transacción: todos los eventos derivados lo comparten. */
  correlationId: string;
  /** Evento que causó éste (vacío si es raíz). */
  causationId: string;
  /** Traza heredada a través de AsyncLocalStorage. */
  traceId: string;
  severity: EventSeverity;
  /** Marca ISO (UTC). */
  timestamp: string;
  /** Payload (debe ser JSON-serializable y sin PII). */
  data: Record<string, unknown>;
  meta: {
    federation?: string;
    entityId?: string;
  };
}

export interface PublishEventInput {
  type: string;
  source: string;
  domain: string;
  data: Record<string, unknown>;
  /** Raíz de transacción; hereda del contexto si se omite. */
  correlationId?: string;
  /** Evento causante; hereda del contexto si se omite. */
  causationId?: string;
  /** Traza; hereda del contexto si se omite. */
  traceId?: string;
  severity?: EventSeverity;
  version?: number;
  meta?: Partial<TamvEventEnvelope["meta"]>;
}

export type EventListener = (event: TamvEventEnvelope) => void;
