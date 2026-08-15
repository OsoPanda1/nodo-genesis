import { describe, it, expect } from 'vitest';
import { comboMultiplier, computeKillPoints, computeWavePoints, POINT_LIMITS } from '@/lib/gamification/rules';

describe('rules · comboMultiplier', () => {
  it('1 y 0 sin bonus', () => {
    expect(comboMultiplier(0)).toBe(1);
    expect(comboMultiplier(1)).toBe(1);
  });
  it('2-3 → 1.25', () => {
    expect(comboMultiplier(2)).toBe(1.25);
    expect(comboMultiplier(3)).toBe(1.25);
  });
  it('4-6 → 1.5', () => {
    expect(comboMultiplier(5)).toBe(1.5);
  });
  it('7-9 → 1.75', () => {
    expect(comboMultiplier(8)).toBe(1.75);
  });
  it('10+ → 2', () => {
    expect(comboMultiplier(10)).toBe(2);
    expect(comboMultiplier(999)).toBe(2);
  });
});

describe('rules · computeKillPoints (multiplicadores territoriales)', () => {
  it('base sin modificadores', () => {
    expect(computeKillPoints({ basePoints: 100, night: false, fog: false, eventMonth: false })).toBe(90);
  });
  it('zona mina (1.2)', () => {
    expect(computeKillPoints({ basePoints: 100, zone: 'mina', night: false, fog: false, eventMonth: false })).toBe(120);
  });
  it('noche (1.3)', () => {
    expect(computeKillPoints({ basePoints: 100, night: true, fog: false, eventMonth: false })).toBe(117);
  });
  it('niebla (1.5) acumulada con noche (zona por defecto calles 0.9)', () => {
    expect(computeKillPoints({ basePoints: 100, night: true, fog: true, eventMonth: false })).toBe(176);
  });
  it('mes de evento (x2)', () => {
    expect(computeKillPoints({ basePoints: 100, night: false, fog: false, eventMonth: true })).toBe(180);
  });
  it('combo 2 (1.25) aplicado', () => {
    expect(computeKillPoints({ basePoints: 100, night: false, fog: false, eventMonth: false, comboCount: 2 })).toBe(113);
  });
  it('nunca supera MAX_KILL_POINTS', () => {
    const points = computeKillPoints({ basePoints: 1000, zone: 'mina', night: true, fog: true, eventMonth: true, comboCount: 10 });
    expect(points).toBeLessThanOrEqual(POINT_LIMITS.MAX_KILL_POINTS);
    expect(points).toBe(POINT_LIMITS.MAX_KILL_POINTS);
  });
});

describe('rules · computeWavePoints', () => {
  it('oleada 1 → 50', () => {
    expect(computeWavePoints(1)).toBe(50);
  });
  it('oleada 5 → 250', () => {
    expect(computeWavePoints(5)).toBe(250);
  });
  it('oleada fuera de rango → 0', () => {
    expect(computeWavePoints(0)).toBe(0);
    expect(computeWavePoints(1001)).toBe(0);
  });
});
