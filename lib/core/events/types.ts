/* ================================================================== */
/* EVENTS — Tipos del bus YUN unificado (envelope + severidad)        */
/* ================================================================== */

export type EventSeverity = 'info' | 'warning' | 'critical';

/** Sobre estándar de eventos del Nodo. Inspirado en el bus YUN del
 *  proyecto hermano (correlationId / causationId / traceId).          */
export interface YunEventEnvelope {
  /** Identificador único del evento. */
  id: string;
  /** Tipo de evento, formato `<dominio>.<accion>` (p.ej. `city.incident.created`). */
  type: string;
  /** Componente emisor (p.ej. `yun-gamification`, `rdm-city-bus`). */
  source: string;
  /** Dominio de negocio al que pertenece (p.ej. `gameplay`, `city`). */
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
    /** Federación YUN a la que pertenece. */
    federation?: string;
    /** Entidad de negocio asociada (sessionId, assetId, ...). */
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
  meta?: Partial<YunEventEnvelope['meta']>;
}

export type EventListener = (event: YunEventEnvelope) => void;
