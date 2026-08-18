/* ------------------------------------------------------------------ */
/* GAMIFICATION YUN — Contratos del dominio                            */
/* ------------------------------------------------------------------ */
/* El cliente del juego de zombies (JS o Unity WebGL) es un emisor de  */
/* eventos firmados. La fuente de verdad de puntos, logros y ranking   */
/* vive SIEMPRE en el backend YUN (server-authoritative). Estos tipos  */
/* son compartidos por las API routes, el points-engine, el anti-cheat */
/* y el ScoreClient del navegador.                                     */
/* ------------------------------------------------------------------ */

export type GameEventType =
  | 'kill-zombie'
  | 'wave-completed'
  | 'combo'
  | 'mission-completed'
  | 'prize-redeemed';

export type SpawnZone = 'mina' | 'cultura' | 'naturaleza' | 'gastronomia' | 'calles';
export type ZombieRarity = 'comun' | 'raro' | 'epico';
export type TimeSlot = 'dia' | 'noche' | 'niebla';

export interface KillZombieEvent {
  sessionId: string;
  timestamp: number;
  archetypeId: string;
  archetypeName?: string;
  rarity?: ZombieRarity;
  zone?: SpawnZone;
  poiId?: string;
  basePoints: number;
  night?: boolean;
  fog?: boolean;
  eventMonth?: boolean;
  comboCount?: number;
  latencyMs?: number;
}

export interface WaveCompletedEvent {
  sessionId: string;
  timestamp: number;
  waveNumber: number;
}

export interface ComboEvent {
  sessionId: string;
  timestamp: number;
  comboCount: number;
}

export interface MissionCompletedEvent {
  sessionId: string;
  timestamp: number;
  missionId: string;
  reward?: number;
}

export interface PrizeRedeemedEvent {
  sessionId: string;
  timestamp: number;
  prizeId: string;
  cost: number;
}

export type GameplayEvent =
  | ({ type: 'kill-zombie' } & KillZombieEvent)
  | ({ type: 'wave-completed' } & WaveCompletedEvent)
  | ({ type: 'combo' } & ComboEvent)
  | ({ type: 'mission-completed' } & MissionCompletedEvent)
  | ({ type: 'prize-redeemed' } & PrizeRedeemedEvent);

export interface GamificationSession {
  id: string;
  actorId: string;
  deviceId: string;
  startedAt: number;
  endedAt?: number;
  totalPoints: number;
  kills: number;
  waves: number;
  maxCombo: number;
  missions: string[];
  redeemed: string[];
  flags: string[];
  leaderboardName?: string;
}

export interface LeaderboardEntry {
  id: string;
  actorId: string;
  deviceId: string;
  name: string;
  points: number;
  captures: number;
  updatedAt: number;
}

export interface SessionStartRequest {
  deviceId: string;
  actorId?: string;
  name?: string;
}

export interface SessionStartResponse {
  ok: boolean;
  sessionId: string;
  token: string;
  actorId: string;
  startedAt: number;
  mode: 'signed' | 'open';
  serverTime: number;
}

export interface EventResult {
  ok: boolean;
  accepted: boolean;
  pointsAwarded: number;
  totalPoints: number;
  sessionId: string;
  reason?: string;
  flags: string[];
}

export interface LeaderboardSnapshot {
  ok: boolean;
  entries: LeaderboardEntry[];
  actor?: LeaderboardEntry | null;
}
