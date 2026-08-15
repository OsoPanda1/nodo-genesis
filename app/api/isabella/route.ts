import { NextRequest, NextResponse } from 'next/server';
import {
  handleIsabellaGet,
  handleIsabellaPost,
} from '@/lib/isabella/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ROUTE_ID_POST = 'api:isabella:post';
const ROUTE_ID_GET = 'api:isabella:get';

const MAX_BODY_BYTES = 1_000_000;
const ALLOWED_ORIGIN = process.env.ISABELLA_ALLOWED_ORIGIN?.trim();

type RouteId = typeof ROUTE_ID_POST | typeof ROUTE_ID_GET;

function baseHeaders(
  route: RouteId,
  latencyMs?: number,
): Record<string, string> {
  return {
    'X-Isabella-Route': route,
    ...(latencyMs === undefined
      ? {}
      : { 'X-Isabella-Latency-Ms': String(latencyMs) }),
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'X-Frame-Options': 'DENY',
    'Cache-Control': 'no-store, max-age=0',
    Vary: 'Origin',
  };
}

function corsHeaders(): Record<string, string> {
  /*
   * Para el chat en el mismo dominio no es necesario CORS.
   * Sólo se emiten headers CORS si configuraste ISABELLA_ALLOWED_ORIGIN.
   */
  if (!ALLOWED_ORIGIN) {
    return {};
  }

  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function responseHeaders(
  route: RouteId,
  latencyMs?: number,
): Record<string, string> {
  return {
    ...baseHeaders(route, latencyMs),
    ...corsHeaders(),
  };
}

function json(
  route: RouteId,
  body: unknown,
  status: number,
  latencyMs?: number,
  extraHeaders?: HeadersInit,
): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: {
      ...Object.fromEntries(new Headers(extraHeaders).entries()),
      ...responseHeaders(route, latencyMs),
    },
  });
}

function requestContentLengthExceeded(request: NextRequest): boolean {
  const contentLength = request.headers.get('content-length');

  if (!contentLength) {
    return false;
  }

  const bytes = Number.parseInt(contentLength, 10);

  return Number.isFinite(bytes) && bytes > MAX_BODY_BYTES;
}

function mergeDelegatedResponse(
  response: Response,
  route: RouteId,
  latencyMs: number,
): NextResponse {
  /*
   * Se preservan los headers que devuelve lib/isabella/http.ts
   * (por ejemplo content-type), pero los de seguridad de la ruta
   * tienen prioridad y no pueden ser reemplazados por la capa interna.
   */
  const headers = new Headers(response.headers);

  for (const [key, value] of Object.entries(responseHeaders(route, latencyMs))) {
    headers.set(key, value);
  }

  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function logRouteFailure(
  route: RouteId,
  error: unknown,
  latencyMs: number,
): void {
  console.error('isabella.route.failed', {
    route,
    latencyMs,
    errorName: error instanceof Error ? error.name : 'UnknownError',
    errorMessage: error instanceof Error ? error.message : String(error),
  });
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      Allow: 'GET, POST, OPTIONS',
      ...responseHeaders(ROUTE_ID_POST),
    },
  });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const startedAt = Date.now();

  try {
    /*
     * Next.js sólo invoca este export para POST. Por eso no hace falta
     * volver a verificar req.method aquí.
     */
    const contentType = req.headers.get('content-type') ?? '';

    if (!contentType.toLowerCase().includes('application/json')) {
      return json(
        ROUTE_ID_POST,
        {
          route: ROUTE_ID_POST,
          ok: false,
          error: 'UNSUPPORTED_MEDIA_TYPE',
          message: 'El cuerpo de la petición debe ser JSON (application/json).',
        },
        415,
        Date.now() - startedAt,
        { Accept: 'application/json' },
      );
    }

    if (requestContentLengthExceeded(req)) {
      return json(
        ROUTE_ID_POST,
        {
          route: ROUTE_ID_POST,
          ok: false,
          error: 'PAYLOAD_TOO_LARGE',
          message: `El cuerpo de la petición excede el límite de ${MAX_BODY_BYTES} bytes.`,
        },
        413,
        Date.now() - startedAt,
      );
    }

    const response = await handleIsabellaPost(req);

    return mergeDelegatedResponse(
      response,
      ROUTE_ID_POST,
      Date.now() - startedAt,
    );
  } catch (error: unknown) {
    const latencyMs = Date.now() - startedAt;

    logRouteFailure(ROUTE_ID_POST, error, latencyMs);

    return json(
      ROUTE_ID_POST,
      {
        route: ROUTE_ID_POST,
        ok: false,
        error: 'INTERNAL_ISABELLA_POST_ERROR',
        message:
          'Ocurrió un error no controlado al procesar la petición POST de Isabella.',
        meta: {
          latencyMs,
        },
      },
      500,
      latencyMs,
    );
  }
}

export async function GET(): Promise<NextResponse> {
  const startedAt = Date.now();

  try {
    const response = await handleIsabellaGet();

    return mergeDelegatedResponse(
      response,
      ROUTE_ID_GET,
      Date.now() - startedAt,
    );
  } catch (error: unknown) {
    const latencyMs = Date.now() - startedAt;

    logRouteFailure(ROUTE_ID_GET, error, latencyMs);

    return json(
      ROUTE_ID_GET,
      {
        route: ROUTE_ID_GET,
        ok: false,
        error: 'INTERNAL_ISABELLA_GET_ERROR',
        message:
          'Ocurrió un error no controlado al procesar la petición GET de manifest/health Isabella.',
        meta: {
          latencyMs,
        },
      },
      500,
      latencyMs,
    );
  }
}
