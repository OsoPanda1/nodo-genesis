import { createClient } from "@supabase/supabase-js";

let isInitialized = false;
let supabaseInstance: ReturnType<typeof createClient> | null = null;

export interface BootstrapConfig {
  supabaseUrl: string;
  supabaseKey: string;
  federationSecret: string;
}

export function getSupabaseClient(url?: string, key?: string) {
  if (!supabaseInstance) {
    const u = url || process.env.SUPABASE_URL || "";
    const k = key || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    if (!u || !k) throw new Error("Supabase credentials missing");
    supabaseInstance = createClient(u, k, { auth: { persistSession: false, autoRefreshToken: false } });
  }
  return supabaseInstance;
}

export async function bootstrapKnowledgeCells(config?: BootstrapConfig): Promise<boolean> {
  if (isInitialized) {
    console.log("[INFO] Knowledge cells already initialized, skipping bootstrap");
    return true;
  }

  try {
    const sUrl = config?.supabaseUrl || process.env.SUPABASE_URL || "";
    const sKey = config?.supabaseKey || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    const db = getSupabaseClient(sUrl, sKey);

    const { error } = await db.from("territorial_cells").select("id").limit(1);
    if (error) throw new Error(`Supabase connectivity check failed: ${error.message}`);

    const fedSecret = config?.federationSecret || process.env.TAMV_FEDERATION_SECRET || "";
    if (!fedSecret) console.warn("[WARN] TAMV_FEDERATION_SECRET not set — remote sync unavailable");

    isInitialized = true;
    return true;
  } catch (error: any) {
    console.error("CRITICAL: bootstrap.ts ->", error.message);
    isInitialized = false;
    supabaseInstance = null;
    throw error;
  }
}
