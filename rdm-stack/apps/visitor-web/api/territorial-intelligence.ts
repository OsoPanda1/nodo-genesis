export interface GeoPoint {
  lat: number;
  lng: number;
  alt?: number;
}

export interface BoundingBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export interface TerritorialInput {
  point: GeoPoint;
  radiusKm?: number;
  filters?: Record<string, unknown>;
}

export interface TerritorialOutput {
  zone: string;
  nearby: Array<{ id: string; name: string; distanceKm: number }>;
  risk: { level: string; factors: string[] };
  metadata: {
    processingTimeMs: number;
    dataVersion: string;
  };
}

const HAVERSINE_RADIUS_KM = 6371;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function haversineDistance(a: GeoPoint, b: GeoPoint): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLng * sinLng;
  return 2 * HAVERSINE_RADIUS_KM * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function pointInBoundingBox(point: GeoPoint, box: BoundingBox): boolean {
  return (
    point.lat >= box.minLat &&
    point.lat <= box.maxLat &&
    point.lng >= box.minLng &&
    point.lng <= box.maxLng
  );
}

export function boundingBoxFromCenter(center: GeoPoint, radiusKm: number): BoundingBox {
  const latDelta = (radiusKm / HAVERSINE_RADIUS_KM) * (180 / Math.PI);
  const lngDelta =
    ((radiusKm / HAVERSINE_RADIUS_KM) * (180 / Math.PI)) /
    Math.cos(toRad(center.lat));
  return {
    minLat: center.lat - latDelta,
    maxLat: center.lat + latDelta,
    minLng: center.lng - lngDelta,
    maxLng: center.lng + lngDelta,
  };
}

export function midpoint(a: GeoPoint, b: GeoPoint): GeoPoint {
  return {
    lat: (a.lat + b.lat) / 2,
    lng: (a.lng + b.lng) / 2,
    alt: a.alt !== undefined && b.alt !== undefined ? (a.alt + b.alt) / 2 : undefined,
  };
}

export function processTerritorial(input: TerritorialInput): TerritorialOutput {
  const start = Date.now();
  const box = input.radiusKm
    ? boundingBoxFromCenter(input.point, input.radiusKm)
    : null;

  return {
    zone: box ? `radius-${input.radiusKm}km` : `point-${input.point.lat}-${input.point.lng}`,
    nearby: [],
    risk: { level: "low", factors: [] },
    metadata: {
      processingTimeMs: Date.now() - start,
      dataVersion: "1.0.0",
    },
  };
}
