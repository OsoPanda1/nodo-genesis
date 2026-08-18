/**
 * Server-only env. Importing this file from the browser bundle is forbidden
 * by ESLint (`no-restricted-imports`) and by the `.server.ts` convention.
 */
import { z } from "zod";

const serverSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
  SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional(),
  GEMINI_API_KEY: z.string().min(1).optional(),
  SENTRY_DSN: z.string().url().optional(),
  TURNSTILE_SECRET_KEY: z.string().min(1).optional(),
  APP_ENV: z.enum(["development", "preview", "production"]).default("development"),
});

export type ServerEnv = z.infer<typeof serverSchema>;

let cached: ServerEnv | undefined;

export function getServerEnv(): ServerEnv {
  if (cached) return cached;
  const parsed = serverSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.flatten().fieldErrors;
    throw new Error(`[env.server] Missing/invalid server env: ${JSON.stringify(issues)}`);
  }
  cached = parsed.data;
  return cached;
}
