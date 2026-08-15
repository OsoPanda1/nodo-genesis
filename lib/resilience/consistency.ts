/* ================================================================== */
/* CONSISTENCIA FEDERADA — Clases C0..C4 y degradación (ADR-0006)      */
/* ================================================================== */
/* Define las clases de consistencia que la flota federada YUN admite   */
/* por tipo de operación, con su timeout máximo y política de          */
/* degradación. La comunicación entre federaciones se degrada de forma  */
/* controlada (sin cascadas): cada salto aplica la política de la       */
/* clase en curso, y el Modo de Operación global decide qué se permite. */
/* ================================================================== */

export type ConsistencyClass = 'C0' | 'C1' | 'C2' | 'C3' | 'C4';

export type OperatingMode = 'operational' | 'degraded' | 'locked-down';

export interface ConsistencyPolicy {
  class: ConsistencyClass;
  label: string;
  timeoutMs: number;
  allowStale: boolean;
  requireAck: boolean;
  maxHops: number;
}

/* C0: lectura en caliente sin ACK; C1: lectura consistente; C2: escritura
   con ACK; C3: escritura fuerte (quórum); C4: transaccional (tolerancia
   mínima a la degradación). */
export const CONSISTENCY_CLASSES: Record<ConsistencyClass, ConsistencyPolicy> = {
  C0: { class: 'C0', label: 'lectura en caliente (stale ok)', timeoutMs: 300, allowStale: true, requireAck: false, maxHops: 2 },
  C1: { class: 'C1', label: 'lectura consistente', timeoutMs: 800, allowStale: false, requireAck: false, maxHops: 3 },
  C2: { class: 'C2', label: 'escritura con ACK', timeoutMs: 1_500, allowStale: false, requireAck: true, maxHops: 2 },
  C3: { class: 'C3', label: 'escritura fuerte (quórum)', timeoutMs: 3_000, allowStale: false, requireAck: true, maxHops: 2 },
  C4: { class: 'C4', label: 'transaccional', timeoutMs: 5_000, allowStale: false, requireAck: true, maxHops: 1 },
};

/** Permisos de operación según el modo global. */
export const MODE_ALLOWED_CLASSES: Record<OperatingMode, ConsistencyClass[]> = {
  operational: ['C0', 'C1', 'C2', 'C3', 'C4'],
  degraded: ['C0', 'C1', 'C2'],
  'locked-down': ['C0'],
};

export function modeForClass(cls: ConsistencyClass, mode: OperatingMode): boolean {
  return MODE_ALLOWED_CLASSES[mode].includes(cls);
}

export function isClassAllowed(cls: ConsistencyClass, mode: OperatingMode): boolean {
  return modeForClass(cls, mode);
}

export function effectiveTimeoutMs(cls: ConsistencyClass, mode: OperatingMode): number {
  if (mode === 'locked-down') return Math.min(CONSISTENCY_CLASSES[cls].timeoutMs, CONSISTENCY_CLASSES.C0.timeoutMs);
  return CONSISTENCY_CLASSES[cls].timeoutMs;
}

/* ------------------------------------------------------------------ */
/* Estado de degradación por federación                                */
/* ------------------------------------------------------------------ */

export type DegradationLevel = 'none' | 'soft' | 'hard';

export interface FederationHealth {
  id: string;
  level: DegradationLevel;
  since: number;
  lastError: string | null;
}

const federationState = new Map<string, FederationHealth>();

export function setFederationHealth(id: string, level: DegradationLevel, error?: string): void {
  const prev = federationState.get(id);
  if (prev && prev.level === level) {
    if (error !== undefined) prev.lastError = error;
    return;
  }
  federationState.set(id, { id, level, since: Date.now(), lastError: error ?? null });
}

export function getFederationHealth(id: string): FederationHealth {
  return federationState.get(id) ?? { id, level: 'none', since: 0, lastError: null };
}

export function federationStatus(): FederationHealth[] {
  return [...federationState.values()];
}
