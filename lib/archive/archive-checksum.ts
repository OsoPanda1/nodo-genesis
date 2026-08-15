/* ================================================================== */
/* ARCHIVO HISTÓRICO — Checksum SHA-256                                */
/* ================================================================== */
/* Cálculo y verificación de resúmenes canónicos `sha256:<64 hex>`      */
/* para los objetos del Archivo (mismo formato que stable-digest).     */
/* ================================================================== */

import { createHash } from 'node:crypto';

const PREFIX = 'sha256:';

export function isCanonicalSha256(value: string): boolean {
  return /^sha256:[a-f0-9]{64}$/.test(value);
}

/** Calcula el digest canónico de un Buffer. */
export function sha256Digest(buffer: Buffer): string {
  const hex = createHash('sha256').update(buffer).digest('hex');
  return `${PREFIX}${hex}`;
}

/** Compara un digest contra el de un Buffer en tiempo constante. */
export function verifySha256(buffer: Buffer, expected: string): boolean {
  if (!isCanonicalSha256(expected)) return false;
  const actual = sha256Digest(buffer);
  return expected === actual;
}
