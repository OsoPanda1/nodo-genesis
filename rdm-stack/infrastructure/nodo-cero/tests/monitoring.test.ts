import { describe, it, expect, beforeEach } from 'vitest';
import { MetricsRegistry } from '@/lib/monitoring/metrics';
import { Tracer } from '@/lib/monitoring/tracer';
import { EventCorrelator } from '@/lib/monitoring/events';
import { AlertEngine } from '@/lib/monitoring/alerts';
import { SystemMonitor, monitor } from '@/lib/monitoring/monitor';

describe('monitoring · metrics', () => {
  const registry = new MetricsRegistry();

  beforeEach(() => registry.clear());

  it('acumula counters por tags', () => {
    registry.inc('api.requests', { route: '/a' });
    registry.inc('api.requests', { route: '/a' });
    registry.inc('api.requests', { route: '/b' });
    expect(registry.counter('api.requests', { route: '/a' })).toBe(2);
    expect(registry.counter('api.requests', { route: '/b' })).toBe(1);
    expect(registry.counter('api.requests')).toBe(0);
  });

  it('registra gauges', () => {
    registry.set('health_up', 5);
    expect(registry.gauge('health_up')).toBe(5);
  });

  it('registra histogramas con buckets', () => {
    registry.observe('latency', 2);
    registry.observe('latency', 8);
    const h = registry.histogram('latency');
    expect(h).not.toBeNull();
    expect(h?.count).toBe(2);
    expect(h?.sum).toBe(10);
    expect(h?.min).toBe(2);
    expect(h?.max).toBe(8);
  });

  it('toma snapshots completos', () => {
    registry.inc('a', {});
    registry.set('b', 1);
    registry.observe('c', 1);
    const snap = registry.snapshot();
    expect(snap.counters).toHaveLength(1);
    expect(snap.gauges).toHaveLength(1);
    expect(snap.histograms).toHaveLength(1);
  });
});

describe('monitoring · tracer', () => {
  it('registra spans exitosos con duración', async () => {
    const tracer = new Tracer();
    await tracer.trace('op', async () => {
      await new Promise(r => setTimeout(r, 5));
      return 1;
    });
    const summary = tracer.summary();
    expect(summary.total).toBe(1);
    expect(summary.ok).toBe(1);
    expect(summary.avgMs).toBeGreaterThanOrEqual(0);
  });

  it('marca spans con error', async () => {
    const tracer = new Tracer();
    await expect(
      tracer.trace('falla', async () => {
        throw new Error('boom');
      }),
    ).rejects.toThrow('boom');
    const summary = tracer.summary();
    expect(summary.error).toBe(1);
  });

  it('mantiene jerarquía parent/child', () => {
    const tracer = new Tracer();
    const parent = tracer.start('padre');
    const child = tracer.start('hijo');
    const spans = tracer.recent(10);
    expect(spans.find(s => s.id === child.id)?.parentId).toBe(parent.id);
    expect(spans.find(s => s.id === parent.id)?.parentId).toBeNull();
    tracer.end(child.id);
    tracer.end(parent.id);
  });
});

describe('monitoring · eventos correlacionados', () => {
  const bus = new EventCorrelator();

  beforeEach(() => bus.clear());

  it('emite y consulta eventos', () => {
    const e = bus.emit('system.boot', 'nodo', 'info');
    expect(bus.query()).toHaveLength(1);
    expect(bus.query({ type: 'system.boot' })).toHaveLength(1);
    expect(bus.query({ type: 'otro' })).toHaveLength(0);
    expect(e.correlationId).toBeTruthy();
  });

  it('correlaciona por correlationId', () => {
    bus.emit('a', 'src', 'warning', undefined, {}, 'corr-1');
    bus.emit('b', 'src', 'info', undefined, {}, 'corr-1');
    bus.emit('c', 'src', 'info', undefined, {}, 'corr-2');
    expect(bus.correlated('corr-1')).toHaveLength(2);
  });

  it('filtra por severidad mínima', () => {
    bus.emit('i', 's', 'info');
    bus.emit('w', 's', 'warning');
    expect(bus.query({ minSeverity: 'warning' })).toHaveLength(1);
  });
});

describe('monitoring · alertas', () => {
  it('dispara y limpia alertas según umbral', () => {
    const metrics = new MetricsRegistry();
    const engine = new AlertEngine(metrics);
    engine.addRule({
      name: 'Latencia alta',
      metric: 'latencia',
      op: 'gt',
      threshold: 500,
      severity: 'warning',
      message: 'superada',
    });
    metrics.set('latencia', 800);
    const active = engine.evaluate();
    expect(active).toHaveLength(1);
    expect(active[0].severity).toBe('warning');
    metrics.set('latencia', 100);
    expect(engine.evaluate()).toHaveLength(0);
  });
});

describe('monitoring · SystemMonitor facade', () => {
  it('registra health checks y calcula overall', async () => {
    const m = new SystemMonitor();
    m.registerHealth('a', () => ({ status: 'up' as const, detail: 'ok' }));
    m.registerHealth('b', () => ({ status: 'degraded' as const, detail: 'lento' }));
    const checks = await m.healthSnapshot();
    const overall = m.overallHealth(checks);
    expect(overall.status).toBe('degraded');
    expect(overall.up).toBe(1);
    expect(overall.degraded).toBe(1);
  });

  it('snapshot global expone métricas, trazas, eventos y alertas', () => {
    const snap = monitor.statusSnapshot();
    expect(snap).toHaveProperty('metrics');
    expect(snap).toHaveProperty('traces');
    expect(snap).toHaveProperty('events');
    expect(snap).toHaveProperty('alerts');
  });
});
