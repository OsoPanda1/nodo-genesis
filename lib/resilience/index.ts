/* ================================================================== */
/* RESILIENCIA — Estrategias unificadas                                */
/* ================================================================== */
/* Combina reintentos, circuit breaker y bulkhead en un único punto   */
/* de entrada con registro de estrategias por dominio.                */
/* ================================================================== */

import { withRetry, type RetryOptions } from '@/lib/resilience/retry';
import { CircuitBreaker } from '@/lib/resilience/circuit-breaker';
import { Bulkhead } from '@/lib/resilience/bulkhead';
import { monitor } from '@/lib/monitoring/monitor';

export type ResilienceStrategy = {
  retry: RetryOptions;
  failureThreshold: number;
  resetTimeoutMs: number;
  maxConcurrent: number;
  maxQueue: number;
};

const DEFAULT_STRATEGY: ResilienceStrategy = {
  retry: { maxAttempts: 3, baseDelayMs: 100, maxDelayMs: 2000, factor: 2, jitter: 0.2 },
  failureThreshold: 5,
  resetTimeoutMs: 30_000,
  maxConcurrent: 20,
  maxQueue: 50,
};

const strategies = new Map<string, ResilienceStrategy>();
const breakers = new Map<string, CircuitBreaker>();
const bulkheads = new Map<string, Bulkhead>();

/** Registra (o actualiza) una estrategia por dominio. */
export function registerStrategy(name: string, strategy: Partial<ResilienceStrategy> = {}): void {
  strategies.set(name, { ...DEFAULT_STRATEGY, ...strategy });
}

export function getStrategy(name: string): ResilienceStrategy {
  return strategies.get(name) ?? DEFAULT_STRATEGY;
}

export function getBreaker(name: string): CircuitBreaker {
  let cb = breakers.get(name);
  if (!cb) {
    const s = getStrategy(name);
    cb = new CircuitBreaker({
      failureThreshold: s.failureThreshold,
      resetTimeoutMs: s.resetTimeoutMs,
      onStateChange: (from, to, reason) => {
        monitor.events.emit('circuit', name, to === 'open' ? 'critical' : 'warning', {
          from,
          to,
          reason,
        });
        monitor.metrics.set('circuit_state', to === 'open' ? 1 : 0, { service: name });
      },
    });
    breakers.set(name, cb);
  }
  return cb;
}

export function getBulkhead(name: string): Bulkhead {
  let bh = bulkheads.get(name);
  if (!bh) {
    const s = getStrategy(name);
    bh = new Bulkhead(s.maxConcurrent, s.maxQueue);
    bulkheads.set(name, bh);
  }
  return bh;
}

/** Ejecuta fn con resiliencia completa para un dominio registrado. */
export async function withResilience<T>(
  name: string,
  fn: () => Promise<T>,
): Promise<T> {
  const strategy = getStrategy(name);
  const breaker = getBreaker(name);
  const bulkhead = getBulkhead(name);

  return bulkhead.run(() =>
    withRetry(() => breaker.run(fn), {
      ...strategy.retry,
      retryable: err => {
        if (err instanceof Error && err.name === 'CircuitOpenError') return false;
        return true;
      },
    }),
  );
}

/** Estado de resiliencia de todas las estrategias. */
export function resilienceStatus(): Array<{
  name: string;
  state: string;
  active: number;
  queue: number;
}> {
  return [...new Set([...strategies.keys(), ...breakers.keys(), ...bulkheads.keys()])].map(
    name => ({
      name,
      state: breakers.get(name)?.getState() ?? 'closed',
      active: bulkheads.get(name)?.activeCount() ?? 0,
      queue: bulkheads.get(name)?.queueLength() ?? 0,
    }),
  );
}

export * from './consistency';
