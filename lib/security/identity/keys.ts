/* ================================================================== */
/* IDENTITY YUN — Criptografía de API keys nativas                    */
/* ================================================================== */
/* Generación, hash y verificación de credenciales del Nodo.           */
/*                                                                     */
/*   - generateApiKey(): 32 bytes aleatorios (crypto) con prefijo      */
/*     identificable `rdm_live_` (el prefijo nunca revela el secreto). */
/*   - hashApiKey():      scrypt (N=2^15) con sal por clave; el hash   */
/*     se almacena, jamás la clave en claro.                           */
/*   - verifyApiKey():    verificación en tiempo constante del hash.   */
/*   - blindKey():        huella corta no reversible para logs/UI.     */
/*                                                                     */
/* Principios: no reutilizar sal, no guardar secreto, fallar cerrado.  */
/* ================================================================== */

import crypto from 'node:crypto';

const KEY_PREFIX = 'rdm_live_';
const KEY_BYTES = 32;
const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const HASH_KEYLEN = 64;

/** Genera una API key nativa con prefijo identificable. */
export function generateApiKey(): string {
  const random = crypto.randomBytes(KEY_BYTES).toString('base64url');
  return `${KEY_PREFIX}${random}`;
}

/** Hash scrypt de una clave (nunca se almacena en claro). */
export function hashApiKey(apiKey: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(apiKey, salt, HASH_KEYLEN, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
  });
  return `scrypt:${salt}:${derived.toString('hex')}`;
}

/** Verifica una clave presentada contra su hash almacenado. */
export function verifyApiKey(apiKey: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  const [, salt, expectedHex] = parts;
  const derived = crypto.scryptSync(apiKey, salt, HASH_KEYLEN, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
  });
  const expected = Buffer.from(expectedHex, 'hex');
  const provided = Buffer.from(derived);
  if (expected.length !== provided.length) return false;
  return crypto.timingSafeEqual(expected, provided);
}

/** Huella corta no reversible para logs, telemetría y listados. */
export function blindApiKey(apiKey: string): string {
  if (!apiKey) return '';
  const hash = crypto.createHash('sha256').update(apiKey).digest('hex').slice(0, 16);
  const label = apiKey.slice(0, 12);
  return `${label}…${hash}`;
}
