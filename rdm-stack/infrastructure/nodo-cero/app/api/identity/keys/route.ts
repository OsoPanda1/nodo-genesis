import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { createApiKeySchema, type CreateApiKeyInput } from '@/lib/security/identity';
import { createKey, listKeys, blindKey } from '@/lib/security/identity/registry';

export const runtime = 'nodejs';

/* ------------------------------------------------------------------ */
/* POST /api/identity/keys — emisión de una API key nativa            */
/* ------------------------------------------------------------------ */
/* Requiere scope `admin:keys` en el registro soberano. El secreto se  */
/* devuelve UNA sola vez: la respuesta muestra la clave en claro para  */
/* que el emisor la copie y NO se vuelve a mostrar jamás.              */
/* ------------------------------------------------------------------ */
export const POST = guardedRoute<CreateApiKeyInput>(
  {
    route: 'api:identity:keys:create',
    methods: ['POST'],
    rateLimit: 10,
    schema: createApiKeySchema,
    identityScopes: ['admin:keys'],
    cacheControl: 'no-store',
  },
  async ({ body }) => {
    const { ok, apiKey, record } = createKey({
      name: body.name,
      description: body.description,
      owner: body.owner,
      scopes: body.scopes,
      expiresInDays: body.expiresInDays,
    });
    if (!ok) return NextResponse.json({ ok: false, error: 'No se pudo emitir la clave.' }, { status: 500 });

    return NextResponse.json(
      {
        ok: true,
        apiKey,
        apiKeyOnce: true,
        blind: blindKey(apiKey),
        record,
      },
      { status: 201 },
    );
  },
);

/* ------------------------------------------------------------------ */
/* GET /api/identity/keys — listado público del registro              */
/* ------------------------------------------------------------------ */
/* Devuelve SOLO metadatos: nunca hashes ni secretos.                  */
/* ------------------------------------------------------------------ */
export const GET = guardedRoute(
  {
    route: 'api:identity:keys:list',
    methods: ['GET'],
    rateLimit: 20,
    json: false,
    identityScopes: ['admin:keys'],
    cacheControl: 'no-store',
  },
  async () => {
    const keys = listKeys();
    return NextResponse.json({ ok: true, keys });
  },
);
