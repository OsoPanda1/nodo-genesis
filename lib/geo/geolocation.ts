/* ================================================================== */
/* GEOLOCALIZACIÓN — Posicionamiento en tiempo real del Nodo Cero     */
/* ================================================================== */
/* Wrapper del API de geolocalización del navegador con watchPosition  */
/* en tiempo real, cálculo de distancia y foco territorial (Real del   */
/* Monte 20.1398, -98.6738). Lógica pura testeable.                    */
/* ================================================================== */

export interface GeoPosition {
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy: number;
  heading: number | null;
  speed: number | null;
  at: number;
}

export const RDM_CENTER = { latitude: 20.1398, longitude: -98.6738 } as const;

/** Fórmula de haversine (km). */
export function distanceKm(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): number {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function distanceToCenter(position: { latitude: number; longitude: number }): number {
  return distanceKm(position, RDM_CENTER);
}

export interface GeoWatchHandlers {
  onPosition?: (position: GeoPosition) => void;
  onError?: (code: number, message: string) => void;
}

export interface GeoWatchHandle {
  stop: () => void;
}

function toGeoPosition(pos: GeolocationPosition): GeoPosition {
  return {
    latitude: pos.coords.latitude,
    longitude: pos.coords.longitude,
    altitude: pos.coords.altitude,
    accuracy: pos.coords.accuracy,
    heading: pos.coords.heading,
    speed: pos.coords.speed,
    at: pos.timestamp,
  };
}

/** Inicia el seguimiento en tiempo real (solo cliente). */
export function watchPosition(
  handlers: GeoWatchHandlers,
  options: PositionOptions = { enableHighAccuracy: true, maximumAge: 1000, timeout: 10_000 },
): GeoWatchHandle | null {
  if (typeof window === 'undefined' || !('geolocation' in navigator)) {
    handlers.onError?.(0, 'Geolocalización no soportada en este dispositivo.');
    return null;
  }
  const id = navigator.geolocation.watchPosition(
    position => handlers.onPosition?.(toGeoPosition(position)),
    error => handlers.onError?.(error.code, error.message),
    options,
  );
  return {
    stop: () => navigator.geolocation.clearWatch(id),
  };
}

/** Una sola lectura de la posición actual. */
export function getCurrentPosition(): Promise<GeoPosition> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      reject(new Error('Geolocalización no soportada.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      position => resolve(toGeoPosition(position)),
      error => reject(new Error(`geo:${error.code} ${error.message}`)),
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 1000 },
    );
  });
}

/** Velocidad instantánea de movimiento (km/h). */
export function speedKmh(speed: number | null): number | null {
  if (speed === null || speed < 0) return null;
  return speed * 3.6;
}
