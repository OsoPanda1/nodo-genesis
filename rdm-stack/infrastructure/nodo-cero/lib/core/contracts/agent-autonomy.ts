/* ================================================================== */
/* CONTRACT AGENT-AUTONOMY — Orquestación de agentes soberanos        */
/* ================================================================== */
/* Contrato canónico del ADR-0006 para la autonomía de los agentes    */
/* del Nodo (Isabella y flota federada). Define:                       */
/*  - capacidades declaradas de un agente (capabilities),              */
/*  - nivel de riesgo por acción (RiskTier R0..R4),                    */
/*  - propuesta de acción (AgentActionProposal) con validación zod,    */
/*  - matriz capability → risk máxima permitida.                       */
/* La política de ejecución (budget, circuit breaker, aprobaciones)    */
/* vive en lib/security/agent-policy.ts y consume estos tipos.         */
/* ================================================================== */

import { z } from 'zod';

/* ------------------------------------------------------------------ */
/* 1. CAPACIDADES DE AGENTE                                            */
/* ------------------------------------------------------------------ */

export const agentCapabilitySchema = z.enum([
  'diagnose',      // diagnosticar, sin efectos laterales
  'retrieve',      // leer conocimiento canónico
  'compose',       // redactar/estructurar contenido
  'propose',       // proponer acciones a un humano o guardián
  'orchestrate',   // invocar sub-agentes
  'mutate',        // modificar estado interno (no persistente)
  'persist',       // escribir en almacenes del Nodo
  'infer-external',// llamar a inferencia remota
  'egress',        // enviar datos fuera del Nodo (federación)
  'destructive',   // borrar/irreversible
]);

export type AgentCapability = z.infer<typeof agentCapabilitySchema>;

/* ------------------------------------------------------------------ */
/* 2. NIVELES DE RIESGO R0..R4                                        */
/* ------------------------------------------------------------------ */

export const riskTierSchema = z.enum(['R0', 'R1', 'R2', 'R3', 'R4']);

export type RiskTier = z.infer<typeof riskTierSchema>;

/* Riesgo máximo aceptable por capacidad declarada. Cualquier propuesta
   cuyo riesgo exceda la matriz es rechazada en el punto de decisión. */
export const CAPABILITY_RISK_MATRIX: Record<AgentCapability, RiskTier> = {
  diagnose: 'R0',
  retrieve: 'R0',
  compose: 'R1',
  propose: 'R1',
  orchestrate: 'R2',
  mutate: 'R2',
  persist: 'R3',
  'infer-external': 'R3',
  egress: 'R4',
  destructive: 'R4',
};

/* ------------------------------------------------------------------ */
/* 3. PROPUESTA DE ACCIÓN                                              */
/* ------------------------------------------------------------------ */

export const agentActionProposalSchema = z
  .object({
    id: z.string().min(1),
    agent: z.string().min(1),
    intent: z.string().min(1),
    capability: agentCapabilitySchema,
    riskTier: riskTierSchema,
    target: z
      .object({
        kind: z.enum(['knowledge', 'store', 'federation', 'process', 'system']),
        id: z.string().min(1),
      })
      .strict(),
    rationale: z.string().min(1).max(500),
    estimateTokens: z.number().int().nonnegative().optional(),
    untrusted: z
      .array(
        z
          .object({
            source: z.string().min(1),
            snippet: z.string().max(200),
          })
          .strict(),
      )
      .default([]),
    traceId: z.string().min(1).optional(),
  })
  .strict();

export type AgentActionProposal = z.infer<typeof agentActionProposalSchema>;

/* ------------------------------------------------------------------ */
/* 4. PERFIL DE AGENTE                                                 */
/* ------------------------------------------------------------------ */

export const agentProfileSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    capabilities: z.array(agentCapabilitySchema).min(1),
    maxRiskTier: riskTierSchema,
    requiresApproval: z.array(riskTierSchema).default(['R3', 'R4']),
  })
  .strict();

export type AgentProfile = z.infer<typeof agentProfileSchema>;

/* ------------------------------------------------------------------ */
/* 5. RESOLUCIÓN DE RIESGO (helper puro)                               */
/* ------------------------------------------------------------------ */

export function resolveRiskTier(capability: AgentCapability): RiskTier {
  return CAPABILITY_RISK_MATRIX[capability];
}

export function riskRank(tier: RiskTier): number {
  return Number(tier.slice(1));
}
