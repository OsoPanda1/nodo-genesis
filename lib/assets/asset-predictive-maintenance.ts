import type { Asset, MaintenanceStrategy } from './asset-types';
import { failureProbability } from './asset-failure-model';
import { computeAssetHealth } from './asset-health-engine';

export type MaintenanceRecommendation = {
  assetId: string;
  assetName: string;
  strategy: MaintenanceStrategy;
  suggestedStrategy: MaintenanceStrategy;
  nextMaintenanceAt: string;
  dueDays: number;
  reason: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
};

function defaultMaintenanceIntervalDays(strategy: MaintenanceStrategy): number {
  switch (strategy) {
    case 'reactive':
      return 180;
    case 'preventive':
      return 90;
    case 'predictive':
      return 45;
    case 'condition-based':
      return 30;
  }
}

export function buildMaintenanceRecommendation(asset: Asset): MaintenanceRecommendation {
  const health = computeAssetHealth(asset);
  const risk = failureProbability(asset);

  const interval = defaultMaintenanceIntervalDays(asset.strategy);
  const daysSince = Math.round((Date.now() - new Date(asset.lastMaintenanceAt).getTime()) / 86_400_000);
  const dueDays = Math.max(0, interval - daysSince);

  const suggestedStrategy: MaintenanceStrategy =
    asset.criticality === 'critical' || asset.criticality === 'high'
      ? 'predictive'
      : risk.probability >= 0.3
        ? 'condition-based'
        : asset.strategy;

  const priority =
    risk.riskBand === 'severe' || health.score < 40
      ? 'urgent'
      : risk.riskBand === 'high' || health.score < 60
        ? 'high'
        : dueDays <= 7
          ? 'medium'
          : 'low';

  const reason =
    risk.riskBand === 'severe'
      ? `Riesgo severo de falla (${Math.round(risk.probability * 100)}%). Intervención inmediata recomendada.`
      : risk.riskBand === 'high'
        ? `Riesgo alto de falla (${Math.round(risk.probability * 100)}%). Programar mantenimiento prioritario.`
        : health.score < 60
          ? 'Condición por debajo del umbral operativo.'
          : 'Mantenimiento preventivo dentro del intervalo planificado.';

  return {
    assetId: asset.id,
    assetName: asset.name,
    strategy: asset.strategy,
    suggestedStrategy,
    nextMaintenanceAt: new Date(Date.now() + dueDays * 86_400_000).toISOString(),
    dueDays,
    reason,
    priority,
  };
}

export function maintenancePlan(assets: Asset[]) {
  const plan = assets.map(buildMaintenanceRecommendation);
  return {
    plan: [...plan].sort((a, b) => a.dueDays - b.dueDays),
    urgent: plan.filter((p) => p.priority === 'urgent').length,
    high: plan.filter((p) => p.priority === 'high').length,
    medium: plan.filter((p) => p.priority === 'medium').length,
    low: plan.filter((p) => p.priority === 'low').length,
    totalHoursEstimate: plan.reduce((sum, p) => sum + (p.priority === 'urgent' ? 6 : p.priority === 'high' ? 4 : 2), 0),
  };
}
