/* ================================================================== */
/* NONCE — Anti-replay de eventos y rutas sensibles                   */
/* ================================================================== */
/* Protege contra reinyección: cada solicitud sensible debe incluir    */
/* un nonce único (x-rdm-nonce) dentro de una ventana de frescura.     */
/* El nonce se consume una sola vez (memoria del runtime).             */
/*                                                                     */
/*  - claimNonce(nonce, scope): registra el nonce y devuelve ok solo   */
/*    la primera vez (replay → denegado).                              */
/*  - El mapa se poda por TTL para no crecer indefinidamente.          */
/* ================================================================== */

import crypto from 'node:crypto';
import { constantTimeCompare } from '@/lib/security/trust';

const DEFAULT_TTL_MS = 300_000; /* 5 min: ventana de frescura por defecto */
const MAX_ENTRIES = 20_000;

interface NonceEntry {
  at: number;
  ttlMs: number;
}

const seen = new Map<string, NonceEntry>();

/** Limpia nonces expirados y poda el almacén. */
export function pruneNonces(now: number = Date.now()): void {
  for (const [key, entry] of seen) {
    if (now - entry.at > entry.ttlMs) seen.delete(key);
  }
  if (seen.size > MAX_ENTRIES) {
    let removed = 0;
    for (const [key, entry] of seen) {
      if (removed >= seen.size - MAX_ENTRIES) break;
      seen.delete(key);
      removed += 1;
    }
  }
}

function scopeKey(scope: string, nonce: string): string {
  return `${scope}:${nonce}`;
}

/**
 * Registra un nonce y valida su primera aparición.
 * Devuelve ok=false si ya fue usado (replay) o no es una cadena segura.
 */
export function claimNonce(
  nonce: string | null | undefined,
  scope: string,
  options: { ttlMs?: number } = {},
): { ok: boolean; reason?: string } {
  pruneNonces();

  if (!nonce || typeof nonce !== 'string') {
    return { ok: false, reason: 'nonce ausente (fail-closed)' };
  }
  if (nonce.length < 16 || nonce.length > 128) {
    return { ok: false, reason: 'nonce con longitud inválida' };
  }
  if (!/^[A-Za-z0-9._~-]+$/.test(nonce)) {
    return { ok: false, reason: 'nonce con caracteres inválidos' };
  }

  const ttlMs = options.ttlMs ?? DEFAULT_TTL_MS;
  const key = scopeKey(scope, nonce);
  const existing = seen.get(key);
  if (existing && Date.now() - existing.at <= ttlMs) {
    return { ok: false, reason: 'nonce ya utilizado (replay denegado)' };
  }

  seen.set(key, { at: Date.now(), ttlMs });
  return { ok: true };
}

/** Genera un nonce criptográfico de 32 bytes (base64url). */
export function generateNonce(): string {
  return crypto.randomBytes(32).toString('base64url');
}

/** Compara dos nonces en tiempo constante (para respuestas firmadas). */
export function noncesEqual(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false;
  return constantTimeCompare(a, b);
}

/** Estado del almacén de nonces (telemetría). */
export function nonceStats(): { used: number; ttlMs: number } {
  return { used: seen.size, ttlMs: DEFAULT_TTL_MS };
}

/** Limpieza total (uso en pruebas). */
export function resetNoncesForTests(): void {
  seen.clear();
}
