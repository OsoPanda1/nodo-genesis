import type { CityIncident } from './city-types';

export type InfrastructureDimension = 'energy' | 'water' | 'transport' | 'communications' | 'publicWorks';

export type InfrastructureHealth = {
  timestamp: string;
  overall: number;
  status: 'healthy' | 'degraded' | 'warning' | 'critical';
  dimensions: Record<InfrastructureDimension, { score: number; alerts: number }>;
};

const DIMENSION_SCORE = {
  energy: 0.22,
  water: 0.24,
  transport: 0.26,
  communications: 0.14,
  publicWorks: 0.14,
} as const;

export function computeInfrastructureHealth(input: {
  energyLoadPercent: number;
  waterPressureAlerts: number;
  congestionIndex: number;
  openWorkOrders: number;
  incidents: CityIncident[];
}): InfrastructureHealth {
  const energyScore = clamp100(100 - Math.max(0, input.energyLoadPercent - 75) * 2.5);
  const waterScore = clamp100(100 - input.waterPressureAlerts * 15);
  const transportScore = clamp100(100 - input.congestionIndex * 100 * 0.8);
  const communicationsScore = 94;
  const publicWorksScore = clamp100(100 - input.openWorkOrders * 2);

  const dimensions = {
    energy: { score: Math.round(energyScore), alerts: input.energyLoadPercent > 75 ? 1 : 0 },
    water: { score: Math.round(waterScore), alerts: input.waterPressureAlerts },
    transport: { score: Math.round(transportScore), alerts: input.congestionIndex >= 0.7 ? 1 : 0 },
    communications: { score: communicationsScore, alerts: 0 },
    publicWorks: { score: Math.round(publicWorksScore), alerts: input.openWorkOrders },
  };

  const overall = Math.round(
    (dimensions.energy.score * DIMENSION_SCORE.energy +
      dimensions.water.score * DIMENSION_SCORE.water +
      dimensions.transport.score * DIMENSION_SCORE.transport +
      dimensions.communications.score * DIMENSION_SCORE.communications +
      dimensions.publicWorks.score * DIMENSION_SCORE.publicWorks) /
      (DIMENSION_SCORE.energy +
        DIMENSION_SCORE.water +
        DIMENSION_SCORE.transport +
        DIMENSION_SCORE.communications +
        DIMENSION_SCORE.publicWorks),
  );

  const status = overall >= 85 ? 'healthy' : overall >= 70 ? 'degraded' : overall >= 45 ? 'warning' : 'critical';

  return { timestamp: new Date().toISOString(), overall, status, dimensions };
}

function clamp100(value: number): number {
  return Math.max(0, Math.min(100, value));
}
