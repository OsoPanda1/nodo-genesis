import type { TwinInstanceRecord } from '../twin-types';
import type { NgsiAttribute, NgsiEntity } from './entity_schemas';
import { validateNgsiEntity } from './entity_schemas';

function attribute(type: NgsiAttribute['type'], value: unknown, observedAt?: string): NgsiAttribute {
  return { type, value, observedAt: observedAt ?? new Date().toISOString() };
}

export function twinInstanceToNgsi(instance: TwinInstanceRecord): NgsiEntity {
  const entity: NgsiEntity = {
    id: `urn:ngsi-ld:${instance.modelId}:${instance.id}`,
    type: instance.modelId.split(':').pop() ?? 'Twin',
  };

  for (const [key, value] of Object.entries(instance.properties)) {
    entity[key] = attribute('Property', value);
  }
  for (const [key, value] of Object.entries(instance.telemetry)) {
    entity[key] = attribute('Property', value);
  }
  if (instance.lat !== undefined && instance.lng !== undefined) {
    entity.location = attribute('GeoProperty', { type: 'Point', coordinates: [instance.lng, instance.lat] });
  }
  entity.status = attribute('Property', instance.status);
  return entity;
}

export function ngsiToTwinInstance(entity: NgsiEntity): Partial<TwinInstanceRecord> {
  const properties: Record<string, unknown> = {};
  const telemetry: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(entity)) {
    if (key === 'id' || key === 'type' || key === 'location') continue;
    if (value && typeof value === 'object' && 'type' in value) {
      const attr = value as NgsiAttribute;
      if (key === 'status') continue;
      if (attr.type === 'Property') {
        if (typeof attr.value === 'number' || typeof attr.value === 'string') telemetry[key] = attr.value;
      }
    }
  }

  return { properties, telemetry };
}

export function applyNgsiPatch(entity: NgsiEntity, patch: Record<string, unknown>): NgsiEntity {
  for (const [key, value] of Object.entries(patch)) {
    if (key === 'id' || key === 'type') continue;
    entity[key] = attribute('Property', value);
  }
  const check = validateNgsiEntity(entity);
  if (!check.ok && check.missing) throw new Error(`NGSI-LD incompleto: faltan ${check.missing.join(', ')}`);
  return entity;
}
