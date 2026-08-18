import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { gemetQueryRequestSchema, type GemetQueryRequest } from '@/lib/gemet';
import { queryNode, addReplica, listReplicas } from '@/lib/gemet';

export const runtime = 'nodejs';

/* ------------------------------------------------------------------ */
/* POST /api/gemet/query — consulta al grafo de conocimiento           */
/* ------------------------------------------------------------------ */
/* Exige scope `gemet:read`. Lee de la réplica local; si no existe y   */
/* la consistencia es estricta consulta réplicas remotas (X-Gemet-Depth)*/
/* y cae a la caché firmada solo si es íntegra.                        */
/* ------------------------------------------------------------------ */
export const POST = guardedRoute<GemetQueryRequest>(
  {
    route: 'api:gemet:query',
    methods: ['POST'],
    rateLimit: 30,
    schema: gemetQueryRequestSchema,
    identityScopes: ['gemet:read'],
    cacheControl: 'no-store',
  },
  async ({ body }) => {
    const result = await queryNode(body.id, body.options);
    if (!result.ok) {
      return NextResponse.json({ ok: false, reason: result.reason }, { status: 404 });
    }
    return NextResponse.json({ ok: true, record: result.record, source: result.source });
  },
);

/* ------------------------------------------------------------------ */
/* PUT /api/gemet/query — alta de una réplica del grafo                */
/* ------------------------------------------------------------------ */
/* Exige scope `gemet:write`. Registra un endpoint remoto del Data     */
/* Fabric para consultas en consistencia estricta.                     */
/* ------------------------------------------------------------------ */
export const PUT = guardedRoute<{ endpoint: string }>(
  {
    route: 'api:gemet:replicas:add',
    methods: ['PUT'],
    rateLimit: 10,
    identityScopes: ['gemet:write'],
    cacheControl: 'no-store',
  },
  async ({ body }) => {
    if (typeof body?.endpoint !== 'string' || body.endpoint.length === 0) {
      return NextResponse.json({ ok: false, error: 'endpoint es requerido.' }, { status: 400 });
    }
    addReplica(body.endpoint);
    return NextResponse.json({ ok: true, replicas: listReplicas() }, { status: 201 });
  },
);
