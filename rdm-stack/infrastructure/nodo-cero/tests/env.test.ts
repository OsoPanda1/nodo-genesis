import { describe, it, expect, afterEach } from 'vitest';
import { envSchema, parseEnv, getEnv, envStatus } from '@/lib/core/env';

/* process.env.NODE_ENV está tipado como readonly por Next; cast mutable. */
const env = process.env as Record<string, string | undefined>;

const KEYS = [
  'APP_URL', 'NEXT_PUBLIC_SITE_URL', 'ISA_API_KEY', 'MEXA_OPERATOR_KEY',
  'CROWN_EMERGENCY_KEY', 'GAMIFICATION_HMAC_SECRET', 'MEXA_OPERATOR_PUBLIC_KEY',
  'NEON_CU_HOURS_LIMIT', 'NEON_PING_COOLDOWN_MS', 'PGHOST', 'PGUSER',
];

afterEach(() => {
  for (const key of KEYS) delete process.env[key];
  delete env.NODE_ENV;
});

describe('env · contrato tipado', () => {
  it('parsea un entorno válido', () => {
    process.env.APP_URL = 'https://rdm.example.com';
    const result = parseEnv(process.env);
    expect(result.ok).toBe(true);
    expect(result.data.APP_URL).toBe('https://rdm.example.com');
  });

  it('reporta problemas sin lanzar ante URLs inválidas', () => {
    process.env.APP_URL = 'no-es-url';
    const result = parseEnv(process.env);
    expect(result.ok).toBe(false);
    expect(result.issues.some(i => i.path === 'APP_URL')).toBe(true);
  });

  it('NODE_ENV tiene default development', () => {
    expect(getEnv().NODE_ENV).toBe('development');
    env.NODE_ENV = 'production';
    expect(getEnv().NODE_ENV).toBe('production');
  });

  it('getEnv es fail-open ante valores inválidos', () => {
    process.env.APP_URL = 'mal';
    expect(getEnv().APP_URL).toBe('mal');
  });

  it('valida claves rotables con _V2/_V3', () => {
    process.env.ISA_API_KEY_V2 = 'clave-larga-suficiente-1234';
    expect(getEnv().ISA_API_KEY_V2).toBe('clave-larga-suficiente-1234');
  });

  it('envStatus agrupa las claves requeridas', () => {
    process.env.APP_URL = 'https://x.example.com';
    process.env.ISA_API_KEY = 'abcdefgh1234';
    const status = envStatus();
    const core = status.groups.find(g => g.group === 'core');
    const keys = status.groups.find(g => g.group === 'claves internas');
    expect(core?.missing).toEqual([]);
    expect(keys?.missing.length).toBe(4);
  });

  it('el esquema no rechaza un entorno vacío (modo demo)', () => {
    expect(envSchema.safeParse({}).success).toBe(true);
  });

  it('acepta las variables de la integración Neon de Vercel', () => {
    process.env.PGHOST = 'ep-lila-123-pooler.us-east-2.aws.neon.tech';
    process.env.PGUSER = 'neondb_owner';
    process.env.POSTGRES_PASSWORD = 'secret';
    process.env.DATABASE_URL = 'postgres://user:pass@host/neondb';
    process.env.NEON_CU_HOURS_LIMIT = '100';
    process.env.NEON_PING_COOLDOWN_MS = '300000';
    const result = parseEnv(process.env);
    expect(result.ok).toBe(true);
    expect(result.data.PGHOST).toContain('pooler');
    expect(result.data.DATABASE_URL).toBe('postgres://user:pass@host/neondb');
    expect(result.data.NEON_CU_HOURS_LIMIT).toBe('100');
  });

  it('rechaza un límite de cómputo no numérico', () => {
    process.env.NEON_CU_HOURS_LIMIT = 'cien';
    const result = parseEnv(process.env);
    expect(result.ok).toBe(false);
    expect(result.issues.some(i => i.path === 'NEON_CU_HOURS_LIMIT')).toBe(true);
  });
});
