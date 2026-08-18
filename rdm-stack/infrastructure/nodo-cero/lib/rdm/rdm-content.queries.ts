/* ===================================================================== */
/* Consultas optimizadas sobre el catálogo RDM.                           */
/* ===================================================================== */

import {
  RDM_ARTISTS,
  RDM_GASTRONOMY,
  RDM_CHALLENGES,
  RDM_GALLERY,
  RDM_INDEX,
} from './rdm-content';

import type {
  RDMArtist,
  RDMGastronomy,
  RDMGalleryItem,
} from './rdm-content.types';

export function getArtistById(
  id: string,
): RDMArtist | undefined {
  return RDM_INDEX.artistsById.get(id);
}

export function getGastronomyById(
  id: string,
): RDMGastronomy | undefined {
  return RDM_INDEX.gastronomyById.get(id);
}

export function getGalleryItemById(
  id: string,
): RDMGalleryItem | undefined {
  return RDM_INDEX.galleryById.get(id);
}

export function searchArtists(
  query: string,
): readonly RDMArtist[] {
  const normalized = query.trim().toLocaleLowerCase();

  if (!normalized) {
    return RDM_ARTISTS;
  }

  return RDM_ARTISTS.filter((artist) =>
    [
      artist.name,
      artist.discipline,
      artist.location,
      artist.bio,
    ]
      .join(' ')
      .toLocaleLowerCase()
      .includes(normalized),
  );
}

export function getGastronomyByType(
  type: RDMGastronomy['type'],
): readonly RDMGastronomy[] {
  return RDM_GASTRONOMY.filter((item) => item.type === type);
}

export function getTopRatedArtists(
  minimumRating = 4.5,
): readonly RDMArtist[] {
  return RDM_ARTISTS
    .filter((artist) => artist.rating >= minimumRating)
    .toSorted((a, b) => b.rating - a.rating);
}

export function getActiveChallenges() {
  return RDM_CHALLENGES.filter(
    (challenge) =>
      challenge.progress >= 0 &&
      challenge.progress < 100,
  );
}

export function getCompletedChallenges() {
  return RDM_CHALLENGES.filter(
    (challenge) => challenge.progress >= 100,
  );
}

export function getGalleryByCategory(
  category: string,
): readonly RDMGalleryItem[] {
  return RDM_GALLERY.filter(
    (item) => item.category === category,
  );
}
