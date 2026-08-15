import { describe, it, expect } from 'vitest';
import { fleetAllowed, policyBlocked, policySeverity } from '@/lib/isabella/gateway-policy';

describe('gateway-policy · LUMEN fail-closed', () => {
  it('solo `allowed` autoriza la consulta a la flota', () => {
    expect(fleetAllowed('allowed')).toBe(true);
    expect(fleetAllowed('denied')).toBe(false);
    expect(fleetAllowed('requires_approval')).toBe(false);
  });

  it('policyBlocked es el inverso exacto', () => {
    expect(policyBlocked('allowed')).toBe(false);
    expect(policyBlocked('denied')).toBe(true);
    expect(policyBlocked('requires_approval')).toBe(true);
  });

  it('severidad alta solo para denied', () => {
    expect(policySeverity('denied')).toBe('high');
    expect(policySeverity('requires_approval')).toBe('medium');
  });
});
