/* ================================================================== */
/* ARCHIVO HISTÓRICO — Acceso a Supabase Storage                       */
/* ================================================================== */
/* Genera URLs firmadas de corta duración para subir originales y      */
/* descargar derivados aprobados. Cuando no hay credenciales de        */
/* Supabase (modo demo), produce URLs firmadas con HMAC local que      */
/* resuelve el runtime sin red. El original jamás se expone público.   */
/* ================================================================== */

import { createHmac } from 'node:crypto';
import { getEnv } from '@/lib/core/env';
import type { ArchiveBucket } from './archive-types';

const MAX_UPLOAD_BYTES = 52_428_800;

function demoSecret(): string {
  return getEnv().GAMIFICATION_HMAC_SECRET || 'archive-demo-secret';
}

function sign(payload: string): string {
  return createHmac('sha256', demoSecret()).update(payload).digest('hex').slice(0, 24);
}

/** Ruta de objeto para un archivo dentro de un bucket. */
export function buildObjectPath(
  bucket: ArchiveBucket,
  itemId: string,
  fileName: string,
): string {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase();
  return `${bucket}/${itemId}/${Date.now().toString(36)}-${safeName}`;
}

function fileNameFromPath(path: string): string {
  return path.split('/').pop() ?? 'archivo';
}

/** URL firmada de subida. En Supabase se delegaría en el endpoint
 *  /object/upload/sign de Storage; en demo firma un path local. */
export async function createSignedUploadUrl(input: {
  bucket: ArchiveBucket;
  objectPath: string;
  mimeType: string;
  byteSize: number;
}): Promise<{ ok: true; url: string; expiresAt: number } | { ok: false; reason: string }> {
  if (input.byteSize > MAX_UPLOAD_BYTES) {
    return { ok: false, reason: `El archivo supera el límite de ${MAX_UPLOAD_BYTES} bytes.` };
  }
  const expiresAt = Date.now() + 60 * 60 * 1000;
  const payload = `${input.bucket}|${input.objectPath}|${input.mimeType}|${expiresAt}`;
  const sig = sign(payload);
  const url = `/api/archive/demo-upload?bucket=${encodeURIComponent(input.bucket)}&path=${encodeURIComponent(input.objectPath)}&expires=${expiresAt}&sig=${sig}`;
  return { ok: true, url, expiresAt };
}

/** URL firmada de descarga para un derivado público. Solo resuelve si
 *  el archivo está marcado como público en el catálogo (verificación
 *  adicional en la ruta). */
export async function createSignedDownloadUrl(input: {
  bucket: ArchiveBucket;
  objectPath: string;
  mimeType: string;
  expiresInSeconds?: number;
}): Promise<{ ok: true; url: string; expiresAt: number }> {
  const ttl = input.expiresInSeconds ?? 300;
  const expiresAt = Date.now() + ttl * 1000;
  const payload = `${input.bucket}|${input.objectPath}|${expiresAt}`;
  const sig = sign(payload);
  const name = fileNameFromPath(input.objectPath);
  const url = `/api/archive/demo-file?bucket=${encodeURIComponent(input.bucket)}&path=${encodeURIComponent(input.objectPath)}&expires=${expiresAt}&sig=${sig}&name=${encodeURIComponent(name)}`;
  return { ok: true, url, expiresAt };
}

/** Verifica una URL firmada demo (antigüedad + firma HMAC). */
export function verifyDemoSignature(
  params: { bucket?: string; path?: string; expires?: string; sig?: string },
): boolean {
  if (!params.bucket || !params.path || !params.expires || !params.sig) return false;
  const expires = Number(params.expires);
  if (!Number.isFinite(expires) || expires < Date.now()) return false;
  const payload = `${params.bucket}|${params.path}|${expires}`;
  const expected = sign(payload);
  const a = Buffer.from(params.sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a[i] ^ b[i];
  return diff === 0;
}
