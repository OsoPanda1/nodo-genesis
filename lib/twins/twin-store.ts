import type { TwinGraphEdge, TwinInstanceRecord, TwinModelRecord, TwinStatus } from './twin-types';
import { RDM_POIS, RDM_NODES_35 } from '@/lib/data/rdm-data';
import { registerHydrator, schedulePersist } from '@/lib/core/persistence';
import { loadEdges, loadInstances, loadModels, upsertEdge, upsertInstance, upsertModel } from './repository';

const MODEL_TTL_MS = 24 * 60 * 60 * 1000;

interface TwinStoreShape {
  models: Map<string, TwinModelRecord>;
  instances: Map<string, TwinInstanceRecord>;
  edges: Map<string, TwinGraphEdge>;
}

const g = globalThis as unknown as { __rdmTwinStore?: TwinStoreShape };

function getStore(): TwinStoreShape {
  if (!g.__rdmTwinStore) {
    g.__rdmTwinStore = { models: new Map(), instances: new Map(), edges: new Map() };
    seed(g.__rdmTwinStore);
  }
  return g.__rdmTwinStore;
}

function now(): string {
  return new Date().toISOString();
}

function seed(store: TwinStoreShape): void {
  const base = [
    {
      id: 'sub-rdm',
      modelId: 'dtmi:rdm:twin:EnergyGrid;1',
      name: 'Subestación Real del Monte',
      lat: 20.1398,
      lng: -98.6738,
      properties: { capacityKw: 2400, feederCount: 4 },
      telemetry: { loadKw: 1560, frequencyHz: 59.9, voltageV: 132000 },
      status: 'healthy' as TwinStatus,
    },
    {
      id: 'tanque-1',
      modelId: 'dtmi:rdm:twin:WaterNetwork;1',
      name: 'Tanque El Crestón',
      lat: 20.1412,
      lng: -98.6719,
      properties: { capacityLiters: 1200000, sourceName: 'Ojo de Agua' },
      telemetry: { pressureBar: 2.4, flowLps: 42, levelPercent: 86 },
      status: 'healthy' as TwinStatus,
    },
    {
      id: 'museo-mineria',
      modelId: 'dtmi:rdm:twin:Building;1',
      name: 'Museo de Minería',
      lat: 20.1393,
      lng: -98.6746,
      properties: { floorAreaM2: 620, occupancy: 145, heritageGrade: 'A' },
      telemetry: { temperature: 22, humidity: 45, powerKw: 18 },
      status: 'healthy' as TwinStatus,
    },
    {
      id: 'bus-turistico-01',
      modelId: 'dtmi:rdm:twin:Vehicle;1',
      name: 'Turibús Ruta Minera',
      lat: 20.1389,
      lng: -98.6741,
      properties: { routeId: 'ruta-norte', capacity: 40 },
      telemetry: { speedKmh: 12, fuelPercent: 64 },
      status: 'warning' as TwinStatus,
    },
    {
      id: 'plaza-nacional',
      modelId: 'dtmi:rdm:twin:PublicSpace;1',
      name: 'Plaza Nacional',
      lat: 20.1395,
      lng: -98.6743,
      properties: { surfaceM2: 4100, capacity: 900, accessible: true },
      telemetry: { visitorsNow: 380, noiseDb: 62 },
      status: 'healthy' as TwinStatus,
    },
  ];
  for (const instance of base) {
    store.instances.set(instance.id, {
      createdAt: now(),
      updatedAt: now(),
      ...instance,
    });
  }
  const edges: Array<[string, string, TwinGraphEdge['kind'], number?]> = [
    ['sub-rdm', 'museo-mineria', 'feeds', 60],
    ['sub-rdm', 'plaza-nacional', 'feeds', 15],
    ['tanque-1', 'museo-mineria', 'feeds'],
    ['tanque-1', 'plaza-nacional', 'feeds'],
    ['museo-mineria', 'plaza-nacional', 'locatedIn'],
    ['bus-turistico-01', 'museo-mineria', 'serves'],
    ['bus-turistico-01', 'plaza-nacional', 'serves'],
  ];

  const derivedPois = RDM_POIS.map((poi) => ({
    id: `twin-${poi.id}`,
    modelId: poi.category === 'naturaleza' ? 'dtmi:rdm:twin:PublicSpace;1' : 'dtmi:rdm:twin:Building;1',
    name: poi.name,
    externalRef: poi.id,
    lat: poi.lat,
    lng: poi.lng,
    properties: {
      category: poi.category,
      rating: poi.rating,
      badge: poi.phygitalBadge,
      heritageGrade: poi.category === 'mina' || poi.category === 'cultura' ? 'A' : undefined,
    },
    telemetry: {
      temperature: parseFloat(poi.sensors.temp ?? '16') || 16,
      occupancy: Number.parseInt(poi.sensors.occupancy ?? '50', 10) || 50,
      traffic: poi.sensors.traffic ?? 'Bajo',
    },
    status: (poi.status === 'En mantenimiento' ? 'warning' : 'healthy') as TwinStatus,
  }));

  const derivedNodes = RDM_NODES_35.map((node) => ({
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
    status: (node.status === 'Standby' ? 'offline' : node.status === 'Sincronizado' ? 'warning' : 'healthy') as TwinStatus,
  }));

  for (const instance of [...derivedPois, ...derivedNodes]) {
    store.instances.set(instance.id, {
      createdAt: now(),
      updatedAt: now(),
      ...instance,
    });
  }

  for (const poi of RDM_POIS) {
    const from = `twin-${poi.id}`;
    if (poi.category === 'naturaleza') edges.push([from, 'plaza-nacional', 'locatedIn']);
    else edges.push([from, 'sub-rdm', 'feeds']);
    edges.push([from, 'bus-turistico-01', 'serves']);
  }

  for (const [from, to, kind, weight] of edges) {
    store.edges.set(`${from}->${to}:${kind}`, { id: `${from}->${to}:${kind}`, from, to, kind, weight });
  }
}

/** Carga inicial desde Postgres: fusiona lo persistido sobre la semilla
 *  (los registros persistidos ganan por id). */
registerHydrator('twins', async () => {
  const store = getStore();
  const [models, instances, edges] = await Promise.all([loadModels(), loadInstances(), loadEdges()]);
  for (const model of models) store.models.set(model.id, model);
  for (const instance of instances) store.instances.set(instance.id, instance);
  for (const edge of edges) store.edges.set(edge.id, edge);
});

export function registerModel(model: TwinModelRecord): TwinModelRecord {
  const store = getStore();
  const next = { ...model, createdAt: model.createdAt || now(), updatedAt: now() };
  store.models.set(model.id, next);
  schedulePersist('twins.model', () => upsertModel(next));
  return model;
}

export function getModels(): TwinModelRecord[] {
  return [...getStore().models.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function upsertTwinInstance(instance: TwinInstanceRecord): TwinInstanceRecord {
  const store = getStore();
  const existing = store.instances.get(instance.id);
  const next: TwinInstanceRecord = {
    ...instance,
    createdAt: existing?.createdAt ?? now(),
    updatedAt: now(),
  };
  store.instances.set(instance.id, next);
  schedulePersist('twins.instance', () => upsertInstance(next));
  return next;
}

export function getTwinInstances(): TwinInstanceRecord[] {
  const store = getStore();
  const nowMs = Date.now();
  for (const [id, instance] of store.instances) {
    if (nowMs - new Date(instance.updatedAt).getTime() > MODEL_TTL_MS) store.instances.delete(id);
  }
  // Re-siembra si el TTL dejó el store vacío: el gemelo no debe quedar mudo.
  if (store.instances.size === 0) {
    seed(store);
  }
  return [...store.instances.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getTwinInstance(id: string): TwinInstanceRecord | undefined {
  return getStore().instances.get(id);
}

export function addTwinEdge(edge: TwinGraphEdge): TwinGraphEdge {
  const store = getStore();
  store.edges.set(edge.id, edge);
  schedulePersist('twins.edge', () => upsertEdge(edge));
  return edge;
}

export function getTwinEdges(): TwinGraphEdge[] {
  return [...getStore().edges.values()];
}
