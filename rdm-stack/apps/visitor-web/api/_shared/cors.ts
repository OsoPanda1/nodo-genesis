// CORS unificado para todo el ecosistema TAMV / RDM Digital Hub
// Fuente de verdad única - todos los endpoints deben importar desde aquí

const ALLOWED_ORIGINS = [
  "https://www.visitarealdelmonte.online",
  "https://visitarealdelmonte.online",
  "https://real-del-monte-digital-hub.vercel.app",
  "https://rdm-digital.vercel.app",
  "https://rdm-digital-hub.vercel.app",
];

const DEV_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:8080",
  "http://localhost:8888",
];

function getAllOrigins(): string[] {
  const isDev = process.env.ENV === "development" || process.env.NODE_ENV === "development";
  return isDev ? [...ALLOWED_ORIGINS, ...DEV_ORIGINS] : ALLOWED_ORIGINS;
}

export function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin && getAllOrigins().includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Isabella-Client, X-Isabella-Token, X-Request-Id",
    "Access-Control-Max-Age": "86400",
    "Access-Control-Allow-Credentials": "true",
  };
}

export function handleCors(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: getCorsHeaders(req.headers.get("origin")),
    });
  }
  return null;
}

export function corsPreflightResponse(request: Request): Response {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;
  return new Response(null, {
    status: 204,
    headers: {
      ...getCorsHeaders(request.headers.get("origin")),
      "Cache-Control": "no-store, max-age=0, must-revalidate",
    },
  });
}

export function corsJsonResponse(request: Request, body: unknown, status = 200, extraHeaders?: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      ...getCorsHeaders(request.headers.get("origin")),
      ...(extraHeaders || {}),
    },
  });
}
