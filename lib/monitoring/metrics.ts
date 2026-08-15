/* ================================================================== */
/* OBSERVABILIDAD — Métricas (counters, gauges, histogramas)          */
/* ================================================================== */

export type MetricTag = Record<string, string | number | boolean>;

export interface CounterSeries {
  tags: MetricTag;
  value: number;
}

export interface GaugeSeries {
  tags: MetricTag;
  value: number;
  updatedAt: number;
}

export interface HistogramSeries {
  tags: MetricTag;
  buckets: number[];
  counts: number[];
  sum: number;
  count: number;
  min: number;
  max: number;
}

export const DEFAULT_BUCKETS = [1, 5, 10, 25, 50, 100, 250, 500, 1000, 5000];

function keyOf(name: string, tags: MetricTag): string {
  const tagPart = Object.keys(tags)
    .sort()
    .map(k => `${k}=${String(tags[k])}`)
    .join(',');
  return tagPart ? `${name}{${tagPart}}` : name;
}

export class MetricsRegistry {
  private counters = new Map<string, CounterSeries>();
  private gauges = new Map<string, GaugeSeries>();
  private histograms = new Map<string, HistogramSeries>();

  inc(name: string, tags: MetricTag = {}, by = 1): void {
    const key = keyOf(name, tags);
    const existing = this.counters.get(key) ?? { tags, value: 0 };
    existing.value += by;
    this.counters.set(key, existing);
  }

  set(name: string, value: number, tags: MetricTag = {}): void {
    const key = keyOf(name, tags);
    this.gauges.set(key, { tags, value, updatedAt: Date.now() });
  }

  observe(name: string, value: number, tags: MetricTag = {}, buckets = DEFAULT_BUCKETS): void {
    const key = keyOf(name, tags);
    const existing =
      this.histograms.get(key) ?? {
        tags,
        buckets,
        counts: new Array(buckets.length).fill(0),
        sum: 0,
        count: 0,
        min: Infinity,
        max: -Infinity,
      };
    existing.sum += value;
    existing.count += 1;
    existing.min = Math.min(existing.min, value);
    existing.max = Math.max(existing.max, value);
    for (let i = 0; i < buckets.length; i++) {
      if (value <= buckets[i]) {
        existing.counts[i] += 1;
        break;
      }
    }
    this.histograms.set(key, existing);
  }

  counter(name: string, tags: MetricTag = {}): number {
    return this.counters.get(keyOf(name, tags))?.value ?? 0;
  }

  gauge(name: string, tags: MetricTag = {}): number | null {
    return this.gauges.get(keyOf(name, tags))?.value ?? null;
  }

  histogram(name: string, tags: MetricTag = {}): HistogramSeries | null {
    return this.histograms.get(keyOf(name, tags)) ?? null;
  }

  snapshot(): {
    counters: CounterSeries[];
    gauges: GaugeSeries[];
    histograms: HistogramSeries[];
  } {
    return {
      counters: [...this.counters.values()],
      gauges: [...this.gauges.values()],
      histograms: [...this.histograms.values()],
    };
  }

  clear(): void {
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
  }
}
