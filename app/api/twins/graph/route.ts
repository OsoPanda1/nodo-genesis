import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { getTwinEdges, getTwinInstances } from '@/lib/twins/twin-store';
import { buildTwinGraph, nearestNode } from '@/lib/twins/twin-graph';
import type { TwinGraphNode } from '@/lib/twins/twin-types';

/* Ruta migrada al route-guard único (antes duplicaba enforceTrust
   con assertServerOnly + verifyOrigin + rateLimit). */

export const GET = guardedRoute(
  {
    route: 'api:twins:graph',
    methods: ['GET'],
    rateLimit: 40,
    json: false,
  },
  async ({ req }) => {
    const instances = getTwinInstances();
    const nodes: TwinGraphNode[] = instances.map((instance) => ({
      id: instance.id,
      type: instance.modelId,
      name: instance.name,
      lat: instance.lat,
      lng: instance.lng,
      meta: { status: instance.status },
    }));
    const edges = getTwinEdges();
    const graph = buildTwinGraph(nodes, edges);

    const near = req.nextUrl.searchParams.get('near');
    if (near) {
      const [lat, lng] = near.split(',').map(Number);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        const closest = nearestNode(graph, lat, lng);
        return NextResponse.json({ ok: true, graph, nearest: closest });
      }
    }
    return NextResponse.json({ ok: true, graph });
  },
);
