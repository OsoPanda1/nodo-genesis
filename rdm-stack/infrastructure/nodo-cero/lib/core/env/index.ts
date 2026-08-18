/* ================================================================== */
/* ENV — Contrato tipado del entorno                                  */
/* ================================================================== */
/* Única fuente de verdad sobre qué variables de entorno existen y qué */
/* forma deben tener. Sustituye la lectura dispersa de process.env.    */
/*                                                                     */
/* Uso en ejecución:                                                   */
/*   const env = getEnv();            // validado + tipado             */
/*                                                                     */
/* Uso en CI / operación:                                              */
/*   const { ok, issues } = parseEnv(); // fail-fast, nunca lanza       */
/*                                                                     */
/* Grupos: core (URLs/NODE_ENV), internal keys (rotables _V2/_V3),     */
/* operator (MEXA), emergency (CROWN), gamification, dev.              */
/* ================================================================== */

import { z } from 'zod';

const rotatableKey = z
  .string()
  .min(8, 'la clave interna debe tener al menos 8 caracteres')
  .optional()
  .or(z.literal(''));

/** Esquema completo del entorno. Todas las claves son opcionales para
 *  que el Nodo siga operando en modo demo (fail-open de presencia,
 *  fail-closed de tipo). La exigencia de "requerida en producción" la
 *  declara cada consumidor. */
export const envSchema = z.object({
  /* Core */
  APP_URL: z.string().url('APP_URL debe ser una URL válida').optional().or(z.literal('')),
  NEXT_PUBLIC_SITE_URL: z.string().url('NEXT_PUBLIC_SITE_URL debe ser una URL válida').optional().or(z.literal('')),
  VERCEL_URL: z.string().optional(),
  VERCEL: z.string().optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  /* Frontera — política canónica de origen (anti-CSRF) */
  /* CANONICAL_ORIGINS: lista separada por comas de orígenes exactos
     permitidos (p.ej. https://www.visitarealdelmonte.online).
     TRUSTED_HOSTS: lista separada por comas de hostnames que el Nodo
     reconoce como propios cuando no hay orígenes canónicos configurados
     (p.ej. www.visitarealdelmonte.online,visitarealdelmonte.online).
     Dominio canónico del despliegue: https://www.visitarealdelmonte.online;
     el apex responde 308 (permanent redirect) al canónico en el edge. */
  CANONICAL_ORIGINS: z.string().optional(),
  TRUSTED_HOSTS: z.string().optional(),

  /* Claves internas (rotables con sufijos _V2 / _V3) */
  ISA_API_KEY: rotatableKey,
  ISA_API_KEY_V2: rotatableKey,
  ISA_API_KEY_V3: rotatableKey,
  MEXA_API_KEY: rotatableKey,
  MEXA_API_KEY_V2: rotatableKey,
  MEXA_API_KEY_V3: rotatableKey,
  GAMIFICATION_API_KEY: rotatableKey,
  GAMIFICATION_API_KEY_V2: rotatableKey,
  GAMIFICATION_API_KEY_V3: rotatableKey,
  MONITOR_API_KEY: rotatableKey,
  MONITOR_API_KEY_V2: rotatableKey,
  MONITOR_API_KEY_V3: rotatableKey,
  CROWN_API_KEY: rotatableKey,
  CROWN_API_KEY_V2: rotatableKey,
  CROWN_API_KEY_V3: rotatableKey,

  /* Operador MEXA (firma de percepciones) */
  MEXA_OPERATOR_KEY: z.string().optional(),
  MEXA_OPERATOR_PUBLIC_KEY: z.string().optional(),

  /* Identidad YUN — bootstrap de la primera clave admin (RDM_ADMIN_API_KEY).
     Si está definida y el registro de identidad está vacío, se da de alta
     como clave admin (`admin:keys` + `admin:all`) en el arranque. */
  RDM_ADMIN_API_KEY: z.string().optional(),

  /* Proveedores LLM del CROWN Gateway (flota federada de IAs).
     Cada clave activa el proveedor homólogo en lib/isabella/crown-gateway.ts:
     - GROQ_API_KEY       → Groq LPU (llama-3.3-70b-versatile)
     - CEREBRAS_API_KEY   → Cerebras (llama-3.3-70b)
     - OPENROUTER_API_KEY → OpenRouter (enrutador multi-modelo)
     - MISTRAL_API_KEY    → Mistral Nemo
     - OPENCODE_ZEN_API_KEY → OpenCode Zen (Chat Completions en opencode.ai/zen/v1)
     - OLLAMA_*           → inferencia local (nunca egress) */
  GROQ_API_KEY: rotatableKey,
  CEREBRAS_API_KEY: rotatableKey,
  OPENROUTER_API_KEY: rotatableKey,
  MISTRAL_API_KEY: rotatableKey,
  CLOUDFLARE_AI_KEY: rotatableKey,
  CLOUDFLARE_AI_ACCOUNT_ID: z.string().optional(),
  OPENCODE_ZEN_API_KEY: rotatableKey,
  /* Clave de integración de los servicios OpenCode con Isabella (copiloto
     de ingeniería ↔ Nodo). No es un proveedor de inferencia: autentica los
     servicios externos que colaboran con el Nodo bajo Zero Trust. */
  OPENCODE_SERVICES_API_KEY: rotatableKey,
  OLLAMA_BASE_URL: z.string().optional(),

  /* Emergencia CROWN */
  CROWN_EMERGENCY_KEY: z.string().optional(),
  CROWN_EMERGENCY_MODE: z.enum(['armed', 'disarmed']).optional(),
  CROWN_HEARTBEAT_TTL_MS: z
    .string()
    .regex(/^\d+$/, 'CROWN_HEARTBEAT_TTL_MS debe ser numérico')
    .optional(),

  /* Licenciamiento — sello de integridad del build */
  BUILD_SEAL_KEY: z.string().optional(),

  /* Gamificación */
  GAMIFICATION_HMAC_SECRET: z.string().optional(),

  /* YUN Quantum Semantic Core — proveedor criptográfico híbrido
     (firma Ed25519 + ML-DSA-65). Hoy solo está registrado
     'unconfigured': sin motor auditado, el sellado del sobre semántico
     falla cerrado con CRYPTO_PROVIDER_NOT_CONFIGURED. */
  YUN_CRYPTO_PROVIDER: z.string().optional().or(z.literal('')),

  /* Persistencia — Postgres primario (Supabase) */
  POSTGRES_URL: z.string().optional(),
  POSTGRES_PRISMA_URL: z.string().optional(),
  POSTGRES_URL_NON_POOLING: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  /* Persistencia — Postgres réplica/primario (Neon)
     La integración de Neon en Vercel provee este conjunto de variables
     (prefijos PostgreSQL estándar más las específicas de Neon Auth).
     El resolver de lib/core/persistence/postgres.ts las lee en prioridad:
       1. URL completa pooled  → POSTGRES_PRISMA_URL / DATABASE_URL
       2. URL completa directa → DATABASE_URL_UNPOOLED
       3. Componentes (para reconstruir la URL) → PGHOST / PGHOST_UNPOOLED /
          PGUSER / POSTGRES_PASSWORD / PGDATABASE
     Las de Neon Auth (VITE_NEON_AUTH_URL / NEON_AUTH_BASE_URL) quedan
     registradas como reservadas para autenticación de base de datos
     (Neon Auth / Better Auth) y no se usan en la capa de persistencia. */
  NEON_DATABASE_URL: z.string().optional(),
  NEON_POSTGRES_URL: z.string().optional(),
  NEON_POSTGRES_URL_NON_POOLING: z.string().optional(),
  DATABASE_URL: z.string().optional(),
  DATABASE_URL_UNPOOLED: z.string().optional(),
  PGHOST: z.string().optional(),
  PGHOST_UNPOOLED: z.string().optional(),
  PGUSER: z.string().optional(),
  POSTGRES_PASSWORD: z.string().optional(),
  PGDATABASE: z.string().optional(),
  PGPORT: z.string().optional(),
  VITE_NEON_AUTH_URL: z.string().optional(),
  NEON_AUTH_BASE_URL: z.string().optional(),

  /* Persistencia — Presupuesto del plan Free de Neon
     NEON_CU_HOURS_LIMIT: horas de cómputo mensuales permitidas (el plan
       Free ofrece 100 CU-hours/proyecto/mes). El presupuesto degrada la
       capa durable a modo demo antes de cortar el servicio.
     NEON_PING_COOLDOWN_MS: intervalo mínimo entre pings de salud para no
       mantener la computa despierta (scale-to-zero tras 5 min). */
  NEON_CU_HOURS_LIMIT: z
    .string()
    .regex(/^\d+(\.\d+)?$/, 'NEON_CU_HOURS_LIMIT debe ser numérico')
    .optional(),
  NEON_PING_COOLDOWN_MS: z
    .string()
    .regex(/^\d+$/, 'NEON_PING_COOLDOWN_MS debe ser numérico')
    .optional(),

  /* Persistencia — Redis (Upstash) */
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  /* Spotify — panel de gestión multimedia del Nodo (RDM Digital Hub).
     SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET: credenciales de la app
       "RDM DIGITAL HUB" (dashboard developers.spotify.com). El flujo de
       autorización es Authorization Code con code_verifier (PKCE).
     SPOTIFY_REDIRECT_URI: URI de redirección registrada en Spotify.
        Producción: https://www.visitarealdelmonte.online/api/spotify/auth/callback
       Desarrollo: http://localhost:3000/api/spotify/auth/callback
     SPOTIFY_SCOPES: ámbitos solicitados (por defecto, el conjunto para
       leer historial de reproducción, listas, biblioteca y controlar el
       reproductor con Web Playback SDK). */
  SPOTIFY_CLIENT_ID: z.string().optional(),
  SPOTIFY_CLIENT_SECRET: z.string().optional(),
  SPOTIFY_REDIRECT_URI: z.string().url('SPOTIFY_REDIRECT_URI debe ser una URL válida').optional().or(z.literal('')),
  SPOTIFY_SCOPES: z.string().optional(),

  /* Desarrollo */
  DISABLE_HMR: z.string().optional(),
});

export type RdmEnv = z.infer<typeof envSchema>;

export interface EnvParseResult {
  ok: boolean;
  data: RdmEnv;
  issues: Array<{ path: string; message: string }>;
}

/** Valida el entorno sin lanzar. Devuelve datos + problemas. */
export function parseEnv(source: NodeJS.ProcessEnv = process.env): EnvParseResult {
  const result = envSchema.safeParse(source);
  if (result.success) return { ok: true, data: result.data, issues: [] };
  return {
    ok: false,
    data: fallbackEnv(source),
    issues: result.error.issues.map(i => ({ path: i.path.join('.'), message: i.message })),
  };
}

/** Acceso tipado al entorno validado. Ante valores inválidos conserva
 *  el string crudo (fail-open) para no romper arranques en modo demo. */
export function getEnv(): RdmEnv {
  const result = envSchema.safeParse(process.env);
  return result.success ? result.data : fallbackEnv(process.env);
}

/** Reconstruye el entorno sin validar, preservando valores crudos. */
function fallbackEnv(source: NodeJS.ProcessEnv): RdmEnv {
  const data: Record<string, unknown> = {};
  for (const name of Object.keys(envSchema.shape)) {
    if (name === 'NODE_ENV') continue;
    data[name] = source[name] ?? undefined;
  }
  data.NODE_ENV = (source.NODE_ENV ?? 'development') as RdmEnv['NODE_ENV'];
  return data as RdmEnv;
}

const REQUIRED_GROUPS: Record<string, string[]> = {
  core: ['APP_URL'],
  'claves internas': ['ISA_API_KEY', 'MEXA_API_KEY', 'GAMIFICATION_API_KEY', 'MONITOR_API_KEY', 'CROWN_API_KEY'],
  operator: ['MEXA_OPERATOR_KEY'],
  emergency: ['CROWN_EMERGENCY_KEY'],
  gamification: ['GAMIFICATION_HMAC_SECRET'],
};

export interface EnvGroupStatus {
  group: string;
  required: string[];
  missing: string[];
  configured: number;
}

/** Reporte agrupado para el monitor y el script check-env. */
export function envStatus(): {
  ok: boolean;
  groups: EnvGroupStatus[];
  parse: EnvParseResult;
} {
  const parse = parseEnv();
  const groups = Object.entries(REQUIRED_GROUPS).map(([group, vars]) => {
    const missing = vars.filter(name => !process.env[name]);
    return {
      group,
      required: vars,
      missing,
      configured: vars.length - missing.length,
    };
  });
  const allConfigured = groups.every(g => g.missing.length === 0);
  return { ok: allConfigured && parse.ok, groups, parse };
}
