/* ------------------------------------------------------------------ */
/* LUMEN POLICY GATE — Decisión soberana de si una percepción puede    */
/* consultar a la flota federada (CROWN Gateway).                      */
/* ------------------------------------------------------------------ */
/* Fail-closed: SOLO `allowed` autoriza la consulta a la flota.        */
/* `denied` y `requires_approval` responden con la decisión local.     */
/* ------------------------------------------------------------------ */

export type LumenPolicyStatus = 'allowed' | 'denied' | 'requires_approval';

export function fleetAllowed(policyStatus: string): policyStatus is 'allowed' {
  return policyStatus === 'allowed';
}

export function policyBlocked(policyStatus: string): boolean {
  return !fleetAllowed(policyStatus);
}

export function policySeverity(policyStatus: string): 'high' | 'medium' {
  return policyStatus === 'denied' ? 'high' : 'medium';
}
