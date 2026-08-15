import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { getModels, registerModel } from '@/lib/twins/twin-store';
import { TWIN_MODELS } from '@/lib/twins/dtdl';
import { twinModelSchema, type TwinModelInput } from '@/lib/twins/api-contracts';

/* Ruta migrada al route-guard único y a contrato zod (twinModelSchema). */

export const GET = guardedRoute(
  {
    route: 'api:twins:models',
    methods: ['GET'],
    rateLimit: 30,
    json: false,
  },
  async ({ req }) => {
    if (getModels().length === 0) {
      for (const model of TWIN_MODELS) {
        registerModel({
          id: String(model['@id']),
          dtmi: String(model['@id']),
          name: String(model.displayName),
          version: 1,
          domain: model['@id'].includes('Building') ? 'building' : 'custom',
          schema: model,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    const custom = getModels();
    const domain =
      typeof req.nextUrl.searchParams.get('domain') === 'string' ? req.nextUrl.searchParams.get('domain') : null;
    const models = domain ? custom.filter((m) => m.domain === domain) : custom;
    return NextResponse.json({ ok: true, models });
  },
);

export const POST = guardedRoute<TwinModelInput>(
  {
    route: 'api:twins:models',
    methods: ['POST'],
    rateLimit: 30,
    schema: twinModelSchema,
  },
  async ({ body }) => {
    const model = {
      id: body.id ?? body.dtmi,
      dtmi: body.dtmi,
      name: body.name,
      version: body.version,
      domain: body.domain,
      schema: body.schema,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    registerModel(model);
    return NextResponse.json({ ok: true, model });
  },
);
