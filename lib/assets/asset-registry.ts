import type { Asset } from './asset-types';
import { RDM_POIS } from '@/lib/data/rdm-data';

const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString();

const POI_CATEGORY_TO_ASSET: Record<string, Asset['category']> = {
  mina: 'structure',
  gastronomia: 'hvac',
  cultura: 'structure',
  naturaleza: 'structure',
  plateria: 'structure',
  hotel: 'hvac',
};

const POI_CATEGORY_CRITICALITY: Record<string, Asset['criticality']> = {
  mina: 'high',
  gastronomia: 'medium',
  cultura: 'medium',
  naturaleza: 'low',
  plateria: 'medium',
  hotel: 'medium',
};

function poisToAssets(): Asset[] {
  return RDM_POIS.map((poi, index) => {
    const occupancy = Number.parseInt(poi.sensors.occupancy ?? '50', 10) || 50;
    const temperature = Number.parseFloat(poi.sensors.temp ?? '16') || 16;
    return {
      id: `asst-poi-${poi.id}`,
      code: `RDM-POI-${String(index + 1).padStart(3, '0')}`,
      name: poi.name,
      category: POI_CATEGORY_TO_ASSET[poi.category],
      criticality: POI_CATEGORY_CRITICALITY[poi.category],
      status: poi.status === 'En mantenimiento' ? 'maintenance' : 'operational',
      condition: poi.status === 'En mantenimiento' ? 'poor' : 'good',
      strategy: 'preventive',
      location: { zone: 'Real del Monte', building: poi.name, coordinates: { lat: poi.lat, lng: poi.lng } },
      manufacturer: 'Patrimonio RDM',
      model: `RDM-${poi.category.toUpperCase()}`,
      serialNumber: `RDM-${poi.id}`,
      installedAt: daysAgo(1800 + index * 30),
      designLifeYears: 30,
      lastMaintenanceAt: daysAgo(30 + index * 2),
      telemetry: {
        temperatureC: temperature,
        loadPercent: occupancy,
        runtimeHours: 8000 + index * 400,
        lastUpdated: new Date().toISOString(),
      },
      tags: [poi.category, 'patrimonio', 'poi', poi.status],
    };
  });
}

export function seedAssets(): Asset[] {
  return [
    {
      id: 'asst-001',
      code: 'TRA-ELC-01',
      name: 'Transformador El Crestón 12.5kVA',
      category: 'transformer',
      criticality: 'critical',
      status: 'operational',
      condition: 'good',
      strategy: 'predictive',
      location: { zone: 'El Crestón', building: 'Subestación central', coordinates: { lat: 20.1412, lng: -98.6719 } },
      manufacturer: 'ABB',
      model: 'TRA-12500',
      serialNumber: 'ABB-2214-0781',
      installedAt: daysAgo(520),
      designLifeYears: 25,
      lastMaintenanceAt: daysAgo(40),
      telemetry: { temperatureC: 62, vibrationMmS: 1.2, runtimeHours: 12050, loadPercent: 78, lastUpdated: new Date().toISOString() },
      tags: ['energy', 'critical', 'grid'],
    },
    {
      id: 'asst-002',
      code: 'BMB-AGU-01',
      name: 'Bomba hidráulica Tanque Norte',
      category: 'pump',
      criticality: 'high',
      status: 'degraded',
      condition: 'poor',
      strategy: 'condition-based',
      location: { zone: 'Tanque norte', building: 'Estación de bombeo 1', coordinates: { lat: 20.144, lng: -98.668 } },
      manufacturer: 'Grundfos',
      model: 'CR-95',
      serialNumber: 'GRF-9982',
      installedAt: daysAgo(640),
      designLifeYears: 15,
      lastMaintenanceAt: daysAgo(95),
      telemetry: { temperatureC: 71, vibrationMmS: 4.8, pressureBar: 3.2, runtimeHours: 18900, loadPercent: 91, lastUpdated: new Date().toISOString() },
      tags: ['water', 'high', 'pumping'],
    },
    {
      id: 'asst-003',
      code: 'BSV-TUR-01',
      name: 'Turibús ruta norte',
      category: 'vehicle',
      criticality: 'medium',
      status: 'maintenance',
      condition: 'fair',
      strategy: 'preventive',
      location: { zone: 'Patio de maniobras', coordinates: { lat: 20.1398, lng: -98.6738 } },
      manufacturer: 'Volvo',
      model: '9800',
      serialNumber: 'VOL-2021-440',
      installedAt: daysAgo(900),
      designLifeYears: 12,
      lastMaintenanceAt: daysAgo(12),
      telemetry: { temperatureC: 88, runtimeHours: 22600, loadPercent: 40, lastUpdated: new Date().toISOString() },
      tags: ['mobility', 'fleet'],
    },
    {
      id: 'asst-004',
      code: 'VLV-GAS-07',
      name: 'Válvula sector 7 gasoducto',
      category: 'valve',
      criticality: 'critical',
      status: 'operational',
      condition: 'good',
      strategy: 'preventive',
      location: { zone: 'Sector 7', coordinates: { lat: 20.1386, lng: -98.6751 } },
      manufacturer: 'Bray',
      model: 'BV-300',
      serialNumber: 'BRY-0304',
      installedAt: daysAgo(300),
      designLifeYears: 20,
      lastMaintenanceAt: daysAgo(30),
      telemetry: { temperatureC: 45, pressureBar: 6.1, runtimeHours: 7200, loadPercent: 55, lastUpdated: new Date().toISOString() },
      tags: ['gas', 'critical', 'network'],
    },
    {
      id: 'asst-005',
      code: 'CMP-AIR-02',
      name: 'Compresor planta tratamiento',
      category: 'compressor',
      criticality: 'high',
      status: 'operational',
      condition: 'fair',
      strategy: 'predictive',
      location: { zone: 'Planta de tratamiento', coordinates: { lat: 20.1435, lng: -98.6701 } },
      manufacturer: 'Atlas Copco',
      model: 'GA-90',
      serialNumber: 'AC-7720',
      installedAt: daysAgo(1100),
      designLifeYears: 18,
      lastMaintenanceAt: daysAgo(70),
      telemetry: { temperatureC: 58, vibrationMmS: 2.6, runtimeHours: 25400, loadPercent: 84, lastUpdated: new Date().toISOString() },
      tags: ['water', 'treatment'],
    },
    {
      id: 'asst-006',
      code: 'TRB-MIN-01',
      name: 'Cinta transportadora escombrera',
      category: 'conveyor',
      criticality: 'low',
      status: 'operational',
      condition: 'excellent',
      strategy: 'reactive',
      location: { zone: 'Escombrera', coordinates: { lat: 20.1375, lng: -98.6769 } },
      manufacturer: 'Metso',
      model: 'CV-450',
      serialNumber: 'MET-1188',
      installedAt: daysAgo(200),
      designLifeYears: 10,
      lastMaintenanceAt: daysAgo(10),
      telemetry: { temperatureC: 41, vibrationMmS: 1.1, runtimeHours: 4100, loadPercent: 62, lastUpdated: new Date().toISOString() },
      tags: ['mining', 'waste'],
    },
    ...poisToAssets(),
  ];
}

export type AssetRegistry = { assets: Asset[] };

const g = globalThis as unknown as { __rdmAssets?: AssetRegistry };

export function getAssetRegistry(): AssetRegistry {
  if (!g.__rdmAssets) g.__rdmAssets = { assets: seedAssets() };
  return g.__rdmAssets;
}

export function listAssets(): Asset[] {
  return getAssetRegistry().assets;
}

export function getAsset(id: string): Asset | undefined {
  return getAssetRegistry().assets.find((a) => a.id === id);
}

export function registerAsset(asset: Omit<Asset, 'id' | 'installedAt' | 'lastMaintenanceAt' | 'lastUpdated'>): Asset {
  const registry = getAssetRegistry();
  const full: Asset = {
    ...asset,
    id: `asst-${Math.random().toString(36).slice(2, 8)}`,
    installedAt: new Date().toISOString(),
    lastMaintenanceAt: new Date().toISOString(),
  };
  registry.assets.push(full);
  return full;
}
