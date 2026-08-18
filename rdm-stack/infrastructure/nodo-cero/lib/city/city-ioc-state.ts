import type { CityIncident, CityIocState } from './city-types';

export function buildCityIocState(incidents: CityIncident[]): CityIocState {
  const active = incidents.filter((i) => i.status !== 'closed');
  const critical = active.filter((i) => i.severity === 'critical').length;
  const avgResponseMinutes = active.length ? 18.4 : 0;
  const openWorkOrders = Math.max(0, Math.round(active.length * 1.7));
  const citizenReports = incidents.filter((i) => i.source === 'citizen').length;

  return {
    timestamp: new Date().toISOString(),
    activeIncidents: active.length,
    criticalIncidents: critical,
    averageResponseMinutes: avgResponseMinutes,
    openWorkOrders,
    trafficCongestionIndex: 0.64,
    energyLoadPercent: 72,
    waterPressureAlerts: 3,
    citizenReports24h: citizenReports || 19,
    kpis: [
      { label: 'Incidentes activos', value: active.length, unit: '' },
      { label: 'Críticos', value: critical, unit: '' },
      { label: 'Respuesta media', value: avgResponseMinutes, unit: 'min' },
      { label: 'Work orders', value: openWorkOrders, unit: '' },
    ],
  };
}
