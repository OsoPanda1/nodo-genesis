/* ================================================================== */
/* RENDER ENGINE — Digest estable para escenas y perfiles              */
/* ================================================================== */
/* Deriva un identificador sha256 canónico (claves ordenadas) para     */
/* escenas 3D/4D y perfiles visuales. El digest ata el perfil visual   */
/* al manifiesto de la escena: cambia la escena, cambia el digest.     */
/* ================================================================== */

import crypto from 'node:crypto';
import { stableJson } from '@/lib/continuity/hash-chain';

/** Devuelve `sha256:<64 hex>` sobre la serialización canónica del valor. */
export async function stableDigest(value: unknown): Promise<string> {
  const hash = crypto.createHash('sha256').update(stableJson(value)).digest('hex');
  return `sha256:${hash}`;
}
