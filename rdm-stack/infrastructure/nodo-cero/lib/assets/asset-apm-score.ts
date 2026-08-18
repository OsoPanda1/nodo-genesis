import type { Asset } from './asset-types';
import { computeAssetHealth } from './asset-health-engine';
import { fleetFailureRisk } from './asset-failure-model';
import { maintenancePlan } from './asset-predictive-maintenance';
import { generateWorkOrders, workOrderStats } from './asset-work-orders';

export type ApmScoreResult = {
  overall: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  pillars: {
    availability: number;
    reliability: number;
    maintainability: number;
    compliance: number;
  };
};

function clamp100(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function computeApmScore(assets: Asset[]): ApmScoreResult {
  if (assets.length === 0) {
    return { overall: 0, grade: 'F', pillars: { availability: 0, reliability: 0, maintainability: 0, compliance: 0 } };
  }

  const healths = assets.map(computeAssetHealth);
  const risk = fleetFailureRisk(assets);
  const plan = maintenancePlan(assets);
  const orders = workOrderStats(generateWorkOrders(assets));
  const overdueEstimate = plan.urgent + plan.high;

  const reliability = clamp100(
    healths.reduce((sum, h) => sum + h.score, 0) / healths.length -
      risk.averageProbability * 40 -
      orders.urgent * 5,
  );

  const availability = clamp100(
    100 -
      orders.urgent * 6 -
      (orders.total - orders.urgent - orders.done) * 1.5 -
      healths.filter((h) => h.status === 'failure').length * 8,
  );

  const maintainability = clamp100(100 - overdueEstimate * 2);

  const compliance = clamp100(100 - overdueEstimate * 2);

  const overall = clamp100(reliability * 0.35 + availability * 0.3 + maintainability * 0.2 + compliance * 0.15);
  const grade: ApmScoreResult['grade'] = overall >= 90 ? 'A' : overall >= 80 ? 'B' : overall >= 65 ? 'C' : overall >= 50 ? 'D' : 'F';

  return { overall, grade, pillars: { availability, reliability, maintainability, compliance } };
}
