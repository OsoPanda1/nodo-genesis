import { NextRequest, NextResponse } from 'next/server';
import { requireIdentity } from '@/app/api/_shared/route-guard';
import { handleIsabellaReason } from '@/lib/isabella/http';
import { reasonSchema } from '@/lib/core/contracts';

const ROUTE_ID = 'api:isabella:isa:reason';
const REQUIRED_FIELDS = ['query', 'context', 'mode'] as const;

export async function POST(req: NextRequest): Promise<NextResponse> {
  const startedAt = Date.now();

  try {
    if (req.method !== 'POST') {
      return NextResponse.json(
        {
          route: ROUTE_ID,
          ok: false,
          error: 'METHOD_NOT_ALLOWED',
          message:
            'Sólo se admite el método POST para este endpoint de razonamiento estructurado ISA.',
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

    // Contrato ejecutable: valida y tipa la carga de razonamiento.
    const parsed = reasonSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          route: ROUTE_ID,
          ok: false,
          error: 'INVALID_PAYLOAD',
          message:
            'La carga de razonamiento debe incluir al menos: query (string no vacía) y un modo válido (trace | answer | audit).',
          required: REQUIRED_FIELDS,
          details: parsed.error.issues.map(i => ({
            path: i.path.join('.'),
            message: i.message,
          })),
        },
        { status: 400 },
      );
    }

    // Identidad soberana y scopes (capa L6) antes de tocar el núcleo ISA.
    const denied = requireIdentity(req, ['isa:read']);
    if (denied) return denied;

    // Delegación al núcleo de razonamiento ISA API v4.0 (C.R.O.W.N.)
    const response = await handleIsabellaReason(req);

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
        error: 'INTERNAL_ISA_REASON_ERROR',
        message:
          'Ocurrió un error no controlado al procesar la petición de razonamiento estructurado Isabella/ISA.',
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
