import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { gemetNodeRecordSchema, type GemetNodeRecord } from '@/lib/gemet';
import { registerNode, listNodes, GEMET_CHECKSUM_MISMATCH } from '@/lib/gemet';

export const runtime = 'nodejs';

/* ------------------------------------------------------------------ */
/* POST /api/gemet/nodes — registro de un nodo de conocimiento         */
/* ------------------------------------------------------------------ */
/* Exige scope `gemet:write`. Verifica el checksum sha256 canónico:    */
/* un checksum inválido rechaza el registro (fail-closed).             */
/* ------------------------------------------------------------------ */
export const POST = guardedRoute<GemetNodeRecord>(
  {
    route: 'api:gemet:nodes:register',
    methods: ['POST'],
    rateLimit: 10,
    schema: gemetNodeRecordSchema,
    identityScopes: ['gemet:write'],
    cacheControl: 'no-store',
  },
  async ({ body }) => {
    try {
      const record = registerNode(body);
      return NextResponse.json({ ok: true, record }, { status: 201 });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message === GEMET_CHECKSUM_MISMATCH) {
        return NextResponse.json(
          { ok: false, error: 'El checksum canónico no coincide con el registro.' },
          { status: 409 },
        );
      }
      return NextResponse.json({ ok: false, error: 'Registro rechazado por el contrato.' }, { status: 400 });
    }
  },
);

/* ------------------------------------------------------------------ */
/* GET /api/gemet/nodes — registros de conocimiento indexados          */
/* ------------------------------------------------------------------ */
/* Requiere scope `gemet:read`. Solo metadatos operativos.             */
/* ------------------------------------------------------------------ */
export const GET = guardedRoute(
  {
    route: 'api:gemet:nodes:list',
    methods: ['GET'],
    rateLimit: 20,
    json: false,
    identityScopes: ['gemet:read'],
    cacheControl: 'no-store',
  },
  async () => {
    return NextResponse.json({ ok: true, records: listNodes() });
  },
);
