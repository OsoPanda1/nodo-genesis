import { describe, it, expect } from 'vitest';
import { seedPowerNodes, seedWaterNodes, seedGridLinks } from '@/lib/grid/grid-network';
import { computePowerBalance, computeWaterBalance } from '@/lib/grid/grid-balance';
import { buildGridAlerts, nodeStatusFor } from '@/lib/grid/grid-alerts';

describe('grid-balance · balance eléctrico', () => {
  it('reserva nunca negativa y frecuencia ~60Hz', () => {
    const balance = computePowerBalance(seedPowerNodes());
    expect(balance.reserveKw).toBeGreaterThanOrEqual(0);
    expect(balance.frequencyHz).toBeGreaterThan(59.5);
    expect(balance.frequencyHz).toBeLessThan(60.5);
    expect(['stable', 'warning', 'critical']).toContain(balance.voltageStatus);
  });

  it('carga total coincide con suma de nodos', () => {
    const nodes = seedPowerNodes();
    const balance = computePowerBalance(nodes);
    const expectedLoad = nodes.reduce((s, n) => s + n.loadKw, 0);
    expect(balance.loadKw).toBe(expectedLoad);
  });
});

describe('grid-balance · balance hídrico', () => {
  it('producción >= 0 y calidad en ppm razonable', () => {
    const balance = computeWaterBalance(seedWaterNodes());
    expect(balance.productionM3h).toBeGreaterThan(0);
    expect(balance.surplusM3h).toBeGreaterThanOrEqual(0);
    expect(balance.avgQualityPpm).toBeGreaterThanOrEqual(0);
    expect(balance.avgQualityPpm).toBeLessThanOrEqual(100);
  });
});

describe('grid-alerts · umbrales y alertas', () => {
  it('nodeStatusFor degrada por utilización', () => {
    expect(nodeStatusFor(50)).toBe('operational');
    expect(nodeStatusFor(75)).toBe('degraded');
    expect(nodeStatusFor(90)).toBe('warning');
    expect(nodeStatusFor(96)).toBe('critical');
  });

  it('genera alertas para la red sembrada', () => {
    const power = seedPowerNodes();
    const water = seedWaterNodes();
    const alerts = buildGridAlerts(power, water, seedGridLinks(power, water));
    expect(alerts.length).toBeGreaterThanOrEqual(1);
    expect(alerts.some((a) => a.level === 'warning' || a.level === 'critical')).toBe(true);
  });
});
