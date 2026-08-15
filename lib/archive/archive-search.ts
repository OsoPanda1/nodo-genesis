/* ================================================================== */
/* ARCHIVO HISTÓRICO — Búsqueda pública                                */
/* ================================================================== */
/* Filtros del catálogo público: texto (sobre título/resumen/etiquetas */
/* de personas, organizaciones y lugares), colección, tipo de bien y   */
/* rango de fechas. Solo considera piezas publicadas y accesibles.     */
/* ================================================================== */

import type { ArchiveItem } from './archive-types';
import type { ArchiveSearchInput } from '@/lib/core/contracts/archive';

const ACCESIBLE_ACCESS: ArchiveItem['accessLevel'][] = ['open', 'download_only', 'view_only'];

function normalize(value: string): string {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function haystack(item: ArchiveItem): string {
  return normalize(
    [item.title, item.summary, item.description ?? '', ...item.tags, ...item.people, ...item.organizations, item.locationName ?? ''].join(' '),
  );
}

export interface ArchiveSearchResult {
  items: ArchiveItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Filtra las piezas publicadas del catálogo según los criterios. */
export function searchPublishedItems(
  items: ArchiveItem[],
  input: ArchiveSearchInput,
): ArchiveSearchResult {
  const q = input.q?.trim() ? normalize(input.q.trim()) : '';
  const yearFrom = input.yearFrom ?? null;
  const yearTo = input.yearTo ?? null;

  const visible = items.filter(item => {
    if (item.status !== 'published') return false;
    if (!ACCESIBLE_ACCESS.includes(item.accessLevel)) return false;
    return true;
  });

  const filtered = visible.filter(item => {
    if (input.collection && item.collectionId !== input.collection) return false;
    if (input.assetType && item.assetType !== input.assetType) return false;
    if (q && !haystack(item).includes(q)) return false;

    if (yearFrom !== null || yearTo !== null) {
      const year = item.historicalDateStart ? Number(item.historicalDateStart.slice(0, 4)) : null;
      if (year !== null) {
        if (yearFrom !== null && year < yearFrom) return false;
        if (yearTo !== null && year > yearTo) return false;
      }
    }
    return true;
  });

  const total = filtered.length;
  const pageSize = input.pageSize;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(input.page, totalPages);
  const start = (page - 1) * pageSize;

  return {
    items: filtered.slice(start, start + pageSize),
    total,
    page,
    pageSize,
    totalPages,
  };
}

/** Resuelve el id de colección por slug para filtrar. */
export function resolveCollectionFilter(
  collectionSlug: string | undefined,
  items: ArchiveItem[],
  collections: Array<{ id: string; slug: string }>,
): string | undefined {
  if (!collectionSlug) return undefined;
  const collection = collections.find(c => c.slug === collectionSlug);
  return collection?.id;
}
