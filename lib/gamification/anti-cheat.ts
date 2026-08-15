/* ------------------------------------------------------------------ */
/* GAMIFICATION YUN — Anti-cheat server-authoritative                  */
/* ------------------------------------------------------------------ */
/* Valida coherencia de cada evento ANTES de otorgar puntos: límites    */
/* por minuto, timestamps dentro de ventana, rangos de parámetros y    */
/* patrones imposibles. Nunca confía en valores declarados por el       */
/* cliente. El motor de puntos ignora eventos que no pasan esta capa.  */
/* ------------------------------------------------------------------ */

import type {
  GamificationSession,
  GameEventType,
  KillZombieEvent,
  WaveCompletedEvent,
  ComboEvent,
} from './contracts';
import { CHEAT_LIMITS, POINT_LIMITS } from './rules';

export interface CheatCheckResult {
  ok: boolean;
  reason?: string;
  flag?: string;
}

/* Ventana deslizante por sesión (timestamps en ms). */
interface SessionWindow {
  timestamps: number[];
  killTimestamps: number[];
}

const windows = new Map<string, SessionWindow>();

function windowFor(sessionId: string): SessionWindow {
  let w = windows.get(sessionId);
  if (!w) {
    w = { timestamps: [], killTimestamps: [] };
    windows.set(sessionId, w);
  }
  return w;
}

export function pruneWindows(): void {
  const now = Date.now();
  for (const [id, w] of windows) {
    w.timestamps = w.timestamps.filter(t => now - t < 60_000);
    w.killTimestamps = w.killTimestamps.filter(t => now - t < 60_000);
    if (w.timestamps.length === 0 && w.killTimestamps.length === 0) windows.delete(id);
  }
}

function timestampOk(timestamp: number): CheatCheckResult {
  const drift = Math.abs(Date.now() - timestamp);
  if (drift > CHEAT_LIMITS.MAX_TIMESTAMP_DRIFT_SECONDS * 1000) {
    return { ok: false, reason: 'timestamp fuera de ventana', flag: 'timestamp-drift' };
  }
  return { ok: true };
}

function eventRateOk(sessionId: string): CheatCheckResult {
  const now = Date.now();
  const w = windowFor(sessionId);
  w.timestamps = w.timestamps.filter(t => now - t < 60_000);
  if (w.timestamps.length >= CHEAT_LIMITS.MAX_EVENTS_PER_MINUTE) {
    return { ok: false, reason: 'frecuencia de eventos excesiva', flag: 'event-rate' };
  }
  w.timestamps.push(now);
  return { ok: true };
}

/** Ventana deslizante real de 60s para kills (nunca media desde el inicio de la sesión). */
function killRateOk(sessionId: string): CheatCheckResult {
  const now = Date.now();
  const w = windowFor(sessionId);
  w.killTimestamps = w.killTimestamps.filter(t => now - t < 60_000);
  if (w.killTimestamps.length >= CHEAT_LIMITS.MAX_KILLS_PER_MINUTE) {
    return { ok: false, reason: 'kills por minuto sobre el límite', flag: 'kill-rate' };
  }
  w.killTimestamps.push(now);
  return { ok: true };
}

export function validateSessionActive(session: GamificationSession | undefined): CheatCheckResult {
  if (!session) return { ok: false, reason: 'sesión no encontrada', flag: 'unknown-session' };
  if (session.endedAt) return { ok: false, reason: 'sesión finalizada', flag: 'closed-session' };
  return { ok: true };
}

export function validateKillEvent(
  session: GamificationSession,
  event: KillZombieEvent,
): CheatCheckResult {
  const active = validateSessionActive(session);
  if (!active.ok) return active;

  const ts = timestampOk(event.timestamp);
  if (!ts.ok) return ts;

  const rate = eventRateOk(session.id);
  if (!rate.ok) return rate;

  const killRate = killRateOk(session.id);
  if (!killRate.ok) return killRate;

  const base = event.basePoints;
  if (!Number.isFinite(base) || base <= 0 || base > POINT_LIMITS.MAX_KILL_POINTS) {
    return { ok: false, reason: 'basePoints fuera de rango', flag: 'points-range' };
  }

  return { ok: true };
}

export function validateWaveEvent(
  session: GamificationSession,
  event: WaveCompletedEvent,
): CheatCheckResult {
  const active = validateSessionActive(session);
  if (!active.ok) return active;

  const ts = timestampOk(event.timestamp);
  if (!ts.ok) return ts;

  const rate = eventRateOk(session.id);
  if (!rate.ok) return rate;

  if (!Number.isInteger(event.waveNumber) || event.waveNumber < 1 || event.waveNumber > POINT_LIMITS.MAX_WAVE_NUMBER) {
    return { ok: false, reason: 'waveNumber fuera de rango', flag: 'wave-range' };
  }
  if (event.waveNumber !== session.waves + 1) {
    return { ok: false, reason: 'oleada no secuencial', flag: 'wave-order' };
  }

  return { ok: true };
}

export function validateComboEvent(
  session: GamificationSession,
  event: ComboEvent,
): CheatCheckResult {
  const active = validateSessionActive(session);
  if (!active.ok) return active;

  const ts = timestampOk(event.timestamp);
  if (!ts.ok) return ts;

  const rate = eventRateOk(session.id);
  if (!rate.ok) return rate;

  if (!Number.isInteger(event.comboCount) || event.comboCount < 1 || event.comboCount > POINT_LIMITS.MAX_COMBO) {
    return { ok: false, reason: 'combo fuera de rango', flag: 'combo-range' };
  }
  if (event.comboCount > session.maxCombo + 1) {
    return { ok: false, reason: 'combo no secuencial', flag: 'combo-order' };
  }

  return { ok: true };
}

export function validateGenericEvent(
  session: GamificationSession,
  type: GameEventType,
  timestamp: number,
): CheatCheckResult {
  const active = validateSessionActive(session);
  if (!active.ok) return active;

  const ts = timestampOk(timestamp);
  if (!ts.ok) return ts;

  const rate = eventRateOk(session.id);
  if (!rate.ok) return rate;

  return { ok: true };
}
