export type NgsiAttributeType = 'Property' | 'Relationship' | 'GeoProperty';

export interface NgsiAttribute {
  type: NgsiAttributeType;
  value: unknown;
  observedAt?: string;
  unitCode?: string;
}

export type NgsiEntity = {
  id: string;
  type: string;
  [key: string]: string | NgsiAttribute;
};

export interface NgsiEntitySchema {
  type: string;
  properties: string[];
  relationships: string[];
  geo: 'Point' | 'LineString' | null;
  mandatory: string[];
}

export const CITY_ENTITY_SCHEMAS: Record<string, NgsiEntitySchema> = {
  Building: {
    type: 'Building',
    properties: ['floorAreaM2', 'occupancy', 'heritageGrade', 'temperature', 'humidity', 'powerKw'],
    relationships: ['locatedIn', 'serves'],
    geo: 'Point',
    mandatory: ['floorAreaM2', 'temperature'],
  },
  EnergyGrid: {
    type: 'EnergyGrid',
    properties: ['capacityKw', 'feederCount', 'loadKw', 'frequencyHz', 'voltageV'],
    relationships: ['feeds'],
    geo: 'Point',
    mandatory: ['capacityKw', 'loadKw'],
  },
  WaterNetwork: {
    type: 'WaterNetwork',
    properties: ['capacityLiters', 'sourceName', 'pressureBar', 'flowLps', 'levelPercent'],
    relationships: ['feeds'],
    geo: 'Point',
    mandatory: ['pressureBar', 'levelPercent'],
  },
  Vehicle: {
    type: 'Vehicle',
    properties: ['routeId', 'capacity', 'speedKmh', 'fuelPercent', 'gpsLat', 'gpsLng'],
    relationships: ['serves'],
    geo: 'Point',
    mandatory: ['routeId', 'speedKmh'],
  },
  PublicSpace: {
    type: 'PublicSpace',
    properties: ['surfaceM2', 'capacity', 'accessible', 'visitorsNow', 'noiseDb'],
    relationships: ['contains'],
    geo: 'Point',
    mandatory: ['surfaceM2', 'capacity'],
  },
};

export function schemaForType(type: string): NgsiEntitySchema | undefined {
  return CITY_ENTITY_SCHEMAS[type];
}

export function validateNgsiEntity(entity: NgsiEntity): { ok: boolean; missing?: string[] } {
  const schema = schemaForType(entity.type);
  if (!schema) return { ok: true };
  const present = new Set(Object.keys(entity));
  const missing = schema.mandatory.filter((m) => !present.has(m));
  if (missing.length > 0) return { ok: false, missing };
  return { ok: true };
}
