/* ================================================================== */
/* OBSERVABILIDAD YUN — Métricas RED (Rate, Errors, Duration)          */
/* ================================================================== */
/* Clasifica el tráfico de API por ruta con las métricas canónicas:    */
/* tasa de peticiones, tasa de errores y latencia (p50/p95/p99).       */
/* Reutiliza el MetricsRegistry del monitor (counters/histogramas).    */
/* ================================================================== */

import { MetricsRegistry, DEFAULT_BUCKETS } from '@/lib/monitoring/metrics';

export interface RedSample {
  route: string;
  ok: boolean;
  durationMs: number;
}

export interface RouteRedStatus {
  route: string;
  requests: number;
  errors: number;
  errorRate: number;
  elapsedMinutes: number;
  requestsPerMinute: number;
  p50Ms: number | null;
  p95Ms: number | null;
  p99Ms: number | null;
}

const COUNT = 'api_requests_total';
const ERROR = 'api_errors_total';
const DURATION = 'api_request_duration_ms';

function percentile(histogram: { buckets: number[]; counts: number[]; count: number }, pct: number): number | null {
  if (histogram.count === 0) return null;
  const target = histogram.count * pct;
  for (let i = 0; i < histogram.buckets.length; i += 1) {
    if (histogram.counts[i] >= target) {
      return i === 0 ? histogram.buckets[0] : histogram.buckets[i];
    }
  }
  return histogram.buckets[histogram.buckets.length - 1];
}

export class RedMetrics {
  private readonly registry: MetricsRegistry;
  private readonly startedAt = new Map<string, number>();

  constructor(registry: MetricsRegistry) {
    this.registry = registry;
  }

  record(sample: RedSample): void {
    const tags = { route: sample.route };
    this.registry.inc(COUNT, tags);
    if (!this.startedAt.has(sample.route)) this.startedAt.set(sample.route, Date.now());
    if (!sample.ok) this.registry.inc(ERROR, tags);
    this.registry.observe(DURATION, sample.durationMs, tags, DEFAULT_BUCKETS);
  }

  status(route?: string): RouteRedStatus[] {
    const routeKeys = route ? [route] : [...this.startedAt.keys()];
    const now = Date.now();
    return routeKeys.map(r => {
      const tags = { route: r };
      const requests = this.registry.counter(COUNT, tags);
      const errors = this.registry.counter(ERROR, tags);
      const elapsedMinutes = Math.max((now - (this.startedAt.get(r) ?? now)) / 60000, 0.001);
      const histogram = this.registry.histogram(DURATION, tags);
      return {
        route: r,
        requests,
        errors,
        errorRate: requests === 0 ? 0 : Math.round((errors / requests) * 10000) / 10000,
        elapsedMinutes: Math.round(elapsedMinutes * 100) / 100,
        requestsPerMinute: Math.round((requests / elapsedMinutes) * 100) / 100,
        p50Ms: histogram ? percentile(histogram, 0.5) : null,
        p95Ms: histogram ? percentile(histogram, 0.95) : null,
        p99Ms: histogram ? percentile(histogram, 0.99) : null,
      };
    });
  }

  clear(): void {
    this.registry.clear();
    this.startedAt.clear();
  }
}
