/* ================================================================== */
/* PERSISTENCIA — Cliente Postgres unificado (Supabase + Neon)         */
/* ================================================================== */
/* Adaptador de persistencia que resuelve la petición explícita de los */
/* stores: "conectar Supabase/Postgres en un adaptador sin tocar el    */
/* resto de la capa".                                                  */
/*                                                                     */
/* - PRIMARIO (escrituras + lecturas): Supabase Postgres.              */
/* - RÉPLICA (lecturas opcionales): Neon Postgres.                     */
/* Ambos hablan el mismo protocolo, así que un solo driver (postgres.js)*/
/* sirve para los dos. Si no hay ninguna URL configurada, el sistema   */
/* sigue operando en modo demo (fail-open) usando solo memoria.        */
/* ================================================================== */

import 'server-only';
import postgres, { type Sql } from 'postgres';
import {
  canPingNeon,
  isNeonBudgetExhausted,
  markNeonPing,
  trackComputeActivity,
} from './neon-budget';

export type PostgresProvider = 'supabase' | 'neon' | 'generic';

interface ResolvedConnection {
  url: string;
  provider: PostgresProvider;
}

const NEON_DEFAULT_DB = 'neondb';
const NEON_DEFAULT_PORT = '5432';

/* ------------------------------------------------------------------ */
/* Resolución de conexiones (integración Neon de Vercel)               */
/* ------------------------------------------------------------------ */
/* Neon en Vercel inyecta: POSTGRES_PRISMA_URL / DATABASE_URL (pooled),*/
/* DATABASE_URL_UNPOOLED (directa), y componentes PGHOST /            */
/* PGHOST_UNPOOLED / PGUSER / POSTGRES_PASSWORD / PGDATABASE / PGPORT. */
/* Prioridad: URL completa (pooled) → URL completa (unpooled) →        */
/* componentes reconstruidos. El pooler de Neon acepta hasta 10,000    */
/* conexiones cliente; la computa free soporta ~104, así que el pool    */
/* se mantiene deliberadamente pequeño (max bajo).                     */
/* ------------------------------------------------------------------ */

function buildNeonUrl(unpooled: boolean): string | null {
  const host = unpooled ? process.env.PGHOST_UNPOOLED : process.env.PGHOST;
  const user = process.env.PGUSER;
  const password = process.env.POSTGRES_PASSWORD;
  if (!host || !user || !password) return null;
  const database = process.env.PGDATABASE || NEON_DEFAULT_DB;
  const port = process.env.PGPORT || NEON_DEFAULT_PORT;
  return `postgres://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
}

function neonPooledUrl(): string | null {
  return (
    process.env.POSTGRES_PRISMA_URL ||
    process.env.DATABASE_URL ||
    buildNeonUrl(false)
  );
}

function neonUnpooledUrl(): string | null {
  return (
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.NEON_POSTGRES_URL_NON_POOLING ||
    buildNeonUrl(true)
  );
}

/** Resuelve la URL primaria (Supabase) con prioridad y degradación limpia. */
function resolvePrimary(): ResolvedConnection | null {
  const supabase =
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING;
  if (supabase) return { url: supabase, provider: 'supabase' };

  const neon =
    process.env.NEON_DATABASE_URL ||
    process.env.NEON_POSTGRES_URL ||
    process.env.NEON_POSTGRES_PRISMA_URL ||
    neonPooledUrl();
  if (neon) return { url: neon, provider: 'neon' };

  const generic = process.env.DATABASE_URL;
  if (generic) return { url: generic, provider: 'generic' };

  return null;
}

/** Resuelve la URL de la réplica de lectura (Neon). Solo si difiere del
 *  primario, para no abrir dos pools idénticos. */
function resolveReplica(primary: ResolvedConnection | null): ResolvedConnection | null {
  const neon =
    process.env.NEON_DATABASE_URL ||
    process.env.NEON_POSTGRES_URL ||
    process.env.NEON_POSTGRES_URL_NON_POOLING ||
    neonUnpooledUrl();
  if (!neon) return null;
  if (primary && primary.url === neon) return null;
  return { url: neon, provider: 'neon' };
}

interface PgSingleton {
  primary?: Sql | null;
  replica?: Sql | null;
  primaryMeta?: ResolvedConnection | null;
  replicaMeta?: ResolvedConnection | null;
}

/* Sobrevive a HMR en dev: un único pool por proceso. */
const g = globalThis as unknown as { __rdmPgPool?: PgSingleton };

function pool(): PgSingleton {
  if (!g.__rdmPgPool) g.__rdmPgPool = {};
  return g.__rdmPgPool;
}

function createClient(conn: ResolvedConnection): Sql {
  /* prepare:false → compatible con pgbouncer en modo transacción (Supabase
   *  pooler / Neon pooler). max bajo por el modelo serverless y por el plan
   *  Free de Neon (la computa free acepta ~104 conexiones directas). */
  const isNeon = conn.provider === 'neon';
  return postgres(conn.url, {
    prepare: false,
    max: isNeon ? 2 : 3,
    idle_timeout: isNeon ? 10 : 20,
    connect_timeout: 10,
    ssl: 'require',
    onnotice: () => {},
  });
}

/** Cliente Postgres primario (Supabase). `null` si no hay DB configurada. */
export function getPrimary(): Sql | null {
  const p = pool();
  if (p.primary !== undefined) return p.primary;
  const meta = resolvePrimary();
  p.primaryMeta = meta;
  p.primary = meta ? createClient(meta) : null;
  return p.primary;
}

/** Cliente de réplica de lectura (Neon). Cae al primario si no existe. */
export function getReplica(): Sql | null {
  const p = pool();
  if (p.replica !== undefined) return p.replica;
  const meta = resolveReplica(resolvePrimary());
  p.replicaMeta = meta;
  p.replica = meta ? createClient(meta) : null;
  return p.replica ?? getPrimary();
}

/** `sql` primario para escrituras y lecturas por defecto. */
export function sql(): Sql {
  const client = getPrimary();
  if (!client) {
    throw new Error('POSTGRES_NOT_CONFIGURED: no hay URL de Postgres (Supabase/Neon) en el entorno.');
  }
  return client;
}

export function isPostgresConfigured(): boolean {
  return resolvePrimary() !== null;
}

export function primaryProvider(): PostgresProvider | null {
  return resolvePrimary()?.provider ?? null;
}

export function replicaProvider(): PostgresProvider | null {
  return resolveReplica(resolvePrimary())?.provider ?? null;
}

/** Ping ligero para el health-check. No lanza. Si el primario es Neon,
 *  aplica cooldown para no mantener la computa despierta (scale-to-zero a
 *  los 5 min) y respeta el presupuesto mensual del plan Free: si se agotó,
 *  reporta 'budget_exhausted' sin abrir conexión nueva. */
export async function pingPostgres(): Promise<{ ok: boolean; latencyMs: number | null; error?: string }> {
  if (primaryProvider() === 'neon') {
    if (isNeonBudgetExhausted()) {
      return { ok: false, latencyMs: null, error: 'budget_exhausted' };
    }
    if (!canPingNeon()) {
      return { ok: true, latencyMs: null, error: 'cooldown' };
    }
  }
  const client = getPrimary();
  if (!client) return { ok: false, latencyMs: null, error: 'not_configured' };
  const started = Date.now();
  try {
    await client`select 1 as ok`;
    const latencyMs = Date.now() - started;
    if (primaryProvider() === 'neon') {
      markNeonPing();
      trackComputeActivity(latencyMs);
    }
    return { ok: true, latencyMs };
  } catch (error) {
    return { ok: false, latencyMs: null, error: error instanceof Error ? error.message : 'unknown' };
  }
}
