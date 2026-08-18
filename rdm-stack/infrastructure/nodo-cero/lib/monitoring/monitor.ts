/* ================================================================== */
/* MONITOR GENERAL — Sistema de Observabilidad del Nodo Cero          */
/* ================================================================== */
/* Vista unificada del comportamiento del sistema:                    */
/*   · métricas (counters / gauges / histogramas)                     */
/*   · trazas (spans con latencia y estado)                           */
/*   · eventos correlacionados por id de correlación                  */
/*   · alertas evaluadas sobre métricas en vivo                       */
/*   · health checks de cada dominio (twins, city, eam, grid,         */
/*     marketplace, isabella, gamificación)                           */
/* ================================================================== */

import { MetricsRegistry } from '@/lib/monitoring/metrics';
import { Tracer } from '@/lib/monitoring/tracer';
import { EventCorrelator } from '@/lib/monitoring/events';
import { AlertEngine, type AlertSeverity } from '@/lib/monitoring/alerts';

export type HealthStatus = 'up' | 'degraded' | 'down';

export interface HealthCheck {
  name: string;
  status: HealthStatus;
  detail: string;
  checkedAt: number;
  latencyMs: number;
}

export interface HealthCheckResult {
  status: HealthStatus;
  detail: string;
}

export type HealthCheckFn = () => HealthCheckResult | Promise<HealthCheckResult>;

export class SystemMonitor {
  readonly metrics = new MetricsRegistry();
  readonly tracer = new Tracer();
  readonly events = new EventCorrelator();
  readonly alerts: AlertEngine;
  readonly startedAt = Date.now();

  private healthChecks = new Map<string, HealthCheckFn>();

  constructor() {
    this.alerts = new AlertEngine(this.metrics);
    this.registerDefaultAlerts();
  }

  /** Registra un health check por dominio (se evalúa en /api/monitor/health). */
  registerHealth(name: string, fn: HealthCheckFn): void {
    this.healthChecks.set(name, fn);
  }

  /** Emite evento + métrica de error de forma unificada. */
  recordError(source: string, message: string, tags: Record<string, string | number | boolean> = {}): void {
    this.metrics.inc('system.errors', { source });
    this.events.emit('error', source, 'warning', { message }, tags);
  }

  /** Cronometra una operación y la registra en métricas + trazas. */
  async time<T>(name: string, fn: () => Promise<T> | T): Promise<T> {
    const start = Date.now();
    try {
      return await this.tracer.trace(name, fn);
    } finally {
      this.metrics.observe('latency', Date.now() - start, { operation: name });
    }
  }

  /** Ejecuta todos los health checks registrados. */
  async healthSnapshot(): Promise<HealthCheck[]> {
    const out: HealthCheck[] = [];
    for (const [name, fn] of this.healthChecks) {
      const start = Date.now();
      try {
        const result = await fn();
        out.push({
          name,
          status: result.status,
          detail: result.detail,
          checkedAt: Date.now(),
          latencyMs: Date.now() - start,
        });
      } catch (err) {
        out.push({
          name,
          status: 'down',
          detail: err instanceof Error ? err.message : String(err),
          checkedAt: Date.now(),
          latencyMs: Date.now() - start,
        });
      }
    }
    return out;
  }

  overallHealth(checks: HealthCheck[]): { status: HealthStatus; up: number; degraded: number; down: number; total: number } {
    const up = checks.filter(c => c.status === 'up').length;
    const degraded = checks.filter(c => c.status === 'degraded').length;
    const down = checks.filter(c => c.status === 'down').length;
    const status: HealthStatus = down > 0 ? 'down' : degraded > 0 ? 'degraded' : 'up';
    return { status, up, degraded, down, total: checks.length };
  }

  /** Estado completo del sistema para /api/monitor/state. */
  statusSnapshot(): Record<string, unknown> {
    return {
      startedAt: this.startedAt,
      uptimeMs: Date.now() - this.startedAt,
      metrics: this.metrics.snapshot(),
      traces: this.tracer.summary(),
      recentSpans: this.tracer.recent(25),
      events: this.events.counts(),
      recentEvents: this.events.query({ limit: 25 }),
      alerts: this.alerts.evaluate(),
    };
  }

  emit(type: string, source: string, severity: AlertSeverity, payload?: Record<string, unknown>): void {
    this.events.emit(type, source, severity, payload);
  }

  private registerDefaultAlerts(): void {
    this.alerts.addRule({
      name: 'Latencia media alta',
      metric: 'latency_avg',
      op: 'gt',
      threshold: 500,
      severity: 'warning',
      message: 'La latencia media supera los 500 ms.',
    });
    this.alerts.addRule({
      name: 'Errores elevados',
      metric: 'errors_rate',
      op: 'gt',
      threshold: 10,
      severity: 'critical',
      message: 'La tasa de errores supera el umbral crítico.',
    });
    this.alerts.addRule({
      name: 'Trazas erróneas',
      metric: 'traces_error',
      op: 'gt',
      threshold: 5,
      severity: 'warning',
      message: 'Hay trazas con error en la ventana reciente.',
    });
  }
}

/** Singleton global del Nodo Cero. */
export const monitor = new SystemMonitor();
