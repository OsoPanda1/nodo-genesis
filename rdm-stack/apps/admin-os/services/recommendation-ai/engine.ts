export interface Coordinates {
  lat: number;
  lng: number;
}

export interface UserProfile {
  location: Coordinates;
  preferences: string[];
  localHour24: number;
}

export interface BusinessCandidate {
  id: string;
  name: string;
  category: string;
  tags: string[];
  location: Coordinates;
  rating: number;
  isOpen: boolean;
  trendScore: number;
}

export interface RankedBusiness extends BusinessCandidate {
  score: number;
  breakdown: {
    proximity: number;
    affinity: number;
    schedule: number;
    trend: number;
  };
  distanceKm: number;
}

const EARTH_RADIUS_KM = 6371;

function normalize(value: number, min: number, max: number) {
  if (max <= min) return 0;
  if (value <= min) return 0;
  if (value >= max) return 1;
  return (value - min) / (max - min);
}

function degreesToRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function haversineDistanceKm(a: Coordinates, b: Coordinates) {
  const lat1 = degreesToRadians(a.lat);
  const lat2 = degreesToRadians(b.lat);
  const deltaLat = lat2 - lat1;
  const deltaLng = degreesToRadians(b.lng - a.lng);

  const h =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return EARTH_RADIUS_KM * c;
}

function affinityScore(userTags: string[], businessTags: string[]) {
  const normalizedUserTags = new Set(userTags.map((t) => t.toLowerCase().trim()));
  if (!normalizedUserTags.size) return 0;

  const matches = businessTags.reduce((acc, tag) => {
    return normalizedUserTags.has(tag.toLowerCase().trim()) ? acc + 1 : acc;
  }, 0);

  return Math.min(matches / normalizedUserTags.size, 1);
}

function scheduleScore(isOpen: boolean, localHour24: number) {
  const normalizedHour = ((Math.floor(localHour24) % 24) + 24) % 24;
  const highIntentHour = normalizedHour >= 8 && normalizedHour <= 22;

  if (isOpen && highIntentHour) return 1;
  if (isOpen) return 0.7;
  return 0;
}

export function rankBusinesses(user: UserProfile, businesses: BusinessCandidate[]): RankedBusiness[] {
  return businesses
    .map((business) => {
      const distanceKm = haversineDistanceKm(user.location, business.location);

      // 0km => score máximo. 20km+ => score mínimo.
      const proximity = 1 - normalize(distanceKm, 0, 20);
      const affinity = affinityScore(user.preferences, business.tags);
      const schedule = scheduleScore(business.isOpen, user.localHour24);
      const trend = normalize(business.trendScore * 0.7 + business.rating * 0.3, 0, 5);

      const score =
        proximity * 0.4 +
        affinity * 0.3 +
        schedule * 0.2 +
        trend * 0.1;

      return {
        ...business,
        score,
        distanceKm,
        breakdown: { proximity, affinity, schedule, trend },
      };
    })
    .sort((a, b) => b.score - a.score || a.distanceKm - b.distanceKm);
}

export function generateResponse(query: string, ranked: RankedBusiness[]) {
  const top = ranked.slice(0, 3);

  if (!top.length) {
    return `No encontré coincidencias para "${query}". Prueba con otra categoría o zona.`;
  }

  const bullets = top
    .map(
      (item) =>
        `• ${item.name} (${item.category}) — score ${item.score.toFixed(2)} — a ${item.distanceKm.toFixed(1)} km`,
    )
    .join("\n");

  return `Encontré opciones alineadas con tu contexto:\n\n${bullets}\n\nBasado en ubicación, preferencias y disponibilidad.`;
}
