/* ================================================================== */
/* AGENT POLICY — Punto de decisión de autonomía (ADR-0006)           */
/* ================================================================== */
/* Decide si una propuesta de acción de un agente puede ejecutarse     */
/* sin supervisión, requiere aprobación humana/guardián, o se rechaza. */
/* Aplica la matriz capability→risk, el perfil del agente (tope máximo */
/* de riesgo + tiers que exigen aprobación) y un presupuesto por       */
/* ventana (budget) con circuit breaker de acciones.                   */
/*                                                                     */
/* Fallos:                                                             */
/*  - Propuesta inválida  → REJECTED (fail-closed)                     */
/*  - Riesgo > tope        → REJECTED                                  */
/*  - Riesgo exige aprobación → APPROVAL_REQUIRED                      */
/*  - Presupuesto agotado / circuito abierto → DEFERRED (no ejecuta)   */
/* ================================================================== */

import {
  AgentActionProposal,
  AgentProfile,
  RiskTier,
  agentActionProposalSchema,
  resolveRiskTier,
  riskRank,
} from '@/lib/core/contracts/agent-autonomy';

export type AgentDecision =
  | { outcome: 'approved'; reason: string }
  | { outcome: 'approval-required'; reason: string; requiredTier: RiskTier }
  | { outcome: 'rejected'; reason: string }
  | { outcome: 'deferred'; reason: string };

export interface AgentBudget {
  maxTokensPerWindow: number;
  maxActionsPerWindow: number;
  windowMs: number;
  maxConsecutiveFailures: number;
}

export const DEFAULT_AGENT_BUDGET: AgentBudget = {
  maxTokensPerWindow: 40_000,
  maxActionsPerWindow: 20,
  windowMs: 60_000,
  maxConsecutiveFailures: 3,
};

/* ------------------------------------------------------------------ */
/* Estado en memoria por agente (presupuesto + circuito)               */
/* ------------------------------------------------------------------ */

interface BudgetState {
  windowStartedAt: number;
  tokensUsed: number;
  actionsUsed: number;
  consecutiveFailures: number;
}

const budgetState = new Map<string, BudgetState>();

function stateFor(agent: string): BudgetState {
  const now = Date.now();
  const s = budgetState.get(agent);
  if (!s || now - s.windowStartedAt >= 60_000) {
    const fresh: BudgetState = {
      windowStartedAt: now,
      tokensUsed: 0,
      actionsUsed: 0,
      consecutiveFailures: 0,
    };
    budgetState.set(agent, fresh);
    return fresh;
  }
  return s;
}

/* ------------------------------------------------------------------ */
/* Decisión pura: sin efectos, sin estado. Testable.                   */
/* ------------------------------------------------------------------ */

export function decideAgentAction(
  raw: unknown,
  profile: AgentProfile,
  budget: AgentBudget = DEFAULT_AGENT_BUDGET,
): AgentDecision {
  const parsed = agentActionProposalSchema.safeParse(raw);
  if (!parsed.success) {
    return { outcome: 'rejected', reason: 'propuesta no conforme al contrato AgentActionProposal' };
  }
  const proposal: AgentActionProposal = parsed.data;

  /* Riesgo declarado vs. matriz canónica: nunca confiar en lo declarado. */
  const canonical = resolveRiskTier(proposal.capability);
  if (riskRank(proposal.riskTier) > riskRank(canonical)) {
    return { outcome: 'rejected', reason: `riesgo declarado ${proposal.riskTier} excede la matriz para ${proposal.capability} (${canonical})` };
  }

  /* El agente no puede exceder su tope de autonomía. */
  if (riskRank(canonical) > riskRank(profile.maxRiskTier)) {
    return { outcome: 'rejected', reason: `capacidad ${proposal.capability} (${canonical}) excede el tope ${profile.maxRiskTier} de ${profile.id}` };
  }

  /* Tiers que exigen aprobación humana/guardián. */
  if (profile.requiresApproval.includes(canonical)) {
    return { outcome: 'approval-required', reason: `riesgo ${canonical} exige aprobación`, requiredTier: canonical };
  }

  /* Presupuesto de ventana (estado en memoria). */
  const s = stateFor(profile.id);
  if (s.actionsUsed >= budget.maxActionsPerWindow) {
    return { outcome: 'deferred', reason: 'presupuesto de acciones por ventana agotado' };
  }
  if ((s.tokensUsed + (proposal.estimateTokens ?? 0)) > budget.maxTokensPerWindow) {
    return { outcome: 'deferred', reason: 'presupuesto de tokens por ventana agotado' };
  }
  if (s.consecutiveFailures >= budget.maxConsecutiveFailures) {
    return { outcome: 'deferred', reason: 'circuito abierto por fallos consecutivos' };
  }

  return { outcome: 'approved', reason: `${proposal.capability} dentro de autonomía de ${profile.id}` };
}

/* ------------------------------------------------------------------ */
/* Contabilidad (llamada por el ejecutor al aprobar/fallar)            */
/* ------------------------------------------------------------------ */

export function recordAgentStart(agent: string, proposal: AgentActionProposal): void {
  const s = stateFor(agent);
  s.actionsUsed += 1;
  s.tokensUsed += proposal.estimateTokens ?? 0;
}

export function recordAgentFailure(agent: string): void {
  const s = stateFor(agent);
  s.consecutiveFailures += 1;
}

export function recordAgentSuccess(agent: string): void {
  const s = stateFor(agent);
  s.consecutiveFailures = 0;
}

export function resetAgentBudget(agent: string): void {
  budgetState.delete(agent);
}
