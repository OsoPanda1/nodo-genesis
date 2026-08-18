import type { TwinGraphEdge, TwinGraphNode, TwinRelationKind } from './twin-types';

export type TwinGraph = {
  nodes: TwinGraphNode[];
  edges: TwinGraphEdge[];
};

export function buildTwinGraph(nodes: TwinGraphNode[], edges: TwinGraphEdge[]): TwinGraph {
  return { nodes, edges };
}

export function adjacencyMap(graph: TwinGraph): Map<string, TwinGraphEdge[]> {
  const map = new Map<string, TwinGraphEdge[]>();
  for (const edge of graph.edges) {
    const arr = map.get(edge.from) ?? [];
    arr.push(edge);
    map.set(edge.from, arr);
  }
  return map;
}

export function relatedNodes(graph: TwinGraph, nodeId: string): TwinGraphNode[] {
  const outgoing = graph.edges.filter((e) => e.from === nodeId || e.to === nodeId);
  const relatedIds = new Set(outgoing.flatMap((e) => [e.from, e.to]).filter((id) => id !== nodeId));
  return graph.nodes.filter((n) => relatedIds.has(n.id));
}

export function neighbors(graph: TwinGraph, nodeId: string): string[] {
  const outgoing = graph.edges.filter((e) => e.from === nodeId || e.to === nodeId);
  return [...new Set(outgoing.flatMap((e) => [e.from, e.to]).filter((id) => id !== nodeId))];
}

export function outgoingKinds(graph: TwinGraph, nodeId: string): TwinRelationKind[] {
  return [...new Set(graph.edges.filter((e) => e.from === nodeId).map((e) => e.kind))];
}

const EARTH_RADIUS_M = 6_371_000;

function haversineMeters(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

export function nearestNode(
  graph: TwinGraph,
  lat: number,
  lng: number,
): { node: TwinGraphNode; distanceMeters: number } | null {
  let best: TwinGraphNode | null = null;
  let bestDistance = Infinity;
  for (const node of graph.nodes) {
    if (node.lat === undefined || node.lng === undefined) continue;
    const distance = haversineMeters(lat, lng, node.lat, node.lng);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = node;
    }
  }
  return best ? { node: best, distanceMeters: Math.round(bestDistance) } : null;
}

export function addEdge(
  graph: TwinGraph,
  from: string,
  to: string,
  kind: TwinRelationKind,
  weight?: number,
): TwinGraph {
  const id = `${from}->${to}:${kind}`;
  if (graph.edges.some((e) => e.id === id)) return graph;
  return { nodes: graph.nodes, edges: [...graph.edges, { id, from, to, kind, weight }] };
}
