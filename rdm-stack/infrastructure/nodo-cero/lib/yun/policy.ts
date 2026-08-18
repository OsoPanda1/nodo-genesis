/* ================================================================== */
/* POLICY YUN — Política de operación del Quantum Semantic Core        */
/* ================================================================== */
/* Traducción ejecutable de `policy/constitution.rego` del blueprint:  */
/*                                                                     */
/*   - El contenedor debe ejecutar como usuario no root.               */
/*   - El readinessProbe debe usar el endpoint de prontitud.           */
/*   - El sellado híbrido exige proveedor auditado (fail-closed).      */
/*                                                                     */
/* En el Nodo Cero la política se evalúa en dos capas: (1) la          */
/* declarativa (rego/Dockerfile/k8s) y (2) la de negocio semántica     */
/* (validateSemanticPolicy). Esta función cubre la de negocio.         */
/* ================================================================== */

import type { YunSemanticContext } from './contracts';

export interface YunPolicyAssessment {
  ok: boolean;
  policy: string;
  checks: Array<{ rule: string; ok: boolean; detail?: string }>;
}

/** Evalúa la política semántica de negocio para un contexto dado. */
export function assessYunPolicy(semantic: YunSemanticContext): YunPolicyAssessment {
  const checks = [
    {
      rule: 'confidential',
      ok: semantic.sensitivity !== 'confidential' || semantic.ontology !== undefined,
      detail: semantic.sensitivity === 'confidential'
        ? (semantic.ontology !== undefined
            ? undefined
            : 'ontología requerida para sensibilidad confidential')
        : undefined,
    },
    {
      rule: 'critical-precision',
      ok: semantic.sensitivity !== 'critical' || semantic.confidence !== undefined,
      detail: semantic.sensitivity === 'critical' && semantic.confidence === undefined
        ? 'confianza requerida para sensibilidad critical'
        : undefined,
    },
    {
      rule: 'federation-aware',
      ok: semantic.federationId === undefined || semantic.domain !== 'federations',
      detail: semantic.federationId !== undefined && semantic.domain === 'federations'
        ? 'eventos de federaciones no deben referir una federación concreta'
        : undefined,
    },
  ];

  return {
    ok: checks.every((check) => check.ok),
    policy: 'yun-constitution-v1',
    checks,
  };
}
