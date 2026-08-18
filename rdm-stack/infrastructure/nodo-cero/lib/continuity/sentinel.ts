/* ================================================================== */
/* CONTINUITY — Sentinel: quórum de señales de fallo                  */
/* ================================================================== */
/* La transición a ACTIVE_ISLAND exige quórum de señales independien- */
/* tes. Una caída aislada de health check NO promueve el bastión:      */
/* evitaría split-brain.                                               */
/*                                                                     */
/* Fuentes de señal independientes:                                   */
/*   - healthchecks: fallo desde 2 vantage points distintos.          */
/*   - heartbeat: ausencia de heartbeats firmados del primario.       */
/*   - lease: pérdida del lease de líder del plano de control.        */
/*   - dependency: error sostenido de dependencias críticas.          */
/*   - operator: confirmación manual del operador con MFA.            */
/* ================================================================== */

import { nowIso } from '@/lib/core/utils';

export type SentinelSignal =
  | 'healthcheck'
  | 'heartbeat'
  | 'lease'
  | 'dependency'
  | 'operator';

interface SignalRecord {
  source: SentinelSignal;
  detail: string;
  at: string;
}

/** Cuántas fuentes independientes hacen falta para sospechar/promover. */
export const QUORUM_PROMOTE = 2;
export const QUORUM_SUSPECT = 1;

const signals: SignalRecord[] = [];

function freshWithin(signal: SignalRecord, windowMs: number): boolean {
  const ageMs = Date.now() - new Date(signal.at).getTime();
  return ageMs <= windowMs;
}

/** Registra una señal de fallo desde una fuente independiente. */
export function recordSignal(source: SentinelSignal, detail: string): SignalRecord {
  const record: SignalRecord = { source, detail, at: nowIso() };
  signals.push(record);
  if (signals.length > 128) signals.shift();
  return record;
}

/** Cuenta fuentes independientes con señal reciente (dedupe por fuente). */
export function independentSignals(windowMs = 90_000): SentinelSignal[] {
  const now = Date.now();
  const sources = new Set<SentinelSignal>();
  for (const signal of signals) {
    const ageMs = now - new Date(signal.at).getTime();
    if (ageMs <= windowMs) sources.add(signal.source);
  }
  return [...sources];
}

export function hasQuorum(windowMs = 90_000): boolean {
  return independentSignals(windowMs).length >= QUORUM_PROMOTE;
}

/** Estado del sentinel para telemetría. */
export function sentinelStatus(windowMs = 90_000): {
  signals: SignalRecord[];
  independentSources: SentinelSignal[];
  quorumPromote: number;
  quorumSatisfied: boolean;
} {
  return {
    signals: [...signals].reverse(),
    independentSources: independentSignals(windowMs),
    quorumPromote: QUORUM_PROMOTE,
    quorumSatisfied: hasQuorum(windowMs),
  };
}

export function resetSignalsForTests(): void {
  signals.length = 0;
}

export { freshWithin };
