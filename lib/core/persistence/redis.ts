/* ================================================================== */
/* PERSISTENCIA — Cliente Redis (Upstash)                              */
/* ================================================================== */
/* Capa de baja latencia para: cache distribuida entre instancias,     */
/* leaderboards en tiempo real (sorted sets), rate-limiting, locks y    */
/* sesiones efímeras. Nunca es la fuente de verdad: Postgres lo es.     */
/*                                                                     */
/* Degradación limpia: si no hay credenciales Upstash, `getRedis()`     */
/* devuelve null y los consumidores caen a memoria/Postgres.           */
/* ================================================================== */

import 'server-only';
import { Redis } from '@upstash/redis';

const g = globalThis as unknown as { __rdmRedis?: Redis | null };

function resolveCreds(): { url: string; token: string } | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.KV_REST_API_URL ||
    process.env.REDIS_REST_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.KV_REST_API_TOKEN ||
    process.env.REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return { url, token };
}

/** Cliente Redis compartido. `null` si Upstash no está configurado. */
export function getRedis(): Redis | null {
  if (g.__rdmRedis !== undefined) return g.__rdmRedis;
  const creds = resolveCreds();
  g.__rdmRedis = creds ? new Redis({ url: creds.url, token: creds.token }) : null;
  return g.__rdmRedis;
}

export function isRedisConfigured(): boolean {
  return resolveCreds() !== null;
}

/** Prefijo de namespace del Nodo para evitar colisiones de claves. */
export const REDIS_NS = 'rdm:nodo-cero';

export function nsKey(...parts: Array<string | number>): string {
  return [REDIS_NS, ...parts].join(':');
}

/** Ping ligero para el health-check. No lanza. */
export async function pingRedis(): Promise<{ ok: boolean; latencyMs: number | null; error?: string }> {
  const redis = getRedis();
  if (!redis) return { ok: false, latencyMs: null, error: 'not_configured' };
  const started = Date.now();
  try {
    await redis.ping();
    return { ok: true, latencyMs: Date.now() - started };
  } catch (error) {
    return { ok: false, latencyMs: null, error: error instanceof Error ? error.message : 'unknown' };
  }
}
