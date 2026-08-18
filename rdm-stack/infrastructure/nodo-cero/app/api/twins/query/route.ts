import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { getTwinInstances } from '@/lib/twins/twin-store';
import { queryTwinInstances } from '@/lib/twins/twin-queries';
import type { TwinQueryFilters } from '@/lib/twins/twin-queries';

/* Ruta migrada al route-guard único (antes duplicaba enforceTrust
   con assertServerOnly + verifyOrigin + rateLimit). */

function filtersFromSearchParams(params: URLSearchParams): TwinQueryFilters {
  const filters: TwinQueryFilters = {};
  const domain = params.get('domain');
  const status = params.get('status');
  const modelId = params.get('modelId');
  const text = params.get('q');
  if (domain) filters.domain = domain as TwinQueryFilters['domain'];
  if (status) filters.status = status as TwinQueryFilters['status'];
  if (modelId) filters.modelId = modelId;
  if (text) filters.text = text;
  return filters;
}

export const GET = guardedRoute(
  {
    route: 'api:twins:query',
    methods: ['GET'],
    rateLimit: 40,
    json: false,
  },
  async ({ req }) => {
    const filters = filtersFromSearchParams(req.nextUrl.searchParams);
    const instances = queryTwinInstances(getTwinInstances(), filters);
    return NextResponse.json({ ok: true, filters, count: instances.length, instances });
  },
);
