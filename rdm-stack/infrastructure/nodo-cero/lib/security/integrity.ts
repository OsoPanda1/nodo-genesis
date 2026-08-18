/* ================================================================== */
/* INTEGRITY — Manifiesto de integridad del build (licenciamiento)    */
/* ================================================================== */
/* Sello de versión del Nodo Cero firmado con HMAC-SHA256.            */
/* Permite a un operador/licenciatario verificar que el artefacto     */
/* desplegado corresponde a una versión autorizada e íntegra.         */
/*                                                                     */
/*  - buildSeal() genera un sello a partir de: versión de la app,     */
/*    commit (si está disponible), NODE_ENV y marca de tiempo.         */
/*  - verifyBuildSeal(seal) valida el sello en tiempo constante.       */
/*  - El secreto vive SOLO en env (BUILD_SEAL_KEY). Sin secreto, el    */
/*    nodo opera en modo 'open' (demo) sin sello criptográfico.        */
/* ================================================================== */

import crypto from 'node:crypto';
import { constantTimeCompare } from '@/lib/security/trust';

export interface BuildSeal {
  sealed: boolean;
  version: string;
  commit?: string;
  environment: string;
  issuedAt: string;
  signature?: string;
}

export function getSealKey(): string | null {
  const key = process.env.BUILD_SEAL_KEY;
  return key && key.length > 0 ? key : null;
}

function readCommit(): string | undefined {
  try {
    /* Commit embebido en build (Vercel / CI). Si no existe, no hay sello. */
    return process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? undefined;
  } catch {
    return undefined;
  }
}

function canonical(seal: Omit<BuildSeal, 'sealed' | 'signature'>): string {
  return JSON.stringify({
    version: seal.version,
    commit: seal.commit ?? '',
    environment: seal.environment,
    issuedAt: seal.issuedAt,
  });
}

/** Genera el sello de integridad del build desplegado. */
export function buildSeal(): BuildSeal {
  const version = process.env.npm_package_version ?? '0.0.0';
  const environment = process.env.NODE_ENV ?? 'development';
  const issuedAt = new Date().toISOString();
  const key = getSealKey();

  const base: Omit<BuildSeal, 'sealed' | 'signature'> = {
    version,
    commit: readCommit(),
    environment,
    issuedAt,
  };

  if (!key) {
    return { ...base, sealed: false };
  }

  const signature = crypto.createHmac('sha256', key).update(canonical(base)).digest('hex');
  return { ...base, sealed: true, signature };
}

/** Verifica un sello en tiempo constante. Fail-closed ante ausencia de clave. */
export function verifyBuildSeal(seal: BuildSeal | null | undefined): {
  ok: boolean;
  reason?: string;
} {
  if (!seal) return { ok: false, reason: 'sello ausente' };
  if (!seal.sealed) return { ok: false, reason: 'sello no criptográfico (modo open)' };

  const key = getSealKey();
  if (!key) return { ok: false, reason: 'BUILD_SEAL_KEY no configurada (fail-closed)' };
  if (!seal.signature) return { ok: false, reason: 'firma ausente' };

  const expected = crypto
    .createHmac('sha256', key)
    .update(canonical({ version: seal.version, commit: seal.commit, environment: seal.environment, issuedAt: seal.issuedAt }))
    .digest('hex');

  if (!constantTimeCompare(expected, seal.signature)) {
    return { ok: false, reason: 'firma no coincide' };
  }
  return { ok: true };
}

/** Estado agregado para el monitor / licenciamiento. */
export function buildIntegrityStatus(): {
  ok: boolean;
  seal: BuildSeal;
} {
  const seal = buildSeal();
  return { ok: seal.sealed, seal };
}
