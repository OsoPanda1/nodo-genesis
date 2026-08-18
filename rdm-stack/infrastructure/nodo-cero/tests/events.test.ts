import { describe, it, expect, beforeEach } from 'vitest';
import {
  publishEvent,
  subscribe,
  onEvent,
  eventHistory,
  dlqSnapshot,
  dlqCount,
  busStats,
  resetBusForTests,
  reportFailure,
  runWithTrace,
  currentTrace,
} from '@/lib/core/events';

beforeEach(() => {
  resetBusForTests();
});

describe('bus YUN · publicación y envelope', () => {
  it('crea un envelope con ids, traza y marca ISO', () => {
    const event = publishEvent({
      type: 'city.incident.created',
      source: 'rdm-city-bus',
      domain: 'city',
      data: { severity: 'high' },
      traceId: 'trace-1',
    });
    expect(event.id).toMatch(/^evt-/);
    expect(event.type).toBe('city.incident.created');
    expect(event.traceId).toBe('trace-1');
    expect(event.correlationId).toBeTruthy();
    expect(event.causationId).toBe('');
    expect(event.version).toBe(1);
    expect(event.severity).toBe('info');
    expect(event.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('hereda traceId y correlationId del contexto', () => {
    runWithTrace({ traceId: 't-root', correlationId: 'c-root' }, () => {
      expect(currentTrace()?.traceId).toBe('t-root');
      const event = publishEvent({
        type: 'gameplay.kill',
        source: 'yun-gamification',
        domain: 'gameplay',
        data: {},
      });
      expect(event.traceId).toBe('t-root');
      expect(event.correlationId).toBe('c-root');
    });
  });

  it('acepta causationId para encadenar eventos', () => {
    const parent = publishEvent({ type: 'a', source: 's', domain: 'd', data: {}, traceId: 'x' });
    const child = publishEvent({
      type: 'b',
      source: 's',
      domain: 'd',
      data: {},
      traceId: 'x',
      correlationId: parent.correlationId,
      causationId: parent.id,
    });
    expect(child.causationId).toBe(parent.id);
    expect(child.correlationId).toBe(parent.correlationId);
  });
});

describe('bus YUN · suscripción', () => {
  it('onEvent solo recibe el tipo suscrito', () => {
    const seen: string[] = [];
    const off = onEvent('city.incident.created', e => seen.push(e.type));
    publishEvent({ type: 'city.incident.created', source: 's', domain: 'city', data: {} });
    publishEvent({ type: 'city.incident.resolved', source: 's', domain: 'city', data: {} });
    off();
    publishEvent({ type: 'city.incident.created', source: 's', domain: 'city', data: {} });
    expect(seen).toEqual(['city.incident.created']);
  });

  it('subscribe global recibe todos los eventos', () => {
    const seen: string[] = [];
    subscribe(e => seen.push(e.type));
    publishEvent({ type: 'a', source: 's', domain: 'd', data: {} });
    publishEvent({ type: 'b', source: 's', domain: 'd', data: {} });
    expect(seen).toEqual(['a', 'b']);
  });

  it('un listener que lanza va a la DLQ y no rompe el bus', () => {
    subscribe(() => {
      throw new Error('consumidor roto');
    });
    publishEvent({ type: 'a', source: 's', domain: 'd', data: {} });
    publishEvent({ type: 'b', source: 's', domain: 'd', data: {} });
    expect(dlqCount()).toBe(2);
    const snapshot = dlqSnapshot();
    expect(snapshot[0].error).toContain('consumidor roto');
  });
});

describe('bus YUN · telemetría', () => {
  it('historial filtra por tipo, dominio y traza', () => {
    publishEvent({ type: 'x', source: 's1', domain: 'a', data: {}, traceId: 't1' });
    publishEvent({ type: 'y', source: 's2', domain: 'b', data: {}, traceId: 't1' });
    publishEvent({ type: 'x', source: 's3', domain: 'b', data: {}, traceId: 't2' });
    expect(eventHistory().length).toBe(3);
    expect(eventHistory(10, { type: 'x' }).length).toBe(2);
    expect(eventHistory(10, { domain: 'b' }).length).toBe(2);
    expect(eventHistory(10, { traceId: 't2' })[0].type).toBe('x');
  });

  it('el historial es cronológico inverso y acotado', () => {
    for (let i = 0; i < 10; i++) publishEvent({ type: `e${i}`, source: 's', domain: 'd', data: {} });
    const first = eventHistory()[0];
    expect(first.type).toBe('e9');
    expect(eventHistory(3).length).toBe(3);
  });

  it('busStats reporta historial, DLQ y listeners', () => {
    subscribe(() => undefined);
    publishEvent({ type: 'a', source: 's', domain: 'd', data: {} });
    const stats = busStats();
    expect(stats.history).toBe(1);
    expect(stats.listeners).toBe(1);
    expect(stats.dlq).toBe(0);
  });

  it('reportFailure publica con severidad crítica y encola en DLQ', () => {
    reportFailure({ type: 'x', source: 's', domain: 'd', data: {} }, 'error de prueba');
    const event = eventHistory()[0];
    expect(event.severity).toBe('critical');
    expect(dlqSnapshot()[0].error).toBe('error de prueba');
  });
});
