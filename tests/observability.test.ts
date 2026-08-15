import { describe, it, expect, beforeEach } from 'vitest';
import type { YunEventEnvelope } from '@/lib/core/events';
import { publishEvent, resetBusForTests } from '@/lib/core/events';
import { SloManager } from '@/lib/observability/slo';
import { RedMetrics } from '@/lib/observability/red-metrics';
import { EventGraph } from '@/lib/observability/event-graph';
import { MetricsRegistry } from '@/lib/monitoring/metrics';
import { wireObservabilityToBus, resetObservabilityBridgeForTests } from '@/lib/observability/bridge';
import { sloManager, redMetrics, eventGraph } from '@/lib/observability';

function envelope(overrides: Partial<YunEventEnvelope> = {}): YunEventEnvelope {
  return {
    id: `evt-test-${Math.random().toString(36).slice(2, 8)}`,
    type: 'test.event',
    source: 'test',
    domain: 'test',
    version: 1,
    correlationId: 'corr-a',
    causationId: '',
    traceId: 'trace-a',
    severity: 'info',
    timestamp: new Date().toISOString(),
    data: {},
    meta: {},
    ...overrides,
  };
}

describe('SloManager', () => {
  it('evoluciona de healthy a at-risk y a exhausted según la tasa de error', () => {
    const slo = new SloManager();
    slo.register({ name: 'api.availability', target: 0.9, windowMs: 30 * 24 * 60 * 60 * 1000 });

    for (let i = 0; i < 92; i += 1) slo.recordOutcome('api.availability', { ok: true });
    for (let i = 0; i < 8; i += 1) slo.recordOutcome('api.availability', { ok: false });
    expect(slo.report('api.availability')?.status).toBe('at-risk');

    for (let i = 0; i < 10; i += 1) slo.recordOutcome('api.availability', { ok: false });
    expect(slo.report('api.availability')?.status).toBe('exhausted');
    expect(slo.report('api.availability')?.burnRate).toBeGreaterThanOrEqual(1);
  });

  it('sin errores el presupuesto queda intacto', () => {
    const slo = new SloManager();
    slo.register({ name: 'api.availability', target: 0.99, windowMs: 1000 });
    for (let i = 0; i < 50; i += 1) slo.recordOutcome('api.availability', { ok: true });
    const report = slo.report('api.availability');
    expect(report?.status).toBe('healthy');
    expect(report?.availability).toBe(1);
    expect(report?.remainingMs).toBe(1000);
  });
});

describe('RedMetrics', () => {
  it('acumula peticiones, errores y latencias por ruta', () => {
    const red = new RedMetrics(new MetricsRegistry());
    for (let i = 0; i < 90; i += 1) red.record({ route: 'api:core:x', ok: true, durationMs: 8 });
    for (let i = 0; i < 10; i += 1) red.record({ route: 'api:core:x', ok: false, durationMs: 120 });

    const [status] = red.status('api:core:x');
    expect(status.requests).toBe(100);
    expect(status.errors).toBe(10);
    expect(status.errorRate).toBe(0.1);
    expect(status.p50Ms).toBeGreaterThan(0);
    expect(status.p95Ms).not.toBeNull();
  });
});

describe('EventGraph', () => {
  it('clasifica etapas por severidad y vincula por causationId', () => {
    const graph = new EventGraph();
    const root = graph.ingest(
      envelope({
        id: 'a',
        type: 'api.route.error',
        severity: 'critical',
        correlationId: 'c1',
        timestamp: '2026-08-06T00:00:00.000Z',
      }),
    );
    const child = graph.ingest(
      envelope({
        id: 'b',
        type: 'api.route.finished',
        severity: 'info',
        correlationId: 'c1',
        causationId: 'a',
        timestamp: '2026-08-06T00:00:01.000Z',
      }),
    );
    const warn = graph.ingest(
      envelope({
        id: 'c',
        type: 'monitor.circuit',
        severity: 'warning',
        correlationId: 'c1',
        timestamp: '2026-08-06T00:00:02.000Z',
      }),
    );

    expect(root.stage).toBe('confirmed');
    expect(child.stage).toBe('correlated');
    expect(warn.stage).toBe('suspected');

    const trace = graph.trace('c1');
    expect(trace.root).toBe('a');
    expect(trace.nodes.map(n => n.id)).toEqual(['a', 'b', 'c']);
    expect(trace.confirmed).toBe(1);
    expect(graph.node('a')?.children).toContain('b');

    const summary = graph.summary();
    expect(summary.total).toBe(3);
    expect(summary.confirmed).toBe(1);
    expect(summary.suspected).toBe(1);
  });
});

describe('puente observabilidad -> bus YUN', () => {
  beforeEach(() => {
    resetBusForTests();
    resetObservabilityBridgeForTests();
  });

  it('alimenta RED y el SLO con los eventos api.route.*', () => {
    wireObservabilityToBus();
    publishEvent({ type: 'api.route.hit', source: 'guard', domain: 'security', data: { route: 'api:test:r' } });
    publishEvent({ type: 'api.route.finished', source: 'guard', domain: 'security', data: { route: 'api:test:r', elapsedMs: 25 } });
    publishEvent({ type: 'api.route.error', source: 'guard', domain: 'security', data: { route: 'api:test:r', error: 'boom' } });

    const [status] = redMetrics.status('api:test:r');
    /* El hit solo marca la entrada; finished + error cuentan la petición
       una sola vez (corrige el doble conteo de requests por petición). */
    expect(status.requests).toBe(2);
    expect(status.errors).toBe(1);

    const report = sloManager.report('api.core.availability');
    expect(report?.total).toBe(2);
    expect(report?.errors).toBe(1);
  });

  it('alimenta el SLO de telemetría con los health-checks', () => {
    wireObservabilityToBus();
    publishEvent({ type: 'api.route.hit', source: 'guard', domain: 'security', data: { route: 'api:monitor:health' } });
    publishEvent({ type: 'api.route.finished', source: 'guard', domain: 'security', data: { route: 'api:monitor:health', elapsedMs: 12 } });
    publishEvent({ type: 'api.route.error', source: 'guard', domain: 'security', data: { route: 'api:monitor:health', error: 'boom' } });

    const report = sloManager.report('api.telemetry.health');
    expect(report?.total).toBe(2);
    expect(report?.errors).toBe(1);
    expect(report?.status).not.toBeUndefined();
  });

  it('ingesta todos los eventos del bus en el grafo causal', () => {
    wireObservabilityToBus();
    publishEvent({ type: 'city.incident.created', source: 'rdm-city', domain: 'city', severity: 'warning', data: { zone: 'norte' } });
    const summary = eventGraph.summary();
    expect(summary.total).toBeGreaterThan(0);
    expect(summary.suspected).toBeGreaterThanOrEqual(1);
  });
});
