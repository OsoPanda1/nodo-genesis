import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import {
  citemeshRegisterNodeRequestSchema,
  type CitemeshRegisterNodeRequest,
} from '@/lib/citemesh';
import { registerNode, listNodes, CITEMESH_NODE_INVALID_CREDENTIALS } from '@/lib/citemesh';

export const runtime = 'nodejs';

/* ------------------------------------------------------------------ */
/* POST /api/citemesh/nodes — registro de un nodo P2P en la malla      */
/* ------------------------------------------------------------------ */
/* Exige scope `citemesh:write`. Lanza 401 si la credencial derivada   */
/* de la p2pPublicKey no corresponde (CITEMESH_NODE_INVALID_CREDENTIALS). */
/* ------------------------------------------------------------------ */
export const POST = guardedRoute<CitemeshRegisterNodeRequest>(
  {
    route: 'api:citemesh:nodes:register',
    methods: ['POST'],
    rateLimit: 10,
    schema: citemeshRegisterNodeRequestSchema,
    identityScopes: ['citemesh:write'],
    cacheControl: 'no-store',
  },
  async ({ body }) => {
    try {
      const node = registerNode(body.config, { nodeSecret: body.nodeSecret });
      return NextResponse.json({ ok: true, node }, { status: 201 });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message === CITEMESH_NODE_INVALID_CREDENTIALS) {
        return NextResponse.json(
          { ok: false, error: 'Credenciales de registro inválidas.' },
          { status: 401 },
        );
      }
      return NextResponse.json({ ok: false, error: 'Registro rechazado por el contrato.' }, { status: 400 });
    }
  },
);

/* ------------------------------------------------------------------ */
/* GET /api/citemesh/nodes — nodos registrados en la malla             */
/* ------------------------------------------------------------------ */
/* Requiere scope `citemesh:read`. Solo metadatos operativos.          */
/* ------------------------------------------------------------------ */
export const GET = guardedRoute(
  {
    route: 'api:citemesh:nodes:list',
    methods: ['GET'],
    rateLimit: 20,
    json: false,
    identityScopes: ['citemesh:read'],
    cacheControl: 'no-store',
  },
  async () => {
    return NextResponse.json({ ok: true, nodes: listNodes() });
  },
);
