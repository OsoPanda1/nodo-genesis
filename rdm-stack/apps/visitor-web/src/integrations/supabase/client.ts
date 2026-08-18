import type { Database } from "./types";

let _supabase: import("@supabase/supabase-js").SupabaseClient<Database> | null | undefined;
let _initPromise: Promise<void> | null = null;
let _authQueue: Array<{ event: string; callback: (...args: unknown[]) => void }> = [];

async function createSupabaseClient() {
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    const missing = [
      ...(!SUPABASE_URL ? ["SUPABASE_URL"] : []),
      ...(!SUPABASE_PUBLISHABLE_KEY ? ["SUPABASE_PUBLISHABLE_KEY"] : []),
    ];
    console.warn(`[Supabase] Variables faltantes: ${missing.join(", ")}. Auth deshabilitado.`);
    return null;
  }

  const { createClient } = await import("@supabase/supabase-js");
  return createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: typeof window !== "undefined" ? localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

export async function initSupabase() {
  if (!_initPromise) {
    _initPromise = (async () => {
      _supabase = await createSupabaseClient();
      if (_supabase) {
        for (const { event, callback } of _authQueue) {
          _supabase.auth.onAuthStateChange(callback as any);
        }
        _authQueue = [];
      }
    })();
  }
  return _initPromise;
}

function getClient() {
  return _supabase;
}

let _authStub: any;

function getAuthStub() {
  if (!_authStub) {
    _authStub = {
      onAuthStateChange: (callback: (...args: unknown[]) => void) => {
        _authQueue.push({ event: "authStateChange", callback });
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
      getSession: async () => {
        const c = getClient();
        if (c) return c.auth.getSession();
        return { data: { session: null }, error: null };
      },
      signInWithPassword: async (...args: any[]) => {
        const c = getClient();
        if (c) return c.auth.signInWithPassword(args[0]);
        return { data: { session: null }, error: null };
      },
      signUp: async (...args: any[]) => {
        const c = getClient();
        if (c) return c.auth.signUp(args[0]);
        return { data: {}, error: null };
      },
      signInWithOAuth: async (...args: any[]) => {
        const c = getClient();
        if (c) return c.auth.signInWithOAuth(args[0]);
        return { error: null };
      },
      signOut: async () => {
        const c = getClient();
        if (c) return c.auth.signOut();
      },
    };
  }
  return _authStub;
}

export const supabase = new Proxy({} as unknown as import("@supabase/supabase-js").SupabaseClient<Database>, {
  get(_target, prop: string) {
    if (prop === "then") return undefined;
    if (prop === "auth") {
      const c = getClient();
      if (c) return c.auth;
      void initSupabase();
      return getAuthStub();
    }
    return async (...args: any[]) => {
      const c = getClient();
      if (c) return (c as any)[prop](...args);
      await initSupabase();
      const client = getClient();
      return client ? (client as any)[prop](...args) : null;
    };
  },
});
