import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { addIncident, getIncident, listIncidents, updateIncident } from '@/lib/city/city-event-bus';
import { autoTriageIncident, rankIncidents } from '@/lib/city/city-incident-engine';
import type { CityIncident } from '@/lib/city/city-types';
import { cityIncidentSchema, cityIncidentPatchSchema, type CityIncidentInput, type CityIncidentPatchInput } from '@/lib/city/api-contracts';

/* Ruta migrada al route-guard único y a contratos zod
   (cityIncidentSchema / cityIncidentPatchSchema). */

export const GET = guardedRoute(
  {
    route: 'api:city:incidents',
    methods: ['GET'],
    rateLimit: 50,
    json: false,
  },
  async () => {
    const incidents = rankIncidents(listIncidents());
    return NextResponse.json({ ok: true, incidents });
  },
);

export const POST = guardedRoute<CityIncidentInput>(
  {
    route: 'api:city:incidents',
    methods: ['POST'],
    rateLimit: 50,
    schema: cityIncidentSchema,
  },
  async ({ body }) => {
    const draft: CityIncident = {
      id: `inc-${Math.random().toString(36).slice(2, 8)}`,
      domain: body.domain,
      title: body.title,
      description: body.description ?? '',
      severity: body.severity,
      status: 'open',
      source: body.source,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: body.tags ?? [],
      relatedEntityIds: body.relatedEntityIds ?? [],
    };
    const incident = addIncident(autoTriageIncident(draft));

    if (body.id) {
      const existing = getIncident(body.id);
      if (existing && incident) {
        return NextResponse.json({ ok: true, incident: existing }, { status: 200 });
      }
    }

    return NextResponse.json({ ok: true, incident }, { status: 201 });
  },
);

export const PATCH = guardedRoute<CityIncidentPatchInput>(
  {
    route: 'api:city:incidents',
    methods: ['PATCH'],
    rateLimit: 50,
    schema: cityIncidentPatchSchema,
  },
  async ({ body }) => {
    const patch: Parameters<typeof updateIncident>[1] = {};
    if (body.status) patch.status = body.status;
    if (body.severity) patch.severity = body.severity;
    if (body.description !== undefined) patch.description = body.description;
    if (body.tags !== undefined) patch.tags = body.tags;

    const updated = updateIncident(body.id, patch);
    if (!updated) return NextResponse.json({ ok: false, error: 'Incidente no encontrado.' }, { status: 404 });
    return NextResponse.json({ ok: true, incident: updated });
  },
);
