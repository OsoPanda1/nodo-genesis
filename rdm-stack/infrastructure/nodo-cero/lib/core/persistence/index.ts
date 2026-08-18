/* ================================================================== */
/* PERSISTENCIA — Barrel + health agregada                             */
/* ================================================================== */
/* Punto único de importación para la capa durable del Nodo.           */
/* ================================================================== */

import 'server-only';
import {
  isPostgresConfigured,
  pingPostgres,
  primaryProvider,
  replicaProvider,
} from './postgres';
import { isRedisConfigured, pingRedis } from './redis';
import { writeBehindStats } from './write-behind';
import { neonBudgetStatus } from './neon-budget';

export * from './postgres';
export * from './redis';
export * from './write-behind';
export * from './neon-budget';

export interface PersistenceHealth {
  mode: 'durable' | 'demo';
  postgres: {
    configured: boolean;
    primary: string | null;
    replica: string | null;
    ok: boolean;
    latencyMs: number | null;
    error?: string;
  };
  neonBudget: ReturnType<typeof neonBudgetStatus>;
  redis: {
    configured: boolean;
    ok: boolean;
    latencyMs: number | null;
    error?: string;
  };
  writeBehind: ReturnType<typeof writeBehindStats>;
}

/** Estado consolidado de la capa de persistencia (no lanza). */
export async function persistenceHealth(): Promise<PersistenceHealth> {
  const [pg, redis] = await Promise.all([pingPostgres(), pingRedis()]);
  const pgConfigured = isPostgresConfigured();
  const redisConfigured = isRedisConfigured();
  return {
    mode: pgConfigured ? 'durable' : 'demo',
    postgres: {
      configured: pgConfigured,
      primary: primaryProvider(),
      replica: replicaProvider(),
      ok: pg.ok,
      latencyMs: pg.latencyMs,
      error: pg.error,
    },
    neonBudget: neonBudgetStatus(),
    redis: {
      configured: redisConfigured,
      ok: redis.ok,
      latencyMs: redis.latencyMs,
      error: redis.error,
    },
    writeBehind: writeBehindStats(),
  };
}
