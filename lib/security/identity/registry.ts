/* ================================================================== */
/* IDENTITY YUN — Registro soberano de API keys                       */
/* ================================================================== */
/* Almacén de credenciales del Nodo (server-only). Guarda únicamente   */
/* hashes scrypt de las claves, con ciclo de vida completo:            */
/*                                                                     */
/*   - createKey():    emite una clave nueva (el secreto se muestra    */
/*                     UNA sola vez al emisor).                        */
/*   - authenticate(): verifica una clave presentada y devuelve su     */
/*                     identidad + scopes si está activa y vigente.    */
/*   - rotateKey():    revoca la generación actual y emite una nueva.  */
/*   - revokeKey():    revocación inmediata.                           */
/*   - introspect():   estado de una clave (sin exponer el hash).      */
/*                                                                     */
/* La persistencia es write-behind (mismo patrón que gamificación):    */
/* el store caliente es memoria; el adaptador durable se registra por  */
/* hidratación si hay base de datos configurada.                       */
/* ================================================================== */

import crypto from 'node:crypto';
import { registerHydrator } from '@/lib/core/persistence';
import { hashApiKey, verifyApiKey, blindApiKey } from './keys';
import type { IdentityScope } from './contracts';

export type ApiKeyStatus = 'active' | 'revoked' | 'expired';

export interface ApiKeyRecord {
  id: string;
  name: string;
  description: string;
  owner: string;
  scopes: IdentityScope[];
  status: ApiKeyStatus;
  hash: string;
  prefix: string;
  createdAt: number;
  expiresAt: number | null;
  lastUsedAt: number | null;
  revokedAt: number | null;
  revokeReason: string | null;
  rotatedFrom: string | null;
  rotatedTo: string | null;
}

export interface ApiKeyPublic {
  id: string;
  name: string;
  description: string;
  owner: string;
  scopes: IdentityScope[];
  status: ApiKeyStatus;
  prefix: string;
  createdAt: number;
  expiresAt: number | null;
  lastUsedAt: number | null;
  revokedAt: number | null;
  revokeReason: string | null;
}

interface IdentityStoreShape {
  keys: Map<string, ApiKeyRecord>;
}

const g = globalThis as unknown as { __rdmIdentityStore?: IdentityStoreShape };

function getStore(): IdentityStoreShape {
  if (!g.__rdmIdentityStore) {
    g.__rdmIdentityStore = { keys: new Map() };
  }
  return g.__rdmIdentityStore;
}

/* Hidratación desde el adaptador durable (si se registra uno). */
registerHydrator('identity', async () => {
  /* Sin adaptador durable declarado, el registro arranca vacío salvo el
     bootstrap de la primera clave admin (si está configurada). */
  seedBootstrapAdminKey();
});

function toPublic(record: ApiKeyRecord): ApiKeyPublic {
  return {
    id: record.id,
    name: record.name,
    description: record.description,
    owner: record.owner,
    scopes: record.scopes,
    status: record.status,
    prefix: record.prefix,
    createdAt: record.createdAt,
    expiresAt: record.expiresAt,
    lastUsedAt: record.lastUsedAt,
    revokedAt: record.revokedAt,
    revokeReason: record.revokeReason,
  };
}

function isExpired(record: ApiKeyRecord, now: number): boolean {
  return record.expiresAt !== null && now > record.expiresAt;
}

export interface CreateKeyOptions {
  name: string;
  description?: string;
  owner?: string;
  scopes: IdentityScope[];
  expiresInDays?: number;
}

export function createKey(options: CreateKeyOptions): {
  ok: true;
  apiKey: string;
  record: ApiKeyPublic;
} {
  const now = Date.now();
  const id = crypto.randomUUID();
  const apiKey = `rdm_live_${crypto.randomBytes(32).toString('base64url')}`;
  const record: ApiKeyRecord = {
    id,
    name: options.name,
    description: options.description ?? '',
    owner: options.owner ?? 'operador',
    scopes: options.scopes,
    status: 'active',
    hash: hashApiKey(apiKey),
    prefix: apiKey.slice(0, 16),
    createdAt: now,
    expiresAt: options.expiresInDays ? now + options.expiresInDays * 86_400_000 : null,
    lastUsedAt: null,
    revokedAt: null,
    revokeReason: null,
    rotatedFrom: null,
    rotatedTo: null,
  };
  getStore().keys.set(id, record);
  return { ok: true, apiKey, record: toPublic(record) };
}

/**
 * Bootstrap de la primera clave admin. Lee `RDM_ADMIN_API_KEY` del entorno
 * y, si el registro está vacío, la da de alta como clave `admin:keys` +
 * `admin:all` (almacenada SIEMPRE como hash scrypt). Idempotente: no hace
 * nada si el registro ya contiene claves o la variable no está definida.
 */
export function seedBootstrapAdminKey(): {
  seeded: boolean;
  keyId?: string;
  reason?: string;
} {
  const bootstrap = process.env.RDM_ADMIN_API_KEY;
  if (!bootstrap) return { seeded: false, reason: 'RDM_ADMIN_API_KEY no definida' };
  if (bootstrap.length < 16) return { seeded: false, reason: 'clave bootstrap demasiado corta' };
  const store = getStore();
  if (store.keys.size > 0) return { seeded: false, reason: 'registro ya poblado' };

  const id = crypto.randomUUID();
  const record: ApiKeyRecord = {
    id,
    name: 'bootstrap-admin',
    description: 'Clave admin de arranque (RDM_ADMIN_API_KEY)',
    owner: 'operador',
    scopes: ['admin:keys', 'admin:all'],
    status: 'active',
    hash: hashApiKey(bootstrap),
    prefix: bootstrap.slice(0, 16),
    createdAt: Date.now(),
    expiresAt: null,
    lastUsedAt: null,
    revokedAt: null,
    revokeReason: null,
    rotatedFrom: null,
    rotatedTo: null,
  };
  store.keys.set(id, record);
  return { seeded: true, keyId: id };
}

export function authenticate(
  apiKey: string | null | undefined,
): { ok: true; record: ApiKeyPublic } | { ok: false; reason: string } {
  if (!apiKey) return { ok: false, reason: 'API key ausente (fail-closed).' };
  if (apiKey.length < 16 || apiKey.length > 256) {
    return { ok: false, reason: 'API key con longitud inválida.' };
  }

  const now = Date.now();
  const store = getStore();

  for (const record of store.keys.values()) {
    if (record.status === 'active' && verifyApiKey(apiKey, record.hash)) {
      if (isExpired(record, now)) {
        record.status = 'expired';
        return { ok: false, reason: 'API key caducada.' };
      }
      record.lastUsedAt = now;
      return { ok: true, record: toPublic(record) };
    }
  }

  return { ok: false, reason: 'API key no autorizada.' };
}

export function hasScope(
  record: ApiKeyPublic,
  requiredScopes: IdentityScope[],
): boolean {
  /* admin:all otorga acceso universal (clave maestra del Nodo). */
  if (record.scopes.includes('admin:all')) return true;
  return requiredScopes.every(scope => record.scopes.includes(scope));
}

export function introspect(id: string): ApiKeyPublic | null {
  const record = getStore().keys.get(id);
  return record ? toPublic(record) : null;
}

export function revokeKey(
  id: string,
  reason: string,
): { ok: true; record: ApiKeyPublic } | { ok: false; reason: string } {
  const record = getStore().keys.get(id);
  if (!record) return { ok: false, reason: 'Clave no encontrada.' };
  if (record.status === 'revoked') return { ok: false, reason: 'Clave ya revocada.' };
  record.status = 'revoked';
  record.revokedAt = Date.now();
  record.revokeReason = reason;
  return { ok: true, record: toPublic(record) };
}

export function rotateKey(
  id: string,
  reason: string,
): { ok: true; apiKey: string; record: ApiKeyPublic } | { ok: false; reason: string } {
  const record = getStore().keys.get(id);
  if (!record) return { ok: false, reason: 'Clave no encontrada.' };
  if (record.status === 'revoked') return { ok: false, reason: 'Clave revocada (no rotable).' };

  const apiKey = `rdm_live_${crypto.randomBytes(32).toString('base64url')}`;
  const next = { ...record };
  next.hash = hashApiKey(apiKey);
  next.prefix = apiKey.slice(0, 16);
  next.rotatedFrom = record.id;
  next.lastUsedAt = null;
  next.revokedAt = null;
  next.revokeReason = null;
  getStore().keys.set(id, next);
  return { ok: true, apiKey, record: toPublic(next) };
}

export function listKeys(): ApiKeyPublic[] {
  const store = getStore();
  const now = Date.now();
  for (const record of store.keys.values()) {
    if (record.status === 'active' && isExpired(record, now)) {
      record.status = 'expired';
    }
  }
  return [...store.keys.values()]
    .sort((a, b) => b.createdAt - a.createdAt)
    .map(toPublic);
}

/** Estadísticas del registro para telemetría (sin datos sensibles). */
export function identityStats(): {
  total: number;
  active: number;
  revoked: number;
  expired: number;
  scopesInUse: number;
} {
  const store = getStore();
  let active = 0;
  let revoked = 0;
  let expired = 0;
  const scopes = new Set<string>();
  for (const record of store.keys.values()) {
    if (record.status === 'active') active += 1;
    if (record.status === 'revoked') revoked += 1;
    if (record.status === 'expired') expired += 1;
    for (const scope of record.scopes) scopes.add(scope);
  }
  return { total: store.keys.size, active, revoked, expired, scopesInUse: scopes.size };
}

/** Huella blindada de una clave para logs (nunca el secreto). */
export function blindKey(apiKey: string): string {
  return blindApiKey(apiKey);
}

/** Limpieza total (uso en pruebas). */
export function resetIdentityForTests(): void {
  getStore().keys.clear();
}
