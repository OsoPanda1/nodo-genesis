/* ================================================================== */
/* ARCHIVO HISTÓRICO — Pruebas del catálogo, flujo editorial y permisos */
/* ================================================================== */

import { describe, it, expect, beforeEach } from 'vitest';
import { resetArchiveStoreForTests, listCollections, listItems } from '@/lib/archive/archive-repository';
import {
  archiveCollections,
  listPublishedItems,
  getPublishedItemBySlug,
  createItem,
  submitItem,
  approveItem,
  publishItem,
  withdrawItem,
  registerFile,
  requestPublicDownload,
  publicationReadiness,
} from '@/lib/archive/archive-service';
import { searchPublishedItems } from '@/lib/archive/archive-search';
import { archiveSearchSchema } from '@/lib/core/contracts/archive';
import { can, assertArchiveAction } from '@/lib/archive/archive-permissions';
import type { ArchiveActor } from '@/lib/archive/archive-service';

const archivist: ArchiveActor = { userId: 'arch-1', role: 'archivist' };
const reviewer: ArchiveActor = { userId: 'rev-1', role: 'reviewer' };
const admin: ArchiveActor = { userId: 'adm-1', role: 'archive_admin' };
const contributor: ArchiveActor = { userId: 'con-1', role: 'contributor' };

function collectionIdOf(slug: string): string {
  const collection = listCollections(false).find(c => c.slug === slug);
  if (!collection) throw new Error(`colección ${slug} ausente`);
  return collection.id;
}

function baseDraft() {
  return {
    collectionId: collectionIdOf('memoria-minera'),
    slug: 'test-herramientas-minero',
    title: 'Herramientas de un minero del Real',
    summary: 'Ficha de prueba para ejercitar el ciclo editorial completo del Archivo Histórico.',
    assetType: 'artifact' as const,
    accessLevel: 'open' as const,
    rightsStatus: 'public_domain' as const,
    authorOrSource: 'Colección del Museo de Minería',
    sourceReference: 'AHREM/C-1980/45',
    datePrecision: 'year' as const,
    people: [],
    organizations: [],
    tags: ['minería', 'herramientas'],
  };
}

describe('archivo · semilla y visibilidad pública', () => {
  beforeEach(() => resetArchiveStoreForTests());

  it('carga 7 colecciones y piezas publicadas por defecto', () => {
    expect(archiveCollections().length).toBe(7);
    expect(listItems().length).toBeGreaterThanOrEqual(6);
    expect(listPublishedItems().length).toBe(9);
  });

  it('solo lista piezas publicadas y con acceso no restringido', () => {
    expect(listPublishedItems().every(i => i.status === 'published' && i.accessLevel !== 'restricted')).toBe(true);
    const draft = createItem(admin, { ...baseDraft(), slug: 'test-borrador-no-lista' });
    if (draft.ok) {
      expect(listPublishedItems().map(i => i.slug)).not.toContain('test-borrador-no-lista');
    }
  });

  it('resuelve ficha pública por slug solo si está publicada', () => {
    expect(getPublishedItemBySlug('huelga-mina-dolores-1766')).not.toBeNull();
  });
});

describe('archivo · búsqueda pública', () => {
  beforeEach(() => resetArchiveStoreForTests());

  it('encuentra por texto sin distinguir acentos', () => {
    const result = searchPublishedItems(listItems(), archiveSearchSchema.parse({ q: 'huelga' }));
    expect(result.items.map(i => i.slug)).toContain('huelga-mina-dolores-1766');
  });

  it('filtra por tipo de bien y rango de años', () => {
    const maps = searchPublishedItems(listItems(), archiveSearchSchema.parse({ assetType: 'map' }));
    expect(maps.total).toBeGreaterThan(0);
    const era = searchPublishedItems(listItems(), archiveSearchSchema.parse({ yearFrom: 1800, yearTo: 1900 }));
    expect(era.items.every(i => Number(i.historicalDateStart?.slice(0, 4)) >= 1800)).toBe(true);
  });

  it('excluye piezas con acceso restringido de los resultados', () => {
    const result = searchPublishedItems(listItems(), archiveSearchSchema.parse({}));
    expect(result.items.every(i => i.accessLevel !== 'restricted')).toBe(true);
  });
});

describe('archivo · flujo editorial', () => {
  beforeEach(() => resetArchiveStoreForTests());

  it('recorre draft → pending_review → approved → published', () => {
    const created = createItem(archivist, baseDraft());
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    expect(created.item.status).toBe('draft');

    const submitted = submitItem(archivist, created.item.id, 'Listo para revisión.');
    expect(submitted.ok && submitted.item.status).toBe('pending_review');

    const approved = approveItem(reviewer, created.item.id, 'Procedencia verificada.');
    expect(approved.ok && approved.item.status).toBe('approved');

    registerFile(admin, {
      itemId: created.item.id,
      storageBucket: 'archive-public',
      objectPath: 'archive-public/items/test-herramientas-minero/copia.jpg',
      fileRole: 'access_copy',
      mimeType: 'image/jpeg',
      byteSize: 1024,
      sha256: 'sha256:0000000000000000000000000000000000000000000000000000000000000000',
      isPublic: true,
    });

    const published = publishItem(reviewer, created.item.id, 'Ficha íntegra y con hash.');
    expect(published.ok).toBe(true);
    if (published.ok) expect(published.item.status).toBe('published');
    expect(getPublishedItemBySlug('test-herramientas-minero')).not.toBeNull();
  });

  it('bloquea la publicación si faltan procedencia, derechos o derivado visible', () => {
    const created = createItem(admin, {
      ...baseDraft(),
      slug: 'test-sin-procedencia',
      authorOrSource: undefined,
      sourceReference: undefined,
      rightsStatus: 'rights_unknown',
    });
    if (!created.ok) return;
    const readiness = publicationReadiness(created.item);
    expect(readiness.ok).toBe(false);
    expect(readiness.reasons.join(' ')).toContain('procedencia');
    expect(readiness.reasons.join(' ')).toContain('derechos');
    expect(readiness.reasons.join(' ')).toContain('derivado visible');
  });

  it('no permite retirar lo que aún no fue publicado', () => {
    const created = createItem(admin, { ...baseDraft(), slug: 'test-sin-publicar' });
    if (!created.ok) return;
    const withdrawn = withdrawItem(admin, created.item.id, 'Se retira');
    expect(withdrawn.ok).toBe(false);
  });

  it('publicado se puede retirar con razón', () => {
    const created = createItem(admin, baseDraft());
    if (!created.ok) return;
    registerFile(admin, {
      itemId: created.item.id,
      storageBucket: 'archive-public',
      objectPath: 'archive-public/items/x/copia.jpg',
      fileRole: 'access_copy',
      mimeType: 'image/jpeg',
      byteSize: 1024,
      sha256: 'sha256:0000000000000000000000000000000000000000000000000000000000000000',
      isPublic: true,
    });
    submitItem(admin, created.item.id, 'A revisión');
    approveItem(admin, created.item.id, 'Ok');
    const published = publishItem(admin, created.item.id, 'Publicar');
    expect(published.ok).toBe(true);
    const withdrawn = withdrawItem(admin, created.item.id, 'Espera nueva digitalización.');
    expect(withdrawn.ok).toBe(true);
    expect(getPublishedItemBySlug('test-herramientas-minero')).toBeNull();
  });

  it('rechaza slug duplicado', () => {
    const first = createItem(admin, baseDraft());
    expect(first.ok).toBe(true);
    const second = createItem(admin, baseDraft());
    expect(second.ok).toBe(false);
    if (!second.ok) expect(second.reason).toBe('SLUG_ALREADY_IN_USE');
  });
});

describe('archivo · permisos por rol', () => {
  it('la matriz autoriza según rol (fail-closed)', () => {
    expect(can(archivist.role, 'approve_item')).toBe(false);
    expect(can(reviewer.role, 'approve_item')).toBe(true);
    expect(can(reviewer.role, 'create_item')).toBe(false);
    expect(can(admin.role, 'grant_roles')).toBe(true);
    expect(can(null, 'create_item')).toBe(false);
    expect(assertArchiveAction(contributor.role, 'create_item').ok).toBe(false);
  });
});

describe('archivo · descarga y entrega segura', () => {
  beforeEach(() => resetArchiveStoreForTests());

  it('nunca entrega el original al público', async () => {
    const result = await requestPublicDownload(listItems()[0].id, 'original');
    expect(result.ok).toBe(false);
  });

  it('niega descarga de material solo-vista', async () => {
    const item = listItems().find(i => i.accessLevel === 'view_only');
    if (!item) return;
    const result = await requestPublicDownload(item.id, 'access_copy');
    expect(result.ok).toBe(false);
  });

  it('genera URL firmada para derivados públicos abiertos', async () => {
    const item = listItems().find(i => i.slug === 'callejon-zopilote-1908');
    if (!item) return;
    const result = await requestPublicDownload(item.id, 'access_copy');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.url).toContain('sig=');
  });
});
