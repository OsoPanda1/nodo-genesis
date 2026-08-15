import { BUILDING_MODEL } from './building';
import { ENERGY_GRID_MODEL } from './energy_grid';
import { WATER_NETWORK_MODEL } from './water_network';
import { VEHICLE_MODEL } from './vehicle';
import { PUBLIC_SPACE_MODEL } from './public_space';

export const TWIN_MODELS = [
  BUILDING_MODEL,
  ENERGY_GRID_MODEL,
  WATER_NETWORK_MODEL,
  VEHICLE_MODEL,
  PUBLIC_SPACE_MODEL,
];

export * from './building';
export * from './energy_grid';
export * from './water_network';
export * from './vehicle';
export * from './public_space';
