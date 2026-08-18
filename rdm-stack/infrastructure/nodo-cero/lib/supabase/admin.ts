/* ================================================================== */
/* Supabase — Cliente admin perezoso (degradación segura)             */
/* ================================================================== */
/* El proveedor de voz intenta cargar `@supabase/supabase-js` SOLO si  */
/* está disponible; si no, degrada (mismo patrón que redis.ts). No     */
/* lanza en el import: lanza al primer uso real, que el consumidor     */
/* (voz) captura y degrada a modo local.                               */
/* ================================================================== */

export interface SupabaseAdminClient {
  storage: {
    from(bucket: string): {
      upload(path: string, body: Uint8Array | ArrayBuffer | Blob, options?: { contentType?: string; cacheControl?: string; upsert?: boolean }): Promise<{ error: { message: string } | null }>;
      createSignedUrl(path: string, expiresIn: number): Promise<{ data: { signedUrl: string } | null; error: { message: string } | null }>;
    };
  };
}

let cached: SupabaseAdminClient | null = null;

async function loadAdmin(): Promise<SupabaseAdminClient> {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error('Faltan variables de entorno de Supabase para servidor.');
  }
  const moduleId = '@supabase/supabase-js';
  const mod = (await import(moduleId)) as unknown as {
    createClient: (url: string, key: string, opts?: { auth?: { autoRefreshToken?: boolean; persistSession?: boolean } }) => SupabaseAdminClient;
  };
  cached = mod.createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return cached;
}

/** Cliente admin perezoso. Lanza solo al primer uso si el paquete o el
 *  entorno no están disponibles; el consumidor (voz) degrada. */
export async function getSupabaseAdmin(): Promise<SupabaseAdminClient> {
  return loadAdmin();
}

export async function isSupabaseAdminAvailable(): Promise<boolean> {
  try {
    await loadAdmin();
    return true;
  } catch {
    return false;
  }
}
