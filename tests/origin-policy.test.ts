import { describe, it, expect, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import {
  validateHostHeader,
  selfOriginFromHost,
  trustedHosts,
  allowedOrigins,
  normalizeOrigin,
  verifyOrigin,
} from '@/lib/security/trust';

/* process.env.NODE_ENV está tipado como readonly por Next; cast a mutable.
   El afterEach reemplaza process.env con una copia, así que siempre se opera
   sobre el objeto actual en cada test. */
function setNodeEnv(value: string): void {
  (process.env as Record<string, string | undefined>).NODE_ENV = value;
}

/** Simula una petición Next con headers de Origin y Host. */
function requestWith(origin?: string | null, host = 'www.visitarealdelmonte.online'): NextRequest {
  const url = `https://${host}/api/ruta`;
  const headers: Record<string, string> = {};
  if (origin !== null && origin !== undefined) headers['origin'] = origin;
  headers['host'] = host;
  return new NextRequest(url, { headers });
}

const ORIGINAL = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL };
});

describe('frontera · normalización y validación de Host', () => {
  it('normaliza hosts simples y con puerto', () => {
    expect(validateHostHeader('tamv.online')).toEqual({ hostname: 'tamv.online', port: '' });
    expect(validateHostHeader('TAMV.Online')).toEqual({ hostname: 'tamv.online', port: '' });
    expect(validateHostHeader('api.tamv.online:8443')).toEqual({ hostname: 'api.tamv.online', port: '8443' });
  });

  it('rechaza hosts malformados (fail-closed)', () => {
    expect(validateHostHeader(null)).toBeNull();
    expect(validateHostHeader('')).toBeNull();
    expect(validateHostHeader('https://tamv.online')).toBeNull();
    expect(validateHostHeader('tamv.online/path')).toBeNull();
    expect(validateHostHeader('tamv.online?x=1')).toBeNull();
    expect(validateHostHeader('user@tamv.online')).toBeNull();
    expect(validateHostHeader('evil.com:99999')).toBeNull();
    expect(validateHostHeader('a b.com')).toBeNull();
    expect(validateHostHeader('tamv.online:abc')).toBeNull();
  });
});

describe('frontera · self-origin SOLO contra trusted hosts', () => {
  it('deriva self-origin únicamente si el host está en la política', () => {
    process.env.TRUSTED_HOSTS = 'tamv.online,www.tamv.online';
    process.env.APP_URL = '';
    process.env.NEXT_PUBLIC_SITE_URL = '';
    process.env.VERCEL_URL = '';
    process.env.CANONICAL_ORIGINS = '';

    expect(selfOriginFromHost('tamv.online')).toBe('https://tamv.online');
    expect(selfOriginFromHost('www.tamv.online')).toBe('https://www.tamv.online');
  });

  it('NUNCA deriva self-origin de un host desconocido', () => {
    process.env.TRUSTED_HOSTS = 'tamv.online';
    process.env.APP_URL = '';
    process.env.NEXT_PUBLIC_SITE_URL = '';
    process.env.VERCEL_URL = '';
    process.env.CANONICAL_ORIGINS = '';

    expect(selfOriginFromHost('evil.com')).toBeNull();
    expect(selfOriginFromHost('sub.tamv.online')).toBeNull();
  });

  it('deriva self-origin de un host malformado', () => {
    process.env.TRUSTED_HOSTS = 'tamv.online';
    expect(selfOriginFromHost('https://evil.com')).toBeNull();
    expect(selfOriginFromHost('tamv.online/path')).toBeNull();
  });
});

describe('frontera · allowlist canónica', () => {
  it('construye la allowlist desde APP_URL, site y CANONICAL_ORIGINS', () => {
    process.env.APP_URL = 'https://tamv.online';
    process.env.NEXT_PUBLIC_SITE_URL = 'https://www.tamv.online';
    process.env.CANONICAL_ORIGINS = 'https://api.tamv.online,https://portal.tamv.online';
    process.env.VERCEL_URL = '';
    const origins = allowedOrigins();
    expect(origins).toContain('https://tamv.online');
    expect(origins).toContain('https://www.tamv.online');
    expect(origins).toContain('https://api.tamv.online');
    expect(origins).toContain('https://portal.tamv.online');
    expect(origins).not.toContain('https://evil.com');
  });

  it('trustedHosts agrega hosts de orígenes canónicos y de TRUSTED_HOSTS', () => {
    process.env.APP_URL = 'https://tamv.online';
    process.env.TRUSTED_HOSTS = 'www.tamv.online,api.tamv.online';
    const hosts = trustedHosts();
    expect(hosts).toContain('tamv.online');
    expect(hosts).toContain('www.tamv.online');
    expect(hosts).toContain('api.tamv.online');
  });
});

describe('frontera · normalizeOrigin', () => {
  it('normaliza a origen sin path', () => {
    expect(normalizeOrigin('https://tamv.online/pagina')).toBe('https://tamv.online');
    expect(normalizeOrigin('https://tamv.online:8443/ruta')).toBe('https://tamv.online:8443');
    expect(normalizeOrigin('no-url')).toBeNull();
  });
});

describe('frontera · verifyOrigin (producción)', () => {
  /* El sitio canónico se sirve en www.visitarealdelmonte.online: el
     navegador envía Origin igual al Host, lo que debe admitirse sin
     depender de la allowlist (defensa CSRF estándar "Origin === Host"). */
  it('acepta el dominio canónico mismo-origen aunque la allowlist no lo incluya', () => {
    process.env.APP_URL = '';
    process.env.NEXT_PUBLIC_SITE_URL = '';
    process.env.VERCEL_URL = '';
    process.env.CANONICAL_ORIGINS = '';
    process.env.TRUSTED_HOSTS = '';
    setNodeEnv('production');

    const result = verifyOrigin(requestWith('https://www.visitarealdelmonte.online', 'www.visitarealdelmonte.online'));
    expect(result.ok).toBe(true);
    expect(result.fallback).toBe(true);
  });

  it('rechaza un origen cross-site ajeno', () => {
    process.env.APP_URL = '';
    process.env.NEXT_PUBLIC_SITE_URL = '';
    process.env.VERCEL_URL = '';
    process.env.CANONICAL_ORIGINS = '';
    process.env.TRUSTED_HOSTS = '';
    setNodeEnv('production');

    const result = verifyOrigin(requestWith('https://evil.com'));
    expect(result.ok).toBe(false);
  });

  it('rechaza un Origin malformado (fail-closed, no degrada a Host)', () => {
    process.env.APP_URL = '';
    process.env.NEXT_PUBLIC_SITE_URL = '';
    process.env.VERCEL_URL = '';
    process.env.CANONICAL_ORIGINS = '';
    process.env.TRUSTED_HOSTS = '';
    setNodeEnv('production');

    const result = verifyOrigin(requestWith('no-url'));
    expect(result.ok).toBe(false);
  });

  it('acepta orígenes de la allowlist explícita (Host distinto del origen)', () => {
    process.env.APP_URL = '';
    process.env.NEXT_PUBLIC_SITE_URL = '';
    process.env.VERCEL_URL = '';
    process.env.CANONICAL_ORIGINS = 'https://www.visitarealdelmonte.online';
    process.env.TRUSTED_HOSTS = '';
    setNodeEnv('production');

    /* Host de API distinto del origen canónico: solo la allowlist lo admite. */
    const result = verifyOrigin(
      new NextRequest('https://api.visitarealdelmonte.online/api/ruta', {
        headers: {
          origin: 'https://www.visitarealdelmonte.online',
          host: 'api.visitarealdelmonte.online',
        },
      }),
    );
    expect(result.ok).toBe(true);
    expect(result.fallback).toBeUndefined();
  });

  it('acepta peticiones sin Origin si el Host es válido', () => {
    process.env.APP_URL = '';
    process.env.NEXT_PUBLIC_SITE_URL = '';
    process.env.VERCEL_URL = '';
    process.env.CANONICAL_ORIGINS = '';
    process.env.TRUSTED_HOSTS = '';
    setNodeEnv('production');

    const result = verifyOrigin(requestWith(null));
    expect(result.ok).toBe(true);
  });
});
