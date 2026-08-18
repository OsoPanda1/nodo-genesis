/* ------------------------------------------------------------------ */
/* GAMIFICATION YUN — Almacén en memoria del runtime (server-only)     */
/* ------------------------------------------------------------------ */
/* Diseñado para latencia hiper baja: sin round-trips a base de datos. */
/* Los datos viven en memoria del runtime (globalThis para sobrevivir  */
/* a HMR en dev). Persistencia real: conectar Supabase/Postgres en el  */
/* módulo de adaptador sin tocar el resto de la capa.                  */
/* ------------------------------------------------------------------ */

import type { GamificationSession, LeaderboardEntry } from './contracts';
import { CHEAT_LIMITS } from './rules';
import { registerHydrator, schedulePersist } from '@/lib/core/persistence';
import { loadLeaderboard, loadSessions, persistLeaderboardEntry, persistSession } from './repository';

const SESSION_TTL_MS = CHEAT_LIMITS.MAX_SESSION_DURATION_MS;

interface GamificationStoreShape {
  sessions: Map<string, GamificationSession>;
  byDevice: Map<string, string[]>;
  leaderboard: Map<string, LeaderboardEntry>;
}

/* Persistencia del mapa a través de recargas de módulo (HMR). */
const g = globalThis as unknown as { __rdmGamificationStore?: GamificationStoreShape };

function getStore(): GamificationStoreShape {
  if (!g.__rdmGamificationStore) {
    g.__rdmGamificationStore = { sessions: new Map(), byDevice: new Map(), leaderboard: new Map() };
  }
  return g.__rdmGamificationStore;
}

/** Carga inicial desde Postgres (idempotente): rellena ausentes sin
 *  pisar el estado caliente en memoria. */
registerHydrator('gamification', async () => {
  const [sessions, leaderboard] = await Promise.all([loadSessions(), loadLeaderboard()]);
  const store = getStore();
  for (const session of sessions) {
    if (!store.sessions.has(session.id)) {
      store.sessions.set(session.id, session);
      const ids = store.byDevice.get(session.deviceId) ?? [];
      ids.push(session.id);
      store.byDevice.set(session.deviceId, ids.slice(-20));
    }
  }
  for (const entry of leaderboard) {
    if (!store.leaderboard.has(entry.deviceId)) store.leaderboard.set(entry.deviceId, entry);
  }
});

function pruneSessions(store: GamificationStoreShape, now: number): void {
  for (const [id, session] of store.sessions) {
    if (session.endedAt && now - session.endedAt > SESSION_TTL_MS) {
      store.sessions.delete(id);
      continue;
    }
    if (!session.endedAt && now - session.startedAt > SESSION_TTL_MS) {
      store.sessions.delete(id);
    }
  }
  for (const [deviceId, ids] of store.byDevice) {
    store.byDevice.set(deviceId, ids.filter(id => store.sessions.has(id)));
    if ((store.byDevice.get(deviceId) ?? []).length === 0) store.byDevice.delete(deviceId);
  }
}

export function createSession(session: GamificationSession): GamificationSession {
  const store = getStore();
  store.sessions.set(session.id, session);
  const deviceIds = store.byDevice.get(session.deviceId) ?? [];
  deviceIds.push(session.id);
  store.byDevice.set(session.deviceId, deviceIds.slice(-20));
  schedulePersist('gamification.session.create', () => persistSession(session));
  return session;
}

export function getSession(id: string): GamificationSession | undefined {
  const store = getStore();
  const session = store.sessions.get(id);
  if (!session) return undefined;
  if (session.endedAt && Date.now() - session.endedAt > SESSION_TTL_MS) {
    store.sessions.delete(id);
    return undefined;
  }
  return session;
}

export function getActiveSessionByDevice(deviceId: string): GamificationSession | undefined {
  const store = getStore();
  const ids = store.byDevice.get(deviceId) ?? [];
  for (let i = ids.length - 1; i >= 0; i--) {
    const session = store.sessions.get(ids[i]);
    if (session && !session.endedAt) return session;
  }
  return undefined;
}

export function updateSession(id: string, patch: Partial<GamificationSession>): GamificationSession | undefined {
  const store = getStore();
  const session = store.sessions.get(id);
  if (!session) return undefined;
  const next = { ...session, ...patch };
  store.sessions.set(id, next);
  schedulePersist('gamification.session.update', () => persistSession(next));
  return next;
}

export function endSession(id: string): GamificationSession | undefined {
  const store = getStore();
  const session = store.sessions.get(id);
  if (!session || session.endedAt) return session;
  const next = { ...session, endedAt: Date.now() };
  store.sessions.set(id, next);
  schedulePersist('gamification.session.end', () => persistSession(next));
  return next;
}

/* ---------------- Leaderboard ---------------- */

export function upsertLeaderboardEntry(entry: LeaderboardEntry): LeaderboardEntry {
  const store = getStore();
  store.leaderboard.set(entry.deviceId, entry);
  schedulePersist('gamification.leaderboard', () => persistLeaderboardEntry(entry));
  return entry;
}

export function getLeaderboardEntry(deviceId: string): LeaderboardEntry | undefined {
  const store = getStore();
  return store.leaderboard.get(deviceId);
}

export function getLeaderboard(limit = 50): LeaderboardEntry[] {
  const store = getStore();
  pruneSessions(store, Date.now());
  return [...store.leaderboard.values()]
    .sort((a, b) => b.points - a.points || a.updatedAt - b.updatedAt)
    .slice(0, limit);
}

export function getGamificationStats(): {
  activeSessions: number;
  leaderboardEntries: number;
  totalKills: number;
  totalPoints: number;
} {
  const store = getStore();
  let activeSessions = 0;
  let totalKills = 0;
  let totalPoints = 0;
  for (const session of store.sessions.values()) {
    if (!session.endedAt) activeSessions++;
    totalKills += session.kills;
    totalPoints += session.totalPoints;
  }
  return { activeSessions, leaderboardEntries: store.leaderboard.size, totalKills, totalPoints };
}
