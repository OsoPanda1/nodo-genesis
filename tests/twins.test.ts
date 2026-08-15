import { describe, it, expect } from 'vitest';
import { getTwinInstances, getTwinEdges } from '@/lib/twins/twin-store';
import { buildTwinGraph, adjacencyMap, relatedNodes, neighbors } from '@/lib/twins/twin-graph';
import { queryTwinInstances, countByStatus } from '@/lib/twins/twin-queries';
import type { TwinGraphNode } from '@/lib/twins/twin-types';

function buildGraph() {
  const nodes: TwinGraphNode[] = getTwinInstances().map((instance) => ({
    id: instance.id,
    name: instance.name,
    type: instance.modelId,
    status: instance.status,
    lat: instance.lat,
    lng: instance.lng,
  }));
  return buildTwinGraph(nodes, getTwinEdges());
}

describe('twin-store · gemelos sembrados', () => {
  it('tiene instancias de los 5 dominios', () => {
    const instances = getTwinInstances();
    const modelIds = new Set(instances.map((i) => i.modelId));
    expect(instances.length).toBeGreaterThanOrEqual(5);
    for (const domain of ['EnergyGrid', 'WaterNetwork', 'Building', 'Vehicle', 'PublicSpace']) {
      expect(modelIds.has(`dtmi:rdm:twin:${domain};1`)).toBe(true);
    }
  });

  it('instancias con telemetría y estado', () => {
    for (const instance of getTwinInstances()) {
      expect(instance.status).toMatch(/healthy|warning|critical|offline/);
      expect(typeof instance.telemetry).toBe('object');
    }
  });
});

describe('twin-graph · grafo de relaciones', () => {
  it('construye grafo y mapa de adyacencia', () => {
    const graph = buildGraph();
    expect(graph.nodes.length).toBeGreaterThanOrEqual(5);
    expect(graph.edges.length).toBeGreaterThanOrEqual(6);
    const adj = adjacencyMap(graph);
    expect(adj.size).toBeGreaterThanOrEqual(4);
  });

  it('relatedNodes devuelve vecinos con relación', () => {
    const graph = buildGraph();
    const related = relatedNodes(graph, 'sub-rdm');
    expect(related.length).toBeGreaterThanOrEqual(1);
    expect(related.map((n) => n.id).sort()).toEqual(expect.arrayContaining(neighbors(graph, 'sub-rdm')));
  });
});

describe('twin-queries · consultas', () => {
  it('filtra por estado y cuenta por estado', () => {
    const instances = getTwinInstances();
    const byStatus = queryTwinInstances(instances, { status: 'healthy' });
    expect(Array.isArray(byStatus)).toBe(true);
    const counts = countByStatus(instances);
    expect(Object.values(counts).reduce((s, n) => s + n, 0)).toBe(instances.length);
  });
});
