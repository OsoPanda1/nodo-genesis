/**
 * SERVER-ONLY Supabase admin client (service role).
 *
 * - Filename ends in `.server.ts` so the bundler / ESLint rule rejects any
 *   import from frontend code (`src/**`, `apps/web/**`).
 * - Reads env exclusively from `process.env` via `getServerEnv()`.
 * - NEVER import this file from a React component, hook, or route loader
 *   that runs in the browser. Use it only from Edge Functions, server
 *   handlers, scripts, and other `*.server.ts` modules.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { getServerEnv } from "@/lib/env.server";

let cached: SupabaseClient<Database> | undefined;

export function getSupabaseAdmin(): SupabaseClient<Database> {
  if (cached) return cached;
  const env = getServerEnv();
  cached = createClient<Database>(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { "X-Client-Info": "rdm-admin/server" } },
  });
  return cached;
}
