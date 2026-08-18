import { describe, it, expect } from 'vitest';
import { applyEvent } from '@/lib/gamification/points-engine';
import { createSession, getSession } from '@/lib/gamification/store';
import { computeKillPoints } from '@/lib/gamification/rules';
import type { GameplayEvent } from '@/lib/gamification/contracts';

function makeSession(overrides: Partial<Parameters<typeof createSession>[0]> = {}) {
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

describe('points-engine · applyEvent', () => {
  it('evento a sesión inexistente → ok:false', () => {
    const r = applyEvent({ type: 'kill-zombie', sessionId: 'no-existe', timestamp: Date.now(), archetypeId: 'a', basePoints: 100 });
    expect(r.ok).toBe(false);
    expect(r.pointsAwarded).toBe(0);
  });

  it('kill válido otorga los puntos de las reglas territoriales', () => {
    const session = makeSession();
    const event: GameplayEvent = { type: 'kill-zombie', sessionId: session.id, timestamp: Date.now(), archetypeId: 'a', zone: 'mina', rarity: 'epico', night: true, basePoints: 200 };
    const r = applyEvent(event);
    expect(r.ok).toBe(true);
    expect(r.accepted).toBe(true);
    const expected = computeKillPoints({ basePoints: 200, zone: 'mina', rarity: 'epico', night: true, fog: false, eventMonth: false });
    expect(r.pointsAwarded).toBe(expected);
    expect(r.totalPoints).toBe(expected);
  });

  it('kill con basePoints excesivo → no aceptado, sin puntos', () => {
    const session = makeSession();
    const r = applyEvent({ type: 'kill-zombie', sessionId: session.id, timestamp: Date.now(), archetypeId: 'a', basePoints: 999_999 });
    expect(r.accepted).toBe(false);
    expect(r.pointsAwarded).toBe(0);
    expect(r.totalPoints).toBe(0);
  });

  it('oleada secuencial acumula 50 × oleada', () => {
    const session = makeSession();
    const r = applyEvent({ type: 'wave-completed', sessionId: session.id, timestamp: Date.now(), waveNumber: 1 });
    expect(r.accepted).toBe(true);
    expect(r.pointsAwarded).toBe(50);
  });

  it('misión solo se premia una vez', () => {
    const session = makeSession();
    const first = applyEvent({ type: 'mission-completed', sessionId: session.id, timestamp: Date.now(), missionId: 'm1', reward: 1000 });
    expect(first.accepted).toBe(true);
    const dup = applyEvent({ type: 'mission-completed', sessionId: session.id, timestamp: Date.now(), missionId: 'm1', reward: 1000 });
    expect(dup.accepted).toBe(false);
    expect(dup.reason).toBe('misión ya reclamada');
  });

  it('premio sin saldo suficiente → rechazado', () => {
    const session = makeSession();
    const r = applyEvent({ type: 'prize-redeemed', sessionId: session.id, timestamp: Date.now(), prizeId: 'p1', cost: 5000 });
    expect(r.accepted).toBe(false);
    expect(r.reason).toBe('saldo insuficiente');
  });

  it('premio con saldo descuenta el coste', () => {
    const session = makeSession({ totalPoints: 10_000 });
    const r = applyEvent({ type: 'prize-redeemed', sessionId: session.id, timestamp: Date.now(), prizeId: 'p1', cost: 3000 });
    expect(r.accepted).toBe(true);
    expect(r.totalPoints).toBe(7_000);
  });

  it('maxCombo se actualiza con el combo del kill', () => {
    const session = makeSession();
    const kill = applyEvent({ type: 'kill-zombie', sessionId: session.id, timestamp: Date.now(), archetypeId: 'a', basePoints: 100, comboCount: 5 });
    expect(kill.accepted).toBe(true);
    expect(getSession(session.id)?.maxCombo).toBe(5);
  });
});
