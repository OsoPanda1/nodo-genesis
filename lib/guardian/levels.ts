/* ================================================================== */
/* GUARDIAN YUN — Niveles de autonomía y emergencia                    */
/* ================================================================== */
/* La autonomía del Kernel es acotada: a mayor nivel de emergencia     */
/* menos acciones autónomas y más escalación humana obligatoria.       */
/* ================================================================== */

export type AutonomyLevel = 'L0' | 'L1' | 'L2' | 'L3';
export type EmergencyLevel = 0 | 1 | 2 | 3 | 4;

export const AUTONOMY_RANK: Record<AutonomyLevel, number> = {
  L0: 0,
  L1: 1,
  L2: 2,
  L3: 3,
};

export interface LevelRule {
  autonomy: AutonomyLevel;
  /** Obliga a intervención humana en toda decisión sensible. */
  humanEscalation: boolean;
  /** Alcance de acciones autónomas permitido en este nivel. */
  autonomousActions: 'none' | 'read' | 'standard' | 'full';
}

export const EMERGENCY_RULES: Record<EmergencyLevel, LevelRule> = {
  0: { autonomy: 'L3', humanEscalation: false, autonomousActions: 'full' },
  1: { autonomy: 'L2', humanEscalation: false, autonomousActions: 'standard' },
  2: { autonomy: 'L1', humanEscalation: true, autonomousActions: 'read' },
  3: { autonomy: 'L0', humanEscalation: true, autonomousActions: 'read' },
  4: { autonomy: 'L0', humanEscalation: true, autonomousActions: 'none' },
};
