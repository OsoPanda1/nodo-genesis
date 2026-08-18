/* ------------------------------------------------------------------ */
/* GAMIFICATION YUN — Estado legible (para Isabella y paneles)         */
/* ------------------------------------------------------------------ */
/* Capa de SOLO lectura que consume SOPHIA/tools sin ciclos: importa   */
/* únicamente store/rules, nunca módulos de Isabella.                  */
/* ------------------------------------------------------------------ */

import { getGamificationStats, getLeaderboard, getSession } from './store';

export interface GamificationStatus {
  ok: boolean;
  activeSessions: number;
  leaderboardEntries: number;
  totalKills: number;
  totalPoints: number;
  topGuardians: Array<{ name: string; points: number; captures: number }>;
}

export function getGamificationStatus(): GamificationStatus {
  const stats = getGamificationStats();
  const top = getLeaderboard(5).map(e => ({ name: e.name, points: e.points, captures: e.captures }));
  return { ok: true, ...stats, topGuardians: top };
}

export function getSessionStatus(sessionId: string) {
  const session = getSession(sessionId);
  if (!session) return null;
  return {
    sessionId: session.id,
    totalPoints: session.totalPoints,
    kills: session.kills,
    waves: session.waves,
    maxCombo: session.maxCombo,
    missions: session.missions.length,
    redeemed: session.redeemed.length,
    flags: session.flags,
  };
}
