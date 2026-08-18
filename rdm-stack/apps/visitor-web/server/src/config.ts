import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(8787),
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET debe tener mínimo 32 caracteres")
    .max(256),
  JWT_ISSUER: z.string().min(1).default("rdmx"),
  JWT_AUDIENCE: z.string().min(1).default("rdmx-api"),
  JWT_EXPIRES_IN: z.string().min(1).default("2h"),
  DATABASE_URL: z
    .string()
    .url("DATABASE_URL debe ser una URL válida")
    .refine(
      (v) => v.startsWith("postgres://") || v.startsWith("postgresql://"),
      "DATABASE_URL debe ser PostgreSQL",
    ),
  PUBLIC_BASE_URL: z
    .string()
    .url("PUBLIC_BASE_URL debe ser una URL válida")
    .refine(
      (v) =>
        process.env.NODE_ENV !== "production" ||
        v.startsWith("https://"),
      "En producción debe utilizar HTTPS",
    ),
  CORS_ALLOWED_ORIGINS: z.string().min(1, "CORS_ALLOWED_ORIGINS no puede estar vacío"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().min(5).max(1000).default(60),
  STRIPE_SECRET_KEY: z.string().optional(),
  OPENWEATHER_API_KEY: z.string().optional(),
  AI_REQUEST_TIMEOUT_MS: z.coerce.number().int().min(1000).max(60000).default(5000),
  AI_MAX_PROMPT_CHARS: z.coerce.number().int().positive().max(4_000).default(800),
  AI_CIRCUIT_BREAKER_THRESHOLD: z.coerce.number().int().positive().default(5),
  AI_CIRCUIT_BREAKER_COOLDOWN_MS: z.coerce.number().int().positive().default(30_000),
});

const redactEnvErrors = (error: z.ZodError) =>
  error.issues.map((issue) => `${issue.path.join(".") || "ENV"}: ${issue.message}`).join("; ");

const env = (() => {
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Configuración insegura o incompleta: ${redactEnvErrors(parsed.error)}`);
  }
  return parsed.data;
})();

const parseOrigins = (input: string) =>
  [...new Set(
    input
      .split(",")
      .map((origin) => origin.trim())
      .filter((o) => /^https?:\/\//.test(o))
  )];

export const config = Object.freeze({
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  jwtSecret: env.JWT_SECRET,
  jwtIssuer: env.JWT_ISSUER,
  jwtAudience: env.JWT_AUDIENCE,
  jwtExpiresIn: env.JWT_EXPIRES_IN,
  publicBaseUrl: env.PUBLIC_BASE_URL,
  stripeSecretKey: env.STRIPE_SECRET_KEY,
  openWeatherApiKey: env.OPENWEATHER_API_KEY,
  corsAllowedOrigins: parseOrigins(env.CORS_ALLOWED_ORIGINS),
  rateLimitWindowMs: env.RATE_LIMIT_WINDOW_MS,
  rateLimitMaxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  databaseUrl: env.DATABASE_URL,
  aiRequestTimeoutMs: env.AI_REQUEST_TIMEOUT_MS,
  aiMaxPromptChars: env.AI_MAX_PROMPT_CHARS,
  aiCircuitBreakerThreshold: env.AI_CIRCUIT_BREAKER_THRESHOLD,
  aiCircuitBreakerCooldownMs: env.AI_CIRCUIT_BREAKER_COOLDOWN_MS,
});
