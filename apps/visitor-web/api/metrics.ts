import { emitTelemetry } from "./_shared/telemetry";

export interface MetricEvent {
  name: string;
  value: number;
  tags?: Record<string, string | number | boolean>;
  timestamp?: string;
}

export function emitMetric(event: MetricEvent): void {
  emitTelemetry({
    level: "info",
    message: `metric:${event.name}`,
    data: {
      metric: event.name,
      value: event.value,
      tags: event.tags,
      _metric_timestamp: event.timestamp || new Date().toISOString(),
    },
  });
}

export function emitCount(name: string, tags?: Record<string, string | number | boolean>): void {
  emitMetric({ name, value: 1, tags });
}

export function emitGauge(
  name: string,
  value: number,
  tags?: Record<string, string | number | boolean>,
): void {
  emitMetric({ name, value, tags });
}

export function emitTiming(
  name: string,
  durationMs: number,
  tags?: Record<string, string | number | boolean>,
): void {
  emitMetric({ name, value: durationMs, tags: { ...tags, unit: "ms" } });
}

export function timing(name: string, tags?: Record<string, string | number | boolean>) {
  const start = Date.now();
  return {
    end: () => emitTiming(name, Date.now() - start, tags),
  };
}
