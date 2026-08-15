import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { introspectApiKeySchema, type IntrospectApiKeyInput } from '@/lib/security/identity';
import { authenticate } from '@/lib/security/identity/registry';

export const runtime = 'nodejs';

/* ------------------------------------------------------------------ */
/* POST /api/identity/introspect — verificación de una API key        */
/* ------------------------------------------------------------------ */
/* Autentica una clave presentada y devuelve su identidad y scopes.    */
/* Útil para gates, islas y consumidores que necesitan verificar       */
/* credenciales del Nodo sin conocer el registro.                      */
/* ------------------------------------------------------------------ */
export const POST = guardedRoute<IntrospectApiKeyInput>(
  {
    route: 'api:identity:introspect',
    methods: ['POST'],
    rateLimit: 30,
    schema: introspectApiKeySchema,
    cacheControl: 'no-store',
  },
  async ({ body }) => {
    const auth = authenticate(body.apiKey);
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: auth.reason }, { status: 401 });
    }
    return NextResponse.json({
      ok: true,
      valid: true,
      keyId: auth.record.id,
      name: auth.record.name,
      owner: auth.record.owner,
      scopes: auth.record.scopes,
      expiresAt: auth.record.expiresAt,
    });
  },
);
