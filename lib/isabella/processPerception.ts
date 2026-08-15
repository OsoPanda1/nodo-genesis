import {
  IsabellaDecision,
  IsabellaPerception,
  IsabellaProcessResult,
  IsabellaToolCall,
  EngineName,
} from './contracts';
import { auditTrace } from './audit-tracer';
import { emitYunEvent, YunDomain } from './events';
import {
  ARGUS_assess,
  KERNEL_verify,
  MNEMOS_cycle,
  ORION_perceive,
  SOPHIA_reason,
  TOPOLOGY_snapshot,
} from './engines';
import { guardPrompt } from './prompt-guard';
import { parseIntention } from './intention-parser';
import { praPrune } from './pra';
import { policyGate } from './policy-gate';
import { executeTool } from './tools';
import { nowIso, uuid } from './utils';

/**
 * Flujo canónico de Isabella: Perceive → Remember → Decide → Act → Audit,
 * gobernado por el marco constitucional C.R.O.W.N. y el Runtime YUN.
 *
 * Pipeline de la ISA API: Prompt Guard (9 categorías) → Intention Parser
 * (8 dominios) → Structured Reasoning (Answer + Sources + Trace) → registro
 * inmutable en el bus de eventos YUN (con firma MSR opcional en la capa HTTP).
 */
export async function processPerception(perception: IsabellaPerception): Promise<IsabellaProcessResult> {
  const traceId = uuid();
  const engines: EngineName[] = [];

  /* 1. AUDIT — percepción recibida */
  const receivedAudit = auditTrace('perception.received', {
    type: perception.type,
    intent: perception.payload.intent ?? null,
    textPreview: (perception.payload.text ?? '').slice(0, 120),
  }, {
    traceId,
    actorId: perception.actorId,
    sessionId: perception.sessionId,
    federationId: perception.territory?.federationId,
    domain: (perception.territory?.domain as YunDomain) ?? 'knowledge',
  });

  /* 2. REMEMBER + CONTEXT — identidad, señales, riesgo y memoria */
  engines.push('KERNEL');
  const kernel = KERNEL_verify(perception);
  perception = { ...perception, actorId: kernel.actorId, sessionId: kernel.sessionId };

  engines.push('ORION');
  const orion = ORION_perceive(perception);

  engines.push('ARGUS');
  const argus = ARGUS_assess(perception, orion);

  engines.push('LUMEN');
  const gate = policyGate(perception);

  engines.push('TOPOLOGY');
  const territory = TOPOLOGY_snapshot();

  engines.push('MNEMOS');
  const memory = MNEMOS_cycle(perception, orion);
  const pra = praPrune();

  /* 3. C.R.O.W.N. — Prompt Guard (primera línea) + Intention Parser */
  const guard = guardPrompt(perception.payload.text ?? '');
  const canonical = parseIntention(perception.payload.text ?? '');

  const baseDetails: Record<string, unknown> = {
    intent: orion.intent,
    canonicalIntent: canonical.domain,
    canonicalConfidence: canonical.confidence,
    guardSeverity: guard.severity,
    guardCategories: guard.matches.map(m => m.categoryId),
    entities: orion.entities,
    sentiment: orion.sentiment,
    riskScore: argus.score,
    appliedPolicies: gate.appliedPolicies,
    pra: { engine: pra.engine, removed: pra.removed, remaining: pra.remaining },
    traceId,
  };

  let decision: IsabellaDecision;

  /* 4. DECIDE — Prompt Guard bloqueante (severidad crítica) */
  if (guard.blocked) {
    const blockReasons = guard.reasons.join(' ');
    const guardAudit = auditTrace('prompt_guard.blocked', {
      severity: guard.severity,
      categories: guard.matches.map(m => m.categoryId),
    }, {
      traceId,
      actorId: perception.actorId,
      sessionId: perception.sessionId,
      federationId: perception.territory?.federationId,
    });

    const guardEvent = emitYunEvent({
      eventType: 'isabella.prompt_guard.blocked',
      domain: 'security',
      federationId: perception.territory?.federationId,
      traceId,
      source: 'crown-prompt-guard',
      entityId: perception.actorId,
      severity: guard.severity,
      payload: {
        perceptionId: perception.id,
        categories: guard.matches.map(m => m.categoryId),
        severity: guard.severity,
      },
    });

    decision = {
      id: uuid(),
      perceptionId: perception.id,
      summary: `No puedo continuar con esa solicitud: la primera línea de la Constitución C.R.O.W.N. la bloqueó. ${blockReasons}`,
      confidence: 0.99,
      riskLevel: 'high',
      policyStatus: 'denied',
      engines,
      toolCalls: [],
      details: { ...baseDetails, blockReason: blockReasons, guardBlock: true },
      createdAt: nowIso(),
    };

    const decisionAudit = auditTrace('decision.created', {
      decisionId: decision.id,
      policyStatus: decision.policyStatus,
      confidence: decision.confidence,
    }, {
      traceId,
      actorId: perception.actorId,
      sessionId: perception.sessionId,
      federationId: perception.territory?.federationId,
    });

    const processedAudit = auditTrace('perception.processed', {
      policyStatus: 'denied',
      source: 'prompt-guard',
    }, {
      traceId,
      actorId: perception.actorId,
      sessionId: perception.sessionId,
    });

    return {
      traceId,
      sessionId: perception.sessionId,
      decision,
      auditEvents: [receivedAudit, guardAudit, decisionAudit, processedAudit],
      events: [guardEvent],
      memoryItems: memory.stored,
    };
  }

  /* 5. DECIDE — gobernanza constitucional (policy gate) */
  if (gate.status !== 'allowed') {
    const deniedSummary =
      gate.status === 'denied'
        ? `No puedo continuar con esa solicitud. ${gate.reason}`
        : `Tu solicitud requiere aprobación humana antes de ejecutarse. ${gate.reason}`;

    decision = {
      id: uuid(),
      perceptionId: perception.id,
      summary: deniedSummary,
      confidence: 0.62,
      riskLevel: argus.level,
      policyStatus: gate.status,
      engines,
      toolCalls: [],
      details: {
        ...baseDetails,
        blockReason: gate.reason,
      },
      createdAt: nowIso(),
    };

    const decisionAudit = auditTrace('decision.created', {
      decisionId: decision.id,
      policyStatus: decision.policyStatus,
      confidence: decision.confidence,
    }, {
      traceId,
      actorId: perception.actorId,
      sessionId: perception.sessionId,
      federationId: perception.territory?.federationId,
    });

    const blockedEvent = emitYunEvent({
      eventType: gate.status === 'denied' ? 'isabella.decision.denied' : 'isabella.decision.requires_approval',
      domain: 'security',
      federationId: perception.territory?.federationId,
      traceId,
      source: 'isabella-s-mind',
      entityId: perception.actorId,
      severity: gate.status === 'denied' ? 'high' : 'medium',
      payload: {
        decisionId: decision.id,
        perceptionId: perception.id,
        riskLevel: argus.level,
        appliedPolicies: gate.appliedPolicies,
      },
    });

    const processedAudit = auditTrace('perception.processed', { policyStatus: gate.status }, {
      traceId,
      actorId: perception.actorId,
      sessionId: perception.sessionId,
    });

    return {
      traceId,
      sessionId: perception.sessionId,
      decision,
      auditEvents: [receivedAudit, decisionAudit, processedAudit],
      events: [blockedEvent],
      memoryItems: memory.stored,
    };
  }

  /* 6. REASON + ACT — motores cognitivos y herramientas autorizadas */
  engines.push('SOPHIA');
  const sophia = SOPHIA_reason(perception, orion, memory.recalled, territory, canonical);

  const toolCalls: IsabellaToolCall[] = [];
  for (const toolName of sophia.suggestedTools.slice(0, 3)) {
    const started = Date.now();
    const outcome = executeTool(toolName, {});
    toolCalls.push({
      id: uuid(),
      tool: toolName,
      arguments: {},
      result: outcome.ok ? outcome.result : undefined,
      status: outcome.ok ? 'success' : 'error',
      durationMs: Date.now() - started,
    });
  }

  const toolsAudit = auditTrace('tools.executed', {
    count: toolCalls.length,
    tools: toolCalls.map(t => t.tool),
  }, {
    traceId,
    actorId: perception.actorId,
    sessionId: perception.sessionId,
  });

  decision = {
    id: uuid(),
    perceptionId: perception.id,
    summary: sophia.response,
    confidence: 0.88,
    riskLevel: argus.level,
    policyStatus: 'allowed',
    engines,
    toolCalls,
    sources: sophia.supportingFacts,
    details: {
      ...baseDetails,
      supportingFacts: sophia.supportingFacts,
      canonicalPatterns: canonical.matchedPatterns,
    },
    createdAt: nowIso(),
  };

  /* 7. AUDIT + EVENTOS — trazabilidad completa */
  const decisionAudit = auditTrace('decision.created', {
    decisionId: decision.id,
    policyStatus: decision.policyStatus,
    confidence: decision.confidence,
    engines: engines.join(','),
  }, {
    traceId,
    actorId: perception.actorId,
    sessionId: perception.sessionId,
    federationId: perception.territory?.federationId,
  });

  const event = emitYunEvent({
    eventType: 'isabella.decision.created',
    domain: 'knowledge',
    federationId: perception.territory?.federationId,
    traceId,
    source: 'isabella-s-mind',
    entityId: perception.actorId,
    severity: 'info',
    payload: {
      decisionId: decision.id,
      perceptionId: perception.id,
      intent: orion.intent,
      canonicalIntent: canonical.domain,
      riskLevel: argus.level,
      confidence: decision.confidence,
      engines: engines.join(','),
    },
  });

  const processedAudit = auditTrace('perception.processed', { policyStatus: 'allowed' }, {
    traceId,
    actorId: perception.actorId,
    sessionId: perception.sessionId,
  });

  return {
    traceId,
    sessionId: perception.sessionId,
    decision,
    auditEvents: [receivedAudit, toolsAudit, decisionAudit, processedAudit],
    events: [event],
    memoryItems: memory.stored,
  };
}
