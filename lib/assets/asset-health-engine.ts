import type { Asset, AssetCondition, AssetStatus } from './asset-types';

export type AssetHealth = {
  assetId: string;
  score: number;
  status: AssetStatus;
  condition: AssetCondition;
  factors: {
    temperature: number;
    vibration: number;
    load: number;
    maintenance: number;
    age: number;
  };
};

function clamp100(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function computeAssetHealth(asset: Asset): AssetHealth {
  const telemetry = asset.telemetry;

  const temperatureScore = telemetry.temperatureC <= 60 ? 100 : telemetry.temperatureC <= 75 ? 70 : telemetry.temperatureC <= 90 ? 40 : 15;

  const vibrationScore =
    telemetry.vibrationMmS === undefined ? 100 : telemetry.vibrationMmS <= 2 ? 100 : telemetry.vibrationMmS <= 4 ? 65 : telemetry.vibrationMmS <= 6 ? 35 : 10;

  const loadScore = telemetry.loadPercent <= 70 ? 100 : telemetry.loadPercent <= 85 ? 75 : telemetry.loadPercent <= 95 ? 45 : 20;

  const maintenanceScore = clamp100(100 - (Date.now() - new Date(asset.lastMaintenanceAt).getTime()) / (24 * 3600 * 1000) * 0.8);

  const ageYears = (Date.now() - new Date(asset.installedAt).getTime()) / (365.25 * 24 * 3600 * 1000);
  const ageRatio = ageYears / asset.designLifeYears;
  const ageScore = ageRatio <= 0.5 ? 100 : ageRatio <= 0.8 ? 80 : ageRatio <= 1 ? 60 : 30;

  const score = clamp100(
    temperatureScore * 0.25 +
      vibrationScore * 0.25 +
      loadScore * 0.2 +
      maintenanceScore * 0.15 +
      ageScore * 0.15,
  );

  const status: AssetStatus = score >= 80 ? 'operational' : score >= 60 ? 'degraded' : score >= 35 ? 'maintenance' : 'failure';
  const condition: AssetCondition = score >= 85 ? 'excellent' : score >= 70 ? 'good' : score >= 50 ? 'fair' : score >= 30 ? 'poor' : 'critical';

  return {
    assetId: asset.id,
    score,
    status,
    condition,
    factors: {
      temperature: temperatureScore,
      vibration: vibrationScore,
      load: loadScore,
      maintenance: maintenanceScore,
      age: ageScore,
    },
  };
}

export function assetHealthSummary(assets: Asset[]) {
  const healths = assets.map(computeAssetHealth);
  const average = assets.length ? Math.round(healths.reduce((sum, h) => sum + h.score, 0) / healths.length) : 0;
  return {
    average,
    count: assets.length,
    operational: healths.filter((h) => h.status === 'operational').length,
    degraded: healths.filter((h) => h.status === 'degraded').length,
    maintenance: healths.filter((h) => h.status === 'maintenance').length,
    failure: healths.filter((h) => h.status === 'failure').length,
    criticalCondition: healths.filter((h) => h.condition === 'critical').length,
    worst: [...healths].sort((a, b) => a.score - b.score)[0] ?? null,
  };
}
