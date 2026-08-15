import { YunEvent } from './contracts';
import { DEFAULT_FEDERATION } from './constitution';
import { nowIso, uuid } from './utils';

export type YunDomain = 'identity' | 'commerce' | 'knowledge' | 'telemetry' | 'gameplay' | 'security' | 'federations';

const EVENTS_KEY = 'yun:isabella:events:v1';
const MAX_EVENTS = 500;

function isClient(): boolean {
  return typeof window !== 'undefined';
}

let serverEvents: YunEvent[] = [];

function persist(events: YunEvent[]): void {
  if (isClient()) {
    try {
      window.localStorage.setItem(EVENTS_KEY, JSON.stringify(events.slice(-MAX_EVENTS)));
    } catch {
      /* almacenamiento no disponible */
    }
  } else {
    serverEvents = events.slice(-MAX_EVENTS);
  }
}

export function emitYunEvent(input: {
  eventType: string;
  domain: YunDomain;
  federationId?: string;
  traceId: string;
  source?: string;
  entityId?: string;
  severity?: string;
  payload: Record<string, unknown>;
}): YunEvent {
  const event: YunEvent = {
    event_id: uuid(),
    event_type: input.eventType,
    domain: input.domain,
    federation_id: input.federationId ?? DEFAULT_FEDERATION,
    trace_id: input.traceId,
    source: input.source ?? 'isabella-s-mind',
    entity_id: input.entityId,
    severity: input.severity ?? 'info',
    payload: input.payload,
    created_at: nowIso(),
  };

  if (isClient()) {
    try {
      const raw = window.localStorage.getItem(EVENTS_KEY);
      const events = raw ? (JSON.parse(raw) as YunEvent[]) : [];
      events.push(event);
      persist(events);
    } catch {
      persist([event]);
    }
  } else {
    const events = serverEvents;
    events.push(event);
    persist(events);
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[YUN-EVENT][${event.event_type}][${event.domain}][${event.trace_id}]`);
  }

  /* Publica además en el bus YUN unificado (solo servidor). El import
     es dinámico para no arrastrar node:async_hooks al bundle cliente. */
  if (!isClient()) {
    void import('@/lib/core/events')
      .then(({ publishEvent }) => {
        publishEvent({
          type: event.event_type,
          source: event.source ?? 'isabella-s-mind',
          domain: event.domain,
          data: { ...event.payload, entityId: event.entity_id },
          traceId: event.trace_id,
          severity: mapSeverity(event.severity),
          meta: { federation: event.federation_id, entityId: event.entity_id },
        });
      })
      .catch(() => {
        /* el bus nunca debe bloquear la emisión original */
      });
  }

  return event;
}

function mapSeverity(value?: string): 'info' | 'warning' | 'critical' {
  if (value === 'error' || value === 'critical') return 'critical';
  if (value === 'warn' || value === 'warning') return 'warning';
  return 'info';
}

export function getYunEvents(traceId?: string): YunEvent[] {
  if (isClient()) {
    try {
      const raw = window.localStorage.getItem(EVENTS_KEY);
      const events = raw ? (JSON.parse(raw) as YunEvent[]) : [];
      return traceId ? events.filter(e => e.trace_id === traceId) : events;
    } catch {
      return [];
    }
  }
  return traceId ? serverEvents.filter(e => e.trace_id === traceId) : serverEvents;
}
