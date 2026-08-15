export type CityDomain =
  | 'police'
  | 'fire'
  | 'traffic'
  | 'utilities'
  | 'publicWorks'
  | 'health'
  | 'civilProtection'
  | 'mobility'
  | 'energy'
  | 'water'
  | 'environment';

export type CitySeverity = 'low' | 'medium' | 'high' | 'critical';

export type CityIncidentStatus = 'open' | 'triaged' | 'assigned' | 'mitigated' | 'closed';

export type CityIncidentSource = 'sensor' | 'citizen' | 'operator' | 'integration' | 'ai';

export type CityIncident = {
  id: string;
  domain: CityDomain;
  title: string;
  description: string;
  severity: CitySeverity;
  status: CityIncidentStatus;
  location?: { lat: number; lng: number; label?: string };
  source: CityIncidentSource;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  relatedEntityIds: string[];
};

export type CityIocKpi = {
  label: string;
  value: number;
  unit: string;
  delta?: number;
  trend?: 'up' | 'down' | 'flat';
};

export type CityIocState = {
  timestamp: string;
  activeIncidents: number;
  criticalIncidents: number;
  averageResponseMinutes: number;
  openWorkOrders: number;
  trafficCongestionIndex: number;
  energyLoadPercent: number;
  waterPressureAlerts: number;
  citizenReports24h: number;
  kpis: CityIocKpi[];
};

export type CityEvent = {
  id: string;
  type: string;
  domain: CityDomain;
  severity: CitySeverity;
  timestamp: string;
  payload: Record<string, unknown>;
};
