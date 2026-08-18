/* ===================================================================== */
/* Runtime del catálogo RDM: validación, congelado e índices.             */
/* ===================================================================== */

import type {
  RDMArtist,
  RDMBadge,
  RDMChallenge,
  RDMGastronomy,
  RDMGalleryItem,
  RDMHonoree,
  RDMImagePath,
  RDMTrack,
} from './rdm-content.types';

export type ReadonlyCatalog<T> = readonly T[];

/** Congela un valor en profundidad; no muta catálogos ya congelados. */
export function deepFreeze<T>(value: T): Readonly<T> {
  if (
    value === null ||
    typeof value !== 'object' ||
    Object.isFrozen(value)
  ) {
    return value as Readonly<T>;
  }

  Object.freeze(value);

  for (const nested of Object.values(value as object)) {
    deepFreeze(nested);
  }

  return value as Readonly<T>;
}

/** Una ruta de imagen debe ser absoluta dentro del sitio (`/images/...`). */
export function isImagePath(value: string): value is RDMImagePath {
  return value.startsWith('/');
}

export function isValidRating(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= 5;
}

export function isValidProgress(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= 100;
}

export function isValidPoints(value: number): boolean {
  return Number.isInteger(value) && value >= 0;
}

export function validateArtist(item: RDMArtist): void {
  if (!item.id || !item.name || !item.discipline) {
    throw new Error(`Artista inválido: ${item.id}`);
  }

  if (!isValidRating(item.rating)) {
    throw new Error(`Rating inválido en artista: ${item.id}`);
  }

  if (!isImagePath(item.image)) {
    throw new Error(`Imagen inválida en artista: ${item.id}`);
  }
}

export function validateGastronomy(item: RDMGastronomy): void {
  if (!item.id || !item.name || !item.description) {
    throw new Error(`Registro gastronómico inválido: ${item.id}`);
  }

  if (!isValidRating(item.rating)) {
    throw new Error(`Rating inválido en gastronomía: ${item.id}`);
  }

  if (!isImagePath(item.image)) {
    throw new Error(`Imagen inválida en gastronomía: ${item.id}`);
  }
}

export function validateTrack(item: RDMTrack): void {
  if (!item.id || !item.title || !item.artist) {
    throw new Error(`Track inválido: ${item.id}`);
  }

  if (!isImagePath(item.image)) {
    throw new Error(`Imagen inválida en track: ${item.id}`);
  }
}

export function validateBadge(item: RDMBadge): void {
  if (!item.id || !item.name || !item.description) {
    throw new Error(`Badge inválido: ${item.id}`);
  }
}

export function validateChallenge(item: RDMChallenge): void {
  if (!item.id || !item.title) {
    throw new Error(`Challenge inválido: ${item.id}`);
  }

  if (!isValidPoints(item.points)) {
    throw new Error(`Puntos inválidos: ${item.id}`);
  }

  if (!isValidProgress(item.progress)) {
    throw new Error(`Progreso inválido: ${item.id}`);
  }
}

export function validateGalleryItem(item: RDMGalleryItem): void {
  if (!item.id || !item.caption || !item.author) {
    throw new Error(`Elemento de galería inválido: ${item.id}`);
  }

  if (!isImagePath(item.image)) {
    throw new Error(`Imagen inválida en galería: ${item.id}`);
  }
}

export function validateHonoree(item: RDMHonoree): void {
  if (!item.id || !item.name || !item.title) {
    throw new Error(`Homenajeado inválido: ${item.id}`);
  }
}

/** Construye un índice O(1) por id sobre un catálogo inmutable. */
export function createIndex<T extends { id: string }>(
  catalog: readonly T[],
): ReadonlyMap<string, T> {
  return new Map(catalog.map((item) => [item.id, item]));
}
