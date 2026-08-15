import { describe, it, expect, vi, afterEach } from 'vitest';
import { withRetry, backoffDelay, withRetrySync } from '@/lib/resilience/retry';
import { CircuitBreaker, CircuitOpenError } from '@/lib/resilience/circuit-breaker';
import { Bulkhead } from '@/lib/resilience/bulkhead';
import { withResilience, registerStrategy, resilienceStatus } from '@/lib/resilience/index';

afterEach(() => vi.restoreAllMocks());

describe('resilience · retry', () => {
  it('reintenta hasta el máximo de intentos y luego lanza', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fail'));
    await expect(withRetry(fn, { maxAttempts: 3, baseDelayMs: 1 })).rejects.toThrow('fail');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('tiene éxito en el segundo intento', async () => {
    let calls = 0;
    const result = await withRetry(
      async () => {
        calls += 1;
        if (calls < 2) throw new Error('transient');
        return 'ok';
      },
      { maxAttempts: 3, baseDelayMs: 1 },
    );
    expect(result).toBe('ok');
    expect(calls).toBe(2);
  });

  it('no reintenta errores no reintentables', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('forbidden: 403'));
    await expect(
      withRetry(fn, { maxAttempts: 3, baseDelayMs: 1 }),
    ).rejects.toThrow('forbidden');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('backoffDelay crece exponencialmente y aplica jitter', () => {
    const d1 = backoffDelay(0, { baseDelayMs: 100, maxDelayMs: 5000, jitter: 0 });
    const d2 = backoffDelay(1, { baseDelayMs: 100, maxDelayMs: 5000, jitter: 0 });
    expect(d1).toBe(100);
    expect(d2).toBe(200);
  });

  it('withRetrySync reintenta operaciones síncronas', () => {
    let calls = 0;
    const value = withRetrySync(() => {
      calls += 1;
      if (calls < 2) throw new Error('x');
      return 'v';
    }, { attempts: 3 });
    expect(value).toBe('v');
    expect(calls).toBe(2);
  });
});

describe('resilience · circuit breaker', () => {
  it('abre el circuito tras fallos consecutivos', () => {
    const cb = new CircuitBreaker({ failureThreshold: 3, resetTimeoutMs: 1000 });
    expect(cb.getState()).toBe('closed');
    cb.recordFailure('e1');
    cb.recordFailure('e2');
    expect(cb.getState()).toBe('closed');
    cb.recordFailure('e3');
    expect(cb.getState()).toBe('open');
    expect(cb.allow()).toBe(false);
  });

  it('se recupera tras el reset (half-open → closed)', async () => {
    const cb = new CircuitBreaker({ failureThreshold: 2, resetTimeoutMs: 5 });
    cb.recordFailure('a');
    cb.recordFailure('b');
    expect(cb.getState()).toBe('open');
    await new Promise(r => setTimeout(r, 10));
    expect(cb.getState()).toBe('half-open');
    cb.recordSuccess();
    expect(cb.getState()).toBe('closed');
  });

  it('lanza CircuitOpenError y usa fallback', async () => {
    const cb = new CircuitBreaker({
      failureThreshold: 1,
      resetTimeoutMs: 1000,
      fallback: <T>(reason: string) => `degraded:${reason}` as unknown as T,
    });
    cb.recordFailure('x');
    const value = await cb.run(async () => 'nunca');
    expect(value).toContain('degraded:circuito abierto');
  });

  it('exige CircuitOpenError sin fallback', async () => {
    const cb = new CircuitBreaker({ failureThreshold: 1, resetTimeoutMs: 1000 });
    cb.recordFailure('x');
    await expect(cb.run(async () => 1)).rejects.toBeInstanceOf(CircuitOpenError);
  });
});

describe('resilience · bulkhead', () => {
  it('limita concurrencia y encola excedentes', async () => {
    const bh = new Bulkhead(1, 2);
    const gate: { release: ((v: number) => void) | null } = { release: null };
    const firstDone = new Promise<number>(resolve => {
      gate.release = resolve;
    });
    const first = bh.run(() => firstDone);
    const second = bh.run(async () => {
      await new Promise(r => setTimeout(r, 5));
      return 2;
    });
    await new Promise(r => setTimeout(r, 10));
    expect(bh.activeCount()).toBe(1);
    expect(bh.queueLength()).toBe(1);
    gate.release?.(1);
    await expect(first).resolves.toBe(1);
    await expect(second).resolves.toBe(2);
  });

  it('rechaza cuando la cola está llena', async () => {
    const bh = new Bulkhead(1, 1);
    const gate: { release: (() => void) | null } = { release: null };
    const busy = bh.run(
      () =>
        new Promise<number>(resolve => {
          gate.release = () => resolve(0);
        }),
    );
    const queued = bh.run(async () => 1);
    await expect(bh.run(async () => 2)).rejects.toThrow(/cola llena/);
    gate.release?.();
    await busy;
    await queued;
  });
});

describe('resilience · withResilience', () => {
  it('combina estrategias registradas', async () => {
    registerStrategy('test-domain', {
      retry: { maxAttempts: 2, baseDelayMs: 1 },
      failureThreshold: 3,
      resetTimeoutMs: 100,
      maxConcurrent: 5,
      maxQueue: 5,
    });
    let calls = 0;
    const value = await withResilience('test-domain', async () => {
      calls += 1;
      if (calls < 2) throw new Error('transient');
      return 'recuperado';
    });
    expect(value).toBe('recuperado');
    expect(calls).toBe(2);
  });

  it('expone el estado de resiliencia', () => {
    const status = resilienceStatus();
    expect(Array.isArray(status)).toBe(true);
  });
});
