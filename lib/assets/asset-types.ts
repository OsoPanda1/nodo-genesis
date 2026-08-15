export type AssetCategory =
  | 'transformer'
  | 'switchgear'
  | 'pump'
  | 'valve'
  | 'pipe'
  | 'vehicle'
  | 'conveyor'
  | 'compressor'
  | 'structure'
  | 'hvac';

export type AssetCriticality = 'low' | 'medium' | 'high' | 'critical';

export type AssetStatus = 'operational' | 'degraded' | 'maintenance' | 'failure' | 'retired';

export type AssetCondition = 'excellent' | 'good' | 'fair' | 'poor' | 'critical';

export type MaintenanceStrategy = 'reactive' | 'preventive' | 'predictive' | 'condition-based';

export type AssetLocation = {
  zone: string;
  building?: string;
  coordinates?: { lat: number; lng: number };
};

export type AssetTelemetry = {
  temperatureC: number;
  vibrationMmS?: number;
  pressureBar?: number;
  runtimeHours: number;
  loadPercent: number;
  lastUpdated: string;
};

export type Asset = {
  id: string;
  code: string;
  name: string;
  category: AssetCategory;
  criticality: AssetCriticality;
  status: AssetStatus;
  condition: AssetCondition;
  strategy: MaintenanceStrategy;
  location: AssetLocation;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  installedAt: string;
  designLifeYears: number;
  lastMaintenanceAt: string;
  telemetry: AssetTelemetry;
  tags: string[];
};
