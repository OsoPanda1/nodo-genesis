/* ===================================================================== */
/* Fachada del catálogo RDM. Conserva todos los exports originales y     */
/* agrega inmutabilidad, validación e índices O(1).                      */
/* ===================================================================== */

import {
  RDM_ARTISTS as LEGACY_ARTISTS,
  RDM_GASTRONOMY as LEGACY_GASTRONOMY,
  RDM_TRACKS as LEGACY_TRACKS,
  RDM_PODCAST as LEGACY_PODCAST,
  RDM_BADGES as LEGACY_BADGES,
  RDM_CHALLENGES as LEGACY_CHALLENGES,
  RDM_LEGENDS as LEGACY_LEGENDS,
  RDM_DICHOS_MINEROS as LEGACY_DICHOS_MINEROS,
  RDM_FORUM_THREADS as LEGACY_FORUM_THREADS,
  RDM_HONOREES as LEGACY_HONOREES,
  RDM_GALLERY as LEGACY_GALLERY,
  RDM_TEAM as LEGACY_TEAM,
  RDM_VALUES as LEGACY_VALUES,
} from './rdm-content.legacy';

import {
  createIndex,
  deepFreeze,
  validateArtist,
  validateBadge,
  validateChallenge,
  validateGalleryItem,
  validateGastronomy,
  validateHonoree,
  validateTrack,
} from './rdm-content.runtime';

import type {
  RDMArtist,
  RDMBadge,
  RDMChallenge,
  RDMGastronomy,
  RDMGalleryItem,
  RDMHonoree,
  RDMTrack,
} from './rdm-content.types';

/**
 * Catálogos completos.
 * Ningún registro del archivo original se elimina.
 */
export const RDM_ARTISTS =
  deepFreeze(LEGACY_ARTISTS) as readonly RDMArtist[];

export const RDM_GASTRONOMY =
  deepFreeze(LEGACY_GASTRONOMY) as readonly RDMGastronomy[];

export const RDM_TRACKS =
  deepFreeze(LEGACY_TRACKS) as readonly RDMTrack[];

export const RDM_PODCAST =
  deepFreeze(LEGACY_PODCAST);

export const RDM_BADGES =
  deepFreeze(LEGACY_BADGES) as readonly RDMBadge[];

export const RDM_CHALLENGES =
  deepFreeze(LEGACY_CHALLENGES) as readonly RDMChallenge[];

export const RDM_LEGENDS =
  deepFreeze(LEGACY_LEGENDS);

export const RDM_DICHOS_MINEROS =
  deepFreeze(LEGACY_DICHOS_MINEROS);

export const RDM_FORUM_THREADS =
  deepFreeze(LEGACY_FORUM_THREADS);

export const RDM_HONOREES =
  deepFreeze(LEGACY_HONOREES) as readonly RDMHonoree[];

export const RDM_GALLERY =
  deepFreeze(LEGACY_GALLERY) as readonly RDMGalleryItem[];

export const RDM_TEAM =
  deepFreeze(LEGACY_TEAM);

export const RDM_VALUES =
  deepFreeze(LEGACY_VALUES);

/**
 * Índices O(1) para búsquedas frecuentes.
 */
export const RDM_INDEX = {
  artistsById: createIndex(RDM_ARTISTS),
  gastronomyById: createIndex(RDM_GASTRONOMY),
  tracksById: createIndex(RDM_TRACKS),
  badgesById: createIndex(RDM_BADGES),
  challengesById: createIndex(RDM_CHALLENGES),
  honoreesById: createIndex(RDM_HONOREES),
  galleryById: createIndex(RDM_GALLERY),
} as const;

/**
 * Validación de integridad del catálogo.
 */
export function validateRDMContent(): void {
  RDM_ARTISTS.forEach(validateArtist);
  RDM_GASTRONOMY.forEach(validateGastronomy);
  RDM_TRACKS.forEach(validateTrack);
  RDM_BADGES.forEach(validateBadge);
  RDM_CHALLENGES.forEach(validateChallenge);
  RDM_GALLERY.forEach(validateGalleryItem);
  RDM_HONOREES.forEach(validateHonoree);
}

/**
 * Ejecutar únicamente durante desarrollo, pruebas o CI.
 */
if (
  process.env.NODE_ENV !== 'production' ||
  process.env.RDM_VALIDATE_CONTENT === 'true'
) {
  validateRDMContent();
}

/* ===================================================================== */
/* Fachada pública compatible.                                           */
/* ===================================================================== */

export * from './rdm-content.queries';
export * from './rdm-content.types';
