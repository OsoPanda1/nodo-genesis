import type { Coordenadas } from "@/core/models";
import { fastDistance } from "@/core/geo/haversine.fast";

export interface SpatialPoint<T = unknown> {
  id: string;
  coords: Coordenadas;
  data?: T;
}

export interface SpatialIndex<T = unknown> {
  upsert(point: SpatialPoint<T>): void;
  nearest(coords: Coordenadas): SpatialPoint<T> | null;
  all(): SpatialPoint<T>[];
}

// O(n) baseline keeping interface ready for KD-Tree/R-Tree swap.
export class LinearSpatialIndex<T = unknown> implements SpatialIndex<T> {
  private points = new Map<string, SpatialPoint<T>>();

  upsert(point: SpatialPoint<T>) {
    this.points.set(point.id, point);
  }

  nearest(coords: Coordenadas): SpatialPoint<T> | null {
    let best: SpatialPoint<T> | null = null;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (const point of this.points.values()) {
      const distance = fastDistance(coords, point.coords);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = point;
      }
    }

    return best;
  }

  all() {
    return [...this.points.values()];
  }
}
