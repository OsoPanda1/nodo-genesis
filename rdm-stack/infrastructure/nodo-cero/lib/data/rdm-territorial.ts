import { RDM_NODES_35, RDM_POIS } from './rdm-data';
import type { POI, YUNNode } from './rdm-data';
import type { TwinInstanceRecord, TwinStatus } from '@/lib/twins/twin-types';
import type { Asset, AssetCategory, AssetCriticality, AssetStatus, AssetCondition, MaintenanceStrategy } from '@/lib/assets/asset-types';
import type { PowerNode, WaterNode } from '@/lib/grid/grid-types';
import type { CityIncident, CityDomain, CitySeverity } from '@/lib/city/city-types';

/* ------------------------------------------------------------------ */
/* Adaptadores: datos reales del territorio (RDM_POIS / RDM_NODES_35) */
/* → gemelos, activos, red, incidentes. Se mantienen puros y          */
/* deterministas para que los seeds sigan siendo reproducibles.       */
/* ------------------------------------------------------------------ */

const MINUTES_AGO = (m: number) => new Date(Date.now() - m * 60_000).toISOString();
const DAYS_AGO = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString();

function parsePercent(value: string | undefined): number {
  if (!value) return 50;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? Math.min(100, Math.max(0, parsed)) : 50;
}

function parseTempC(value: string | undefined): number {
  if (!value) return 16;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 16;
}

const POI_TWIN_MODEL: Record<POI['category'], string> = {
  mina: 'dtmi:rdm:twin:Building;1',
  gastronomia: 'dtmi:rdm:twin:Building;1',
  cultura: 'dtmi:rdm:twin:Building;1',
  plateria: 'dtmi:rdm:twin:Building;1',
  hotel: 'dtmi:rdm:twin:Building;1',
  naturaleza: 'dtmi:rdm:twin:PublicSpace;1',
};

function poiTwinStatus(poi: POI): TwinStatus {
  if (poi.status === 'En mantenimiento') return 'warning';
  return 'healthy';
}

export function poisToTwinInstances(pois: POI[]): TwinInstanceRecord[] {
  return pois.map((poi) => ({
    id: `twin-${poi.id}`,
    modelId: POI_TWIN_MODEL[poi.category],
    name: poi.name,
    externalRef: poi.id,
    lat: poi.lat,
    lng: poi.lng,
    properties: {
      category: poi.category,
      rating: poi.rating,
      badge: poi.phygitalBadge,
      description: poi.description,
    },
    telemetry: {
      temperature: parseTempC(poi.sensors.temp),
      occupancy: parsePercent(poi.sensors.occupancy),
      trafficLevel: poi.sensors.traffic ?? 'Bajo',
    },
    status: poiTwinStatus(poi),
    createdAt: DAYS_AGO(120),
    updatedAt: MINUTES_AGO(30),
  }));
}

function nodeTwinStatus(node: YUNNode): TwinStatus {
  if (node.status === 'Standby') return 'offline';
  if (node.status === 'Sincronizado') return 'warning';
  return 'healthy';
}

export function nodesToTwinInstances(nodes: YUNNode[]): TwinInstanceRecord[] {
  return nodes.map((node) => ({
    id: `yun-${node.id}`,
    modelId: 'dtmi:rdm:twin:CityService;1',
    name: node.title,
    externalRef: node.code,
    properties: {
      coreId: node.coreId,
      coreName: node.coreName,
      category: node.category,
      endpoint: node.endpoint,
    },
    telemetry: {
      latencyMs: Number.parseInt(node.latency, 10) || 0,
      statusLabel: node.status,
    },
    status: nodeTwinStatus(node),
    createdAt: DAYS_AGO(180),
    updatedAt: MINUTES_AGO(15),
  }));
}

const POI_ASSET_CATEGORY: Record<POI['category'], AssetCategory> = {
  mina: 'structure',
  gastronomia: 'hvac',
  cultura: 'structure',
  plateria: 'structure',
  hotel: 'hvac',
  naturaleza: 'structure',
};

const POI_ASSET_CRITICALITY: Record<POI['category'], AssetCriticality> = {
  mina: 'high',
  gastronomia: 'medium',
  cultura: 'medium',
  plateria: 'medium',
  hotel: 'low',
  naturaleza: 'low',
};

export function poisToAssets(pois: POI[]): Asset[] {
  return pois.map((poi, index) => ({
    id: `asst-poi-${poi.id}`,
    code: `POI-${String(index + 1).padStart(3, '0')}`,
    name: poi.name,
    category: POI_ASSET_CATEGORY[poi.category],
    criticality: POI_ASSET_CRITICALITY[poi.category],
    status: poi.status === 'En mantenimiento' ? 'maintenance' : 'operational',
    condition: poi.status === 'En mantenimiento' ? 'fair' : 'good',
    strategy: 'preventive',
    location: {
      zone: 'Real del Monte',
      building: poi.name,
      coordinates: { lat: poi.lat, lng: poi.lng },
    },
    manufacturer: 'Patrimonio RDM',
    model: `RDM-${poi.category.toUpperCase()}`,
    serialNumber: `RDM-${poi.id}`,
    installedAt: DAYS_AGO(400 + index * 7),
    designLifeYears: 50,
    lastMaintenanceAt: DAYS_AGO(20 + index * 3),
    telemetry: {
      temperatureC: parseTempC(poi.sensors.temp),
      runtimeHours: 4200 + index * 210,
      loadPercent: parsePercent(poi.sensors.occupancy),
      lastUpdated: MINUTES_AGO(30),
    },
    tags: [poi.category, 'poi', 'patrimonio', poi.status === 'En mantenimiento' ? 'mantenimiento' : 'operativo'],
  }));
}

export function poisToPowerNodes(pois: POI[]): PowerNode[] {
  return pois.map((poi) => ({
    id: `pw-${poi.id}`,
    name: poi.name,
    type: 'meter',
    zone: 'Real del Monte',
    status: poi.status === 'En mantenimiento' ? 'degraded' : 'operational',
    capacityKw: 15,
    loadKw: 2 + (parsePercent(poi.sensors.occupancy) % 9),
    voltagePu: 1.0,
    frequencyHz: 60.0,
  }));
}

export function poisToWaterNodes(pois: POI[]): WaterNode[] {
  return pois.map((poi) => ({
    id: `wt-${poi.id}`,
    name: poi.name,
    type: 'meter',
    zone: 'Real del Monte',
    status: 'operational',
    capacityM3: 0,
    flowM3h: 3 + (parsePercent(poi.sensors.occupancy) % 6),
    levelPercent: 0,
    pressureBar: 0,
    qualityPpm: 12 + (parsePercent(poi.sensors.temp || '0') % 8),
  }));
}

export function nodesToPowerNodes(nodes: YUNNode[]): PowerNode[] {
  const byTitle = (fragment: string) => nodes.find((n) => n.title.toLowerCase().includes(fragment));
  const alumbrado = byTitle('alumbrado');
  const parking = byTitle('estacionamiento');
  const traffic = byTitle('tráfico');

  const derived: PowerNode[] = [];
  if (alumbrado) {
    derived.push({
      id: `gen-alumbrado`,
      name: alumbrado.title,
      type: 'generator',
      zone: 'Real del Monte',
      status: 'operational',
      capacityKw: 320,
      loadKw: 190,
      voltagePu: 1.0,
      frequencyHz: 60.0,
    });
  }
  if (parking) {
    derived.push({
      id: `sw-parking`,
      name: parking.title,
      type: 'switch',
      zone: 'Centro',
      status: 'operational',
      capacityKw: 120,
      loadKw: 72,
      voltagePu: 0.99,
      frequencyHz: 60.0,
    });
  }
  if (traffic) {
    derived.push({
      id: `sw-trafico`,
      name: traffic.title,
      type: 'switch',
      zone: 'Acceso norte',
      status: 'warning',
      capacityKw: 90,
      loadKw: 78,
      voltagePu: 0.97,
      frequencyHz: 59.95,
    });
  }
  return derived;
}

const POI_INCIDENT_DOMAIN: Record<string, CityDomain> = {
  pasteleria: 'traffic',
  plaza: 'traffic',
};

export function poisToIncidents(pois: POI[]): CityIncident[] {
  const incidents: CityIncident[] = [];
  for (const poi of pois) {
    const occupancy = parsePercent(poi.sensors.occupancy);
    const traffic = poi.sensors.traffic;

    if (occupancy >= 80 || traffic === 'Alto') {
      const domain = POI_INCIDENT_DOMAIN[poi.id] ?? 'traffic';
      incidents.push({
        id: `inc-poi-${poi.id}`,
        domain,
        title: `Aforo alto en ${poi.name}`,
        description: `Ocupación del ${occupancy}% con flujo elevado. Se recomienda vigilancia del aforo.`,
        severity: 'medium' as CitySeverity,
        status: 'open',
        location: { lat: poi.lat, lng: poi.lng, label: poi.name },
        source: 'sensor',
        createdAt: MINUTES_AGO(45 + incidents.length * 9),
        updatedAt: MINUTES_AGO(10),
        tags: ['aforo', 'turismo', poi.category],
        relatedEntityIds: [`twin-${poi.id}`],
      });
    } else if (poi.status === 'En mantenimiento') {
      incidents.push({
        id: `inc-poi-${poi.id}`,
        domain: 'publicWorks',
        title: `Mantenimiento en ${poi.name}`,
        description: `El punto se encuentra en mantenimiento. Coordinar horarios de atención.`,
        severity: 'low' as CitySeverity,
        status: 'open',
        location: { lat: poi.lat, lng: poi.lng, label: poi.name },
        source: 'operator',
        createdAt: MINUTES_AGO(30),
        updatedAt: MINUTES_AGO(10),
        tags: ['mantenimiento', poi.category],
        relatedEntityIds: [`twin-${poi.id}`, `asst-poi-${poi.id}`],
      });
    } else if (parseTempC(poi.sensors.temp) < 11) {
      incidents.push({
        id: `inc-poi-${poi.id}`,
        domain: 'environment',
        title: `Temperatura baja en ${poi.name}`,
        description: `Condición climática fría en zona exterior. Riesgo bajo para visitantes.`,
        severity: 'low' as CitySeverity,
        status: 'open',
        location: { lat: poi.lat, lng: poi.lng, label: poi.name },
        source: 'sensor',
        createdAt: MINUTES_AGO(60),
        updatedAt: MINUTES_AGO(15),
        tags: ['clima', poi.category],
        relatedEntityIds: [`twin-${poi.id}`],
      });
    }
  }
  return incidents;
}

export const RDM_TERRITORIAL = {
  pois: RDM_POIS,
  nodes: RDM_NODES_35,
  twins: {
    pois: () => poisToTwinInstances(RDM_POIS),
    nodes: () => nodesToTwinInstances(RDM_NODES_35),
  },
  assets: () => poisToAssets(RDM_POIS),
  grid: {
    power: () => [...poisToPowerNodes(RDM_POIS), ...nodesToPowerNodes(RDM_NODES_35)],
    water: () => poisToWaterNodes(RDM_POIS),
  },
  incidents: () => poisToIncidents(RDM_POIS),
};

export { RDM_POIS, RDM_NODES_35 };
