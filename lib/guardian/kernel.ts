/* ================================================================== */
/* GUARDIAN YUN — Kernel de guardianía                                 */
/* ================================================================== */
/* Motor de decisión con deny-by-default, mínimo privilegio,           */
/* idempotencia (replay de decisiones), reversibilidad, auditoría y    */
/* escalación humana cuando la autonomía no alcanza.                   */
/* ================================================================== */

import type { GuardianPolicy, GuardianRequest, GuardianDecision } from './policy';
import { EMERGENCY_RULES, type AutonomyLevel, type EmergencyLevel } from './levels';

export interface AuditEntry {
  at: number;
  principal: string;
  action: string;
  resource: string;
  effect: 'allow' | 'deny';
  reason: string;
  token?: string;
}

export interface Escalation {
  id: string;
  request: GuardianRequest;
  decision: GuardianDecision;
  status: 'pending' | 'approved' | 'rejected';
}

let escalationSeq = 0;

function matches(policy: GuardianPolicy, request: GuardianRequest): boolean {
  if (policy.principal !== '*' && policy.principal !== request.principal) return false;
  if (policy.action !== request.action) return false;
  if (policy.resource !== '*' && policy.resource !== request.resource) return false;
  return true;
}

export class GuardianKernel {
  private policies = new Map<string, GuardianPolicy>();
  private decisions = new Map<string, GuardianDecision>();
  private audit: AuditEntry[] = [];
  private escalations = new Map<string, Escalation>();
  private emergencyLevel: EmergencyLevel = 0;

  register(policy: GuardianPolicy): void {
    this.policies.set(policy.id, policy);
  }

  deregister(id: string): void {
    this.policies.delete(id);
  }

  setEmergencyLevel(level: EmergencyLevel): void {
    this.emergencyLevel = level;
  }

  getEmergencyLevel(): EmergencyLevel {
    return this.emergencyLevel;
  }

  /** Decide una petición. Sin política explícita -> deny (deny by default). */
  decide(request: GuardianRequest): GuardianDecision {
    if (request.idempotencyKey) {
      const cached = this.decisions.get(request.idempotencyKey);
      if (cached) return { ...cached, replayed: true };
    }

    const matched = [...this.policies.values()].filter(policy => matches(policy, request));
    const deny = matched.find(policy => policy.effect === 'deny');
    const allow = matched.find(policy => policy.effect === 'allow');
    const rules = EMERGENCY_RULES[this.emergencyLevel];

    let decision: GuardianDecision;
    if (deny) {
      decision = this.buildDecision('deny', 'Denegado por política explícita', deny.id, false, rules, deny.reversible);
    } else if (allow) {
      const needsHuman = !allow.autonomous || rules.humanEscalation;
      decision = this.buildDecision(
        'allow',
        needsHuman ? 'Permitido con escalación humana' : 'Permitido autónomo',
        allow.id,
        needsHuman,
        rules,
        allow.reversible,
      );
    } else {
      decision = this.buildDecision('deny', 'Denegado por defecto (sin política explícita)', null, false, rules, false);
    }

    if (request.idempotencyKey) this.decisions.set(request.idempotencyKey, decision);
    this.audit.push({
      at: Date.now(),
      principal: request.principal,
      action: request.action,
      resource: request.resource,
      effect: decision.effect,
      reason: decision.reason,
    });
    return decision;
  }

  /** Registra una escalación humana pendiente. */
  escalate(request: GuardianRequest, decision: GuardianDecision): string {
    const id = `esc-${Date.now().toString(36)}-${(++escalationSeq).toString(36)}`;
    this.escalations.set(id, { id, request, decision, status: 'pending' });
    return id;
  }

  pendingEscalations(): Escalation[] {
    return [...this.escalations.values()].filter(e => e.status === 'pending');
  }

  resolveEscalation(id: string, approved: boolean): boolean {
    const escalation = this.escalations.get(id);
    if (!escalation || escalation.status !== 'pending') return false;
    escalation.status = approved ? 'approved' : 'rejected';
    this.audit.push({
      at: Date.now(),
      principal: escalation.request.principal,
      action: escalation.request.action,
      resource: escalation.request.resource,
      effect: approved ? escalation.decision.effect : 'deny',
      reason: approved ? 'Escalación humana aprobada' : 'Escalación humana rechazada',
      token: id,
    });
    return true;
  }

  /** Revierte una decisión idempotente si la política es reversible. */
  revert(idempotencyKey: string): boolean {
    const decision = this.decisions.get(idempotencyKey);
    if (!decision || !decision.reversible) return false;
    this.audit.push({
      at: Date.now(),
      principal: 'guardian',
      action: 'revert',
      resource: idempotencyKey,
      effect: decision.effect,
      reason: 'Reversión idempotente aplicada',
      token: idempotencyKey,
    });
    return true;
  }

  auditTrail(limit = 100): AuditEntry[] {
    return this.audit.slice(-limit).reverse();
  }

  status(): {
    emergencyLevel: EmergencyLevel;
    autonomy: AutonomyLevel;
    policies: number;
    decisionsCached: number;
    escalationsPending: number;
  } {
    return {
      emergencyLevel: this.emergencyLevel,
      autonomy: EMERGENCY_RULES[this.emergencyLevel].autonomy,
      policies: this.policies.size,
      decisionsCached: this.decisions.size,
      escalationsPending: this.pendingEscalations().length,
    };
  }

  clear(): void {
    this.policies.clear();
    this.decisions.clear();
    this.audit = [];
    this.escalations.clear();
    this.emergencyLevel = 0;
  }

  private buildDecision(
    effect: 'allow' | 'deny',
    reason: string,
    matchedPolicyId: string | null,
    needsHuman: boolean,
    rules: { autonomy: AutonomyLevel },
    reversible: boolean,
  ): GuardianDecision {
    return {
      effect,
      reason,
      matchedPolicyId,
      needsHuman,
      autonomy: rules.autonomy,
      emergencyLevel: this.emergencyLevel,
      reversible,
      replayed: false,
    };
  }
}
