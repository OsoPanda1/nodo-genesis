/* ================================================================== */
/* OBSERVABILIDAD — Correlación de eventos                            */
/* ================================================================== */

export type EventSeverity = 'info' | 'warning' | 'critical';

export interface SystemEvent {
  id: string;
  correlationId: string;
  type: string;
  source: string;
  severity: EventSeverity;
  at: number;
  tags: Record<string, string | number | boolean>;
  payload?: Record<string, unknown>;
}

export const SEVERITY_RANK: Record<EventSeverity, number> = {
  info: 0,
  warning: 1,
  critical: 2,
};

const MAX_EVENTS = 5000;
let eventSeq = 0;

export class EventCorrelator {
  private buffer: SystemEvent[] = [];

  emit(
    type: string,
    source: string,
    severity: EventSeverity = 'info',
    payload?: Record<string, unknown>,
    tags: Record<string, string | number | boolean> = {},
    correlationId?: string,
  ): SystemEvent {
    eventSeq = (eventSeq + 1) % 0xffff;
    const event: SystemEvent = {
      id: `evt-${Date.now().toString(36)}-${eventSeq.toString(36)}`,
      correlationId: correlationId ?? `corr-${Date.now().toString(36)}`,
      type,
      source,
      severity,
      at: Date.now(),
      tags,
      payload,
    };
    this.buffer.push(event);
    if (this.buffer.length > MAX_EVENTS) this.buffer.shift();
    this.emitMirror(event);
    return event;
  }

  /* Publica además en el bus YUN unificado (solo servidor). El import es
     dinámico para no arrastrar node:async_hooks al bundle de cliente. */
  private emitMirror(event: SystemEvent): void {
    if (typeof window !== 'undefined') return;
    void import('@/lib/core/events')
      .then(({ publishEvent }) => {
        publishEvent({
          type: `monitor.${event.type}`,
          source: event.source,
          domain: 'telemetry',
          severity: event.severity,
          correlationId: event.correlationId,
          data: event.payload ?? {},
          meta: { entityId: event.id },
        });
      })
      .catch(() => {
        /* el bus nunca debe bloquear la emisión original */
      });
  }

  query(options: {
    type?: string;
    source?: string;
    minSeverity?: EventSeverity;
    sinceMs?: number;
    limit?: number;
    correlationId?: string;
  } = {}): SystemEvent[] {
    const now = Date.now();
    const minRank = options.minSeverity ? SEVERITY_RANK[options.minSeverity] : 0;
    return this.buffer
      .filter(e => {
        if (options.type && e.type !== options.type) return false;
        if (options.source && e.source !== options.source) return false;
        if (options.correlationId && e.correlationId !== options.correlationId) return false;
        if (options.sinceMs && now - e.at > options.sinceMs) return false;
        return SEVERITY_RANK[e.severity] >= minRank;
      })
      .slice(-(options.limit ?? 200))
      .reverse();
  }

  correlated(correlationId: string): SystemEvent[] {
    return this.buffer.filter(e => e.correlationId === correlationId);
  }

  counts(): { info: number; warning: number; critical: number; total: number } {
    const info = this.buffer.filter(e => e.severity === 'info').length;
    const warning = this.buffer.filter(e => e.severity === 'warning').length;
    const critical = this.buffer.filter(e => e.severity === 'critical').length;
    return { info, warning, critical, total: this.buffer.length };
  }

  clear(): void {
    this.buffer = [];
  }
}
