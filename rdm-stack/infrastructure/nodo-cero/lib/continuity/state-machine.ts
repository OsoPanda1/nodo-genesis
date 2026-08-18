/* ================================================================== */
/* CONTINUITY — Máquina de estados del Bastión (YUN BE)               */
/* ================================================================== */
/* Estados:                                                           */
/*   DORMANT → observa salud, replica eventos, verifica integridad.   */
/*   READY   → réplicas y políticas válidas; apto para promoción.     */
/*   SUSPECT → señales inconsistentes; no promueve todavía.           */
/*   ISOLATED→ evita split-brain; bloquea escritura no esencial.      */
/*   ACTIVE_ISLAND → atiende funciones críticas con datos verificados */
/*                   o marcados como stale.                            */
/*   RECOVERY_PENDING → primario recuperado; se valida consistencia.  */
/*   RECONCILING → reproduce journal, resuelve conflictos, audita.    */
/*                                                                     */
/* Regla de promoción a ACTIVE_ISLAND:                                */
/*   2 fuentes de fallo independientes + lease primario expirado +    */
/*   YUN BE READY + fencing token válido = promoción.                  */
/* ================================================================== */

import type { YunBeMode } from './types';

const TRANSITIONS: Record<YunBeMode, YunBeMode[]> = {
  DORMANT: ['READY', 'SUSPECT', 'ISOLATED'],
  READY: ['DORMANT', 'SUSPECT', 'ISOLATED', 'ACTIVE_ISLAND'],
  SUSPECT: ['DORMANT', 'READY', 'ISOLATED'],
  ISOLATED: ['READY', 'ACTIVE_ISLAND', 'RECOVERY_PENDING', 'SUSPECT'],
  ACTIVE_ISLAND: ['ISOLATED', 'RECOVERY_PENDING', 'SUSPECT', 'RECONCILING'],
  RECOVERY_PENDING: ['ACTIVE_ISLAND', 'RECONCILING', 'DORMANT'],
  RECONCILING: ['DORMANT', 'READY', 'ACTIVE_ISLAND'],
};

export function canTransition(from: YunBeMode, to: YunBeMode): boolean {
  return TRANSITIONS[from].includes(to);
}

export function transitionError(from: YunBeMode, to: YunBeMode): string | null {
  if (canTransition(from, to)) return null;
  return `Transición inválida de ${from} a ${to}`;
}

export const YUN_BE_MODES: YunBeMode[] = [
  'DORMANT',
  'READY',
  'SUSPECT',
  'ISOLATED',
  'ACTIVE_ISLAND',
  'RECOVERY_PENDING',
  'RECONCILING',
];
