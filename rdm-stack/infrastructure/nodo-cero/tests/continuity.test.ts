import { describe, it, expect, beforeEach } from 'vitest';
import {
  stableJson,
  sha256,
  calculateJournalHash,
  verifyChain,
  canTransition,
  transitionError,
  YUN_BE_MODES,
  recordSignal,
  independentSignals,
  hasQuorum,
  QUORUM_PROMOTE,
  initLease,
  promoteEpoch,
  issueFencingToken,
  isValidFencingToken,
  isLeaseActive,
  leaseExpired,
  heartbeatLease,
  appendJournalEntry,
  journalCount,
  journalIntegrity,
  journalSnapshot,
  enqueueIntent,
  outboxSize,
  resolveOutbox,
  resetContinuityForTests,
  decideEmergencyDisposition,
  activateIsland,
  isolatePrimary,
  primaryHeartbeat,
  submitIntent,
  reconcile,
  continuityStatus,
  getContinuityState,
} from '../lib/continuity';

function makeIntent(overrides: Record<string, unknown> = {}) {
  return {
    eventId: `evt-${Math.random().toString(36).slice(2)}`,
    idempotencyKey: `ik-${Math.random().toString(36).slice(2)}`,
    traceId: 'trace-1',
    domain: 'test',
    eventType: 'commerce.order.requested',
    classification: 'INTERNAL_LOW' as const,
    payload: { amount: 100 },
    occurredAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('YUN BE — hash-chain del journal', () => {
  it('stableJson serializa de forma canónica (claves ordenadas)', () => {
    const a = stableJson({ b: 1, a: { d: 2, c: 3 } });
    const b = stableJson({ a: { c: 3, d: 2 }, b: 1 });
    expect(a).toBe(b);
    expect(a).toBe('{"a":{"c":3,"d":2},"b":1}');
  });

  it('calculateJournalHash es determinista y sensible al contenido', () => {
    const base = {
      previousHash: null,
      eventId: 'e1',
      idempotencyKey: 'ik1',
      payloadHash: sha256(stableJson({ amount: 100 })),
      policyVersion: '2026.1',
      fencingEpoch: 3,
      occurredAt: '2026-01-01T00:00:00.000Z',
    };
    const h1 = calculateJournalHash(base);
    const h2 = calculateJournalHash({ ...base, fencingEpoch: 4 });
    expect(h1).toHaveLength(64);
    expect(h1).toBe(calculateJournalHash(base));
    expect(h1).not.toBe(h2);
  });

  it('verifyChain detecta alteración secuencial', () => {
    const a = { previousHash: null, entryHash: sha256('a') };
    const b = { previousHash: a.entryHash, entryHash: sha256('b') };
    expect(verifyChain([a, b])).toEqual({ ok: true });

    const tampered = { ...b, previousHash: sha256('otro') };
    expect(verifyChain([a, tampered])).toEqual({ ok: false, brokenAt: 1 });
  });
});

describe('YUN BE — máquina de estados', () => {
  it('expone los 7 modos del bastión', () => {
    expect(YUN_BE_MODES).toEqual([
      'DORMANT',
      'READY',
      'SUSPECT',
      'ISOLATED',
      'ACTIVE_ISLAND',
      'RECOVERY_PENDING',
      'RECONCILING',
    ]);
  });

  it('permite transiciones válidas y rechaza las inválidas', () => {
    expect(canTransition('DORMANT', 'SUSPECT')).toBe(true);
    expect(canTransition('READY', 'ACTIVE_ISLAND')).toBe(true);
    expect(canTransition('RECOVERY_PENDING', 'RECONCILING')).toBe(true);
    expect(canTransition('RECONCILING', 'DORMANT')).toBe(true);

    expect(canTransition('DORMANT', 'ACTIVE_ISLAND')).toBe(false);
    expect(transitionError('DORMANT', 'ACTIVE_ISLAND')).toMatch(/Transición inválida/);
    expect(transitionError('READY', 'READY')).toMatch(/Transición inválida/);
  });
});

describe('YUN BE — sentinel (quórum de señales)', () => {
  beforeEach(() => resetContinuityForTests());

  it('una sola fuente no alcanza quórum de promoción', () => {
    recordSignal('healthcheck', 'sin respuesta del primario');
    expect(independentSignals()).toEqual(['healthcheck']);
    expect(hasQuorum()).toBe(false);
  });

  it('dos fuentes independientes alcanzan quórum', () => {
    recordSignal('healthcheck', 'sin respuesta del primario');
    recordSignal('lease', 'lease de líder expirado');
    expect(hasQuorum()).toBe(true);
    expect(independentSignals().length).toBeGreaterThanOrEqual(QUORUM_PROMOTE);
  });

  it('deduplica por fuente: repeticiones de la misma no suman', () => {
    recordSignal('healthcheck', 'a');
    recordSignal('healthcheck', 'b');
    recordSignal('healthcheck', 'c');
    expect(independentSignals()).toEqual(['healthcheck']);
    expect(hasQuorum()).toBe(false);
  });
});

describe('YUN BE — lease y fencing tokens', () => {
  beforeEach(() => resetContinuityForTests());

  it('initLease activa el lease y sube la época', () => {
    initLease('primary');
    expect(isLeaseActive()).toBe(true);
    expect(leaseExpired()).toBe(false);
  });

  it('promoteEpoch invalida al primario antiguo (lease null, época mayor)', () => {
    initLease('primary');
    const epochBefore = getContinuityState().epoch;
    const epochAfter = promoteEpoch();
    expect(epochAfter).toBe(epochBefore + 1);
    expect(isLeaseActive()).toBe(false);
  });

  it('el fencing token de una época anterior es rechazado (fail-closed)', () => {
    initLease('primary');
    const oldToken = issueFencingToken('primary');
    expect(oldToken).not.toBeNull();
    expect(isValidFencingToken(oldToken!.token)).toBe(true);

    promoteEpoch();
    expect(isValidFencingToken(oldToken!.token)).toBe(false);
    expect(isValidFencingToken('nonsense')).toBe(false);
    expect(isValidFencingToken(null)).toBe(false);
  });

  it('heartbeatLease renueva el lease sin cambiar la época', () => {
    initLease('primary');
    const epochBefore = getContinuityState().epoch;
    expect(heartbeatLease()).toBe(true);
    expect(getContinuityState().epoch).toBe(epochBefore);
  });
});

describe('YUN BE — journal inmutable', () => {
  beforeEach(() => resetContinuityForTests());

  it('encadena entradas con previousHash y mantiene integridad', () => {
    const opts = { policyVersion: '2026.1', fencingEpoch: 1, disposition: 'ACCEPTED' as const };
    appendJournalEntry(makeIntent({ eventId: 'e1', idempotencyKey: 'ik1' }), opts);
    appendJournalEntry(makeIntent({ eventId: 'e2', idempotencyKey: 'ik2' }), opts);
    appendJournalEntry(makeIntent({ eventId: 'e3', idempotencyKey: 'ik3' }), opts);

    expect(journalCount()).toBe(3);
    const snapshot = journalSnapshot();
    expect(snapshot.entries[0].previousHash).toBeNull();
    expect(snapshot.entries[1].previousHash).toBe(snapshot.entries[0].entryHash);
    expect(snapshot.entries[2].previousHash).toBe(snapshot.entries[1].entryHash);
    expect(journalIntegrity()).toEqual({ ok: true });
  });

  it('rechaza entradas duplicadas por idempotencyKey', () => {
    const opts = { policyVersion: '2026.1', fencingEpoch: 1, disposition: 'ACCEPTED' as const };
    const first = appendJournalEntry(makeIntent({ idempotencyKey: 'dup' }), opts);
    const second = appendJournalEntry(makeIntent({ idempotencyKey: 'dup' }), opts);
    expect(first.accepted).toBe(true);
    expect(second.accepted).toBe(false);
    expect(second.reason).toMatch(/idempotencia/);
    expect(journalCount()).toBe(1);
  });
});

describe('YUN BE — disposiciones en modo isla (fail-closed)', () => {
  beforeEach(() => resetContinuityForTests());

  it('fuera de ACTIVE_ISLAND las intenciones se aceptan', () => {
    const state = getContinuityState();
    expect(decideEmergencyDisposition(state, makeIntent())).toBe('ACCEPTED');
  });

  it('en ACTIVE_ISLAND las operaciones de alto impacto se deniegan', () => {
    const state = { ...getContinuityState(), mode: 'ACTIVE_ISLAND' as const };
    for (const eventType of ['payment.executed', 'payout.executed', 'policy.changed', 'identity.role.changed']) {
      expect(decideEmergencyDisposition(state, makeIntent({ eventType }))).toBe('DENIED');
    }
  });

  it('en ACTIVE_ISLAND las intenciones de cola se encolan y el resto se deniega', () => {
    const state = { ...getContinuityState(), mode: 'ACTIVE_ISLAND' as const };
    expect(decideEmergencyDisposition(state, makeIntent({ eventType: 'commerce.order.requested' }))).toBe('QUEUED');
    expect(decideEmergencyDisposition(state, makeIntent({ eventType: 'other.event' }))).toBe('DENIED');
    expect(
      decideEmergencyDisposition(state, makeIntent({ eventType: 'commerce.order.requested', classification: 'RESTRICTED' })),
    ).toBe('DENIED');
  });

  it('submitIntent encola en el outbox cuando la disposición es QUEUED', () => {
    recordSignal('healthcheck', 'sin respuesta');
    recordSignal('dependency', 'DB primaria inaccesible');
    activateIsland({ operatorConfirmed: true });
    const result = submitIntent(
      makeIntent({
        eventType: 'commerce.order.requested',
        idempotencyKey: 'queued-1',
        classification: 'INTERNAL_LOW',
      }),
    );
    expect(result.ok).toBe(true);
    expect(result.disposition).toBe('QUEUED');
    expect(outboxSize()).toBe(1);
  });

  it('submitIntent deniega operaciones prohibidas en isla y las registra', () => {
    recordSignal('healthcheck', 'sin respuesta');
    recordSignal('dependency', 'DB primaria inaccesible');
    activateIsland({ operatorConfirmed: true });
    const result = submitIntent(makeIntent({ eventType: 'payment.executed', idempotencyKey: 'denied-1' }));
    expect(result.ok).toBe(true);
    expect(result.disposition).toBe('DENIED');
    expect(journalCount()).toBe(1);
  });
});

describe('YUN BE — promoción a ACTIVE_ISLAND', () => {
  beforeEach(() => resetContinuityForTests());

  it('no promueve sin quórum de señales (evita split-brain)', () => {
    const result = activateIsland();
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/quórum/);
    expect(continuityStatus().mode).toBe('DORMANT');
  });

  it('no promueve con lease del primario activo', () => {
    initLease('primary');
    recordSignal('healthcheck', 'x');
    recordSignal('lease', 'y');
    const result = activateIsland();
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/lease/);
  });

  it('promueve con quórum + lease expirado y entrega fencing token', () => {
    recordSignal('healthcheck', 'sin respuesta');
    recordSignal('dependency', 'DB primaria inaccesible');
    const token = activateIsland({ operatorConfirmed: true });
    expect(token.ok).toBe(true);
    expect(token.mode).toBe('ACTIVE_ISLAND');
    expect(token.fencingToken).toBeDefined();
    expect(isValidFencingToken(token.fencingToken ?? '')).toBe(true);
  });
});

describe('YUN BE — reconciliación', () => {
  beforeEach(() => resetContinuityForTests());

  it('no inicia reconciliación si el primario no está recuperado', () => {
    const report = reconcile({ primaryRecovered: false });
    expect(report.closed).toBe(false);
    expect(report.note).toMatch(/no está recuperado/);
  });

  it('resuelve el outbox por idempotencia con recibos APPLIED y cierra con aprobación dual', () => {
    recordSignal('healthcheck', 'sin respuesta');
    recordSignal('dependency', 'DB primaria inaccesible');
    activateIsland({ operatorConfirmed: true });
    submitIntent(
      makeIntent({
        eventType: 'commerce.order.requested',
        idempotencyKey: 'ord-1',
        classification: 'INTERNAL_LOW',
      }),
    );
    submitIntent(
      makeIntent({
        eventType: 'commerce.order.requested',
        idempotencyKey: 'ord-2',
        classification: 'INTERNAL_LOW',
      }),
    );
    expect(outboxSize()).toBe(2);

    const report = reconcile({
      primaryRecovered: true,
      dualApproval: true,
      replayReceipts: [
        { idempotencyKey: 'ord-1', status: 'APPLIED' },
        { idempotencyKey: 'ord-2', status: 'DUPLICATE' },
      ],
    });
    expect(report.closed).toBe(true);
    expect(report.requiresDualApproval).toBe(false);
    expect(report.replayed).toBe(2);
    expect(outboxSize()).toBe(0);
  });

  it('un recibo CONFLICT queda sin resolver y exige aprobación humana (no last-write-wins)', () => {
    recordSignal('healthcheck', 'sin respuesta');
    recordSignal('dependency', 'DB primaria inaccesible');
    activateIsland({ operatorConfirmed: true });
    submitIntent(makeIntent({ eventType: 'commerce.order.requested', idempotencyKey: 'ord-x', classification: 'INTERNAL_LOW' }));

    const report = reconcile({
      primaryRecovered: true,
      dualApproval: false,
      replayReceipts: [
        { idempotencyKey: 'ord-x', status: 'CONFLICT' },
      ],
    });
    expect(report.closed).toBe(false);
    expect(report.requiresDualApproval).toBe(true);
    expect(report.unresolved.length).toBe(1);
    expect(report.unresolved[0].outcome).toBe('CONFLICT');
    expect(continuityStatus().mode).toBe('RECONCILING');
  });

  it('sin aprobación dual el incidente permanece abierto (RECONCILING)', () => {
    recordSignal('healthcheck', 'sin respuesta');
    recordSignal('dependency', 'DB primaria inaccesible');
    activateIsland({ operatorConfirmed: true });
    submitIntent(
      makeIntent({
        eventType: 'commerce.order.requested',
        idempotencyKey: 'ord-keep',
        classification: 'INTERNAL_LOW',
      }),
    );

    const report = reconcile({
      primaryRecovered: true,
      dualApproval: false,
      replayReceipts: [{ idempotencyKey: 'ord-keep', status: 'APPLIED' }],
    });
    expect(report.closed).toBe(false);
    expect(report.requiresDualApproval).toBe(true);
    expect(continuityStatus().mode).toBe('RECONCILING');
  });

  it('cierre de incidente regresa el bastión a DORMANT', () => {
    recordSignal('healthcheck', 'sin respuesta');
    recordSignal('dependency', 'DB primaria inaccesible');
    activateIsland({ operatorConfirmed: true });
    expect(continuityStatus().mode).toBe('ACTIVE_ISLAND');

    const report = reconcile({ primaryRecovered: true, dualApproval: true });
    if (report.closed) {
      expect(continuityStatus().mode).toBe('DORMANT');
    }
  });
});
