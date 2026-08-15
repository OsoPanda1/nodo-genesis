import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { signSessionToken, verifySessionToken } from '@/lib/security/auth-tokens';

const SECRET = 'test-hmac-secret-0123456789abcdef';

/* process.env.NODE_ENV está tipado como readonly por Next; cast a mutable. */
function setNodeEnv(value: string): void {
  (process.env as Record<string, string | undefined>).NODE_ENV = value;
}

describe('auth-tokens · HMAC (modo signed)', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    process.env.GAMIFICATION_HMAC_SECRET = SECRET;
    setNodeEnv('test');
  });
  afterEach(() => {
    delete process.env.GAMIFICATION_HMAC_SECRET;
    setNodeEnv(originalNodeEnv ?? 'test');
    vi.useRealTimers();
  });

  it('emite tokens firmados con exactamente 2 segmentos', () => {
    const { token, mode } = signSessionToken({ sessionId: 's1', deviceId: 'd1', actorId: 'a1' });
    expect(mode).toBe('signed');
    expect(token.split('.')).toHaveLength(2);
  });

  it('verifica un token válido con sessionId/deviceId esperados', () => {
    const { token } = signSessionToken({ sessionId: 's1', deviceId: 'd1', actorId: 'a1' });
    const v = verifySessionToken(token, 's1', 'd1');
    expect(v.ok).toBe(true);
    expect(v.payload?.sessionId).toBe('s1');
    expect(v.payload?.deviceId).toBe('d1');
  });

  it('rechaza firma alterada (tampering)', () => {
    const { token } = signSessionToken({ sessionId: 's1', deviceId: 'd1', actorId: 'a1' });
    const [body] = token.split('.');
    const forged = `${body}.AA${body.slice(2, 40)}zZ`;
    const v = verifySessionToken(forged, 's1', 'd1');
    expect(v.ok).toBe(false);
    expect(v.reason).toBe('firma inválida');
  });

  it('rechaza token con segmentos extra', () => {
    const { token } = signSessionToken({ sessionId: 's1', deviceId: 'd1', actorId: 'a1' });
    const v = verifySessionToken(`${token}.extra`, 's1', 'd1');
    expect(v.ok).toBe(false);
    expect(v.reason).toBe('token con segmentos extra');
  });

  it('rechaza token de otra sesión (anti-IDOR)', () => {
    const { token } = signSessionToken({ sessionId: 's1', deviceId: 'd1', actorId: 'a1' });
    const v = verifySessionToken(token, 's2', 'd1');
    expect(v.ok).toBe(false);
    expect(v.reason).toBe('token no corresponde a la sesión');
  });

  it('rechaza token de otro dispositivo', () => {
    const { token } = signSessionToken({ sessionId: 's1', deviceId: 'd1', actorId: 'a1' });
    const v = verifySessionToken(token, 's1', 'd2');
    expect(v.ok).toBe(false);
    expect(v.reason).toBe('token no corresponde al dispositivo');
  });

  it('rechaza token caducado', () => {
    vi.useFakeTimers();
    const { token } = signSessionToken({ sessionId: 's1', deviceId: 'd1', actorId: 'a1' });
    vi.advanceTimersByTime(7 * 60 * 60 * 1000);
    const v = verifySessionToken(token, 's1', 'd1');
    expect(v.ok).toBe(false);
    expect(v.reason).toBe('token caducado');
  });

  it('rechaza token sin firma (modo signed)', () => {
    const body = Buffer.from(JSON.stringify({
      sessionId: 's1', deviceId: 'd1', actorId: 'a1',
      iat: Date.now(), exp: Date.now() + 3600_000,
    })).toString('base64url');
    const v = verifySessionToken(`${body}.`, 's1', 'd1');
    expect(v.ok).toBe(false);
    expect(v.reason).toBe('token sin firma');
  });
});

describe('auth-tokens · modos open y fail-closed', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    delete process.env.GAMIFICATION_HMAC_SECRET;
    setNodeEnv(originalNodeEnv ?? 'test');
  });

  it('sin secreto en desarrollo → modo open (valida estructura)', () => {
    setNodeEnv('development');
    delete process.env.GAMIFICATION_HMAC_SECRET;
    const { token, mode } = signSessionToken({ sessionId: 's1', deviceId: 'd1', actorId: 'a1' });
    expect(mode).toBe('open');
    const v = verifySessionToken(token, 's1', 'd1');
    expect(v.ok).toBe(true);
  });

  it('sin secreto en producción → sign LANZA (fail-closed)', () => {
    setNodeEnv('production');
    delete process.env.GAMIFICATION_HMAC_SECRET;
    expect(() => signSessionToken({ sessionId: 's1', deviceId: 'd1', actorId: 'a1' }))
      .toThrow(/GAMIFICATION_HMAC_SECRET/);
  });

  it('sin secreto en producción → verify falla (fail-closed)', () => {
    setNodeEnv('production');
    delete process.env.GAMIFICATION_HMAC_SECRET;
    const body = Buffer.from(JSON.stringify({
      sessionId: 's1', deviceId: 'd1', actorId: 'a1',
      iat: Date.now(), exp: Date.now() + 3600_000,
    })).toString('base64url');
    const v = verifySessionToken(`${body}.`, 's1', 'd1');
    expect(v.ok).toBe(false);
    expect(v.reason).toBe('verificación criptográfica no disponible');
  });
});
