import { describe, it, expect, beforeEach } from 'vitest';
import { GuardianKernel } from '@/lib/guardian/kernel';
import type { GuardianPolicy } from '@/lib/guardian/policy';

const ALLOW_PUBLISH: GuardianPolicy = {
  id: 'pol-gamification-publish',
  principal: 'service:gamification',
  action: 'publish',
  resource: 'api:marketplace:publish',
  effect: 'allow',
  autonomous: true,
  reversible: true,
};

const DENY_EMERGENCY: GuardianPolicy = {
  id: 'pol-deny-emergency',
  principal: '*',
  action: 'emergency.arm',
  resource: '*',
  effect: 'deny',
  autonomous: false,
  reversible: false,
};

describe('Guardian Kernel', () => {
  let kernel: GuardianKernel;

  beforeEach(() => {
    kernel = new GuardianKernel();
  });

  it('deniega por defecto cuando no hay política explícita', () => {
    const decision = kernel.decide({ principal: 'service:x', action: 'publish', resource: 'api:x' });
    expect(decision.effect).toBe('deny');
    expect(decision.reason).toContain('por defecto');
  });

  it('una política explícita de denegación prevalece sobre el allow', () => {
    kernel.register(ALLOW_PUBLISH);
    kernel.register(DENY_EMERGENCY);
    const decision = kernel.decide({ principal: 'service:gamification', action: 'emergency.arm', resource: 'system' });
    expect(decision.effect).toBe('deny');
    expect(decision.matchedPolicyId).toBe(DENY_EMERGENCY.id);
  });

  it('permite acciones autónomas con política allow en nivel 0', () => {
    kernel.register(ALLOW_PUBLISH);
    const decision = kernel.decide({
      principal: 'service:gamification',
      action: 'publish',
      resource: 'api:marketplace:publish',
    });
    expect(decision.effect).toBe('allow');
    expect(decision.needsHuman).toBe(false);
    expect(decision.autonomy).toBe('L3');
  });

  it('escala a humano en emergencia nivel 2 (autonomía acotada)', () => {
    kernel.register(ALLOW_PUBLISH);
    kernel.setEmergencyLevel(2);
    const decision = kernel.decide({
      principal: 'service:gamification',
      action: 'publish',
      resource: 'api:marketplace:publish',
    });
    expect(decision.effect).toBe('allow');
    expect(decision.needsHuman).toBe(true);
    expect(decision.autonomy).toBe('L1');
  });

  it('deduplica decisiones por clave de idempotencia', () => {
    kernel.register(ALLOW_PUBLISH);
    const first = kernel.decide({
      principal: 'service:gamification',
      action: 'publish',
      resource: 'api:marketplace:publish',
      idempotencyKey: 'op-1',
    });
    const second = kernel.decide({
      principal: 'service:gamification',
      action: 'publish',
      resource: 'api:marketplace:publish',
      idempotencyKey: 'op-1',
    });
    expect(second.replayed).toBe(true);
    expect(second.effect).toBe(first.effect);
    expect(kernel.status().decisionsCached).toBe(1);
  });

  it('revierte solo decisiones reversibles', () => {
    kernel.register(ALLOW_PUBLISH);
    kernel.register({ ...DENY_EMERGENCY, id: 'pol-deny-x', action: 'write' });
    kernel.decide({
      principal: 'service:gamification',
      action: 'publish',
      resource: 'api:marketplace:publish',
      idempotencyKey: 'op-rev',
    });
    kernel.decide({ principal: 'service:x', action: 'write', resource: 'api:x', idempotencyKey: 'op-noway' });

    expect(kernel.revert('op-rev')).toBe(true);
    expect(kernel.revert('op-noway')).toBe(false);
  });

  it('registra y resuelve escalaciones humanas', () => {
    kernel.register(ALLOW_PUBLISH);
    kernel.setEmergencyLevel(3);
    const decision = kernel.decide({
      principal: 'service:gamification',
      action: 'publish',
      resource: 'api:marketplace:publish',
    });
    expect(decision.needsHuman).toBe(true);

    const id = kernel.escalate(
      { principal: 'service:gamification', action: 'publish', resource: 'api:marketplace:publish' },
      decision,
    );
    expect(kernel.pendingEscalations().length).toBe(1);

    expect(kernel.resolveEscalation(id, true)).toBe(true);
    expect(kernel.pendingEscalations().length).toBe(0);

    const tail = kernel.auditTrail(5);
    expect(tail.some(entry => entry.token === id && entry.reason.includes('aprobada'))).toBe(true);
  });

  it('reporta el estado del kernel', () => {
    kernel.register(ALLOW_PUBLISH);
    kernel.setEmergencyLevel(1);
    const status = kernel.status();
    expect(status.policies).toBe(1);
    expect(status.autonomy).toBe('L2');
    expect(status.emergencyLevel).toBe(1);
  });
});
