import type { TwinDomain, TwinInstanceRecord, TwinStatus } from './twin-types';

export interface TwinQueryFilters {
  domain?: TwinDomain;
  status?: TwinStatus;
  modelId?: string;
  text?: string;
}

export function queryTwinInstances(
  instances: TwinInstanceRecord[],
  filters: TwinQueryFilters = {},
): TwinInstanceRecord[] {
  return instances.filter((instance) => {
    if (filters.domain && !instance.modelId.includes(filters.domain) && !instance.modelId.includes(modelDomainToken(filters.domain))) {
      return false;
    }
    if (filters.status && instance.status !== filters.status) return false;
    if (filters.modelId && instance.modelId !== filters.modelId) return false;
    if (filters.text) {
      const haystack = `${instance.name} ${instance.modelId} ${JSON.stringify(instance.properties)} ${instance.id}`.toLowerCase();
      if (!haystack.includes(filters.text.toLowerCase())) return false;
    }
    return true;
  });
}

function modelDomainToken(domain: TwinDomain): string {
  const tokens: Record<TwinDomain, string> = {
    building: 'Building',
    energy: 'Energy',
    water: 'Water',
    vehicle: 'Vehicle',
    publicSpace: 'PublicSpace',
    cityService: 'CityService',
    custom: '',
  };
  return tokens[domain];
}

export function countByStatus(instances: TwinInstanceRecord[]): Record<TwinStatus, number> {
  const counts: Record<TwinStatus, number> = { healthy: 0, warning: 0, critical: 0, offline: 0 };
  for (const instance of instances) counts[instance.status] += 1;
  return counts;
}

export function instancesByDomain(instances: TwinInstanceRecord[]): Record<string, number> {
  const byDomain: Record<string, number> = {};
  for (const instance of instances) {
    const domain = instance.modelId.split(':').pop() ?? 'unknown';
    byDomain[domain] = (byDomain[domain] ?? 0) + 1;
  }
  return byDomain;
}
