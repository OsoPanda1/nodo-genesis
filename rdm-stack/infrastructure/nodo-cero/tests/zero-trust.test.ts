import { describe, it, expect } from 'vitest';
import {
  enforceZeroTrustHeaders,
  signBody,
  verifySignature,
  assertZeroTrust,
  YUN_FEDERATIONS,
} from '@/lib/security/zero-trust';
import { blindKey, deriveKey, verifyInternalKey, hasInternalKey } from '@/lib/security/keys';

describe('zero trust · 7 capas (una por federación YUN)', () => {
  it('expone las 7 federaciones', () => {
    expect(YUN_FEDERATIONS).toHaveLength(7);
    expect(YUN_FEDERATIONS).toEqual([
      'decision',
      'trazabilidad',
      'experiencia',
      'resiliencia',
      'operacion',
      'identidad',
      'interconexion',
    ]);
  });

  it('aprueba una petición limpia sin identidad exigida', () => {
    const report = enforceZeroTrustHeaders(new Headers(), { route: '/test', limit: 100 });
    expect(report.ok).toBe(true);
    expect(report.layers).toHaveLength(7);
  });

  it('rechaza payload con PII en claro (capa OPERACIÓN)', () => {
    const headers = new Headers();
    const report = enforceZeroTrustHeaders(headers, {
      route: '/test',
      body: 'hola persona@ejemplo.com',
      limit: 100,
    });
    expect(report.ok).toBe(false);
    expect(report.deniedBy).toBe('Sanitización');
    expect(report.federation).toBe('operacion');
  });

  it('rechaza API key inválida (capa IDENTIDAD) y acepta la correcta', () => {
    const options = {
      route: '/test',
      allowedKeys: ['clave-valida'],
      limit: 100,
    };
    const bad = enforceZeroTrustHeaders(
      new Headers({ 'x-rdm-api-key': 'clave-mala' }),
      options,
    );
    expect(bad.ok).toBe(false);
    expect(bad.deniedBy).toBe('Identidad');

    const good = enforceZeroTrustHeaders(
      new Headers({ 'x-rdm-api-key': 'clave-valida' }),
      options,
    );
    expect(good.ok).toBe(true);
  });

  it('rechaza firma HMAC ausente cuando se exige (capa DECISIÓN)', () => {
    const report = enforceZeroTrustHeaders(new Headers(), {
      route: '/signed',
      requiresSignature: true,
      hmacSecret: 'secreto',
      body: 'payload',
    });
    expect(report.ok).toBe(false);
    expect(report.deniedBy).toBe('Policy Gate');
  });

  it('verifica firmas HMAC válidas e inválidas', () => {
    const secret = 'secreto';
    const body = 'datos';
    const sig = signBody(body, secret);
    expect(verifySignature(body, secret, sig)).toBe(true);
    expect(verifySignature(body, secret, 'mal')).toBe(false);
    expect(verifySignature(body, 'otro-secreto', sig)).toBe(false);
    expect(verifySignature(body, secret, null)).toBe(false);
  });

  it('aprueba con firma válida cuando se exige', () => {
    const secret = 'secreto';
    const body = 'payload';
    const sig = signBody(body, secret);
    const report = enforceZeroTrustHeaders(
      new Headers({ 'x-rdm-signature': sig }),
      { route: '/signed', requiresSignature: true, hmacSecret: secret, body, limit: 100 },
    );
    expect(report.ok).toBe(true);
  });

  it('assertZeroTrust lanza cuando una capa falla', () => {
    expect(() =>
      assertZeroTrust(new Headers({ 'x-rdm-api-key': 'x' }), {
        allowedKeys: ['y'],
      }),
    ).toThrow(/Zero Trust denegado/);
  });
});

describe('key vault', () => {
  it('blinde y deriva claves sin reversa', () => {
    expect(blindKey('abc')).not.toContain('abc');
    expect(blindKey('abc')).toBe(blindKey('abc'));
    expect(deriveKey('master', 'p1').length).toBe(32);
    expect(deriveKey('master', 'p1').toString('hex')).toBe(
      deriveKey('master', 'p1').toString('hex'),
    );
    expect(deriveKey('master', 'p2').toString('hex')).not.toBe(
      deriveKey('master', 'p1').toString('hex'),
    );
  });

  it('verifyInternalKey es fail-closed sin claves configuradas', () => {
    expect(hasInternalKey('ISA_API_KEY')).toBe(false);
    expect(verifyInternalKey('ISA_API_KEY', 'cualquiera')).toBe(false);
  });
});
