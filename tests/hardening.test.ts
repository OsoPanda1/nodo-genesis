import { describe, it, expect } from 'vitest';
import { mexaValidateQuantumResilience } from '../lib/isabella/mexa-crypto';
import { getTripleHardeningStatus, getEmergencyStatus } from '../lib/isabella/dead-man-switch';
import { isaReason } from '../lib/isabella/isa-core';

describe('RDM Digital Mega Auditoría & Triple Hardening Suite', () => {
  it('1. Layer 1 Crypto: Post-quantum resilience audit should pass', async () => {
    const status = await mexaValidateQuantumResilience();
    expect(status.hardened).toBe(true);
    expect(status.pqcTarget).toBe('CRYSTALS-Dilithium-5');
  });

  it('2. Layer 2 Resilience: Dead Man Switch and Triple Hardening audit should be active', () => {
    const status = getTripleHardeningStatus();
    expect(status.layer1CryptoPostQuantum).toBe(true);
    expect(status.layer2DeadManSwitchResilience).toBe(true);
    expect(status.layer3StateCRDTIntegrity).toBe(true);
    expect(status.hardened).toBe(true);

    const emergency = getEmergencyStatus();
    expect(emergency.hardening.zeroEgressInLockdown).toBe(true);
  });

  it('3. Layer 3 YUN & Heptafederado + Isabella integration should resolve core sources', async () => {
    const res = await isaReason('Háblame del Núcleo 1 y de la federación YUN');
    expect(res.answer).toBeDefined();
    expect(res.sources.length).toBeGreaterThan(0);
    const hasNucleo = res.sources.some(s => s.kind === 'nucleo' || s.title.includes('Núcleo'));
    expect(hasNucleo).toBe(true);
  });
});
