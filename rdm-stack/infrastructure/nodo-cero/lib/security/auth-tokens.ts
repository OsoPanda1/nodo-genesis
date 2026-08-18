/* ------------------------------------------------------------------ */
/* SECURITY YUN — Tokens de sesión firmados (HMAC-SHA256)              */
/* ------------------------------------------------------------------ */
/* Cada sesión de juego recibe un token firmado con GAMIFICATION_HMAC_ */
/* SECRET. El backend verifica integridad (tiempo constante) antes de  */
/* aceptar cualquier evento. Sin secreto configurado el Nodo opera en  */
/* modo 'open' (demo): se validan estructura, caducidad y vínculo      */
/* deviceId↔sesión, pero sin integridad criptográfica.                 */
/* ------------------------------------------------------------------ */

import crypto from 'node:crypto';
import { constantTimeCompare } from '@/lib/security/trust';

const TOKEN_TTL_MS = 6 * 60 * 60 * 1000;

export function getHmacSecret(): string | null {
  const secret = process.env.GAMIFICATION_HMAC_SECRET;
  return secret && secret.length > 0 ? secret : null;
}

interface TokenPayload {
  sessionId: string;
  deviceId: string;
  actorId: string;
  iat: number;
  exp: number;
}

function encodeBase64Url(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function decodeBase64Url(value: string): string | null {
  try {
    return Buffer.from(value, 'base64url').toString('utf8');
  } catch {
    return null;
  }
}

function canonical(payload: TokenPayload): string {
  return JSON.stringify({
    sessionId: payload.sessionId,
    deviceId: payload.deviceId,
    actorId: payload.actorId,
    iat: payload.iat,
    exp: payload.exp,
  });
}

function hmac(payload: TokenPayload, secret: string): string {
  return crypto.createHmac('sha256', secret).update(canonical(payload)).digest('base64url');
}

export function signSessionToken(input: {
  sessionId: string;
  deviceId: string;
  actorId: string;
}): { token: string; mode: 'signed' | 'open' } {
  const secret = getHmacSecret();
  if (!secret && process.env.NODE_ENV === 'production') {
    /* Fail-closed: en producción jamás se emiten tokens sin integridad criptográfica. */
    throw new Error('GAMIFICATION_HMAC_SECRET no está definida: los tokens de sesión exigen firma en producción.');
  }
  const now = Date.now();
  const payload: TokenPayload = {
    sessionId: input.sessionId,
    deviceId: input.deviceId,
    actorId: input.actorId,
    iat: now,
    exp: now + TOKEN_TTL_MS,
  };

  const body = encodeBase64Url(canonical(payload));
  if (!secret) {
    return { token: `${body}.`, mode: 'open' };
  }
  return { token: `${body}.${hmac(payload, secret)}`, mode: 'signed' };
}

export function verifySessionToken(
  token: string | null | undefined,
  expectedSessionId?: string,
  expectedDeviceId?: string,
): { ok: boolean; payload?: TokenPayload; reason?: string } {
  if (!token || !token.includes('.')) {
    return { ok: false, reason: 'token ausente o malformado' };
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return { ok: false, reason: 'token con segmentos extra' };
  }
  const [body, signature] = parts;
  const decoded = decodeBase64Url(body);
  if (!decoded) return { ok: false, reason: 'payload de token inválido' };

  let payload: TokenPayload;
  try {
    payload = JSON.parse(decoded) as TokenPayload;
  } catch {
    return { ok: false, reason: 'payload de token corrupto' };
  }

  if (!payload.sessionId || !payload.deviceId || !payload.exp) {
    return { ok: false, reason: 'campos de token incompletos' };
  }

  if (Date.now() > payload.exp) {
    return { ok: false, reason: 'token caducado' };
  }

  if (expectedSessionId && payload.sessionId !== expectedSessionId) {
    return { ok: false, reason: 'token no corresponde a la sesión' };
  }

  if (expectedDeviceId && payload.deviceId !== expectedDeviceId) {
    return { ok: false, reason: 'token no corresponde al dispositivo' };
  }

  const secret = getHmacSecret();
  if (!secret && process.env.NODE_ENV === 'production') {
    /* Fail-closed: sin secreto en producción no hay integridad que verificar. */
    return { ok: false, reason: 'verificación criptográfica no disponible' };
  }
  if (secret) {
    if (!signature) return { ok: false, reason: 'token sin firma' };
    const expected = hmac(payload, secret);
    if (!constantTimeCompare(expected, signature)) {
      return { ok: false, reason: 'firma inválida' };
    }
  }

  return { ok: true, payload };
}
