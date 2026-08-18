/* ------------------------------------------------------------------ */
/* GAMIFICATION YUN — ScoreClient del navegador                        */
/* ------------------------------------------------------------------ */
/* Puente entre el juego JS (Zombies RDM Invasion) y el backend        */
/* server-authoritative. Envía eventos firmados y NUNCA decide puntos  */
/* finales: el servidor responde totalPoints. Fire-and-forget para     */
/* mantener la latencia del juego en cero (no bloquea el gameplay).    */
/* Con fallback local (modo simulación) si la API no responde.         */
/* ------------------------------------------------------------------ */

import { computeKillPoints } from './rules';
import type { KillZombieEvent, SpawnZone, ZombieRarity } from './contracts';

const DEVICE_KEY = 'zombies:rdm:device:v1';
const SESSION_KEY = 'zombies:rdm:session:v1';
const API_BASE = '/api/gamification';

export interface ClientSession {
  sessionId: string;
  token: string;
  mode: 'signed' | 'open';
  actorId: string;
}

function readJson<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* almacenamiento no disponible */
  }
}

export function getDeviceId(): string {
  let deviceId = readJson<string>(DEVICE_KEY);
  if (!deviceId) {
    deviceId = `dev-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
    writeJson(DEVICE_KEY, deviceId);
  }
  return deviceId;
}

export function getCachedSession(): ClientSession | null {
  return readJson<ClientSession>(SESSION_KEY);
}

export function cacheSession(session: ClientSession): void {
  writeJson(SESSION_KEY, session);
}

export function clearCachedSession(): void {
  if (typeof window !== 'undefined') window.localStorage.removeItem(SESSION_KEY);
}

async function post(path: string, body: unknown): Promise<unknown> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => null)) as Record<string, unknown>;
  if (!res.ok || data.ok === false) {
    throw new Error(`Gamification API ${path}: ${res.status} ${String(data.error ?? 'error')}`);
  }
  return data;
}

export async function startSession(name?: string): Promise<ClientSession> {
  const cached = getCachedSession();
  if (cached) return cached;

  try {
    const data = (await post('/session', {
      action: 'start',
      deviceId: getDeviceId(),
      name,
    })) as {
      sessionId: string;
      token: string;
      mode: 'signed' | 'open';
      actorId: string;
    };
    const session: ClientSession = {
      sessionId: data.sessionId,
      token: data.token,
      mode: data.mode,
      actorId: data.actorId,
    };
    cacheSession(session);
    return session;
  } catch {
    const fallback: ClientSession = {
      sessionId: `local-${Math.random().toString(36).slice(2, 10)}`,
      token: '',
      mode: 'open',
      actorId: 'guardian-local',
    };
    cacheSession(fallback);
    return fallback;
  }
}

export async function endSession(): Promise<void> {
  const cached = getCachedSession();
  if (!cached || cached.sessionId.startsWith('local-')) {
    clearCachedSession();
    return;
  }
  try {
    await post('/session', { action: 'end', sessionId: cached.sessionId });
  } catch {
    /* ignorar fallo de cierre */
  }
  clearCachedSession();
}

async function reportEvent(type: string, payload: Record<string, unknown>): Promise<number | null> {
  const session = getCachedSession();
  if (!session || session.sessionId.startsWith('local-')) return null;

  try {
    const data = (await post('/events', {
      type,
      sessionId: session.sessionId,
      token: session.token,
      timestamp: Date.now(),
      ...payload,
    })) as { accepted: boolean; pointsAwarded: number; totalPoints: number };
    return data.accepted ? data.totalPoints : null;
  } catch {
    return null;
  }
}

export interface KillReportInput {
  archetypeId: string;
  archetypeName?: string;
  rarity?: ZombieRarity;
  zone?: SpawnZone;
  poiId?: string;
  basePoints: number;
  night: boolean;
  fog: boolean;
  eventMonth: boolean;
  comboCount?: number;
}

/** Reporta una captura; devuelve el totalPoints del servidor o null. */
export function reportKill(input: KillReportInput): Promise<number | null> {
  return reportEvent('kill-zombie', {
    archetypeId: input.archetypeId,
    archetypeName: input.archetypeName,
    rarity: input.rarity,
    zone: input.zone,
    poiId: input.poiId,
    basePoints: input.basePoints,
    night: input.night,
    fog: input.fog,
    eventMonth: input.eventMonth,
    comboCount: input.comboCount ?? 0,
  });
}

export function reportWave(waveNumber: number): Promise<number | null> {
  return reportEvent('wave-completed', { waveNumber });
}

export function reportCombo(comboCount: number): Promise<number | null> {
  return reportEvent('combo', { comboCount });
}

export function reportMission(missionId: string, reward: number): Promise<number | null> {
  return reportEvent('mission-completed', { missionId, reward });
}

export function reportPrize(prizeId: string, cost: number): Promise<number | null> {
  return reportEvent('prize-redeemed', { prizeId, cost });
}

export async function fetchLeaderboard(deviceId?: string, limit = 50): Promise<unknown> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (deviceId) params.set('deviceId', deviceId);
  const res = await fetch(`${API_BASE}/leaderboard?${params.toString()}`);
  return res.json();
}

export async function submitLeaderboard(name: string): Promise<unknown> {
  const session = getCachedSession();
  if (!session || session.sessionId.startsWith('local-')) return null;
  return post('/leaderboard', { sessionId: session.sessionId, token: session.token, name });
}

/** Fallback local (modo simulación): mis puntos son los mismos que los del servidor. */
export function localKillPoints(input: {
  basePoints: number;
  rarity?: ZombieRarity;
  zone?: SpawnZone;
  night: boolean;
  fog: boolean;
  eventMonth: boolean;
  comboCount?: number;
}): number {
  return computeKillPoints(input);
}
