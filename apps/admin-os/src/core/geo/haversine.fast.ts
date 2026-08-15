import type { Coordenadas } from "@/core/models";

const R = 6_371e3;
const TO_RAD = 0.0174533;

export function fastDistance(a: Coordenadas, b: Coordenadas) {
  const dLat = (b.lat - a.lat) * TO_RAD;
  const dLng = (b.lng - a.lng) * TO_RAD;
  const lat1 = a.lat * TO_RAD;
  const lat2 = b.lat * TO_RAD;

  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}
