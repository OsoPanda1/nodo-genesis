import { IsabellaPerception, PolicyGateResult } from './contracts';
import { ARGUS_assess, LUMEN_evaluate, ORION_perceive } from './engines';

/**
 * Policy Gate — Capa de infraestructura que gobierna cada percepción.
 *
 * Entrada: IsabellaPerception.
 * Salida: PolicyGateResult { status: 'allowed' | 'denied' | 'requires_approval', reason, appliedPolicies }.
 *
 * Orquesta ORION (señales), ARGUS (riesgo) y LUMEN (evaluación constitucional
 * sobre isabella_policies) para aplicar "Governance as Code" en cada percepción.
 */
export function policyGate(perception: IsabellaPerception): PolicyGateResult {
  const orion = ORION_perceive(perception);
  const argus = ARGUS_assess(perception, orion);
  const lumen = LUMEN_evaluate(perception, argus);

  return {
    status: lumen.status,
    reason: lumen.reason,
    appliedPolicies: lumen.appliedPolicies,
  };
}
