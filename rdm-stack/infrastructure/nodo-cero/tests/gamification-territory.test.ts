import { describe, it, expect } from 'vitest';
import {
  computeChallengeProgress,
  computeAllChallenges,
  getTerritoryPulse,
  getGamificationTerritoryStatus,
  type TerritoryPulse,
} from '@/lib/gamification/territory';
import { RDM_CHALLENGES } from '@/lib/rdm/rdm-content';
import { RDM_POIS } from '@/lib/data/rdm-data';

const ZONES = ['mina', 'cultura', 'naturaleza', 'gastronomia', 'calles'] as const;

function makePulse(overrides: Partial<TerritoryPulse> = {}): TerritoryPulse {
  return {
    timestamp: Date.now(),
    incidents: { open: 0, critical: 0, resolved: 0, total: 0, byDomain: {} },
    twins: { total: 0, healthy: 0 },
    marketplace: { published: 0, subscriptions: 0 },
    payments: { confirmed: 0, confirmedAmount: 0 },
    pressureByPoi: {},
    pressureByZone: { mina: 0, cultura: 0, naturaleza: 0, gastronomia: 0, calles: 0 },
    ...overrides,
  };
}

describe('computeChallengeProgress', () => {
  it('reto desconocido → 0', () => {
    const pulse = makePulse();
    expect(computeChallengeProgress('c-999', pulse)).toBe(0);
  });

  it('c-2 mide listados publicados sobre el objetivo (6)', () => {
    const pulse = makePulse({ marketplace: { published: 3, subscriptions: 0 } });
    expect(computeChallengeProgress('c-2', pulse)).toBe(50);
    const completo = makePulse({ marketplace: { published: 6, subscriptions: 0 } });
    expect(computeChallengeProgress('c-2', completo)).toBe(100);
  });

  it('c-5 mide incidentes resueltos sobre el total', () => {
    const pulse = makePulse({
      incidents: { open: 2, critical: 1, resolved: 3, total: 5, byDomain: { water: 5 } },
    });
    expect(computeChallengeProgress('c-5', pulse)).toBe(60);
    expect(computeChallengeProgress('c-5', makePulse())).toBe(0);
  });

  it('c-6 mide pagos confirmados sobre el objetivo (12)', () => {
    const pulse = makePulse({ payments: { confirmed: 6, confirmedAmount: 1200 } });
    expect(computeChallengeProgress('c-6', pulse)).toBe(50);
    expect(computeChallengeProgress('c-6', makePulse({ payments: { confirmed: 12, confirmedAmount: 2400 } }))).toBe(100);
  });

  it('c-1 mide minas sin presión sobre el total de minas', () => {
    const minas = RDM_POIS.filter(p => p.category === 'mina');
    const conPresion = new Set(minas.slice(0, Math.max(1, Math.floor(minas.length / 2))).map(p => p.id));
    const pressureByPoi: Record<string, number> = {};
    for (const id of conPresion) pressureByPoi[id] = 1;
    const pulse = makePulse({ pressureByPoi });
    const progress = computeChallengeProgress('c-1', pulse);
    expect(progress).toBeGreaterThan(0);
    expect(progress).toBeLessThan(100);
  });
});

describe('getTerritoryPulse', () => {
  it('devuelve un pulso bien formado desde los stores reales', () => {
    const pulse = getTerritoryPulse();
    expect(pulse.timestamp).toBeGreaterThan(0);
    expect(pulse.incidents.total).toBeGreaterThanOrEqual(0);
    expect(pulse.incidents.open).toBeGreaterThanOrEqual(0);
    expect(pulse.incidents.resolved).toBeGreaterThanOrEqual(0);
    expect(pulse.incidents.byDomain).toBeDefined();
    expect(pulse.twins.total).toBeGreaterThan(0);
    expect(pulse.twins.healthy).toBeGreaterThanOrEqual(0);
    expect(pulse.marketplace.published).toBeGreaterThanOrEqual(0);
    expect(pulse.marketplace.subscriptions).toBeGreaterThanOrEqual(0);
    expect(pulse.payments.confirmed).toBeGreaterThanOrEqual(0);
    expect(pulse.payments.confirmedAmount).toBeGreaterThanOrEqual(0);
  });

  it('las zonas de presión cubren las 5 zonas y están normalizadas a 0..1', () => {
    const pulse = getTerritoryPulse();
    for (const zone of ZONES) {
      expect(pulse.pressureByZone[zone]).toBeGreaterThanOrEqual(0);
      expect(pulse.pressureByZone[zone]).toBeLessThanOrEqual(1);
    }
  });

  it('la presión por POI solo referencia POIs conocidos', () => {
    const pulse = getTerritoryPulse();
    const conocidos = new Set(RDM_POIS.map(p => p.id));
    for (const poiId of Object.keys(pulse.pressureByPoi)) {
      expect(conocidos.has(poiId)).toBe(true);
      expect(pulse.pressureByPoi[poiId]).toBeGreaterThan(0);
    }
  });
});

describe('computeAllChallenges y getGamificationTerritoryStatus', () => {
  it('los retos conservan id, título, categoría y puntos del contenido', () => {
    const challenges = computeAllChallenges(getTerritoryPulse());
    expect(challenges).toHaveLength(RDM_CHALLENGES.length);
    for (const c of challenges) {
      const original = RDM_CHALLENGES.find(r => r.id === c.id);
      expect(original).toBeDefined();
      expect(c.title).toBe(original?.title);
      expect(c.category).toBe(original?.category);
      expect(c.points).toBe(original?.points);
      expect(c.progress).toBeGreaterThanOrEqual(0);
      expect(c.progress).toBeLessThanOrEqual(100);
    }
  });

  it('el estado territorial global expone territory, challenges y stats', () => {
    const status = getGamificationTerritoryStatus();
    expect(status.territory).toBeDefined();
    expect(status.challenges).toHaveLength(RDM_CHALLENGES.length);
    expect(status.stats).toBeDefined();
  });
});
