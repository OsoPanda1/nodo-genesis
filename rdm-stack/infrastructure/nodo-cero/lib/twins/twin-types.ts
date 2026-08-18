export type TwinDomain =
  | 'building'
  | 'energy'
  | 'water'
  | 'vehicle'
  | 'publicSpace'
  | 'cityService'
  | 'custom';

export type TwinRelationKind =
  | 'feeds'
  | 'contains'
  | 'connectedTo'
  | 'locatedIn'
  | 'serves'
  | 'dependsOn'
  | 'governedBy';

export type TwinStatus = 'healthy' | 'warning' | 'critical' | 'offline';

export type TwinModelRecord = {
  id: string;
  dtmi: string;
  name: string;
  version: number;
  domain: TwinDomain;
  schema: unknown;
  createdAt: string;
  updatedAt: string;
};

export type TwinInstanceRecord = {
  id: string;
  modelId: string;
  name: string;
  externalRef?: string;
  lat?: number;
  lng?: number;
  properties: Record<string, unknown>;
  telemetry: Record<string, unknown>;
  status: TwinStatus;
  createdAt: string;
  updatedAt: string;
};

export type TwinGraphNode = {
  id: string;
  type: string;
  name: string;
  lat?: number;
  lng?: number;
  meta?: Record<string, unknown>;
};

export type TwinGraphEdge = {
  id: string;
  from: string;
  to: string;
  kind: TwinRelationKind;
  weight?: number;
};
