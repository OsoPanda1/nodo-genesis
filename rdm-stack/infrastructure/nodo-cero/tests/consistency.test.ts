import { describe, it, expect, beforeEach } from 'vitest';
import {
  CONSISTENCY_CLASSES,
  isClassAllowed,
  modeForClass,
  effectiveTimeoutMs,
  setFederationHealth,
  getFederationHealth,
  federationStatus,
} from '@/lib/resilience/consistency';
import type { ConsistencyClass } from '@/lib/resilience/consistency';

beforeEach(() => {
  /* reinicia el estado de salud de federaciones */
  for (const id of ['node-0', 'node-1']) {
    setFederationHealth(id, 'none');
  }
});

describe('consistency · clases de consistencia', () => {
  it('define las 5 clases con timeout creciente', () => {
    const timeouts = (['C0', 'C1', 'C2', 'C3', 'C4'] as ConsistencyClass[]).map(c => CONSISTENCY_CLASSES[c].timeoutMs);
    for (let i = 1; i < timeouts.length; i += 1) {
      expect(timeouts[i]).toBeGreaterThan(timeouts[i - 1]);
    }
  });

  it('C0 permite stale y no exige ACK; C4 exige ACK y un solo salto', () => {
    expect(CONSISTENCY_CLASSES.C0.allowStale).toBe(true);
    expect(CONSISTENCY_CLASSES.C0.requireAck).toBe(false);
    expect(CONSISTENCY_CLASSES.C4.allowStale).toBe(false);
    expect(CONSISTENCY_CLASSES.C4.requireAck).toBe(true);
    expect(CONSISTENCY_CLASSES.C4.maxHops).toBe(1);
  });

  it('modo operacional permite todas las clases', () => {
    for (const cls of ['C0', 'C1', 'C2', 'C3', 'C4'] as const) {
      expect(modeForClass(cls, 'operational')).toBe(true);
    }
  });

  it('modo degradado bloquea C3 y C4', () => {
    expect(isClassAllowed('C2', 'degraded')).toBe(true);
    expect(isClassAllowed('C3', 'degraded')).toBe(false);
    expect(isClassAllowed('C4', 'degraded')).toBe(false);
  });

  it('modo locked-down solo permite C0', () => {
    expect(isClassAllowed('C0', 'locked-down')).toBe(true);
    expect(isClassAllowed('C1', 'locked-down')).toBe(false);
    expect(isClassAllowed('C4', 'locked-down')).toBe(false);
  });

  it('el timeout efectivo en locked-down queda acotado al de C0', () => {
    expect(effectiveTimeoutMs('C4', 'locked-down')).toBeLessThanOrEqual(
      CONSISTENCY_CLASSES.C0.timeoutMs,
    );
    expect(effectiveTimeoutMs('C4', 'operational')).toBe(CONSISTENCY_CLASSES.C4.timeoutMs);
  });
});

describe('consistency · degradación de federaciones', () => {
  it('registra y consulta el nivel de salud', () => {
    setFederationHealth('node-1', 'soft', 'latencia alta');
    const health = getFederationHealth('node-1');
    expect(health.level).toBe('soft');
    expect(health.lastError).toBe('latencia alta');
    expect(health.since).toBeGreaterThan(0);
  });

  it('mantiene el nivel si no cambia, sin resetear timestamp', () => {
    setFederationHealth('node-1', 'hard', 'timeout');
    const first = getFederationHealth('node-1').since;
    setFederationHealth('node-1', 'hard');
    expect(getFederationHealth('node-1').since).toBe(first);
  });

  it('no inventa salud para federaciones no registradas', () => {
    expect(getFederationHealth('nodo-inexistente').level).toBe('none');
    expect(federationStatus().some(h => h.id === 'nodo-inexistente')).toBe(false);
  });
});
