import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { rotateApiKeySchema, revokeApiKeySchema } from '@/lib/security/identity';
import { rotateKey, revokeKey, blindKey } from '@/lib/security/identity/registry';

export const runtime = 'nodejs';

/* ------------------------------------------------------------------ */
/* PATCH /api/identity/keys/[id] — rotación de una API key            */
/* ------------------------------------------------------------------ */
/* Revoca la generación actual y emite una nueva con los mismos        */
/* scopes. El secreto nuevo se muestra una sola vez.                   */
/* ------------------------------------------------------------------ */
export const PATCH = guardedRoute<{ reason?: string }>(
  {
    route: 'api:identity:keys:rotate',
    methods: ['PATCH'],
    rateLimit: 10,
    schema: rotateApiKeySchema,
    identityScopes: ['admin:keys'],
    cacheControl: 'no-store',
  },
  async ({ req, body }) => {
    const id = req.nextUrl.pathname.split('/').pop() ?? '';
    const result = rotateKey(id, body.reason ?? 'rotación programada');
    if (!result.ok) {
      const status = result.reason === 'Clave no encontrada.' ? 404 : 409;
      return NextResponse.json({ ok: false, error: result.reason }, { status });
    }
    return NextResponse.json({
      ok: true,
      apiKey: result.apiKey,
      apiKeyOnce: true,
      blind: blindKey(result.apiKey),
      record: result.record,
    });
  },
);

/* ------------------------------------------------------------------ */
/* DELETE /api/identity/keys/[id] — revocación inmediata              */
/* ------------------------------------------------------------------ */
export const DELETE = guardedRoute<{ reason?: string }>(
  {
    route: 'api:identity:keys:revoke',
    methods: ['DELETE'],
    rateLimit: 10,
    schema: revokeApiKeySchema,
    identityScopes: ['admin:keys'],
    cacheControl: 'no-store',
  },
  async ({ req, body }) => {
    const id = req.nextUrl.pathname.split('/').pop() ?? '';
    const result = revokeKey(id, body.reason ?? 'revocación administrativa');
    if (!result.ok) {
      const status = result.reason === 'Clave no encontrada.' ? 404 : 409;
      return NextResponse.json({ ok: false, error: result.reason }, { status });
    }
    return NextResponse.json({ ok: true, record: result.record });
  },
);
