/* ================================================================== */
/* GAMIFICATION YUN — World Runtime · Integridad de manifiestos       */
/* ================================================================== */
/* Hash SHA-256 sobre el manifiesto sin el bloque integrity (JCS-like */
/* vía stableJson). Los manifiestos publicados son inmutables.        */
/* ================================================================== */

import { sha256, stableJson } from '@/lib/continuity/hash-chain';
import type { WorldManifest, WorldManifestHashInput } from './contracts';
import { WorldError } from './world-errors';

/** Calcula el payloadHash canónico de un manifiesto (sin integrity). */
export function hashWorldManifest(input: WorldManifestHashInput): string {
  return sha256(stableJson(input));
}

/** Adjunta el bloque integrity a un manifiesto ya validado. */
export function sealWorldManifest(
  input: WorldManifestHashInput,
  journalEntryId: string | null = null,
): WorldManifest {
  const payloadHash = hashWorldManifest(input);
  return {
    ...input,
    integrity: {
      canonicalization: 'JCS-RFC8785',
      hashAlgorithm: 'SHA-256',
      payloadHash,
      journalEntryId,
    },
  };
}

/** Verifica que el hash del manifiesto coincida con el contenido. */
export function verifyWorldManifestIntegrity(manifest: WorldManifest): void {
  const { integrity, ...rest } = manifest;
  const expected = hashWorldManifest(rest as WorldManifestHashInput);
  if (integrity.payloadHash !== expected) {
    throw new WorldError({
      code: 'MANIFEST_INTEGRITY_FAILED',
      httpStatus: 409,
      clientMessage: 'El manifiesto no supera la verificación de integridad.',
      reason: `payloadHash esperado ${expected}, recibido ${integrity.payloadHash}`,
    });
  }
  if (integrity.hashAlgorithm !== 'SHA-256' || integrity.canonicalization !== 'JCS-RFC8785') {
    throw new WorldError({
      code: 'MANIFEST_INTEGRITY_FAILED',
      httpStatus: 409,
      clientMessage: 'Algoritmo de integridad no soportado.',
      reason: 'canonicalization/hashAlgorithm no canónicos',
    });
  }
}
