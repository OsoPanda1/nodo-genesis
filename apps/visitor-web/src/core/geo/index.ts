/**
 * RDM Digital - Geo Utilities GEN-7+
 * Optimizaciones geoespaciales con cache LRU y TTL
 */

import type { Coordenadas, BoundingBox, GeoCacheEntry, LRUCacheConfig } from "../models";

// ============================================================================
// CONSTANTES
// ============================================================================

const EARTH_RADIUS_KM = 6371;
const DEG_TO_RAD = Math.PI / 180;

// ============================================================================
// FUNCIONES GEOESPACIALES
// ============================================================================

/**
 * Filtro rapido por BoundingBox O(1)
 */
export function withinBBox(coords: Coordenadas, bbox: BoundingBox): boolean {
  return (
    coords.lat >= bbox.minLat &&
    coords.lat <= bbox.maxLat &&
    coords.lng >= bbox.minLng &&
    coords.lng <= bbox.maxLng
  );
}

/**
 * Calculo de distancia Haversine optimizado
 * Retorna distancia en metros
 */
export function fastDistance(a: Coordenadas, b: Coordenadas): number {
  const dLat = (b.lat - a.lat) * DEG_TO_RAD;
  const dLng = (b.lng - a.lng) * DEG_TO_RAD;

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);

  const aVal =
    sinDLat * sinDLat +
    Math.cos(a.lat * DEG_TO_RAD) * Math.cos(b.lat * DEG_TO_RAD) * sinDLng * sinDLng;

  const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));

  return EARTH_RADIUS_KM * c * 1000; // Convertir a metros
}

/**
 * Genera BoundingBox alrededor de un punto con radio en metros
 */
export function createBBox(center: Coordenadas, radiusMeters: number): BoundingBox {
  const radiusKm = radiusMeters / 1000;
  const latDelta = radiusKm / 111.32; // 1 grado lat ≈ 111.32 km
  const lngDelta = radiusKm / (111.32 * Math.cos(center.lat * DEG_TO_RAD));

  return {
    minLat: center.lat - latDelta,
    maxLat: center.lat + latDelta,
    minLng: center.lng - lngDelta,
    maxLng: center.lng + lngDelta,
  };
}

/**
 * Calcula el bearing (direccion) entre dos puntos
 */
export function calculateBearing(from: Coordenadas, to: Coordenadas): number {
  const dLng = (to.lng - from.lng) * DEG_TO_RAD;
  const fromLatRad = from.lat * DEG_TO_RAD;
  const toLatRad = to.lat * DEG_TO_RAD;

  const y = Math.sin(dLng) * Math.cos(toLatRad);
  const x =
    Math.cos(fromLatRad) * Math.sin(toLatRad) -
    Math.sin(fromLatRad) * Math.cos(toLatRad) * Math.cos(dLng);

  const bearing = Math.atan2(y, x) * (180 / Math.PI);
  return (bearing + 360) % 360;
}

// ============================================================================
// CACHE LRU CON TTL
// ============================================================================

export class GeoLRUCache {
  private cache: Map<string, GeoCacheEntry>;
  private readonly maxSize: number;
  private readonly ttlMs: number;

  constructor(config: LRUCacheConfig) {
    this.cache = new Map();
    this.maxSize = config.maxSize;
    this.ttlMs = config.ttlMs;
  }

  private makeKey(a: Coordenadas, b: Coordenadas): string {
    // Redondear a 5 decimales para reducir variaciones insignificantes
    const aKey = `${a.lat.toFixed(5)},${a.lng.toFixed(5)}`;
    const bKey = `${b.lat.toFixed(5)},${b.lng.toFixed(5)}`;
    // Ordenar para que (a,b) y (b,a) sean la misma clave
    return aKey < bKey ? `${aKey}|${bKey}` : `${bKey}|${aKey}`;
  }

  get(a: Coordenadas, b: Coordenadas): number | null {
    const key = this.makeKey(a, b);
    const entry = this.cache.get(key);

    if (!entry) return null;

    // Verificar TTL
    if (Date.now() > entry.expiresAt.getTime()) {
      this.cache.delete(key);
      return null;
    }

    // Move to end (LRU behavior)
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.distance;
  }

  set(a: Coordenadas, b: Coordenadas, distance: number): void {
    const key = this.makeKey(a, b);

    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }

    const now = new Date();
    this.cache.set(key, {
      key,
      distance,
      calculatedAt: now,
      expiresAt: new Date(now.getTime() + this.ttlMs),
    });
  }

  /**
   * Obtiene distancia del cache o calcula y cachea
   */
  getOrCompute(a: Coordenadas, b: Coordenadas): number {
    const cached = this.get(a, b);
    if (cached !== null) return cached;

    const distance = fastDistance(a, b);
    this.set(a, b, distance);
    return distance;
  }

  get size(): number {
    return this.cache.size;
  }

  get capacity(): number {
    return this.maxSize;
  }

  clear(): void {
    this.cache.clear();
  }

  /**
   * Limpia entradas expiradas
   */
  prune(): number {
    const now = Date.now();
    let pruned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt.getTime()) {
        this.cache.delete(key);
        pruned++;
      }
    }

    return pruned;
  }
}

// ============================================================================
// FILTRO DE MOVIMIENTO (EMA)
// ============================================================================

export class MovementFilter {
  private lastSpeed: number = 0;
  private readonly alpha: number;

  constructor(alpha: number = 0.3) {
    this.alpha = Math.max(0.1, Math.min(0.9, alpha));
  }

  /**
   * Aplica filtro EMA (Exponential Moving Average) a la velocidad
   */
  smooth(rawSpeed: number): number {
    this.lastSpeed = this.alpha * rawSpeed + (1 - this.alpha) * this.lastSpeed;
    return this.lastSpeed;
  }

  get currentSpeed(): number {
    return this.lastSpeed;
  }

  get alphaValue(): number {
    return this.alpha;
  }

  reset(): void {
    this.lastSpeed = 0;
  }
}

// ============================================================================
// UTILIDADES ADICIONALES
// ============================================================================

/**
 * Encuentra el punto mas cercano de una lista
 */
export function findNearestPoint<T extends { coords: Coordenadas }>(
  from: Coordenadas,
  points: T[],
  geoCache?: GeoLRUCache,
): { point: T; distance: number } | null {
  if (points.length === 0) return null;

  let nearest: T | null = null;
  let minDistance = Infinity;

  for (const point of points) {
    const distance = geoCache
      ? geoCache.getOrCompute(from, point.coords)
      : fastDistance(from, point.coords);

    if (distance < minDistance) {
      minDistance = distance;
      nearest = point;
    }
  }

  return nearest ? { point: nearest, distance: minDistance } : null;
}

/**
 * Filtra puntos dentro de un radio
 */
export function filterPointsInRadius<T extends { coords: Coordenadas }>(
  center: Coordenadas,
  points: T[],
  radiusMeters: number,
  geoCache?: GeoLRUCache,
): Array<{ point: T; distance: number }> {
  const bbox = createBBox(center, radiusMeters);

  return points
    .filter((p) => withinBBox(p.coords, bbox))
    .map((point) => ({
      point,
      distance: geoCache
        ? geoCache.getOrCompute(center, point.coords)
        : fastDistance(center, point.coords),
    }))
    .filter(({ distance }) => distance <= radiusMeters)
    .sort((a, b) => a.distance - b.distance);
}

/**
 * Calcula velocidad entre dos puntos dado un intervalo de tiempo
 */
export function calculateSpeed(
  from: Coordenadas,
  to: Coordenadas,
  timeDeltaMs: number,
  geoCache?: GeoLRUCache,
): number {
  if (timeDeltaMs <= 0) return 0;

  const distance = geoCache ? geoCache.getOrCompute(from, to) : fastDistance(from, to);

  return distance / (timeDeltaMs / 1000); // m/s
}
