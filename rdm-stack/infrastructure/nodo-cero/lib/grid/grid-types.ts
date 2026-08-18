export type GridDomain = 'power' | 'water';

export type NodeStatus = 'operational' | 'degraded' | 'warning' | 'critical' | 'offline';

export type PowerNodeType = 'substation' | 'transformer' | 'feeder' | 'generator' | 'meter' | 'switch';

export type WaterNodeType = 'reservoir' | 'tank' | 'pump' | 'valve' | 'pipe' | 'meter' | 'treatment';

export type PowerNode = {
  id: string;
  name: string;
  type: PowerNodeType;
  zone: string;
  status: NodeStatus;
  capacityKw: number;
  loadKw: number;
  voltagePu: number;
  frequencyHz: number;
};

export type WaterNode = {
  id: string;
  name: string;
  type: WaterNodeType;
  zone: string;
  status: NodeStatus;
  capacityM3: number;
  flowM3h: number;
  levelPercent: number;
  pressureBar: number;
  qualityPpm: number;
};

export type GridLink = {
  from: string;
  to: string;
  domain: GridDomain;
  capacity: number;
  utilizationPercent: number;
};

export type GridAlert = {
  id: string;
  domain: GridDomain;
  nodeId: string;
  message: string;
  level: 'info' | 'warning' | 'critical';
  timestamp: string;
};
