/* ------------------------------------------------------------------ */
/* GAMIFICATION YUN — Leaderboard                                      */
/* ------------------------------------------------------------------ */

import type { GamificationSession, LeaderboardEntry, LeaderboardSnapshot } from './contracts';
import { getLeaderboard, getLeaderboardEntry, upsertLeaderboardEntry } from './store';

const MAX_NAME_LENGTH = 40;

function sanitizeName(name: string): string {
  return name.replace(/[<>]/g, '').trim().slice(0, MAX_NAME_LENGTH) || 'Guardián Anónimo';
}

export function submitToLeaderboard(
  session: GamificationSession,
  name: string,
): LeaderboardEntry {
  const entry: LeaderboardEntry = {
    id: `lb-${session.deviceId}`,
    actorId: session.actorId,
    deviceId: session.deviceId,
    name: sanitizeName(name),
    points: session.totalPoints,
    captures: session.kills,
    updatedAt: Date.now(),
  };
  upsertLeaderboardEntry(entry);
  return entry;
}

export function snapshotLeaderboard(deviceId?: string, limit = 50): LeaderboardSnapshot {
  const entries = getLeaderboard(limit);
  const actor = deviceId ? getLeaderboardEntry(deviceId) ?? null : null;
  return { ok: true, entries, actor };
}
