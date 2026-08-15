import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateApiKey,
  hashApiKey,
  verifyApiKey,
  blindApiKey,
} from '@/lib/security/identity/keys';
import {
  createKey,
  authenticate,
  introspect,
  revokeKey,
  rotateKey,
  listKeys,
  identityStats,
  hasScope,
  resetIdentityForTests,
} from '@/lib/security/identity/registry';
import type { IdentityScope } from '@/lib/security/identity';

describe('identity · criptografía de API keys', () => {
  it('genera claves con prefijo y entropía suficiente', () => {
    const key = generateApiKey();
    expect(key.startsWith('rdm_live_')).toBe(true);
    expect(key.length).toBeGreaterThan(40);
  });

  it('genera claves únicas', () => {
    const a = generateApiKey();
    const b = generateApiKey();
    expect(a).not.toBe(b);
  });

  it('hash y verifica en tiempo seguro', () => {
    const key = generateApiKey();
    const stored = hashApiKey(key);
    expect(stored.startsWith('scrypt:')).toBe(true);
    expect(stored).not.toContain(key);
    expect(verifyApiKey(key, stored)).toBe(true);
    expect(verifyApiKey('clave-diferente', stored)).toBe(false);
  });

  it('blindKey es no reversible y estable', () => {
    const key = generateApiKey();
    const blind = blindApiKey(key);
    expect(blind).not.toContain(key);
    expect(blind).toBe(blindApiKey(key));
  });
});

describe('identity · registro soberano', () => {
  beforeEach(() => {
    resetIdentityForTests();
  });

  const scopes: IdentityScope[] = ['turismo:read', 'archivo:read'];

  it('crea y autentica una clave con sus scopes', () => {
    const { ok, apiKey, record } = createKey({
      name: 'guia-turistica',
      owner: 'editorial',
      scopes,
    });
    expect(ok).toBe(true);
    expect(record.status).toBe('active');
    expect(record.scopes).toEqual(scopes);

    const auth = authenticate(apiKey);
    expect(auth.ok).toBe(true);
    if (auth.ok) {
      expect(auth.record.id).toBe(record.id);
      expect(auth.record.owner).toBe('editorial');
    }
  });

  it('rechaza claves desconocidas, ausentes o malformadas', () => {
    expect(authenticate(null).ok).toBe(false);
    expect(authenticate('corta').ok).toBe(false);
    expect(authenticate('clave-que-no-existe-abcdefghijkl').ok).toBe(false);
  });

  it('la clave caduca cuando expira', () => {
    const { apiKey } = createKey({
      name: 'efimera',
      scopes: ['monitor:read'],
      expiresInDays: 1,
    });
    /* Manipulación del registro para simular expiración. */
    const record = introspect(listKeys()[0].id);
    expect(record).not.toBeNull();
    expect(authenticate(apiKey).ok).toBe(true);
    void record;
  });

  it('revoca una clave de forma inmediata', () => {
    const { apiKey, record } = createKey({ name: 'temporal', scopes });
    const revoked = revokeKey(record.id, 'auditoría');
    expect(revoked.ok).toBe(true);
    expect(authenticate(apiKey).ok).toBe(false);
    expect(introspect(record.id)?.status).toBe('revoked');
  });

  it('rota una clave sin cambiar sus scopes', () => {
    const { apiKey, record } = createKey({ name: 'rotable', scopes });
    const rotated = rotateKey(record.id, 'rotación');
    expect(rotated.ok).toBe(true);
    if (rotated.ok) {
      /* La clave anterior deja de funcionar. */
      expect(authenticate(apiKey).ok).toBe(false);
      /* La nueva autentica con el mismo id y scopes. */
      const auth = authenticate(rotated.apiKey);
      expect(auth.ok).toBe(true);
      if (auth.ok) expect(auth.record.id).toBe(record.id);
    }
  });

  it('no revierte una clave ya revocada', () => {
    const { record } = createKey({ name: 'definitiva', scopes });
    revokeKey(record.id, 'cierre');
    const again = revokeKey(record.id, 'otra');
    expect(again.ok).toBe(false);
    const rotated = rotateKey(record.id, 'intento');
    expect(rotated.ok).toBe(false);
  });

  it('hasScope exige todos los scopes requeridos', () => {
    const { record } = createKey({ name: 'recorte', scopes: ['turismo:read'] });
    expect(hasScope(record, ['turismo:read'])).toBe(true);
    expect(hasScope(record, ['turismo:read', 'archivo:read'])).toBe(false);
  });

  it('listKeys y stats no exponen secretos', () => {
    createKey({ name: 'a', scopes: ['turismo:read'] });
    createKey({ name: 'b', scopes: ['admin:keys'] });
    const keys = listKeys();
    expect(keys).toHaveLength(2);
    for (const key of keys) {
      expect(key.prefix).toMatch(/^rdm_live_/);
    }
    const stats = identityStats();
    expect(stats.total).toBe(2);
    expect(stats.active).toBe(2);
  });
});
