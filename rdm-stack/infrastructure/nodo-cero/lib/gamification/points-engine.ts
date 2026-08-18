/* ------------------------------------------------------------------ */
/* GAMIFICATION YUN — Motor de puntos (server-authoritative)           */
/* ------------------------------------------------------------------ */
/* Aplica las reglas territoriales a los eventos validados por el      */
/* anti-cheat. Un evento rechazado NO otorga puntos y marca flags de   */
/* sospecha en la sesión para que ARGUS/LUMEN las evalúen.             */
/* ------------------------------------------------------------------ */

import type {
  EventResult,
  GameplayEvent,
  GamificationSession,
  KillZombieEvent,
  WaveCompletedEvent,
} from './contracts';
import {
  computeKillPoints,
  computeWavePoints,
  comboMultiplier,
  POINT_LIMITS,
} from './rules';
import {
  pruneWindows,
  validateComboEvent,
  validateGenericEvent,
  validateKillEvent,
  validateWaveEvent,
} from './anti-cheat';
import { getSession, updateSession } from './store';

export function flagSession(sessionId: string, flag: string): void {
  const session = getSession(sessionId);
  if (!session) return;
  const flags = session.flags.includes(flag) ? session.flags : [...session.flags, flag];
  updateSession(sessionId, { flags });
}

function applyKill(session: GamificationSession, event: KillZombieEvent): EventResult {
  const check = validateKillEvent(session, event);
  if (!check.ok) {
    if (check.flag) flagSession(session.id, check.flag);
    return {
      ok: true,
      accepted: false,
      pointsAwarded: 0,
      totalPoints: session.totalPoints,
      sessionId: session.id,
      reason: check.reason,
      flags: session.flags,
    };
  }

  const points = computeKillPoints({
    basePoints: event.basePoints,
    rarity: event.rarity,
    zone: event.zone,
    night: event.night === true,
    fog: event.fog === true,
    eventMonth: event.eventMonth === true,
    comboCount: event.comboCount ?? 0,
  });

  const next = updateSession(session.id, {
    totalPoints: session.totalPoints + points,
    kills: session.kills + 1,
    maxCombo: Math.max(session.maxCombo, event.comboCount ?? 0),
  });

  return {
    ok: true,
    accepted: true,
    pointsAwarded: points,
    totalPoints: next?.totalPoints ?? session.totalPoints,
    sessionId: session.id,
    flags: session.flags,
  };
}

function applyWave(session: GamificationSession, event: WaveCompletedEvent): EventResult {
  const check = validateWaveEvent(session, event);
  if (!check.ok) {
    if (check.flag) flagSession(session.id, check.flag);
    return {
      ok: true,
      accepted: false,
      pointsAwarded: 0,
      totalPoints: session.totalPoints,
      sessionId: session.id,
      reason: check.reason,
      flags: session.flags,
    };
  }

  const points = computeWavePoints(event.waveNumber);
  const next = updateSession(session.id, {
    totalPoints: session.totalPoints + points,
    waves: event.waveNumber,
  });

  return {
    ok: true,
    accepted: true,
    pointsAwarded: points,
    totalPoints: next?.totalPoints ?? session.totalPoints,
    sessionId: session.id,
    flags: session.flags,
  };
}

function applyCombo(session: GamificationSession, comboCount: number, timestamp: number): EventResult {
  const check = validateComboEvent(session, { sessionId: session.id, timestamp, comboCount });
  if (!check.ok) {
    if (check.flag) flagSession(session.id, check.flag);
    return {
      ok: true,
      accepted: false,
      pointsAwarded: 0,
      totalPoints: session.totalPoints,
      sessionId: session.id,
      reason: check.reason,
      flags: session.flags,
    };
  }

  const points = Math.round(comboMultiplier(comboCount) * 10);
  const next = updateSession(session.id, {
    totalPoints: session.totalPoints + points,
    maxCombo: Math.max(session.maxCombo, comboCount),
  });

  return {
    ok: true,
    accepted: true,
    pointsAwarded: points,
    totalPoints: next?.totalPoints ?? session.totalPoints,
    sessionId: session.id,
    flags: session.flags,
  };
}

function applyMission(session: GamificationSession, missionId: string, reward: number, timestamp: number): EventResult {
  const check = validateGenericEvent(session, 'mission-completed', timestamp);
  if (!check.ok) {
    if (check.flag) flagSession(session.id, check.flag);
    return {
      ok: true,
      accepted: false,
      pointsAwarded: 0,
      totalPoints: session.totalPoints,
      sessionId: session.id,
      reason: check.reason,
      flags: session.flags,
    };
  }

  if (session.missions.includes(missionId)) {
    return {
      ok: true,
      accepted: false,
      pointsAwarded: 0,
      totalPoints: session.totalPoints,
      sessionId: session.id,
      reason: 'misión ya reclamada',
      flags: session.flags,
    };
  }

  const safeReward = Math.min(reward, POINT_LIMITS.MAX_MISSION_REWARD);
  const next = updateSession(session.id, {
    totalPoints: session.totalPoints + safeReward,
    missions: [...session.missions, missionId],
  });

  return {
    ok: true,
    accepted: true,
    pointsAwarded: safeReward,
    totalPoints: next?.totalPoints ?? session.totalPoints,
    sessionId: session.id,
    flags: session.flags,
  };
}

function applyPrize(session: GamificationSession, prizeId: string, cost: number, timestamp: number): EventResult {
  const check = validateGenericEvent(session, 'prize-redeemed', timestamp);
  if (!check.ok) {
    if (check.flag) flagSession(session.id, check.flag);
    return {
      ok: true,
      accepted: false,
      pointsAwarded: 0,
      totalPoints: session.totalPoints,
      sessionId: session.id,
      reason: check.reason,
      flags: session.flags,
    };
  }

  if (session.redeemed.includes(prizeId)) {
    return {
      ok: true,
      accepted: false,
      pointsAwarded: 0,
      totalPoints: session.totalPoints,
      sessionId: session.id,
      reason: 'premio ya canjeado',
      flags: session.flags,
    };
  }

  const safeCost = Math.min(cost, POINT_LIMITS.MAX_PRIZE_COST);
  if (session.totalPoints < safeCost) {
    return {
      ok: true,
      accepted: false,
      pointsAwarded: 0,
      totalPoints: session.totalPoints,
      sessionId: session.id,
      reason: 'saldo insuficiente',
      flags: session.flags,
    };
  }

  const next = updateSession(session.id, {
    totalPoints: session.totalPoints - safeCost,
    redeemed: [...session.redeemed, prizeId],
  });

  return {
    ok: true,
    accepted: true,
    pointsAwarded: -safeCost,
    totalPoints: next?.totalPoints ?? session.totalPoints,
    sessionId: session.id,
    flags: session.flags,
  };
}

export function applyEvent(event: GameplayEvent): EventResult {
  /* Poda de ventanas anti-cheat expiradas (mitiga crecimiento de memoria). */
  pruneWindows();

  const session = getSession(event.sessionId);
  if (!session) {
    return { ok: false, accepted: false, pointsAwarded: 0, totalPoints: 0, sessionId: event.sessionId, reason: 'sesión no encontrada', flags: [] };
  }

  switch (event.type) {
    case 'kill-zombie':
      return applyKill(session, event);
    case 'wave-completed':
      return applyWave(session, event);
    case 'combo':
      return applyCombo(session, event.comboCount, event.timestamp);
    case 'mission-completed':
      return applyMission(session, event.missionId, event.reward ?? 0, event.timestamp);
    case 'prize-redeemed':
      return applyPrize(session, event.prizeId, event.cost, event.timestamp);
    default:
      return { ok: false, accepted: false, pointsAwarded: 0, totalPoints: session.totalPoints, sessionId: session.id, reason: 'tipo de evento no soportado', flags: session.flags };
  }
}

export function rewardKill(sessionId: string, event: KillZombieEvent): EventResult {
  return applyEvent({ type: 'kill-zombie', ...event });
}
