import type { Coordenadas } from "@/core/models";

export function withinBBox(a: Coordenadas, b: Coordenadas, meters: number) {
  const deg = meters / 111_320;
  return Math.abs(a.lat - b.lat) <= deg && Math.abs(a.lng - b.lng) <= deg;
}
