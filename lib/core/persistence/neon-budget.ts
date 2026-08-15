/* ================================================================== */
/* PERSISTENCIA — Presupuesto de cómputo Neon (plan Free)             */
/* ================================================================== */
/* Protege el plan Free de Neon: 100 CU-hours/proyecto/mes. La computa */
/* de Neon se factura por tiempo ACTIVO (CU-hours); con scale-to-zero   */
/* tras 5 min, un nodo que mantiene pings frecuentes puede agotar el    */
/* presupuesto mensual sin hacer trabajo útil.                         */
/*                                                                     */
/* Este módulo lleva un contador mensual de "tiempo de computa activa"  */
/* estimado desde los consumidores de la capa durable y expone:        */
/*   - neonBudgetStatus(): uso mensual estimado y límite configurable.  */
/*   - isNeonBudgetExhausted(): si el presupuesto se agotó (degradar).  */
/*   - trackComputeActivity(ms): registrar actividad de cómputo.        */
/*   - pingCooldown(): intervalo mínimo entre pings de salud.           */
/*                                                                     */
/* La fuente de verdad es la memoria del proceso (fail-open, nunca      */
/* bloquea operaciones): si el presupuesto se agota, la capa durable    */
/* sigue en modo demo y el monitor lo reporta. No corta nada por sí     */
/* mismo; los consumidores consultan el estado y degradan.             */
/* ================================================================== */

import 'server-only';

export const NEON_FREE_CU_HOURS = 100;
export const NEON_AUTOSUSPEND_MS = 5 * 60 * 1000;

interface NeonBudgetState {
  month: string;
  computeMs: number;
  lastPingAt: number;
}

const g = globalThis as unknown as { __rdmNeonBudget?: NeonBudgetState };

function currentMonth(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
}

function state(): NeonBudgetState {
  const month = currentMonth();
  if (!g.__rdmNeonBudget || g.__rdmNeonBudget.month !== month) {
    g.__rdmNeonBudget = { month, computeMs: 0, lastPingAt: 0 };
  }
  return g.__rdmNeonBudget;
}

/** Límite mensual de cómputo en horas (configurable, default plan Free). */
export function neonCuHoursLimit(): number {
  const raw = process.env.NEON_CU_HOURS_LIMIT;
  const value = raw ? Number(raw) : NaN;
  return Number.isFinite(value) && value > 0 ? value : NEON_FREE_CU_HOURS;
}

/** Registra tiempo de cómputo activo estimado (ms). Acumulador mensual. */
export function trackComputeActivity(activeMs: number): void {
  const s = state();
  if (Number.isFinite(activeMs) && activeMs > 0) {
    s.computeMs += activeMs;
  }
}

/** Estado del presupuesto mensual. Nunca lanza. */
export function neonBudgetStatus(): {
  month: string;
  limitHours: number;
  usedMs: number;
  usedHours: number;
  usageRatio: number;
  exhausted: boolean;
  cooldownMs: number;
} {
  const s = state();
  const limitHours = neonCuHoursLimit();
  const usedHours = s.computeMs / (60 * 60 * 1000);
  return {
    month: s.month,
    limitHours,
    usedMs: s.computeMs,
    usedHours,
    usageRatio: limitHours > 0 ? usedHours / limitHours : 0,
    exhausted: limitHours > 0 && usedHours >= limitHours,
    cooldownMs: neonPingCooldownMs(),
  };
}

/** ¿Se agotó el presupuesto mensual de cómputo? (degradar a demo). */
export function isNeonBudgetExhausted(): boolean {
  return neonBudgetStatus().exhausted;
}

/** Intervalo mínimo entre pings de salud (default 5 min → scale-to-zero). */
export function neonPingCooldownMs(): number {
  const raw = process.env.NEON_PING_COOLDOWN_MS;
  const value = raw ? Number(raw) : NaN;
  return Number.isFinite(value) && value > 0 ? value : NEON_AUTOSUSPEND_MS;
}

/** ¿Es momento de volver a pingear según el cooldown? */
export function canPingNeon(now: number = Date.now()): boolean {
  const s = state();
  return now - s.lastPingAt >= neonPingCooldownMs();
}

/** Marca el último ping como realizado. */
export function markNeonPing(now: number = Date.now()): void {
  state().lastPingAt = now;
}

/** Sella el estado mensual (para el monitor: uso + cooldown). */
export function neonBudgetTelemetry(): NeonBudgetState {
  return { ...state() };
}

/** Reinicia el presupuesto (solo para tests). */
export function resetNeonBudgetForTests(): void {
  delete g.__rdmNeonBudget;
}
