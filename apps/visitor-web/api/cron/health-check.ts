// api/cron/health-check.ts — Vercel Edge Function + Cron
// Federation Health Check — pensado para ejecutarse vía Vercel Cron
// - Aplica CORS y rate-limit para llamadas manuales
// - Ejecuta health-check real contra Supabase y registra en federation_health_log

export const config = { runtime: "edge" };

import { getCorsHeaders, handleCors } from "../_shared/cors";
import { checkRateLimit } from "../_shared/rate-limit";

const FEDERATIONS = [
  { id: "F1", name: "Gobernanza" },
  { id: "F2", name: "Identidad y Acceso" },
  { id: "F3", name: "Datos Territoriales" },
  { id: "F4", name: "Comercio y Monetización" },
  { id: "F5", name: "IA y Automatización" },
  { id: "F6", name: "Comunidad y Contenido" },
  { id: "F7", name: "Observabilidad y Seguridad" },
];

const LTOS_FEDERATIONS = ["ANUBIS", "MDD_TAMV", "BOOKPI", "PHOENIX", "KAOS", "CHRONOS", "DEKATEOTL"];

const DEFENSIVE_HEADERS_BASE = {
  "Content-Security-Policy": "default-src 'self'",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Cache-Control": "no-store, max-age=0, must-revalidate",
  "Content-Type": "application/json",
};

function buildHeaders(origin: string | null) {
  return {
    ...DEFENSIVE_HEADERS_BASE,
    ...getCorsHeaders(origin),
  };
}

async function measureSupabaseHealth(supabase: any, federationId: string) {
  const started = Date.now();
  const probe = supabase
    .from("federation_health_log")
    .select("checked_at")
    .eq("federation_id", federationId)
    .order("checked_at", { ascending: false })
    .limit(1);

  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Supabase health probe timeout")), 4_000);
  });

  try {
    const { error } = await Promise.race([probe, timeout]);
    return {
      status: error ? "degraded" : "healthy",
      latency: Date.now() - started,
      error: error?.message as string | undefined,
    };
  } catch (error: unknown) {
    return {
      status: "degraded",
      latency: Date.now() - started,
      error: error instanceof Error ? error.message : "Unknown health probe error",
    };
  }
}

export default async function handler(req: Request): Promise<Response> {
  // CORS preflight primero (OPTIONS)
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const origin = req.headers.get("origin");
  const headers = buildHeaders(origin);

  // Rate-limit para llamadas manuales desde front / exploración
  const { allowed } = checkRateLimit(req, { windowMs: 60_000, maxRequests: 30, keyPrefix: "health" });
  if (!allowed) {
    return new Response(JSON.stringify({ error: "rate_limited" }), {
      status: 429,
      headers,
    });
  }

  // Autorización de cron (cuando se use como job programado)
  const authHeader = req.headers.get("Authorization");
  const cronSecret = process.env.CRON_SECRET;

  const isCronCall = !!authHeader;
  if (isCronCall && (!cronSecret || authHeader !== `Bearer ${cronSecret}`)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers,
    });
  }

  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers,
    });
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Si Supabase no está configurado, degradado pero respondiendo.
    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({
          ok: false,
          status: "degraded",
          error: "Supabase not configured",
          message: "RDM Digital Hub — LTOS health-check alive (sin Supabase)",
          timestamp: new Date().toISOString(),
          federations_logged: 0,
          ltos_federations: LTOS_FEDERATIONS.length,
          version: "1.0.0",
        }),
        { status: 200, headers },
      );
    }

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, supabaseKey);

    const results: {
      federation: string;
      name: string;
      status: string;
      latency_ms: number;
      logged: boolean;
      error?: string;
    }[] = [];

    const timestamp = new Date().toISOString();

    for (const fed of FEDERATIONS) {
      const health = await measureSupabaseHealth(supabase, fed.id);

      const { error } = await supabase.from("federation_health_log").insert({
        federation_id: fed.id,
        federation_name: fed.name,
        status: health.status,
        latency_ms: health.latency,
        checked_at: timestamp,
        source: "cron-vercel",
      });

      results.push({
        federation: fed.id,
        name: fed.name,
        status: health.status,
        latency_ms: health.latency,
        logged: !error,
        error: health.error || (error?.message as string | undefined),
      });
    }

    const healthyCount = results.filter((r) => r.status === "healthy").length;

    return new Response(
      JSON.stringify({
        ok: true,
        message: "RDM Digital Hub — LTOS federation health-check",
        timestamp,
        federations_logged: results.length,
        healthy: healthyCount,
        total: FEDERATIONS.length,
        ltos_federations: LTOS_FEDERATIONS.length,
        version: "1.0.0",
        details: results,
      }),
      { status: 200, headers },
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        error: err?.message ?? "Unknown error",
        status: "error",
      }),
      { status: 500, headers },
    );
  }
}
