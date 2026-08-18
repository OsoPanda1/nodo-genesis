/* ------------------------------------------------------------------ */
/* GAMIFICATION YUN — Reglas territoriales de puntuación               */
/* ------------------------------------------------------------------ */
/* Fuente única de las reglas que el points-engine aplica a los        */
/* eventos. Nunca las calcula el cliente: el servidor decide cuánto    */
/* vale cada acción usando estas tablas (server-authoritative).        */
/* ------------------------------------------------------------------ */

import type { SpawnZone, TimeSlot, ZombieRarity } from './contracts';

/* Multiplicador de zona del territorio. */
export const ZONE_MULTIPLIER: Record<SpawnZone, number> = {
  mina: 1.2,
  cultura: 1.1,
  naturaleza: 1.0,
  gastronomia: 1.0,
  calles: 0.9,
};

/* Multiplicador de tiempo (día / noche / niebla). */
export const TIME_MULTIPLIER: Record<TimeSlot, number> = {
  dia: 1.0,
  noche: 1.3,
  niebla: 1.5,
};

/* Puntos base por rareza (si el cliente no reporta basePoints). */
export const BASE_POINTS_BY_RARITY: Record<ZombieRarity, number> = {
  comun: 100,
  raro: 500,
  epico: 2000,
};

/* Mes de evento del territorio: doble puntuación. */
export const EVENT_MONTH_MULTIPLIER = 2;

/* Bonus por oleada superada: 50 × número de oleada. */
export const WAVE_BONUS_BASE = 50;

/* Tabla de bonus por combo de capturas consecutivas. */
export const COMBO_MULTIPLIER: Array<{ min: number; max: number; multiplier: number }> = [
  { min: 0, max: 1, multiplier: 1 },
  { min: 2, max: 3, multiplier: 1.25 },
  { min: 4, max: 6, multiplier: 1.5 },
  { min: 7, max: 9, multiplier: 1.75 },
  { min: 10, max: Number.MAX_SAFE_INTEGER, multiplier: 2 },
];

/* Topes de seguridad aplicados por el points-engine. */
export const POINT_LIMITS = {
  MAX_KILL_POINTS: 1000,
  MAX_WAVE_NUMBER: 1000,
  MAX_COMBO: 500,
  MAX_MISSION_REWARD: 5000,
  MAX_PRIZE_COST: 25000,
} as const;

/* Rangos de validación del anti-cheat. */
export const CHEAT_LIMITS = {
  MAX_KILLS_PER_MINUTE: 8,
  MAX_EVENTS_PER_MINUTE: 30,
  MAX_TIMESTAMP_DRIFT_SECONDS: 90,
  MIN_SESSION_DURATION_MS: 5_000,
  MAX_SESSION_DURATION_MS: 6 * 60 * 60 * 1000,
} as const;

/** Multiplicador de combo para un contador dado. */
export function comboMultiplier(comboCount: number): number {
  const row = COMBO_MULTIPLIER.find(r => comboCount >= r.min && comboCount <= r.max);
  return row?.multiplier ?? 1;
}

/** Puntos finales de una captura de zombie. */
export function computeKillPoints(input: {
  basePoints?: number;
  rarity?: ZombieRarity;
  zone?: SpawnZone;
  night: boolean;
  fog: boolean;
  eventMonth: boolean;
  comboCount?: number;
}): number {
  const base = input.basePoints ?? BASE_POINTS_BY_RARITY[input.rarity ?? 'comun'];
  let points = base;

  const zone = input.zone ?? 'calles';
  points *= ZONE_MULTIPLIER[zone] ?? 1;

  if (input.night) points *= TIME_MULTIPLIER.noche;
  if (input.fog) points *= TIME_MULTIPLIER.niebla;
  if (input.eventMonth) points *= EVENT_MONTH_MULTIPLIER;

  points *= comboMultiplier(input.comboCount ?? 0);

  return Math.min(POINT_LIMITS.MAX_KILL_POINTS, Math.round(points));
}

/** Puntos de oleada superada (50 × oleada, con tope). */
export function computeWavePoints(waveNumber: number): number {
  if (waveNumber < 1 || waveNumber > POINT_LIMITS.MAX_WAVE_NUMBER) return 0;
  return WAVE_BONUS_BASE * waveNumber;
}
