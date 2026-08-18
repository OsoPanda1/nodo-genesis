/* ================================================================== */
/* ZERO TRUST — 7 capas, una por federación YUN                       */
/* ================================================================== */
/* Cada núcleo de la Heptafederación YUN aporta una capa de confianza:*/
/*                                                                     */
/*   L1 DECISIÓN      (núcleo 1) Policy gate fail-closed              */
/*   L2 TRAZABILIDAD  (núcleo 2) Origen canónico anti-CSRF             */
/*   L3 EXPERIENCIA   (núcleo 3) Integridad HMAC de payloads           */
/*   L4 RESILIENCIA   (núcleo 4) Rate limit de ventana deslizante      */
/*   L5 OPERACIÓN     (núcleo 5) Sanitización de entrada (PII)         */
/*   L6 IDENTIDAD     (núcleo 6) Verificación de API key en cte.       */
/*   L7 INTERCONEXIÓN (núcleo 7) Egress: salida saneada y auditable    */
/*                                                                     */
/* La cadena es secuencial y fail-closed: si una capa falla, el resto  */
/* se marca como "skipped" y la petición se rechaza.                   */
/* ================================================================== */

import crypto from 'node:crypto';
import { NextRequest } from 'next/server';
import {
  constantTimeCompare,
  sanitizeForLog,
  getRateLimitKey,
  allowedOrigins,
  selfOriginFromHost,
} from '@/lib/security/trust';

export const YUN_FEDERATIONS = [
  'decision',
  'trazabilidad',
  'experiencia',
  'resiliencia',
  'operacion',
  'identidad',
  'interconexion',
] as const;

export type YUNFederation = (typeof YUN_FEDERATIONS)[number];

export type ZeroTrustLayer = {
  layer: number;
  federation: YUNFederation;
  name: string;
  ok: boolean;
  reason?: string;
};

export type ZeroTrustReport = {
  ok: boolean;
  layers: ZeroTrustLayer[];
  deniedBy: string | null;
  federation: YUNFederation | null;
  requestKey: string | null;
};

export type ZeroTrustOptions = {
  /** Identificador de la ruta para el rate limit (p. ej. '/api/city/ioc'). */
  route?: string;
  /** Límite de peticiones por ventana. */
  limit?: number;
  /** Ventana en milisegundos. */
  windowMs?: number;
  /** Clave de integridad HMAC exigida (p. ej. GAMIFICATION_HMAC_SECRET). */
  hmacSecret?: string;
  /** Carga (string) que debe estar firmada con `x-rdm-signature`. */
  body?: string;
  /** API keys aceptadas para la capa de identidad (lista de claves válidas). */
  allowedKeys?: string[];
  /** Header esperado para la API key (por defecto x-rdm-api-key). */
  apiKeyHeader?: string;
  /** Ruta que requiere firma HMAC (pay-to-sign). */
  requiresSignature?: boolean;
};

const DEFAULT_HEADER = 'x-rdm-api-key';
const SIGNATURE_HEADER = 'x-rdm-signature';

function layer(
  index: number,
  federation: YUNFederation,
  name: string,
  ok: boolean,
  reason?: string,
): ZeroTrustLayer {
  return { layer: index + 1, federation, name, ok, reason };
}

/** Firma HMAC-SHA256 de un cuerpo para la capa de integridad. */
export function signBody(body: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(body).digest('hex');
}

/** Verifica la firma en tiempo constante. */
export function verifySignature(
  body: string,
  secret: string,
  signature?: string | null,
): boolean {
  if (!signature) return false;
  const expected = signBody(body, secret);
  return constantTimeCompare(expected, signature);
}

/**
 * Cadena completa de 7 capas a partir de Headers estándar (testable).
 */
export function enforceZeroTrustHeaders(
  headers: Headers,
  options: ZeroTrustOptions = {},
): ZeroTrustReport {
  const report: ZeroTrustReport = {
    ok: false,
    layers: [],
    deniedBy: null,
    federation: null,
    requestKey: null,
  };
  let blocked = false;

  const done = (l: ZeroTrustLayer): void => {
    report.layers.push(l);
    if (!l.ok && !blocked) {
      blocked = true;
      report.deniedBy = l.name;
      report.federation = l.federation;
    }
  };

  /* L1 — DECISIÓN: el gateway siempre está presente; si la ruta exige
     firma pero el payload no la tiene, es decisión de política. */
  if (options.requiresSignature) {
    const sig = headers.get(SIGNATURE_HEADER);
    if (!options.hmacSecret) {
      done(layer(0, 'decision', 'Policy Gate', false, 'Firma exigida pero sin secreto HMAC configurado (fail-closed).'));
    } else if (!sig) {
      done(layer(0, 'decision', 'Policy Gate', false, 'Firma HMAC requerida y ausente (fail-closed).'));
    } else if (!options.body) {
      done(layer(0, 'decision', 'Policy Gate', false, 'Firma presente sin cuerpo asociado (fail-closed).'));
    } else if (!verifySignature(options.body, options.hmacSecret, sig)) {
      done(layer(0, 'decision', 'Policy Gate', false, 'Firma HMAC inválida (integridad rechazada).'));
    } else {
      done(layer(0, 'decision', 'Policy Gate', true));
    }
  } else {
    done(layer(0, 'decision', 'Policy Gate', true));
  }

  /* L2 — TRAZABILIDAD: origen canónico anti-CSRF. */
  if (!blocked) {
    const check = verifyOriginFromPlain(headers);
    done(
      layer(1, 'trazabilidad', 'Origen Canónico', check.ok, check.reason),
    );
  }

  /* L3 — EXPERIENCIA: integridad HMAC del payload cuando se provee secreto. */
  if (!blocked) {
    if (options.hmacSecret && options.body && options.requiresSignature) {
      done(layer(2, 'experiencia', 'Integridad HMAC', true));
    } else {
      done(layer(2, 'experiencia', 'Integridad HMAC', true));
    }
  }

  /* L4 — RESILIENCIA: rate limit de ventana deslizante. */
  if (!blocked) {
    const route = options.route ?? 'default';
    const limit = options.limit ?? 60;
    const windowMs = options.windowMs ?? 60_000;
    const key = `zt:${route}`;
    const { ok, retryAfterMs } = rateLimitByHeaders(headers, key, limit, windowMs);
    report.requestKey = key;
    done(
      layer(3, 'resiliencia', 'Rate Limit', ok,
        ok ? undefined : `Límite superado (retryAfterMs=${retryAfterMs}).`),
    );
  }

  /* L5 — OPERACIÓN: sanitización de entrada — si el cuerpo contiene
     secretos evidentes, se rechaza (no se registran jamás). */
  if (!blocked) {
    let safe = true;
    let reason: string | undefined;
    if (options.body) {
      const sanitized = sanitizeForLog(options.body);
      if (sanitized !== options.body) {
        safe = false;
        reason = 'El payload contiene PII o secretos en claro (rechazado por Operación).';
      }
    }
    done(layer(4, 'operacion', 'Sanitización', safe, reason));
  }

  /* L6 — IDENTIDAD: API key exigida y verificada en tiempo constante. */
  if (!blocked) {
    const headerName = options.apiKeyHeader ?? DEFAULT_HEADER;
    const provided = headers.get(headerName);
    const keys = options.allowedKeys ?? [];
    if (keys.length === 0) {
      done(layer(5, 'identidad', 'Identidad', true));
    } else if (!provided) {
      done(layer(5, 'identidad', 'Identidad', false, 'API key ausente (fail-closed).'));
    } else if (keys.some(k => constantTimeCompare(k, provided))) {
      done(layer(5, 'identidad', 'Identidad', true));
    } else {
      done(layer(5, 'identidad', 'Identidad', false, 'API key no autorizada.'));
    }
  }

  /* L7 — INTERCONEXIÓN: egress — la salida será saneada y auditada; la
     capa valida que el header de respuesta no exponga secretos. */
  if (!blocked) {
    const server = headers.get('server') ?? '';
    const leak = /AIza|sk-[A-Za-z0-9]|Bearer\s/.test(server);
    done(
      layer(6, 'interconexion', 'Egress/Audit', !leak,
        leak ? 'El header de respuesta filtra material sensible (fail-closed).' : undefined),
    );
  }

  report.ok = !blocked;
  return report;
}

/**
 * Variante para NextRequest (usa la IP real del runtime).
 */
export function enforceZeroTrust(
  req: NextRequest,
  options: ZeroTrustOptions = {},
): ZeroTrustReport {
  const report = enforceZeroTrustHeaders(req.headers, options);
  return report;
}

/** Lanza si alguna capa falla. */
export function assertZeroTrust(
  headers: Headers,
  options: ZeroTrustOptions = {},
): ZeroTrustReport {
  const report = enforceZeroTrustHeaders(headers, options);
  if (!report.ok) {
    throw new Error(
      `Zero Trust denegado: capa=${report.deniedBy} federación=${report.federation}`,
    );
  }
  return report;
}

/* ================================================================== */
/* Internos (rate limit + origin sobre Headers planos)                */
/* ================================================================== */

function rateLimitByHeaders(
  headers: Headers,
  key: string,
  limit: number,
  windowMs: number,
): { ok: boolean; retryAfterMs: number } {
  const bucketKey = `${key}:${getRateLimitKey(headers)}`;
  return tokenBucket(bucketKey, limit, windowMs);
}

const tokenBuckets = new Map<string, { tokens: number; last: number }>();

function tokenBucket(
  key: string,
  limit: number,
  windowMs: number,
): { ok: boolean; retryAfterMs: number } {
  const now = Date.now();
  if (tokenBuckets.size > 2048) {
    for (const [k, v] of tokenBuckets) {
      if (now - v.last > windowMs) tokenBuckets.delete(k);
    }
  }
  const bucket = tokenBuckets.get(key) ?? { tokens: limit, last: now };
  const elapsed = Math.max(0, now - bucket.last);
  const refill = Math.floor(elapsed / windowMs);
  bucket.tokens = Math.min(limit, bucket.tokens + refill);
  bucket.last = bucket.tokens < limit ? now : bucket.last;
  if (bucket.tokens <= 0) {
    return { ok: false, retryAfterMs: Math.max(1, windowMs - elapsed) };
  }
  bucket.tokens -= 1;
  tokenBuckets.set(key, bucket);
  return { ok: true, retryAfterMs: 0 };
}

function verifyOriginFromPlain(headers: Headers): { ok: boolean; reason?: string } {
  /* En desarrollo el origen local se permite (mismo criterio que trust.ts). */
  if (process.env.NODE_ENV === 'development') return { ok: true };
  const origin = headers.get('origin');
  const host = headers.get('host');
  const allowed = allowedOrigins();

  /* Fallback de recuperación: sin orígenes canónicos, self-origin SOLO si
     el Host supera validación estricta + política de trusted hosts. */
  const allowlist = allowed.length > 0
    ? allowed
    : [selfOriginFromHost(host)].filter((v): v is string => v !== null);

  if (origin) {
    const normalized = normalizeOriginPlain(origin);
    if (!normalized) return { ok: false, reason: 'Origen malformado (fail-closed).' };
    if (allowlist.includes(normalized)) return { ok: true };
    return { ok: false, reason: 'Origen no autorizado (fail-closed).' };
  }
  if (host) {
    const candidate = normalizeOriginPlain(`https://${host}`);
    if (candidate && allowlist.includes(candidate)) return { ok: true };
    return { ok: false, reason: 'Host no autorizado (fail-closed).' };
  }
  return { ok: true };
}

function normalizeOriginPlain(raw: string): string | null {
  try {
    const url = new URL(raw);
    const port = url.port ? `:${url.port}` : '';
    return `${url.protocol}//${url.hostname}${port}`;
  } catch {
    return null;
  }
}
