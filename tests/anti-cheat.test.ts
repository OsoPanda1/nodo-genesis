import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  validateComboEvent,
  validateKillEvent,
  validateSessionActive,
  validateWaveEvent,
} from '@/lib/gamification/anti-cheat';
import { createSession, endSession, getSession, updateSession } from '@/lib/gamification/store';
import { CHEAT_LIMITS, POINT_LIMITS } from '@/lib/gamification/rules';
import type { GamificationSession } from '@/lib/gamification/contracts';

function makeSession(overrides: Partial<GamificationSession> = {}): GamificationSession {
  return createSession({
    id: `s-${Math.random().toString(36).slice(2)}`,
    actorId: 'actor-test',
    deviceId: 'dev-test',
    startedAt: Date.now(),
    totalPoints: 0,
    kills: 0,
    waves: 0,
    maxCombo: 0,
    missions: [],
    redeemed: [],
    flags: [],
    leaderboardName: 'Tester',
    ...overrides,
  });
}

describe('anti-cheat · ventana de kills por minuto (ventana deslizante real)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('acepta hasta MAX_KILLS_PER_MINUTE kills en un minuto', () => {
    const session = makeSession();
    for (let i = 0; i < CHEAT_LIMITS.MAX_KILLS_PER_MINUTE; i++) {
      const r = validateKillEvent(session, { sessionId: session.id, timestamp: Date.now(), archetypeId: 'a', basePoints: 100 });
      expect(r.ok, `kill ${i + 1} debería pasar`).toBe(true);
    }
  });

  it('rechaza el kill que supera el límite por minuto', () => {
    const session = makeSession();
    for (let i = 0; i < CHEAT_LIMITS.MAX_KILLS_PER_MINUTE; i++) {
      validateKillEvent(session, { sessionId: session.id, timestamp: Date.now(), archetypeId: 'a', basePoints: 100 });
    }
    const r = validateKillEvent(session, { sessionId: session.id, timestamp: Date.now(), archetypeId: 'a', basePoints: 100 });
    expect(r.ok).toBe(false);
    expect(r.flag).toBe('kill-rate');
  });

  it('al pasar 60s la ventana se desliza y vuelve a aceptar', () => {
    const session = makeSession();
    for (let i = 0; i < CHEAT_LIMITS.MAX_KILLS_PER_MINUTE; i++) {
      validateKillEvent(session, { sessionId: session.id, timestamp: Date.now(), archetypeId: 'a', basePoints: 100 });
    }
    vi.advanceTimersByTime(60_001);
    const r = validateKillEvent(session, { sessionId: session.id, timestamp: Date.now(), archetypeId: 'a', basePoints: 100 });
    expect(r.ok).toBe(true);
  });
});

describe('anti-cheat · rangos y coherencia', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('basePoints 0 o superior al tope → points-range', () => {
    const session = makeSession();
    const low = validateKillEvent(session, { sessionId: session.id, timestamp: Date.now(), archetypeId: 'a', basePoints: 0 });
    expect(low.ok).toBe(false);
    expect(low.flag).toBe('points-range');
    const high = validateKillEvent(session, { sessionId: session.id, timestamp: Date.now(), archetypeId: 'a', basePoints: POINT_LIMITS.MAX_KILL_POINTS + 1 });
    expect(high.ok).toBe(false);
    expect(high.flag).toBe('points-range');
  });

  it('timestamp fuera de ventana de 90s → timestamp-drift', () => {
    const session = makeSession();
    const r = validateKillEvent(session, { sessionId: session.id, timestamp: Date.now() + 120_000, archetypeId: 'a', basePoints: 100 });
    expect(r.ok).toBe(false);
    expect(r.flag).toBe('timestamp-drift');
  });

  it('oleadas no secuenciales → wave-order', () => {
    const session = makeSession();
    const first = validateWaveEvent(session, { sessionId: session.id, timestamp: Date.now(), waveNumber: 1 });
    expect(first.ok).toBe(true);
    updateSession(session.id, { waves: 1 });
    const updated = getSession(session.id) as GamificationSession;
    const repeat = validateWaveEvent(updated, { sessionId: updated.id, timestamp: Date.now(), waveNumber: 1 });
    expect(repeat.ok).toBe(false);
    expect(repeat.flag).toBe('wave-order');
    const skip = validateWaveEvent(updated, { sessionId: updated.id, timestamp: Date.now(), waveNumber: 3 });
    expect(skip.ok).toBe(false);
    expect(skip.flag).toBe('wave-order');
  });

  it('combo no secuencial o fuera de rango → rechazado', () => {
    const session = makeSession();
    const ok = validateComboEvent(session, { sessionId: session.id, timestamp: Date.now(), comboCount: 1 });
    expect(ok.ok).toBe(true);
    const skip = validateComboEvent(session, { sessionId: session.id, timestamp: Date.now(), comboCount: 3 });
    expect(skip.ok).toBe(false);
    expect(skip.flag).toBe('combo-order');
    const range = validateComboEvent(session, { sessionId: session.id, timestamp: Date.now(), comboCount: POINT_LIMITS.MAX_COMBO + 1 });
    expect(range.ok).toBe(false);
    expect(range.flag).toBe('combo-range');
  });

  it('sesión finalizada → closed-session', () => {
    const session = makeSession();
    endSession(session.id);
    const updated = getSession(session.id);
    expect(updated?.endedAt).toBeTruthy();
    const r = validateSessionActive(updated);
    expect(r.ok).toBe(false);
    expect(r.flag).toBe('closed-session');
  });
});
