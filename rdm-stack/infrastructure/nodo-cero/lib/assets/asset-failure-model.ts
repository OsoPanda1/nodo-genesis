import type { Asset } from './asset-types';
import { computeAssetHealth } from './asset-health-engine';

export type FailureProbability = {
  assetId: string;
  probability: number;
  riskBand: 'low' | 'medium' | 'high' | 'severe';
  meanTimeToFailureDays: number;
  dominantFactor: 'temperature' | 'vibration' | 'load' | 'age' | 'condition';
  nextFailureWindow?: string;
};

const CRITICALITY_WEIGHT = { low: 0.8, medium: 1, high: 1.3, critical: 1.6 } as const;

export function failureProbability(asset: Asset): FailureProbability {
  const health = computeAssetHealth(asset);
  const ageDays = (Date.now() - new Date(asset.installedAt).getTime()) / 86_400_000;
  const lifeDays = asset.designLifeYears * 365.25;
  const ageRatio = ageDays / lifeDays;

  const telemetry = asset.telemetry;
  const tempFactor = Math.max(0, telemetry.temperatureC - 60) / 40;
  const vibFactor = telemetry.vibrationMmS === undefined ? 0 : Math.max(0, telemetry.vibrationMmS - 2) / 5;
  const loadFactor = Math.max(0, telemetry.loadPercent - 70) / 30;
  const condFactor = (100 - health.score) / 100;

  const raw = (100 - health.score) / 100 + ageRatio * 0.5 + tempFactor * 0.3 + vibFactor * 0.4 + loadFactor * 0.2 + condFactor * 0.4;

  const base = Math.min(0.95, raw * CRITICALITY_WEIGHT[asset.criticality]);

  const dominantFactor: FailureProbability['dominantFactor'] =
    vibFactor > tempFactor && vibFactor > loadFactor
      ? 'vibration'
      : tempFactor > loadFactor
        ? 'temperature'
        : loadFactor > 0.5
          ? 'load'
          : ageRatio > 0.7
            ? 'age'
            : 'condition';

  const mttfDays = Math.max(7, Math.round((1 / Math.max(0.02, base)) * (asset.condition === 'excellent' ? 1.4 : 1)));

  const riskBand: FailureProbability['riskBand'] = base >= 0.7 ? 'severe' : base >= 0.45 ? 'high' : base >= 0.2 ? 'medium' : 'low';

  return {
    assetId: asset.id,
    probability: Math.round(base * 100) / 100,
    riskBand,
    meanTimeToFailureDays: mttfDays,
    dominantFactor,
    nextFailureWindow: base >= 0.45 ? `≤${mttfDays} días` : undefined,
  };
}

export function fleetFailureRisk(assets: Asset[]) {
  const risks = assets.map(failureProbability);
  return {
    risks: [...risks].sort((a, b) => b.probability - a.probability),
    severe: risks.filter((r) => r.riskBand === 'severe').length,
    high: risks.filter((r) => r.riskBand === 'high').length,
    averageProbability: assets.length ? Math.round(risks.reduce((s, r) => s + r.probability, 0) / assets.length * 100) / 100 : 0,
  };
}
