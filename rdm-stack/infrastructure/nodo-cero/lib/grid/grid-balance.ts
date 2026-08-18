import type { PowerNode, WaterNode } from './grid-types';

export type PowerBalance = {
  generationKw: number;
  loadKw: number;
  reserveKw: number;
  reservePercent: number;
  voltageStatus: 'stable' | 'warning' | 'critical';
  frequencyHz: number;
  worstNode?: PowerNode;
};

export function computePowerBalance(nodes: PowerNode[]): PowerBalance {
  const generators = nodes.filter((n) => n.type === 'generator' || n.type === 'substation');
  const consumers = nodes.filter((n) => n.type !== 'generator' && n.type !== 'substation');

  const generationKw = generators.reduce((sum, n) => sum + n.capacityKw, 0);
  const loadKw = nodes.reduce((sum, n) => sum + n.loadKw, 0);
  const reserveKw = Math.max(0, generationKw - loadKw);
  const reservePercent = generationKw > 0 ? Math.round((reserveKw / generationKw) * 100) : 0;

  const avgVoltage = nodes.reduce((s, n) => s + n.voltagePu, 0) / Math.max(1, nodes.length);
  const voltageStatus = avgVoltage < 0.95 ? 'critical' : avgVoltage < 0.98 ? 'warning' : 'stable';

  const avgFreq = nodes.reduce((s, n) => s + n.frequencyHz, 0) / Math.max(1, nodes.length);
  const worstNode = [...nodes].sort((a, b) => a.voltagePu - b.voltagePu)[0];

  return { generationKw, loadKw, reserveKw, reservePercent, voltageStatus, frequencyHz: Math.round(avgFreq * 100) / 100, worstNode };
}

export type WaterBalance = {
  productionM3h: number;
  demandM3h: number;
  surplusM3h: number;
  storageLevelPercent: number;
  avgPressureBar: number;
  avgQualityPpm: number;
  pressureStatus: 'stable' | 'warning' | 'critical';
  worstNode?: WaterNode;
};

export function computeWaterBalance(nodes: WaterNode[]): WaterBalance {
  const production = nodes.filter((n) => n.type === 'reservoir' || n.type === 'treatment').reduce((s, n) => s + n.flowM3h, 0);
  const demand = nodes.filter((n) => n.type === 'meter').reduce((s, n) => s + n.flowM3h, 0) || 260;
  const tanks = nodes.filter((n) => n.type === 'tank');
  const storageLevelPercent = tanks.length ? Math.round(tanks.reduce((s, n) => s + n.levelPercent, 0) / tanks.length) : 0;
  const pressured = nodes.filter((n) => n.pressureBar > 0);
  const avgPressureBar = pressured.length ? Math.round((pressured.reduce((s, n) => s + n.pressureBar, 0) / pressured.length) * 10) / 10 : 0;
  const avgQualityPpm = Math.round(nodes.reduce((s, n) => s + n.qualityPpm, 0) / nodes.length);

  const pressureStatus = avgPressureBar < 2.5 ? 'critical' : avgPressureBar < 3 ? 'warning' : 'stable';
  const worstNode = [...nodes].filter((n) => n.pressureBar > 0).sort((a, b) => a.pressureBar - b.pressureBar)[0];

  return {
    productionM3h: production,
    demandM3h: demand,
    surplusM3h: Math.max(0, production - demand),
    storageLevelPercent,
    avgPressureBar,
    avgQualityPpm,
    pressureStatus,
    worstNode,
  };
}
