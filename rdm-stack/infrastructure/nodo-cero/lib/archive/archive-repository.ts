/* ================================================================== */
/* ARCHIVO HISTÓRICO — Repositorio (almacén + persistencia)            */
/* ================================================================== */
/* Almacén en memoria (globalThis) del catálogo del Archivo, con el    */
/* patrón del resto de dominios: hidratación al arranque y write-behind */
/* hacia Postgres (Supabase). Los seeds solo se cargan si está vacío.  */
/* ================================================================== */

import { publishArchiveEvent } from '@/lib/core/events/archive-events';
import type {
  ArchiveAuditEvent,
  ArchiveAuditEventType,
  ArchiveCollection,
  ArchiveFileRecord,
  ArchiveFileRole,
  ArchiveItem,
  ArchiveRevision,
  ArchiveStaffRole,
} from './archive-types';
import { ARCHIVE_SEED_COLLECTIONS, ARCHIVE_SEED_FILES, ARCHIVE_SEED_ITEMS } from './archive-seed';

interface ArchiveStoreShape {
  collections: Map<string, ArchiveCollection>;
  items: Map<string, ArchiveItem>;
  files: Map<string, ArchiveFileRecord>;
  revisions: Map<string, ArchiveRevision>;
  audit: ArchiveAuditEvent[];
  staffRoles: Map<string, ArchiveStaffRole>;
}

const STORE_KEY = '__rdmArchiveStore';

const g = globalThis as unknown as { [STORE_KEY]?: ArchiveStoreShape };

function getStore(): ArchiveStoreShape {
  if (!g[STORE_KEY]) {
    const store: ArchiveStoreShape = {
      collections: new Map(),
      items: new Map(),
      files: new Map(),
      revisions: new Map(),
      audit: [],
      staffRoles: new Map(),
    };
    for (const collection of ARCHIVE_SEED_COLLECTIONS) store.collections.set(collection.id, collection);
    for (const item of ARCHIVE_SEED_ITEMS) store.items.set(item.id, item);
    for (const file of ARCHIVE_SEED_FILES) store.files.set(file.id, file);
    g[STORE_KEY] = store;
  }
  return g[STORE_KEY] as ArchiveStoreShape;
}

/* ---------------- utilidades ---------------- */

function newUuid(): string {
  return crypto.randomUUID();
}

export function archiveAudit(
  event: {
    itemId?: string | null;
    actorId?: string | null;
    eventType: ArchiveAuditEventType;
    traceId?: string | null;
    correlationId?: string | null;
    metadata?: Record<string, unknown>;
  },
): ArchiveAuditEvent {
  const record: ArchiveAuditEvent = {
    id: newUuid(),
    itemId: event.itemId ?? null,
    actorId: event.actorId ?? null,
    eventType: event.eventType,
    traceId: event.traceId ?? null,
    correlationId: event.correlationId ?? null,
    metadata: event.metadata ?? {},
    occurredAt: Date.now(),
  };
  getStore().audit.push(record);
  return record;
}

/* ---------------- colecciones ---------------- */

export function listCollections(publicOnly = true): ArchiveCollection[] {
  const store = getStore();
  const all = [...store.collections.values()].sort((a, b) => a.title.localeCompare(b.title));
  return publicOnly ? all.filter(c => c.isPublic) : all;
}

export function findCollectionBySlug(slug: string): ArchiveCollection | null {
  return [...getStore().collections.values()].find(c => c.slug === slug) ?? null;
}

export function findCollectionById(id: string): ArchiveCollection | null {
  return getStore().collections.get(id) ?? null;
}

export function upsertCollection(collection: ArchiveCollection): void {
  getStore().collections.set(collection.id, collection);
}

/* ---------------- piezas ---------------- */

export function listItems(): ArchiveItem[] {
  return [...getStore().items.values()];
}

export function listItemsByCollection(collectionId: string): ArchiveItem[] {
  return [...getStore().items.values()].filter(i => i.collectionId === collectionId);
}

export function findItemById(id: string): ArchiveItem | null {
  return getStore().items.get(id) ?? null;
}

export function findItemBySlug(slug: string): ArchiveItem | null {
  return [...getStore().items.values()].find(i => i.slug === slug) ?? null;
}

export function upsertItem(item: ArchiveItem): void {
  getStore().items.set(item.id, item);
}

/* ---------------- archivos ---------------- */

export function listFilesByItem(itemId: string): ArchiveFileRecord[] {
  return [...getStore().files.values()].filter(f => f.itemId === itemId);
}

export function findFileById(id: string): ArchiveFileRecord | null {
  return getStore().files.get(id) ?? null;
}

export function upsertFile(file: ArchiveFileRecord): void {
  getStore().files.set(file.id, file);
}

/* ---------------- revisiones ---------------- */

export function listRevisionsByItem(itemId: string): ArchiveRevision[] {
  return [...getStore().revisions.values()]
    .filter(r => r.itemId === itemId)
    .sort((a, b) => a.revisionNumber - b.revisionNumber);
}

export function nextRevisionNumber(itemId: string): number {
  const revisions = listRevisionsByItem(itemId);
  return revisions.length ? revisions[revisions.length - 1].revisionNumber + 1 : 1;
}

export function addRevision(revision: ArchiveRevision): void {
  getStore().revisions.set(revision.id, revision);
}

/* ---------------- roles ---------------- */

export function roleOf(userId: string): ArchiveStaffRole | null {
  return getStore().staffRoles.get(userId) ?? null;
}

export function grantRole(role: ArchiveStaffRole): void {
  getStore().staffRoles.set(role.userId, role);
}

/* ---------------- auditoría ---------------- */

export function listAudit(limit = 200): ArchiveAuditEvent[] {
  return [...getStore().audit].slice(-limit).reverse();
}

/** Vacía el almacén y recarga los seeds (uso exclusivo en pruebas). */
export function resetArchiveStoreForTests(): void {
  g[STORE_KEY] = undefined;
  getStore();
}

/* ---------------- persistencia durable ---------------- */

import { isPostgresConfigured, sql, registerHydrator, schedulePersist } from '@/lib/core/persistence';

async function persistItem(item: ArchiveItem): Promise<void> {
  if (!isPostgresConfigured()) return;
  const db = sql();
  await db`
    insert into public.archive_items
      (id, collection_id, slug, title, summary, description, asset_type, status,
       access_level, rights_status, author_or_source, source_reference, donor_name,
       license, historical_date_start, historical_date_end, date_precision,
       location_name, latitude, longitude, people, organizations, tags,
       published_at, withdrawn_at, withdrawn_reason, created_at, updated_at)
    values (
      ${item.id}, ${item.collectionId}, ${item.slug}, ${item.title}, ${item.summary},
      ${item.description}, ${item.assetType}, ${item.status}, ${item.accessLevel},
      ${item.rightsStatus}, ${item.authorOrSource}, ${item.sourceReference},
      ${item.donorName}, ${item.license}, ${item.historicalDateStart},
      ${item.historicalDateEnd}, ${item.datePrecision}, ${item.locationName},
      ${item.latitude}, ${item.longitude}, ${item.people}, ${item.organizations},
      ${item.tags}, ${item.publishedAt ? new Date(item.publishedAt).toISOString() : null},
      ${item.withdrawnAt ? new Date(item.withdrawnAt).toISOString() : null},
      ${item.withdrawnReason}, ${new Date(item.createdAt).toISOString()},
      ${new Date(item.updatedAt).toISOString()}
    )
    on conflict (id) do update set
      title = excluded.title,
      summary = excluded.summary,
      status = excluded.status,
      access_level = excluded.access_level,
      updated_at = excluded.updated_at
  `;
}

registerHydrator('archive', async () => {
  if (!isPostgresConfigured()) return;
  const db = sql();
  const rows = await db`select * from public.archive_items`;
  const store = getStore();
  for (const row of rows) {
    if (!store.items.has(row.id)) {
      store.items.set(row.id, {
        id: row.id,
        collectionId: row.collection_id,
        slug: row.slug,
        title: row.title,
        summary: row.summary,
        description: row.description,
        assetType: row.asset_type,
        status: row.status,
        accessLevel: row.access_level,
        rightsStatus: row.rights_status,
        authorOrSource: row.author_or_source,
        sourceReference: row.source_reference,
        donorName: row.donor_name,
        license: row.license,
        historicalDateStart: row.historical_date_start,
        historicalDateEnd: row.historical_date_end,
        datePrecision: row.date_precision,
        locationName: row.location_name,
        latitude: row.latitude,
        longitude: row.longitude,
        people: row.people ?? [],
        organizations: row.organizations ?? [],
        tags: row.tags ?? [],
        publishedAt: row.published_at ? new Date(row.published_at).getTime() : null,
        withdrawnAt: row.withdrawn_at ? new Date(row.withdrawn_at).getTime() : null,
        withdrawnReason: row.withdrawn_reason,
        createdAt: new Date(row.created_at).getTime(),
        updatedAt: new Date(row.updated_at).getTime(),
      });
    }
  }
});

export { schedulePersist, publishArchiveEvent };

/** Utilidad de persistencia diferida de una pieza. */
export function scheduleItemPersist(item: ArchiveItem): void {
  schedulePersist(`archive.item.${item.id}`, () => persistItem(item));
}

export type { ArchiveFileRole };
