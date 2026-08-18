import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";

const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET || "";
if (!SUPABASE_JWT_SECRET) {
  console.warn("WARNING: SUPABASE_JWT_SECRET not set — auth running in insecure mode");
}

export interface AuthResult {
  authenticated: boolean;
  userId?: string;
  email?: string;
  role?: string;
  errorMessage?: string;
  errorResponse?: Response;
  supabase?: ReturnType<typeof createClient>;
}

interface JwtPayload {
  sub: string;
  email?: string;
  role?: string;
  exp: number;
  iat: number;
}

async function verifyTokenCryptographically(token: string): Promise<JwtPayload | null> {
  if (!SUPABASE_JWT_SECRET) return null;
  try {
    const decoded = jwt.verify(token, SUPABASE_JWT_SECRET, { algorithms: ["HS256"] }) as JwtPayload;
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) return null;
    return decoded;
  } catch {
    return null;
  }
}

async function verifyTokenViaSupabase(token: string, supabaseUrl: string, supabaseAnonKey: string): Promise<AuthResult> {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return { authenticated: false, errorMessage: error?.message || "Invalid token" };
    }
    return {
      authenticated: true,
      userId: user.id,
      email: user.email,
      role: user.role,
      supabase,
    };
  } catch (err) {
    return {
      authenticated: false,
      errorMessage: err instanceof Error ? err.message : "Supabase auth verification failed",
    };
  }
}

export async function verifyAuth(request: Request): Promise<AuthResult> {
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return { authenticated: false, errorMessage: "Missing Authorization header" };
  }

  const [scheme, token] = authHeader.split(" ", 2);

  if (scheme !== "Bearer" || !token) {
    return { authenticated: false, errorMessage: "Invalid Authorization scheme (use Bearer)" };
  }

  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && token === cronSecret) {
    return { authenticated: true, role: "cron" };
  }

  // 1) Cryptographic JWT verification (fast path, no network call)
  const cryptoResult = await verifyTokenCryptographically(token);
  if (cryptoResult) {
    return {
      authenticated: true,
      userId: cryptoResult.sub,
      email: cryptoResult.email,
      role: cryptoResult.role,
    };
  }

  // 2) Fallback: network-based verification via Supabase Auth API
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return { authenticated: false, errorMessage: "Supabase not configured" };
  }

  return verifyTokenViaSupabase(token, supabaseUrl, supabaseAnonKey);
}

export async function requireAuth(request: Request): Promise<AuthResult> {
  const result = await verifyAuth(request);

  if (!result.authenticated) {
    return {
      ...result,
      errorResponse: new Response(
        JSON.stringify({ error: result.errorMessage || "Unauthorized" }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
            "WWW-Authenticate": 'Bearer realm="api"',
          },
        },
      ),
    };
  }

  return result;
}

export async function requireRole(request: Request, allowedRoles: string[]): Promise<AuthResult> {
  const result = await requireAuth(request);

  if (result.errorResponse) return result;

  if (result.role === "cron") return result;

  if (!result.role || !allowedRoles.includes(result.role)) {
    return {
      ...result,
      errorResponse: new Response(
        JSON.stringify({ error: "Insufficient permissions" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        },
      ),
    };
  }

  return result;
}
