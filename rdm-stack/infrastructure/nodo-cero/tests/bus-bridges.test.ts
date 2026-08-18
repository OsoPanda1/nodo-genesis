import { describe, it, expect, beforeEach } from 'vitest';
import { eventHistory, resetBusForTests, publishEvent } from '@/lib/core/events';
import { publishCityEvent } from '@/lib/city/city-event-bus';
import { monitor } from '@/lib/monitoring/monitor';
import { wireMonitorToUnifiedBus, resetMonitorBridgeForTests } from '@/lib/monitoring/bridge';

/* Los puentes usan import() dinámico fire-and-forget: se espera un
   tick para que el evento llegue al bus unificado. */
const flush = () => new Promise(resolve => setTimeout(resolve, 25));

beforeEach(() => {
  resetBusForTests();
  resetMonitorBridgeForTests();
  monitor.events.clear();
});

describe('puentes al bus YUN unificado', () => {
  it('city-event-bus refleja eventos de ciudad en el bus', async () => {
    publishCityEvent({
      type: 'incident.created',
      domain: 'traffic',
      severity: 'high',
      payload: { zone: 'norte' },
    });
    await flush();
    const hit = eventHistory(50, { type: 'city.incident.created' });
    expect(hit.length).toBe(1);
    expect(hit[0].domain).toBe('traffic');
    expect(hit[0].severity).toBe('warning');
    expect(hit[0].meta?.entityId).toBeTruthy();
  });

  it('el correlator de monitor refleja sus eventos en el bus', async () => {
    monitor.events.emit('circuit', 'grid-water', 'warning', { name: 'gw-1' });
    await flush();
    const hit = eventHistory(50, { type: 'monitor.circuit' });
    expect(hit.length).toBe(1);
    expect(hit[0].severity).toBe('warning');
    expect(hit[0].correlationId).toBeTruthy();
  });

  it('el bus YUN alimenta el correlator del monitor sin lazo infinito', async () => {
    wireMonitorToUnifiedBus();
    publishEvent({
      type: 'api.route.hit',
      source: 'crown-route-guard',
      domain: 'security',
      data: { route: 'api:marketplace:publish' },
    });
    await flush();

    const seen = monitor.events.query({ type: 'api.route.hit' });
    expect(seen.length).toBe(1);

    const mirrored = eventHistory(200, { type: 'monitor.api.route.hit' });
    expect(mirrored.length).toBe(1);

    await flush();
    expect(eventHistory(200, { type: 'monitor.api.route.hit' }).length).toBe(1);
    expect(monitor.events.query({ type: 'api.route.hit' }).length).toBe(1);
  });
});
