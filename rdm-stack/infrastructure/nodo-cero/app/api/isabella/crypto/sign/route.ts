import { NextRequest, NextResponse } from 'next/server';
import { requireIdentity } from '@/app/api/_shared/route-guard';
import { handleIsabellaCryptoSign } from '@/lib/isabella/http';

const ROUTE_ID = 'api:isabella:crypto:sign';
const REQUIRED_FIELDS = ['payload', 'context', 'operatorId', 'operatorKey'] as const;

type SignRequestBody = {
  payload: string;
  context?: Record<string, unknown>;
  operatorId: string;
  operatorKey: string;
};

function isSignBody(value: unknown): value is SignRequestBody {
  if (typeof value !== 'object' || value === null) return false;

  const body = value as Record<string, unknown>;

  return (
    typeof body.payload === 'string' &&
    typeof body.operatorId === 'string' &&
    typeof body.operatorKey === 'string'
  );
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const startedAt = Date.now();

  try {
    if (req.method !== 'POST') {
      return NextResponse.json(
        {
          route: ROUTE_ID,
          ok: false,
          error: 'METHOD_NOT_ALLOWED',
          message: 'Sólo se admite el método POST para este endpoint criptográfico.',
        },
        {
          status: 405,
          headers: {
            Allow: 'POST',
          },
        },
      );
    }

    const contentType = req.headers.get('content-type') ?? '';
    const isJson = contentType.includes('application/json');

    if (!isJson) {
      return NextResponse.json(
        {
          route: ROUTE_ID,
          ok: false,
          error: 'UNSUPPORTED_MEDIA_TYPE',
          message: 'El cuerpo de la petición debe ser JSON (application/json).',
        },
        { status: 415 },
      );
    }

    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          route: ROUTE_ID,
          ok: false,
          error: 'INVALID_JSON',
          message: 'El cuerpo JSON no pudo ser parseado correctamente.',
        },
        { status: 400 },
      );
    }

    if (!isSignBody(body)) {
      return NextResponse.json(
        {
          route: ROUTE_ID,
          ok: false,
          error: 'INVALID_PAYLOAD',
          message:
            'La carga de firma debe incluir: payload (string), operatorId (string) y operatorKey (credencial del operador).',
          required: REQUIRED_FIELDS,
        },
        { status: 400 },
      );
    }

    // Identidad soberana y scopes (capa L6): firma MSR restringida a mexa:sign.
    const denied = requireIdentity(req, ['mexa:sign']);
    if (denied) return denied;

    // Delegación al núcleo de firma MSR / Mexa API (C.R.O.W.N.)
    const response = await handleIsabellaCryptoSign(req);

    const elapsedMs = Date.now() - startedAt;

    const secureHeaders: Record<string, string> = {
      'X-Isabella-Route': ROUTE_ID,
      'X-Isabella-Latency-Ms': String(elapsedMs),
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
    };

    const merged = new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...Object.fromEntries(response.headers),
        ...secureHeaders,
      },
    });

    return merged;
  } catch (error: unknown) {
    const elapsedMs = Date.now() - startedAt;

    return NextResponse.json(
      {
        route: ROUTE_ID,
        ok: false,
        error: 'INTERNAL_CRYPTO_SIGN_ERROR',
        message:
          'Ocurrió un error no controlado al procesar la petición de firma Isabella/Mexa.',
        details:
          process.env.NODE_ENV === 'development'
            ? String(error)
            : undefined,
        meta: {
          latencyMs: elapsedMs,
        },
      },
      {
        status: 500,
        headers: {
          'X-Isabella-Route': ROUTE_ID,
          'X-Isabella-Latency-Ms': String(elapsedMs),
          'X-Content-Type-Options': 'nosniff',
          'Referrer-Policy': 'no-referrer',
        },
      },
    );
  }
}
