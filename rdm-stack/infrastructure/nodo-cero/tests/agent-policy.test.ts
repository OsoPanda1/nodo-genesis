import { describe, it, expect, beforeEach } from 'vitest';
import {
  decideAgentAction,
  recordAgentStart,
  recordAgentFailure,
  recordAgentSuccess,
  resetAgentBudget,
  DEFAULT_AGENT_BUDGET,
} from '@/lib/security/agent-policy';
import type { AgentActionProposal, AgentProfile } from '@/lib/core/contracts/agent-autonomy';

const profile: AgentProfile = {
  id: 'isabella',
  name: 'Isabella Villaseñor',
  capabilities: ['diagnose', 'retrieve', 'compose', 'propose', 'mutate'],
  maxRiskTier: 'R3',
  requiresApproval: ['R3', 'R4'],
};

function proposal(overrides: Record<string, unknown> = {}): AgentActionProposal {
  return {
    id: 'act-1',
    agent: 'isabella',
    intent: 'consultar fuente',
    capability: 'retrieve',
    riskTier: 'R0',
    target: { kind: 'knowledge', id: 'kn-abc' },
    rationale: 'consulta de rutina',
    ...overrides,
  } as AgentActionProposal;
}

beforeEach(() => {
  resetAgentBudget('isabella');
});

describe('agent-policy · decisión de autonomía', () => {
  it('aprueba acciones de bajo riesgo dentro de la autonomía', () => {
    const decision = decideAgentAction(proposal(), profile);
    expect(decision.outcome).toBe('approved');
  });

  it('rechaza propuestas que no cumplen el contrato (fail-closed)', () => {
    const decision = decideAgentAction({ nope: true }, profile);
    expect(decision.outcome).toBe('rejected');
  });

  it('rechaza riesgo declarado mayor que la matriz canónica', () => {
    const decision = decideAgentAction(
      proposal({ capability: 'retrieve', riskTier: 'R4' }),
      profile,
    );
    expect(decision.outcome).toBe('rejected');
    expect(decision.reason).toContain('excede la matriz');
  });

  it('rechaza capacidades que exceden el tope del agente', () => {
    const decision = decideAgentAction(
      proposal({ capability: 'egress', riskTier: 'R4' }),
      profile,
    );
    expect(decision.outcome).toBe('rejected');
    expect(decision.reason).toContain('excede el tope');
  });

  it('exige aprobación para tiers declarados en requiresApproval', () => {
    const decision = decideAgentAction(
      proposal({ capability: 'persist', riskTier: 'R3' }),
      profile,
    );
    expect(decision.outcome).toBe('approval-required');
    if (decision.outcome === 'approval-required') {
      expect(decision.requiredTier).toBe('R3');
    }
  });

  it('difiere cuando el presupuesto de acciones por ventana se agota', () => {
    for (let i = 0; i < DEFAULT_AGENT_BUDGET.maxActionsPerWindow; i += 1) {
      recordAgentStart('isabella', proposal({ id: `act-${i}` }));
    }
    const decision = decideAgentAction(proposal(), profile);
    expect(decision.outcome).toBe('deferred');
  });

  it('abre el circuito tras fallos consecutivos', () => {
    for (let i = 0; i < DEFAULT_AGENT_BUDGET.maxConsecutiveFailures; i += 1) {
      recordAgentFailure('isabella');
    }
    const decision = decideAgentAction(proposal(), profile);
    expect(decision.outcome).toBe('deferred');
    expect(decision.reason).toContain('circuito');
  });

  it('cierra el circuito tras un éxito', () => {
    for (let i = 0; i < DEFAULT_AGENT_BUDGET.maxConsecutiveFailures; i += 1) {
      recordAgentFailure('isabella');
    }
    recordAgentSuccess('isabella');
    const decision = decideAgentAction(proposal(), profile);
    expect(decision.outcome).toBe('approved');
  });
});
