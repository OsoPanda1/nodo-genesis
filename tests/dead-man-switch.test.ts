import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  armEmergency,
  disarmEmergency,
  getEmergencyStatus,
  heartbeat,
} from '@/lib/isabella/dead-man-switch';

const KEY = 'clave-emergencia-prueba';

describe('dead-man-switch · armado y desarme', () => {
  const originalKey = process.env.CROWN_EMERGENCY_KEY;

  beforeEach(() => {
    process.env.CROWN_EMERGENCY_KEY = KEY;
  });
  afterEach(() => {
    if (originalKey === undefined) delete process.env.CROWN_EMERGENCY_KEY;
    else process.env.CROWN_EMERGENCY_KEY = originalKey;
  });

  it('armar activa LOCKDOWN', () => {
    armEmergency('manual', 'test');
    expect(getEmergencyStatus().mode).toBe('armed');
  });

  it('desarmar con la clave correcta revierte a disarmed y limpia activatedAt', () => {
    armEmergency('manual', 'test');
    const r = disarmEmergency(KEY);
    expect(r.ok).toBe(true);
    const status = getEmergencyStatus();
    expect(status.mode).toBe('disarmed');
    expect(status.activatedAt).toBeNull();
    expect(status.deactivatedAt).not.toBeNull();
  });

  it('desarmar con clave incorrecta falla y mantiene LOCKDOWN', () => {
    armEmergency('manual', 'test');
    const r = disarmEmergency('clave-equivocada');
    expect(r.ok).toBe(false);
    expect(getEmergencyStatus().mode).toBe('armed');
  });

  it('desarmar sin CROWN_EMERGENCY_KEY definida no está permitido', () => {
    delete process.env.CROWN_EMERGENCY_KEY;
    armEmergency('manual', 'test');
    const r = disarmEmergency(KEY);
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/CROWN_EMERGENCY_KEY/);
    expect(getEmergencyStatus().mode).toBe('armed');
  });

  it('el latido renueva el heartbeat', () => {
    heartbeat();
    expect(getEmergencyStatus().heartbeat.ageMs).toBeLessThan(1000);
  });
});
