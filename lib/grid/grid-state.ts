import type { GridAlert, PowerNode, WaterNode } from './grid-types';
import { computePowerBalance, computeWaterBalance } from './grid-balance';

export type GridNetworkState = {
  timestamp: string;
  power: PowerNode[];
  water: WaterNode[];
  powerBalance: ReturnType<typeof computePowerBalance>;
  waterBalance: ReturnType<typeof computeWaterBalance>;
  alerts: GridAlert[];
};

export function buildGridNetworkState(power: PowerNode[], water: WaterNode[], alerts: GridAlert[]): GridNetworkState {
  return {
    timestamp: new Date().toISOString(),
    power,
    water,
    powerBalance: computePowerBalance(power),
    waterBalance: computeWaterBalance(water),
    alerts,
  };
}
