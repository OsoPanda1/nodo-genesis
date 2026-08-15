import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

const EARTH_RADIUS_KM = 6371;

export interface GeoLocation {
  latitude: number;
  longitude: number;
}

export interface TerritorialCell {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distanceKm?: number;
  metadata: Record<string, any>;
}

export function calculateHaversineDistance(pointA: GeoLocation, pointB: GeoLocation): number {
  const dLat = ((pointB.latitude - pointA.latitude) * Math.PI) / 180;
  const dLon = ((pointB.longitude - pointA.longitude) * Math.PI) / 180;
  const lat1Rad = (pointA.latitude * Math.PI) / 180;
  const lat2Rad = (pointB.latitude * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function getNearbyTerritorialCells(
  userLocation: GeoLocation,
  radiusKm = 10,
  maxResults = 20,
): Promise<TerritorialCell[]> {
  if (!userLocation || typeof userLocation.latitude !== "number" || typeof userLocation.longitude !== "number") {
    throw new Error("Invalid user location coordinates");
  }

  try {
    const latDelta = radiusKm / 111;
    const lonDelta = radiusKm / (111 * Math.cos((userLocation.latitude * Math.PI) / 180));
    const minLat = userLocation.latitude - latDelta;
    const maxLat = userLocation.latitude + latDelta;
    const minLon = userLocation.longitude - lonDelta;
    const maxLon = userLocation.longitude + lonDelta;

    const { data: rawCells, error } = await supabase
      .from("territorial_cells")
      .select("id, name, latitude, longitude, metadata")
      .gte("latitude", minLat)
      .lte("latitude", maxLat)
      .gte("longitude", minLon)
      .lte("longitude", maxLon)
      .limit(maxResults * 3);

    if (error) throw new Error(`Database error: ${error.message}`);
    if (!rawCells || rawCells.length === 0) return [];

    const processed: TerritorialCell[] = rawCells
      .map((cell: any) => {
        const dist = calculateHaversineDistance(userLocation, {
          latitude: Number(cell.latitude),
          longitude: Number(cell.longitude),
        });
        return {
          id: String(cell.id),
          name: String(cell.name),
          latitude: Number(cell.latitude),
          longitude: Number(cell.longitude),
          distanceKm: parseFloat(dist.toFixed(3)),
          metadata: cell.metadata || {},
        };
      })
      .filter((c) => (c.distanceKm ?? Infinity) <= radiusKm)
      .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0))
      .slice(0, maxResults);

    return processed;
  } catch (error: any) {
    console.error("CRITICAL: territorial-intelligence.ts ->", error.message);
    return [];
  }
}
