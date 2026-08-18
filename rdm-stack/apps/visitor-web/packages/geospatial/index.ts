export interface Coordinates {
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

export interface GeoFeature {
  type: "point" | "polygon" | "linestring";
  coordinates: number[] | number[][] | number[][][];
  properties?: Record<string, unknown>;
}

const EARTH_RADIUS_KM = 6371;
const EARTH_RADIUS_M = 6371000;

export function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

export function haversineDistance(a: Coordinates, b: Coordinates): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLng * sinLng;
  return 2 * EARTH_RADIUS_KM * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function haversineDistanceM(a: Coordinates, b: Coordinates): number {
  return haversineDistance(a, b) * 1000;
}

export function bearing(a: Coordinates, b: Coordinates): number {
  const dLng = toRad(b.lng - a.lng);
  const y = Math.sin(dLng) * Math.cos(toRad(b.lat));
  const x =
    Math.cos(toRad(a.lat)) * Math.sin(toRad(b.lat)) -
    Math.sin(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

export function midpoint(a: Coordinates, b: Coordinates): Coordinates {
  return {
    lat: (a.lat + b.lat) / 2,
    lng: (a.lng + b.lng) / 2,
    alt: a.alt !== undefined && b.alt !== undefined ? (a.alt + b.alt) / 2 : undefined,
  };
}

export function boundingBoxFromCenter(center: Coordinates, radiusKm: number): BoundingBox {
  const latDelta = (radiusKm / EARTH_RADIUS_KM) * (180 / Math.PI);
  const lngDelta =
    ((radiusKm / EARTH_RADIUS_KM) * (180 / Math.PI)) / Math.cos(toRad(center.lat));
  return {
    minLat: center.lat - latDelta,
    maxLat: center.lat + latDelta,
    minLng: center.lng - lngDelta,
    maxLng: center.lng + lngDelta,
  };
}

export function pointInBoundingBox(point: Coordinates, box: BoundingBox): boolean {
  return (
    point.lat >= box.minLat &&
    point.lat <= box.maxLat &&
    point.lng >= box.minLng &&
    point.lng <= box.maxLng
  );
}

export function destinationPoint(origin: Coordinates, distanceKm: number, bearingDeg: number): Coordinates {
  const bearingRad = toRad(bearingDeg);
  const angularDist = distanceKm / EARTH_RADIUS_KM;
  const latRad = Math.asin(
    Math.sin(toRad(origin.lat)) * Math.cos(angularDist) +
      Math.cos(toRad(origin.lat)) * Math.sin(angularDist) * Math.cos(bearingRad),
  );
  const lngRad =
    toRad(origin.lng) +
    Math.atan2(
      Math.sin(bearingRad) * Math.sin(angularDist) * Math.cos(toRad(origin.lat)),
      Math.cos(angularDist) - Math.sin(toRad(origin.lat)) * Math.sin(latRad),
    );
  return { lat: toDeg(latRad), lng: toDeg(lngRad) };
}

export function approximateAltitude(pressureHPa: number, seaLevelPressure = 1013.25): number {
  return 44330 * (1 - Math.pow(pressureHPa / seaLevelPressure, 1 / 5.255));
}

export function geoJsonFeature(
  type: GeoFeature["type"],
  coordinates: GeoFeature["coordinates"],
  properties?: Record<string, unknown>,
): GeoFeature {
  return { type, coordinates, properties };
}
