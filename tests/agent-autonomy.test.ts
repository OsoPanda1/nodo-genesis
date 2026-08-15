import { describe, it, expect } from 'vitest';
import {
  agentActionProposalSchema,
  agentCapabilitySchema,
  riskTierSchema,
  resolveRiskTier,
  riskRank,
  CAPABILITY_RISK_MATRIX,
} from '@/lib/core/contracts/agent-autonomy';

describe('agent-autonomy · contrato de propuestas', () => {
  it('valida una propuesta conforme al contrato estricto', () => {
    const result = agentActionProposalSchema.safeParse({
      id: 'act-1',
      agent: 'isabella',
      intent: 'resumir conocimiento',
      capability: 'retrieve',
      riskTier: 'R0',
      target: { kind: 'knowledge', id: 'kn-abc' },
      rationale: 'lectura de fuente canónica',
      untrusted: [{ source: 'user', snippet: 'contenido' }],
    });
    expect(result.success).toBe(true);
  });

  it('rechaza claves extra (fail-closed strict)', () => {
    const result = agentActionProposalSchema.safeParse({
      id: 'act-1',
      agent: 'isabella',
      intent: 'x',
      capability: 'retrieve',
      riskTier: 'R0',
      target: { kind: 'knowledge', id: 'kn-abc' },
      rationale: 'x',
      injected: true,
    });
    expect(result.success).toBe(false);
  });

  it('rechaza riesgo declarado no válido', () => {
    const result = agentActionProposalSchema.safeParse({
      id: 'act-1',
      agent: 'isabella',
      intent: 'x',
      capability: 'retrieve',
      riskTier: 'R9',
      target: { kind: 'knowledge', id: 'kn-abc' },
      rationale: 'x',
    });
    expect(result.success).toBe(false);
  });

  it('enumera capacidades y tiers como uniones cerradas', () => {
    expect(agentCapabilitySchema.options).toContain('egress');
    expect(agentCapabilitySchema.options).toContain('destructive');
    expect(riskTierSchema.options).toEqual(['R0', 'R1', 'R2', 'R3', 'R4']);
  });
});

describe('agent-autonomy · matriz de riesgo', () => {
  it('mapea cada capacidad a su tier canónico', () => {
    expect(resolveRiskTier('diagnose')).toBe('R0');
    expect(resolveRiskTier('compose')).toBe('R1');
    expect(resolveRiskTier('persist')).toBe('R3');
    expect(resolveRiskTier('egress')).toBe('R4');
    expect(resolveRiskTier('destructive')).toBe('R4');
  });

  it('define tope para toda capacidad de la matriz', () => {
    for (const capability of agentCapabilitySchema.options) {
      expect(CAPABILITY_RISK_MATRIX[capability]).toBeDefined();
    }
  });

  it('rank ordena de menor a mayor riesgo', () => {
    expect(riskRank('R0')).toBe(0);
    expect(riskRank('R4')).toBe(4);
  });
});
