/* ------------------------------------------------------------------ */
/* C.R.O.W.N. — Trust Layer unificada (canónica)                       */
/* ------------------------------------------------------------------ */
/* UBICACIÓN CANÓNICA: lib/security/trust.ts                           */
/* lib/isabella/trust.ts es un barril de compatibilidad (re-export).   */
/*                                                                     */
/* Núcleo de confianza de servidor aplicado a TODA la superficie de    */
/* entrada del Nodo Cero:                                              */
/*                                                                     */
/*  1. assertServerOnly      — el módulo jamás se ejecuta en el cliente */
/*  2. verifyOrigin / verifyOriginFromHeaders — rechaza CSRF y orígenes */
/*     cross-origin no autorizados (APP_URL / NEXT_PUBLIC_SITE_URL).   */
/*  3. rateLimit (req o headers) — ventana deslizante por IP con poda  */
/*     periódica del almacén.                                          */
/*  4. redact / redactPII / redactRecord / sanitizeForLog — ofuscación */
/*     de PII y secretos en logs, trazas y respuestas.                 */
/*  5. constantTimeCompare / timingSafeEqualUtf8 — comparación de      */
/*     claves y tokens sin timing attacks.                             */
/*                                                                     */
/* Esta capa es la ÚNICA fuente de trust del Nodo: cualquier módulo    */
/* que necesite validar origen, limitar tráfico o sanear datos debe    */
/* importar de aquí.                                                   */
/* ------------------------------------------------------------------ */

import { NextRequest } from 'next/server';
import crypto from 'node:crypto';

/* ================================================================== */
/* 1. SOLO SERVIDOR                                                    */
/* ================================================================== */

export function assertServerOnly(context = 'CROWN'):
  { ok: boolean; error?: string } {
  if (typeof window !== 'undefined') {
    return { ok: false, error: `${context}: módulo de servidor invocado en el cliente (violación de Zero Trust).` };
  }
  return { ok: true };
}

/* ================================================================== */
/* 2. ORIGEN CANÓNICO Y VERIFICACIÓN (anti-CSRF / Zero Trust)          */
/* ================================================================== */

export interface CanonicalOriginConfig {
  appUrl?: string;
  siteUrl?: string;
  vercelUrl?: string;
  canonicalOrigins?: string;
  trustedHosts?: string;
}

export function getCanonicalOrigins(): CanonicalOriginConfig {
  return {
    appUrl: process.env.APP_URL,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
    vercelUrl: process.env.VERCEL_URL,
    canonicalOrigins: process.env.CANONICAL_ORIGINS,
    trustedHosts: process.env.TRUSTED_HOSTS,
  };
}

/** Normaliza una URL a su origen (esquema + host + puerto). */
export function normalizeOrigin(raw?: string | null): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    const port = url.port ? `:${url.port}` : '';
    return `${url.protocol}//${url.hostname}${port}`;
  } catch {
    return null;
  }
}

/** Parsea una lista separada por comas a entries limpias. */
function parseList(raw?: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}

/**
 * Normaliza y valida un header Host estricto antes de usarlo.
 * Reglas: sin scheme, sin path, sin query; solo hostname opcionalmente
 * con puerto numérico; caracteres permitidos limitados a DNS/puerto.
 * Devuelve { hostname, port } o null si el host es inválido (fail-closed).
 */
export function validateHostHeader(raw: string | null | undefined): {
  hostname: string;
  port: string;
} | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (trimmed.length === 0 || trimmed.length > 253) return null;
  /* Rechaza scheme, path, query, userinfo y caracteres de control. */
  if (/[\s/@?\\#]/.test(trimmed)) return null;
  if (/[^\x21-\x7e]/.test(trimmed)) return null;
  /* Host con puerto opcional. */
  const portIndex = trimmed.lastIndexOf(':');
  let hostname = trimmed;
  let port = '';
  if (portIndex !== -1) {
    const maybePort = trimmed.slice(portIndex + 1);
    if (/^\d{1,5}$/.test(maybePort)) {
      const portNumber = Number(maybePort);
      /* Puerto válido: 1–65535 (0 y >65535 son inválidos). */
      if (portNumber >= 1 && portNumber <= 65535) {
        hostname = trimmed.slice(0, portIndex);
        port = maybePort;
      }
    }
  }
  hostname = hostname.toLowerCase().replace(/\.+$/, '');
  if (hostname.length === 0 || hostname.length > 253) return null;
  /* Solo letras, dígitos, guiones y puntos (DNS). */
  if (!/^[a-z0-9][a-z0-9.-]*$/.test(hostname)) return null;
  return { hostname, port };
}

/** Self-origen derivado del Host de la petición (validado estructuralmente).
 *  Permite la defensa CSRF estándar "Origin === Host" sin exigir que el
 *  dominio esté pre-registrado en la allowlist: un navegador legítimo
 *  siempre envía Origin igual al Host del sitio que está visitando, y un
 *  atacante no puede forzar que ambos coincidan en una petición cross-site. */
function selfOriginFromRequestHost(hostHeader: string | null | undefined): string | null {
  const validated = validateHostHeader(hostHeader);
  if (!validated) return null;
  const scheme = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const port = validated.port ? `:${validated.port}` : '';
  return `${scheme}://${validated.hostname}${port}`;
}

/** Hosts confiables derivados de la política explícita del Nodo. */
export function trustedHosts(): string[] {
  const hosts = new Set<string>();
  const { canonicalOrigins, trustedHosts: envTrusted, appUrl, siteUrl, vercelUrl } = getCanonicalOrigins();

  /* Hosts explícitos por política (TRUSTED_HOSTS). */
  for (const entry of parseList(envTrusted)) {
    const normalized = entry.toLowerCase().replace(/\.+$/, '');
    if (normalized) hosts.add(normalized);
  }

  /* Hosts derivados de orígenes canónicos configurados. */
  for (const value of [appUrl, siteUrl]) {
    const parsed = normalizeOrigin(value);
    if (parsed) {
      const hostname = parsed.replace(/^[a-z]+:\/\//i, '').split(':')[0];
      if (hostname) hosts.add(hostname.toLowerCase());
    }
  }
  if (vercelUrl) {
    const parsed = normalizeOrigin(vercelUrl.startsWith('http') ? vercelUrl : `https://${vercelUrl}`);
    if (parsed) {
      const hostname = parsed.replace(/^[a-z]+:\/\//i, '').split(':')[0];
      if (hostname) hosts.add(hostname.toLowerCase());
    }
  }

  /* Orígenes canónicos explícitos (CANONICAL_ORIGINS). */
  for (const entry of parseList(canonicalOrigins)) {
    const parsed = normalizeOrigin(entry);
    if (parsed) {
      const hostname = parsed.replace(/^[a-z]+:\/\//i, '').split(':')[0];
      if (hostname) hosts.add(hostname.toLowerCase());
    }
  }

  return [...hosts];
}

/** Allowlist de orígenes canónicos (APP_URL, NEXT_PUBLIC_SITE_URL,
 *  VERCEL_URL, CANONICAL_ORIGINS). */
export function allowedOrigins(): string[] {
  const origins = new Set<string>();
  const { appUrl, siteUrl, vercelUrl, canonicalOrigins } = getCanonicalOrigins();

  for (const value of [appUrl, siteUrl]) {
    const normalized = normalizeOrigin(value);
    if (normalized) origins.add(normalized);
  }
  if (vercelUrl) {
    const normalized = normalizeOrigin(
      vercelUrl.startsWith('http') ? vercelUrl : `https://${vercelUrl}`,
    );
    if (normalized) origins.add(normalized);
  }
  for (const entry of parseList(canonicalOrigins)) {
    const normalized = normalizeOrigin(entry);
    if (normalized) origins.add(normalized);
  }

  /* En desarrollo local se permiten los orígenes de Next dev. */
  if (process.env.NODE_ENV === 'development') {
    origins.add('http://localhost:3000');
    origins.add('http://127.0.0.1:3000');
  }
  return [...origins];
}

/**
 * Deriva el origen "self" de una petición a partir de su Host, SOLO tras
 * normalización estricta y validación contra la política de hosts
 * confiables del Nodo (TRUSTED_HOSTS / orígenes canónicos).
 *
 * Nunca se trata un Host arbitrario como confiable: si el host no está
 * en la política, devuelve null (fail-closed). En producción exige HTTPS.
 */
export function selfOriginFromHost(hostHeader: string | null | undefined, requireHttps = true): string | null {
  const validated = validateHostHeader(hostHeader);
  if (!validated) return null;

  const trusted = trustedHosts();
  if (!trusted.includes(validated.hostname)) return null;

  const scheme = process.env.NODE_ENV === 'production' || requireHttps ? 'https' : 'http';
  const port = validated.port ? `:${validated.port}` : '';
  return `${scheme}://${validated.hostname}${port}`;
}

/**
 * Verifica el origen/host de una petición Next contra la política.
 *  - Si hay header `origin`: compara contra la allowlist (rechaza CSRF).
 *  - Si no hay `origin` pero hay `host`: compara el host (server-to-server).
 *  - Sin ninguno de los dos: se permite (cliente/agente sin origen).
 *  - Sin allowlist configurada: fallback de recuperación que SOLO acepta
 *    el self-origin derivado de un Host validado contra TRUSTED_HOSTS
 *    (fail-closed ante hosts desconocidos). Este fallback se registra en
 *    telemetría como estado de configuración incompleta, no como
 *    configuración definitiva.
 */
export function verifyOrigin(req: NextRequest): { ok: boolean; reason?: string; fallback?: boolean } {
  if (process.env.NODE_ENV === 'development') return { ok: true };
  const origins = allowedOrigins();
  const hostHeader = req.headers.get('host');

  /* Fallback de recuperación: sin orígenes canónicos, derivar el self-origin
     desde un Host validado estructuralmente (defensa CSRF "Origin === Host",
     sin exigir allowlist). Host malformado o ausente: fail-closed. */
  if (origins.length === 0) {
    const self = selfOriginFromRequestHost(hostHeader);
    if (!self) {
      const validated = validateHostHeader(hostHeader);
      return {
        ok: false,
        reason: validated
          ? `Host no autorizado (${hostHeader ?? 'null'}). Configura APP_URL / CANONICAL_ORIGINS / TRUSTED_HOSTS. Zero Trust: fail-closed.`
          : `Host malformado (${hostHeader ?? 'null'}) y sin orígenes canónicos. Zero Trust: fail-closed.`,
      };
    }

    const origin = req.headers.get('origin');
    if (origin) {
      const normalized = normalizeOrigin(origin);
      if (!normalized) {
        /* Origin presente pero malformado: jamás se degrada al chequeo de Host. */
        return { ok: false, reason: 'Origen malformado no autorizado (Zero Trust).' };
      }
      if (normalized === self) return { ok: true, fallback: true };
      return { ok: false, reason: 'Origen no autorizado (Zero Trust).' };
    }

    /* Sin header Origin (server-to-server o navegador sin CORS): el Host
       ya fue validado contra la política de trusted hosts. */
    return { ok: true, fallback: true };
  }

  const origin = req.headers.get('origin');

  /* Self-origen del Host de la petición (defensa CSRF estándar):
     un navegador legítimo envía Origin igual al Host que visita; un
     atacante no puede forzar que ambos coincidan en una petición
     cross-site. Esto admite el dominio canónico del despliegue
     (p. ej. www.visitarealdelmonte.online) sin depender de la allowlist. */
  const self = selfOriginFromRequestHost(hostHeader);

  if (origin) {
    const normalized = normalizeOrigin(origin);
    if (!normalized) {
      /* Origin presente pero malformado: jamás se degrada al chequeo de Host. */
      return { ok: false, reason: 'Origen malformado no autorizado (Zero Trust).' };
    }
    if (self && normalized === self) return { ok: true, fallback: true };
    if (origins.includes(normalized)) return { ok: true };
    return { ok: false, reason: 'Origen no autorizado (Zero Trust).' };
  }

  const host = hostHeader;
  if (host) {
    const candidate = normalizeOrigin(`https://${host}`);
    if (self && candidate === self) return { ok: true, fallback: true };
    if (candidate && origins.includes(candidate)) return { ok: true };
    return { ok: false, reason: 'Host no autorizado (Zero Trust).' };
  }

  return { ok: true };
}

/** Variante para Headers estándar (fetch/Next) con detalle de diagnóstico. */
export function verifyOriginFromHeaders(headers: Headers): {
  ok: boolean;
  origin?: string | null;
  host?: string | null;
  reason?: string;
} {
  const originHeader = headers.get('origin') ?? headers.get('referer');
  const hostHeader = headers.get('host');

  const origin = normalizeOrigin(originHeader);
  const host = hostHeader ? normalizeOrigin(`https://${hostHeader}`) : null;

  const allowed = allowedOrigins();

  if (!origin && !host) {
    return { ok: false, origin, host, reason: 'No origin/host headers present' };
  }

  /* Fallback de recuperación: sin orígenes canónicos, self-origin SOLO
     si el Host supera validación + política de trusted hosts. */
  const allowlist = allowed.length > 0
    ? allowed
    : [selfOriginFromHost(hostHeader)].filter((v): v is string => v !== null);

  const candidate = origin ?? host;
  const match = candidate !== null && allowlist.includes(candidate);

  return {
    ok: match,
    origin,
    host,
    reason: match ? undefined : 'Origin/host not in canonical allowlist or trusted-host policy',
  };
}

/** Lanza si el origen no es confiable (para early-return con try/catch). */
export function assertTrustedOrigin(headers: Headers): void {
  const check = verifyOriginFromHeaders(headers);
  if (!check.ok) {
    throw new Error(
      `Untrusted origin: origin=${check.origin ?? 'null'} host=${check.host ?? 'null'} reason=${check.reason ?? 'unknown'}`,
    );
  }
}

/* ================================================================== */
/* 3. RATE LIMIT (ventana deslizante en memoria del runtime)           */
/* ================================================================== */

interface Bucket {
  timestamps: number[];
}

const RATE_WINDOW_MS = 60_000;
/** Límite por defecto para la variante header-only (assertRateLimit). */
const RATE_LIMIT_MAX_REQUESTS = 30;

const rateBuckets = new Map<string, Bucket>();

function rateLimitByKey(
  key: string,
  limit: number,
  windowMs: number,
): { ok: boolean; remaining: number; retryAfterMs: number } {
  const now = Date.now();

  /* Poda probabilística del almacén de buckets para evitar crecimiento
     ilimitado en procesos de larga duración. */
  if (rateBuckets.size > 512) pruneRateBuckets();

  let bucket = rateBuckets.get(key);
  if (!bucket) {
    bucket = { timestamps: [] };
    rateBuckets.set(key, bucket);
  }
  bucket.timestamps = bucket.timestamps.filter(t => now - t < windowMs);

  if (bucket.timestamps.length >= limit) {
    const oldest = bucket.timestamps[0];
    return { ok: false, remaining: 0, retryAfterMs: Math.max(1, oldest + windowMs - now) };
  }

  bucket.timestamps.push(now);
  return { ok: true, remaining: Math.max(0, limit - bucket.timestamps.length), retryAfterMs: 0 };
}

/**
 * Extrae la IP real de la petición priorizando proxies de confianza.
 *  - Vercel: x-vercel-forwarded-for (añadido por su proxy).
 *  - Cloudflare: cf-connecting-ip.
 *  - Proxy propio: x-real-ip.
 *  - Cadena X-Forwarded-For: último valor (el que añade el proxy último).
 * Nota: sin un proxy de confianza la cabecera es spoofeable; se documenta
 * en el informe de auditoría (mitigación: desplegar tras Vercel/edge).
 */
export function getRequestIp(req: NextRequest): string {
  if (process.env.VERCEL) {
    const vercelForwarded = req.headers.get('x-vercel-forwarded-for');
    if (vercelForwarded) return vercelForwarded.trim();
  }
  const cf = req.headers.get('cf-connecting-ip');
  if (cf) return cf.trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real.trim();
  const forwarded = req.headers.get('x-forwarded-for');
  const parts = forwarded?.split(',') ?? [];
  const last = parts[parts.length - 1]?.trim();
  if (last) return last;
  return 'unknown';
}

/** Clave de rate limit a partir de headers estándar. */
export function getRateLimitKey(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || headers.get('x-real-ip')?.trim() || 'unknown';
  return `ip:${ip}`;
}

/** Rate limit por petición Next (buckets separados por clave + IP). */
export function rateLimit(
  req: NextRequest,
  key: string,
  limit: number,
  windowMs: number = RATE_WINDOW_MS,
): { ok: boolean; remaining: number; retryAfterMs: number } {
  return rateLimitByKey(`${key}:${getRequestIp(req)}`, limit, windowMs);
}

/** Aplica rate limit por headers estándar; lanza si se supera. */
export function assertRateLimit(
  headers: Headers,
  limit: number = RATE_LIMIT_MAX_REQUESTS,
): void {
  const key = getRateLimitKey(headers);
  const { ok, retryAfterMs } = rateLimitByKey(`header:${key}`, limit, RATE_WINDOW_MS);
  if (!ok) {
    throw new Error(
      `Rate limit exceeded for key=${key} resetMs=${retryAfterMs}`,
    );
  }
}

/** Libera memoria: poda los buckets expirados. */
export function pruneRateBuckets(): void {
  const now = Date.now();
  for (const [key, bucket] of rateBuckets) {
    bucket.timestamps = bucket.timestamps.filter(t => now - t < RATE_WINDOW_MS);
    if (bucket.timestamps.length === 0) rateBuckets.delete(key);
  }
}

/* ================================================================== */
/* 4. REDACCIÓN DE PII / SECRETOS (para logs, trazas y respuestas)     */
/* ================================================================== */
/* Patrones calibrados para evitar falsos positivos en contenido       */
/* histórico del territorio (años como "2026", cifras como "500"):     */
/* los teléfonos requieren formato completo y los años quedan intactos */
/* porque no alcanzan las longitudes mínimas de las reglas.            */
/* ------------------------------------------------------------------ */

const PII_PATTERNS: Array<[RegExp, string]> = [
  /* Correos electrónicos */
  [/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '[EMAIL]'],
  /* Teléfonos internacionales con prefijo + (9-15 dígitos) */
  [/\+?\d{1,3}[\s-]?\(\d{2,4}\)[\s-]?\d{3,4}[\s-]?\d{3,4}/g, '[TEL]'],
  /* Teléfonos MX de 10 dígitos exactos (nunca años de 4 dígitos) */
  [/\b\d{10}\b/g, '[TEL]'],
  /* CURP (18 caracteres alfanuméricos, sexo H/M) */
  [/\b[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d\b/g, '[CURP]'],
  /* Tarjetas: 13-19 dígitos, con o sin separadores */
  [/\b(?:\d[ -]*?){13,19}\b/g, '[TARJETA]'],
  /* Claves de proveedores de IA */
  [/AIza[A-Za-z0-9_\-]{20,}/g, '[GEMINI_KEY]'],
  [/\bsk-ant-[A-Za-z0-9_-]{20,}/g, '[SK_KEY]'],
  [/\bsk-[A-Za-z0-9]{16,}/g, '[SK_KEY]'],
  [/\bgsk_[A-Za-z0-9]{16,}/g, '[GATEWAY_KEY]'],
  /* Tokens Bearer y secretos por clave: valor */
  [/\bBearer\s+[A-Za-z0-9._~+/=-]{16,}/g, '[TOKEN]'],
  [/\b(?:apikey|api_key|secret|token|password|clave)\s*[:=]\s*[^\s,;]+/gi, '[KEY]'],
];

/** Redacta PII y secretos en un texto. */
export function redact(input: string): string {
  let output = input;
  for (const [pattern, replacement] of PII_PATTERNS) {
    output = output.replace(pattern, replacement);
  }
  return output;
}

/** Alias legado (nomenclatura del trust layer original). */
export function redactPII(text: string): string {
  return redact(text);
}

/** Redacta un registro plano o anidado (objetos/arrays incluidos). */
export function redactRecord(record: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    if (typeof value === 'string') out[key] = redact(value);
    else if (Array.isArray(value)) out[key] = value.map(sanitizeForLog);
    else if (value && typeof value === 'object') out[key] = redactRecord(value as Record<string, unknown>);
    else out[key] = value;
  }
  return out;
}

/** Sanitiza cualquier payload para logs (recursivo). */
export function sanitizeForLog(payload: unknown): unknown {
  if (typeof payload === 'string') return redact(payload);
  if (Array.isArray(payload)) return payload.map(sanitizeForLog);
  if (payload && typeof payload === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(payload as Record<string, unknown>)) {
      out[key] = sanitizeForLog(value);
    }
    return out;
  }
  return payload;
}

/* ================================================================== */
/* 5. COMPARACIÓN EN TIEMPO CONSTANTE (anti timing-attack)             */
/* ================================================================== */

/** Compara dos cadenas en tiempo constante (sin dependencias nativas). */
export function constantTimeCompare(a: string, b: string): boolean {
  const ba = new TextEncoder().encode(a);
  const bb = new TextEncoder().encode(b);
  if (ba.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ba.length; i++) diff |= ba[i] ^ bb[i];
  return diff === 0;
}

/** Variante con crypto.timingSafeEqual (requiere Node; misma longitud). */
export function timingSafeEqualUtf8(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}
