import { describe, it, expect } from 'vitest';
import { seedAssets } from '@/lib/assets/asset-registry';
import { computeAssetHealth, assetHealthSummary } from '@/lib/assets/asset-health-engine';
import { failureProbability, fleetFailureRisk } from '@/lib/assets/asset-failure-model';
import { maintenancePlan } from '@/lib/assets/asset-predictive-maintenance';
import { generateWorkOrders, workOrderStats } from '@/lib/assets/asset-work-orders';
import { computeApmScore } from '@/lib/assets/asset-apm-score';

describe('asset-health-engine · salud de activos', () => {
  it('puntúa cada activo dentro de 0-100', () => {
    for (const asset of seedAssets()) {
      const health = computeAssetHealth(asset);
      expect(health.score).toBeGreaterThanOrEqual(0);
      expect(health.score).toBeLessThanOrEqual(100);
      expect(['operational', 'degraded', 'maintenance', 'failure']).toContain(health.status);
    }
  });

  it('resumen de flota reporta promedio y conteos', () => {
    const summary = assetHealthSummary(seedAssets());
    expect(summary.count).toBe(seedAssets().length);
    expect(summary.average).toBeGreaterThanOrEqual(0);
    expect(summary.worst).toBeTruthy();
  });
});

describe('asset-failure-model · riesgo de falla', () => {
  it('probabilidad entre 0 y 1 con banda de riesgo', () => {
    for (const asset of seedAssets()) {
      const risk = failureProbability(asset);
      expect(risk.probability).toBeGreaterThanOrEqual(0);
      expect(risk.probability).toBeLessThanOrEqual(0.95);
      expect(['low', 'medium', 'high', 'severe']).toContain(risk.riskBand);
      expect(risk.meanTimeToFailureDays).toBeGreaterThanOrEqual(7);
    }
  });

  it('fleetFailureRisk ordena de mayor a menor riesgo', () => {
    const fleet = fleetFailureRisk(seedAssets());
    const sorted = fleet.risks.every((r, i) => i === 0 || fleet.risks[i - 1].probability >= r.probability);
    expect(sorted).toBe(true);
  });
});

describe('asset-predictive-maintenance · plan de mantenimiento', () => {
  it('genera recomendaciones con prioridad y fecha', () => {
    const plan = maintenancePlan(seedAssets());
    expect(plan.plan.length).toBe(seedAssets().length);
    expect(plan.urgent + plan.high + plan.medium + plan.low).toBe(plan.plan.length);
    for (const rec of plan.plan) {
      expect(['low', 'medium', 'high', 'urgent']).toContain(rec.priority);
      expect(new Date(rec.nextMaintenanceAt).getTime()).toBeGreaterThan(Date.now() - 86_400_000);
    }
  });
});

describe('asset-work-orders · órdenes de trabajo', () => {
  it('genera una orden por activo con prioridad coherente', () => {
    const orders = generateWorkOrders(seedAssets());
    expect(orders.length).toBe(seedAssets().length);
    for (const order of orders) {
      expect(order.origin).not.toBe('manual');
      expect(['low', 'medium', 'high', 'urgent']).toContain(order.priority);
      expect(order.estimatedHours).toBeGreaterThan(0);
    }
  });

  it('estadísticas cuadran con el total', () => {
    const orders = generateWorkOrders(seedAssets());
    const stats = workOrderStats(orders);
    expect(stats.total).toBe(orders.length);
    expect(stats.open + stats.scheduled + stats.inProgress + stats.done).toBe(stats.total);
  });
});

describe('asset-apm-score · puntaje global APM', () => {
  it('produce overall, grade y 4 pilares', () => {
    const score = computeApmScore(seedAssets());
    expect(score.overall).toBeGreaterThanOrEqual(0);
    expect(score.overall).toBeLessThanOrEqual(100);
    expect(['A', 'B', 'C', 'D', 'F']).toContain(score.grade);
    expect(Object.keys(score.pillars).sort()).toEqual(['availability', 'compliance', 'maintainability', 'reliability']);
  });

  it('sin activos la calificación es F', () => {
    const score = computeApmScore([]);
    expect(score.grade).toBe('F');
    expect(score.overall).toBe(0);
  });
});
