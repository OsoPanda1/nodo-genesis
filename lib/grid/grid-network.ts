import type { GridLink, PowerNode, WaterNode } from './grid-types';
import { RDM_POIS, RDM_NODES_35 } from '@/lib/data/rdm-data';

function poisToPowerNodes(): PowerNode[] {
  return RDM_POIS.map((poi) => {
    const occupancy = Number.parseInt(poi.sensors.occupancy ?? '50', 10) || 50;
    return {
      id: `pw-${poi.id}`,
      name: poi.name,
      type: 'meter',
      zone: 'Real del Monte',
      status: poi.status === 'En mantenimiento' ? 'degraded' : 'operational',
      capacityKw: 15,
      loadKw: 2 + (occupancy % 8),
      voltagePu: 1.0,
      frequencyHz: 60.0,
    };
  });
}

function nodesToPowerNodes(): PowerNode[] {
  return RDM_NODES_35
    .filter((node) => node.category === 'Infraestructura' || node.title.toLowerCase().includes('alumbrado'))
    .map((node, index) => ({
      id: `nw-${node.id}`,
      name: node.title,
      type: index % 2 === 0 ? ('transformer' as const) : ('switch' as const),
      zone: node.coreName,
      status: node.status === 'Optimo' ? 'operational' : node.status === 'Sincronizado' ? 'degraded' : 'warning',
      capacityKw: 120 + index * 40,
      loadKw: 60 + index * 22,
      voltagePu: 1.0 - index * 0.01,
      frequencyHz: 60.0,
    }));
}

function poisToWaterNodes(): WaterNode[] {
  return RDM_POIS.map((poi) => {
    const temp = Number.parseFloat(poi.sensors.temp ?? '16') || 16;
    return {
      id: `wt-${poi.id}`,
      name: poi.name,
      type: 'pipe',
      zone: 'Real del Monte',
      status: 'operational',
      capacityM3: 0,
      flowM3h: 8 + (temp % 10),
      levelPercent: 0,
      pressureBar: 0,
      qualityPpm: 10 + (temp % 8),
    };
  });
}

export function seedPowerNodes(): PowerNode[] {
  return [
    { id: 'gen-solar', name: 'Granja solar Real', type: 'generator', zone: 'Real del Monte', status: 'operational', capacityKw: 1200, loadKw: 820, voltagePu: 1.01, frequencyHz: 60.02 },
    { id: 'sub-central', name: 'Subestación central', type: 'substation', zone: 'Centro', status: 'operational', capacityKw: 2500, loadKw: 1710, voltagePu: 1.0, frequencyHz: 60.0 },
    { id: 'sub-creston', name: 'Subestación El Crestón', type: 'substation', zone: 'El Crestón', status: 'degraded', capacityKw: 1800, loadKw: 1500, voltagePu: 0.96, frequencyHz: 59.9 },
    { id: 'tra-pasta', name: 'Transformador Pasta de Conchos', type: 'transformer', zone: 'Pasta de Conchos', status: 'operational', capacityKw: 800, loadKw: 610, voltagePu: 0.99, frequencyHz: 60.0 },
    { id: 'fed-norte', name: 'Alimentador norte', type: 'feeder', zone: 'Acceso norte', status: 'warning', capacityKw: 600, loadKw: 470, voltagePu: 0.97, frequencyHz: 59.95 },
    { id: 'sw-cc1', name: 'Seccionador CC-1', type: 'switch', zone: 'Centro', status: 'operational', capacityKw: 400, loadKw: 210, voltagePu: 1.0, frequencyHz: 60.0 },
    ...poisToPowerNodes(),
    ...nodesToPowerNodes(),
  ];
}

export function seedWaterNodes(): WaterNode[] {
  return [
    { id: 'emb-barra', name: 'Embalse La Barranca', type: 'reservoir', zone: 'Sierra', status: 'operational', capacityM3: 520000, flowM3h: 1450, levelPercent: 78, pressureBar: 0, qualityPpm: 12 },
    { id: 'pta-trat', name: 'Planta de tratamiento', type: 'treatment', zone: 'Planta', status: 'operational', capacityM3: 24000, flowM3h: 1180, levelPercent: 0, pressureBar: 4.2, qualityPpm: 8 },
    { id: 'tanque-1', name: 'Tanque El Crestón', type: 'tank', zone: 'El Crestón', status: 'degraded', capacityM3: 3200, flowM3h: 210, levelPercent: 41, pressureBar: 2.6, qualityPpm: 15 },
    { id: 'bmb-norte', name: 'Bomba Tanque norte', type: 'pump', zone: 'Tanque norte', status: 'warning', capacityM3: 0, flowM3h: 180, levelPercent: 0, pressureBar: 3.1, qualityPpm: 15 },
    { id: 'vav-s7', name: 'Válvula sector 7', type: 'valve', zone: 'Sector 7', status: 'operational', capacityM3: 0, flowM3h: 95, levelPercent: 0, pressureBar: 3.4, qualityPpm: 14 },
    { id: 'mtr-centro', name: 'Macromedidor centro', type: 'meter', zone: 'Centro', status: 'operational', capacityM3: 0, flowM3h: 260, levelPercent: 0, pressureBar: 3.0, qualityPpm: 15 },
    ...poisToWaterNodes(),
  ];
}

export function seedGridLinks(power: PowerNode[], water: WaterNode[]): GridLink[] {
  return [
    { from: 'gen-solar', to: 'sub-central', domain: 'power', capacity: 1200, utilizationPercent: 68 },
    { from: 'sub-central', to: 'sub-creston', domain: 'power', capacity: 1800, utilizationPercent: 83 },
    { from: 'sub-central', to: 'tra-pasta', domain: 'power', capacity: 800, utilizationPercent: 76 },
    { from: 'sub-central', to: 'fed-norte', domain: 'power', capacity: 600, utilizationPercent: 78 },
    { from: 'tra-pasta', to: 'sw-cc1', domain: 'power', capacity: 400, utilizationPercent: 52 },
    { from: 'emb-barra', to: 'pta-trat', domain: 'water', capacity: 2000, utilizationPercent: 73 },
    { from: 'pta-trat', to: 'tanque-1', domain: 'water', capacity: 1500, utilizationPercent: 68 },
    { from: 'tanque-1', to: 'bmb-norte', domain: 'water', capacity: 800, utilizationPercent: 55 },
    { from: 'bmb-norte', to: 'vav-s7', domain: 'water', capacity: 500, utilizationPercent: 42 },
    { from: 'vav-s7', to: 'mtr-centro', domain: 'water', capacity: 600, utilizationPercent: 43 },
  ];
}
