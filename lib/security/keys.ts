/* ================================================================== */
/* RDM KEY VAULT — Claves internas blindadas del Nodo Cero            */
/* ================================================================== */
/* Centraliza la lectura, derivación, blindaje y rotación de las      */
/* claves internas de la plataforma:                                  */
/*                                                                     */
/*   ISA_API_KEY          — autenticación del núcleo cognitivo ISA     */
/*   MEXA_API_KEY         — autenticación de la API interna MEXA       */
/*   GAMIFICATION_API_KEY — firma/autorización del motor de juego      */
/*   MONITOR_API_KEY      — lectura del monitor general                */
/*   CROWN_API_KEY        — flota de agentes CROWN                     */
/*                                                                     */
/* Principios:                                                         */
/*   - Nunca se expone la clave en claro fuera del servidor.           */
/*   - Las derivaciones usan HMAC-SHA256 (unidireccional).             */
/*   - El blindaje (blinding) evita leaks en memoria/logs.             */
/*   - La rotación se apoya en sufijos _V2, _V3 (kebab de versiones).  */
/* ================================================================== */

import crypto from 'node:crypto';
import { constantTimeCompare } from '@/lib/security/trust';

export type InternalKeyName =
  | 'ISA_API_KEY'
  | 'MEXA_API_KEY'
  | 'GAMIFICATION_API_KEY'
  | 'MONITOR_API_KEY'
  | 'CROWN_API_KEY';

const KEY_NAMES: InternalKeyName[] = [
  'ISA_API_KEY',
  'MEXA_API_KEY',
  'GAMIFICATION_API_KEY',
  'MONITOR_API_KEY',
  'CROWN_API_KEY',
];

/** Cifra (blind) una clave en un derivado no reversible para logs/memoria. */
export function blindKey(raw: string): string {
  if (!raw) return '';
  return crypto.createHash('sha256').update(raw).digest('hex').slice(0, 16);
}

/** Prefijo legible para auditoría: isa_•, mexa_•, game_•, mon_•, crown_• */
export function blindKeyLabel(name: InternalKeyName, raw: string): string {
  const short: Record<InternalKeyName, string> = {
    ISA_API_KEY: 'isa',
    MEXA_API_KEY: 'mexa',
    GAMIFICATION_API_KEY: 'game',
    MONITOR_API_KEY: 'mon',
    CROWN_API_KEY: 'crown',
  };
  return `${short[name]}_${blindKey(raw)}`;
}

/** Lee una clave del entorno resolviendo también sufijos de rotación. */
export function getInternalKey(name: InternalKeyName): string | null {
  for (const suffix of ['', '_V2', '_V3']) {
    const value = process.env[`${name}${suffix}`];
    if (value && value.length >= 8) return value;
  }
  return null;
}

/** Indica si la clave está configurada en el entorno. */
export function hasInternalKey(name: InternalKeyName): boolean {
  return getInternalKey(name) !== null;
}

/** Estado de disponibilidad de todas las claves internas (blindeado). */
export function internalKeysStatus(): Record<string, string | 'unset'> {
  const out: Record<string, string | 'unset'> = {};
  for (const name of KEY_NAMES) {
    const value = getInternalKey(name);
    out[name] = value ? blindKeyLabel(name, value) : 'unset';
  }
  return out;
}

/** Verifica una clave presentada contra la del entorno (tiempo constante). */
export function verifyInternalKey(
  name: InternalKeyName,
  presented: string | null | undefined,
): boolean {
  if (!presented) return false;
  const expected = getInternalKey(name);
  if (!expected) return false; // fail-closed: sin clave configurada, no hay acceso.
  return constantTimeCompare(expected, presented);
}

/**
 * Deriva una subclave determinista a partir de una clave maestra.
 * Útil para firmas de submódulos sin compartir la clave maestra.
 */
export function deriveKey(
  master: string,
  purpose: string,
  lengthBytes = 32,
): Buffer {
  return crypto
    .createHmac('sha256', master)
    .update(purpose)
    .digest()
    .subarray(0, lengthBytes);
}

/** Clave HMAC derivada en hex para el monitor (si existe maestra). */
export function monitorSigningKey(): string | null {
  const isa = getInternalKey('ISA_API_KEY');
  if (!isa) return null;
  return deriveKey(isa, 'rdm:monitor:sign').toString('hex');
}

/** Devuelve el resumen blindado para el encabezado de auditoría. */
export function keyFingerprint(name: InternalKeyName): string | null {
  const value = getInternalKey(name);
  return value ? blindKey(value) : null;
}
