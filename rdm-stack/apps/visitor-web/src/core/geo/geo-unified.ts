export interface GeoPoint {
  lat: number;
  lng: number;
}

/**
 * Unified geo helper.
 *
 * Note: this keeps a string-based index format to avoid external runtime
 * dependencies while preserving an H3-like encode/decode API shape.
 */
export class GeoUnified {
  encode(lat: number, lng: number): string {
    return `${lat.toFixed(6)}:${lng.toFixed(6)}`;
  }

  decode(index: string): GeoPoint {
    const [latRaw, lngRaw] = index.split(":");
    const lat = Number(latRaw);
    const lng = Number(lngRaw);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      throw new Error(`Invalid geo index: ${index}`);
    }

    return { lat, lng };
  }

  spatialSearch(_index: string, _radius: number): string[] {
    return [];
  }
}
