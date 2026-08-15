import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  NEON_FREE_CU_HOURS,
  neonCuHoursLimit,
  neonPingCooldownMs,
  trackComputeActivity,
  neonBudgetStatus,
  isNeonBudgetExhausted,
  canPingNeon,
  markNeonPing,
  resetNeonBudgetForTests,
} from '@/lib/core/persistence/neon-budget';

const env = process.env as Record<string, string | undefined>;

beforeEach(() => {
  delete env.NEON_CU_HOURS_LIMIT;
  delete env.NEON_PING_COOLDOWN_MS;
  resetNeonBudgetForTests();
});

afterEach(() => {
  delete env.NEON_CU_HOURS_LIMIT;
  delete env.NEON_PING_COOLDOWN_MS;
});

describe('neon-budget · límites del plan Free', () => {
  it('usa el límite por defecto del plan Free (100 CU-hours)', () => {
    expect(neonCuHoursLimit()).toBe(NEON_FREE_CU_HOURS);
    expect(neonCuHoursLimit()).toBe(100);
  });

  it('acepta un límite configurado vía entorno', () => {
    env.NEON_CU_HOURS_LIMIT = '50';
    expect(neonCuHoursLimit()).toBe(50);
  });

  it('ignora límites inválidos y cae al default', () => {
    env.NEON_CU_HOURS_LIMIT = 'abc';
    expect(neonCuHoursLimit()).toBe(NEON_FREE_CU_HOURS);
  });

  it('acumula actividad de cómputo y reporta el ratio de uso', () => {
    trackComputeActivity(10 * 60 * 1000); /* 10 min de computa activa */
    const status = neonBudgetStatus();
    expect(status.usedHours).toBeCloseTo(10 / 60, 5);
    expect(status.limitHours).toBe(100);
    expect(status.usageRatio).toBeCloseTo((10 / 60) / 100, 5);
    expect(status.exhausted).toBe(false);
  });

  it('marca el presupuesto como agotado al llegar al límite mensual', () => {
    env.NEON_CU_HOURS_LIMIT = '1';
    trackComputeActivity(2 * 60 * 60 * 1000); /* 2 h ≥ 1 h */
    expect(isNeonBudgetExhausted()).toBe(true);
    expect(neonBudgetStatus().exhausted).toBe(true);
  });

  it('no suma actividad inválida o negativa', () => {
    trackComputeActivity(-1000);
    trackComputeActivity(NaN);
    expect(neonBudgetStatus().usedHours).toBe(0);
  });
});

describe('neon-budget · cooldown de pings (scale-to-zero)', () => {
  it('usa el cooldown por defecto de 5 minutos', () => {
    expect(neonPingCooldownMs()).toBe(5 * 60 * 1000);
  });

  it('acepta un cooldown configurado', () => {
    env.NEON_PING_COOLDOWN_MS = '60000';
    expect(neonPingCooldownMs()).toBe(60000);
  });

  it('permite pingear al inicio y lo bloquea tras un ping reciente', () => {
    const start = Date.now();
    expect(canPingNeon(start)).toBe(true);
    markNeonPing(start);
    expect(canPingNeon(start + 1000)).toBe(false);
    expect(canPingNeon(start + 5 * 60 * 1000)).toBe(true);
  });

  it('reporta el mes actual y el cooldown en el estado', () => {
    const status = neonBudgetStatus();
    expect(status.month).toMatch(/^\d{4}-\d{2}$/);
    expect(status.cooldownMs).toBe(5 * 60 * 1000);
  });
});
