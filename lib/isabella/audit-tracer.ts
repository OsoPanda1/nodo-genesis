import { IsabellaAuditEvent } from './contracts';
import { DEFAULT_DOMAIN, DEFAULT_FEDERATION } from './constitution';
import { nowIso, uuid } from './utils';

const AUDIT_KEY = 'yun:isabella:audit:v1';
const MAX_EVENTS = 500;

function isClient(): boolean {
  return typeof window !== 'undefined';
}

let serverLog: IsabellaAuditEvent[] = [];

function persist(events: IsabellaAuditEvent[]): void {
  if (isClient()) {
    try {
      window.localStorage.setItem(AUDIT_KEY, JSON.stringify(events.slice(-MAX_EVENTS)));
    } catch {
      /* almacenamiento no disponible */
    }
  } else {
    serverLog = events.slice(-MAX_EVENTS);
  }
}

function load(): IsabellaAuditEvent[] {
  if (isClient()) {
    try {
      const raw = window.localStorage.getItem(AUDIT_KEY);
      return raw ? (JSON.parse(raw) as IsabellaAuditEvent[]) : [];
    } catch {
      return [];
    }
  }
  return serverLog;
}

export interface AuditContext {
  traceId: string;
  actorId: string;
  sessionId: string;
  federationId?: string;
  domain?: string;
}

export function auditTrace(
  eventType: string,
  data: Record<string, unknown>,
  ctx: AuditContext
): IsabellaAuditEvent {
  const event: IsabellaAuditEvent = {
    eventId: uuid(),
    eventType,
    domain: ctx.domain ?? DEFAULT_DOMAIN,
    traceId: ctx.traceId,
    actorId: ctx.actorId,
    sessionId: ctx.sessionId,
    federationId: ctx.federationId ?? DEFAULT_FEDERATION,
    payload: data,
    timestamp: nowIso(),
  };

  const log = load();
  log.push(event);
  persist(log);

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[ISABELLA-AUDIT][${event.eventType}][${event.traceId}]`, JSON.stringify(data));
  }

  return event;
}

export function getAuditEvents(traceId?: string): IsabellaAuditEvent[] {
  const events = load();
  return traceId ? events.filter(e => e.traceId === traceId) : events;
}
