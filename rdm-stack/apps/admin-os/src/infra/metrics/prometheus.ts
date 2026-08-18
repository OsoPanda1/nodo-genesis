type Labels = Record<string, string>;

class Counter {
  private data = new Map<string, number>();

  constructor(public name: string, public help: string) {}

  inc(labels: Labels = {}, value = 1) {
    const key = JSON.stringify(labels);
    const previous = this.data.get(key) ?? 0;
    this.data.set(key, previous + value);
  }

  snapshot() {
    return [...this.data.entries()].map(([labels, value]) => ({ labels: JSON.parse(labels), value }));
  }
}

class Gauge {
  private value = 0;

  constructor(public name: string, public help: string) {}

  inc() {
    this.value += 1;
  }

  dec() {
    this.value = Math.max(0, this.value - 1);
  }

  set(value: number) {
    this.value = value;
  }

  snapshot() {
    return this.value;
  }
}

class Histogram {
  private observations: number[] = [];

  constructor(public name: string, public help: string, private buckets: number[]) {}

  observe(value: number) {
    this.observations.push(value);
  }

  snapshot() {
    const counts = this.buckets.map((bucket) => ({ le: bucket, count: this.observations.filter((v) => v <= bucket).length }));
    return {
      count: this.observations.length,
      sum: this.observations.reduce((acc, curr) => acc + curr, 0),
      buckets: counts,
    };
  }
}

class Registry {
  private metrics = new Map<string, Counter | Gauge | Histogram>();

  registerMetric(metric: Counter | Gauge | Histogram) {
    this.metrics.set(metric.name, metric);
  }

  async metricsText() {
    const lines: string[] = [];

    for (const metric of this.metrics.values()) {
      lines.push(`# HELP ${metric.name} ${metric.help}`);
      if (metric instanceof Counter) {
        lines.push(`# TYPE ${metric.name} counter`);
        const entries = metric.snapshot();
        for (const entry of entries) {
          const labels = Object.entries(entry.labels)
            .map(([k, v]) => `${k}="${v}"`)
            .join(",");
          lines.push(labels ? `${metric.name}{${labels}} ${entry.value}` : `${metric.name} ${entry.value}`);
        }
      } else if (metric instanceof Gauge) {
        lines.push(`# TYPE ${metric.name} gauge`);
        lines.push(`${metric.name} ${metric.snapshot()}`);
      } else {
        lines.push(`# TYPE ${metric.name} histogram`);
        const snap = metric.snapshot();
        for (const bucket of snap.buckets) {
          lines.push(`${metric.name}_bucket{le="${bucket.le}"} ${bucket.count}`);
        }
        lines.push(`${metric.name}_count ${snap.count}`);
        lines.push(`${metric.name}_sum ${snap.sum}`);
      }
    }

    return lines.join("\n");
  }
}

export const register = new Registry();

export const isabellaTerritorialDecisionLatencyMs = new Histogram(
  "isabella_territorial_decision_latency_ms",
  "Latencia de decisiones territoriales Isabella",
  [10, 25, 50, 100, 200, 500, 1000],
);

export const decisionScore = new Histogram(
  "decision_score",
  "Distribución del score calculado por turista",
  [0.2, 0.4, 0.6, 0.8, 1],
);

export const reviews = new Counter("reviews_total", "Volumen de reseñas por territorio y polaridad");
export const consentEvents = new Counter("consent_events_total", "Total de eventos de consentimiento");
export const reviewsScore = new Histogram("reviews_score", "Distribución de rating de reseñas", [1, 2, 3, 4, 5]);

export const streamConnections = new Gauge("sse_connections", "Conexiones SSE activas");
export const isabellaGeoLruSize = new Gauge("isabella_geo_lru_size", "Tamaño actual del LRU geoespacial");
export const isabellaGeoLruCapacity = new Gauge("isabella_geo_lru_capacity", "Capacidad máxima del LRU geoespacial");
export const isabellaMovementFilterAlpha = new Gauge("isabella_movement_filter_alpha", "Alpha del filtro EMA de movimiento");
export const eventsDroppedTotal = new Counter("events_dropped_total", "Eventos descartados por backpressure");

// Backward compatibility export
export const decisionLatency = isabellaTerritorialDecisionLatencyMs;

[
  isabellaTerritorialDecisionLatencyMs,
  decisionScore,
  reviews,
  consentEvents,
  reviewsScore,
  streamConnections,
  isabellaGeoLruSize,
  isabellaGeoLruCapacity,
  isabellaMovementFilterAlpha,
  eventsDroppedTotal,
].forEach((metric) => register.registerMetric(metric));
