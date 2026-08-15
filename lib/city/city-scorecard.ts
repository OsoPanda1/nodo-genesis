import type { CityDomain, CityIncident, CityIocState } from './city-types';
import { incidentCountByDomain, incidentCountByStatus } from './city-event-bus';

export type CityScorecardDimension = {
  key: string;
  label: string;
  score: number;
  weight: number;
  incidents: number;
};

export type CityScorecard = {
  timestamp: string;
  overall: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  dimensions: CityScorecardDimension[];
};

export const DIMENSION_LABELS: Array<{ key: string; label: string; weight: number }> = [
  { key: 'safety', label: 'Seguridad', weight: 0.2 },
  { key: 'mobility', label: 'Movilidad', weight: 0.18 },
  { key: 'energy', label: 'Energía', weight: 0.15 },
  { key: 'water', label: 'Agua', weight: 0.15 },
  { key: 'environment', label: 'Medio ambiente', weight: 0.12 },
  { key: 'response', label: 'Respuesta', weight: 0.2 },
];

function scoreForDomain(incidents: CityIncident[], domain: CityDomain): number {
  const relevant = incidents.filter((i) => i.domain === domain);
  if (relevant.length === 0) return 92;
  const total = relevant.length;
  const critical = relevant.filter((i) => i.severity === 'critical').length;
  const high = relevant.filter((i) => i.severity === 'high').length;
  const closed = relevant.filter((i) => i.status === 'closed').length;
  let score = 100 - critical * 18 - high * 9 - (total - closed) * 2;
  return Math.max(20, Math.round(score));
}

export function buildCityScorecard(input: {
  incidents: CityIncident[];
  iocState: CityIocState;
}): CityScorecard {
  const incidents = input.incidents;
  const byDomain = incidentCountByDomain(incidents);

  const raw: Record<string, number> = {
    safety: scoreForDomain(incidents, 'police') * 0.6 + scoreForDomain(incidents, 'civilProtection') * 0.4,
    mobility: scoreForDomain(incidents, 'mobility') - input.iocState.trafficCongestionIndex * 15,
    energy: scoreForDomain(incidents, 'energy') - Math.max(0, input.iocState.energyLoadPercent - 70),
    water: scoreForDomain(incidents, 'water') - input.iocState.waterPressureAlerts * 5,
    environment: scoreForDomain(incidents, 'environment'),
    response: scoreForDomain(incidents, 'civilProtection') - input.iocState.averageResponseMinutes * 0.6,
  };

  const dimensions: CityScorecardDimension[] = DIMENSION_LABELS.map((dim) => ({
    key: dim.key,
    label: dim.label,
    weight: dim.weight,
    score: Math.max(10, Math.min(100, Math.round(raw[dim.key]))),
    incidents: byDomain[dim.key === 'safety' ? 'police' : dim.key as CityDomain] ?? 0,
  }));

  const overall = Math.round(
    dimensions.reduce((sum, dim) => sum + dim.score * dim.weight, 0),
  );

  const grade = overall >= 90 ? 'A' : overall >= 80 ? 'B' : overall >= 65 ? 'C' : overall >= 50 ? 'D' : 'F';

  return { timestamp: new Date().toISOString(), overall, grade, dimensions };
}

export function scorecardToKpis(scorecard: CityScorecard) {
  return scorecard.dimensions.map((dim) => ({
    label: dim.label,
    value: dim.score,
    unit: '/100',
  }));
}

export function statusByScore(overall: number): 'healthy' | 'degraded' | 'warning' | 'critical' {
  return overall >= 85 ? 'healthy' : overall >= 70 ? 'degraded' : overall >= 45 ? 'warning' : 'critical';
}

export function activeByStatus(incidents: CityIncident[]) {
  return incidentCountByStatus(incidents);
}
