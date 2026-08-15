import { useMemo } from "react";

export interface GeoPoint {
  id: string;
  lat: number;
  lng: number;
}

export interface ClusterOptions {
  precision?: number;
}

export function clusterGeoPoints(points: GeoPoint[], options: ClusterOptions = {}) {
  const precision = options.precision ?? 10;
  const clusters = new Map<string, GeoPoint[]>();

  for (const point of points) {
    if (!Number.isFinite(point.lat) || !Number.isFinite(point.lng)) continue;

    const key = `${Math.floor(point.lat * precision)}-${Math.floor(point.lng * precision)}`;
    if (!clusters.has(key)) clusters.set(key, []);
    clusters.get(key)?.push(point);
  }

  return [...clusters.values()];
}

export function useGeoCluster(points: GeoPoint[], options: ClusterOptions = {}) {
  const precision = options.precision ?? 10;
  return useMemo(() => clusterGeoPoints(points, { precision }), [points, precision]);
}
