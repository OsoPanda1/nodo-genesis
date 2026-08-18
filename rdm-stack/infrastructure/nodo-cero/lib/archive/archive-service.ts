/* ================================================================== */
/* ARCHIVO HISTÓRICO — Servicio editorial                              */
/* ================================================================== */
/* Orquesta el ciclo de vida de las piezas y la entrega pública:       */
/*   draft -> pending_review -> approved -> published -> withdrawn     */
/* Publicación bloqueada si falta procedencia, derechos, derivado      */
/* visible, hash SHA-256 o razón de cambio. Emite eventos archive.*     */
/* ================================================================== */

import type {
  ArchiveAction,
} from './archive-permissions';
import { assertArchiveAction } from './archive-permissions';
import { isCanonicalSha256 } from './archive-checksum';
import { createSignedDownloadUrl } from './archive-storage';
import { publishArchiveEvent } from '@/lib/core/events/archive-events';
import type { ArchiveEventType } from '@/lib/core/events/archive-events';
import type {
  ArchiveCollection,
  ArchiveFileRecord,
  ArchiveFileRole,
  ArchiveItem,
  ArchiveItemWithFiles,
  ArchiveRole,
} from './archive-types';
import {
  archiveAudit,
  findCollectionById,
  findCollectionBySlug,
  findItemById,
  findItemBySlug,
  listCollections,
  listFilesByItem,
  listItems,
  nextRevisionNumber,
  addRevision,
  roleOf,
  upsertCollection,
  upsertFile,
  upsertItem,
  scheduleItemPersist,
} from './archive-repository';

import type { ArchiveAuditEventType } from './archive-types';

export interface ArchiveActor {
  userId: string;
  role: ArchiveRole;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function newUuid(): string {
  return crypto.randomUUID();
}

function emit(itemId: string, type: ArchiveEventType, metadata?: Record<string, unknown>): void {
  publishArchiveEvent({ type, itemId, metadata });
}

function audit(itemId: string, eventType: ArchiveAuditEventType, metadata?: Record<string, unknown>) {
  archiveAudit({ itemId, eventType, metadata });
}

/** Convierte una pieza en su vista con colección y archivos resueltos. */
export function itemWithFiles(item: ArchiveItem): ArchiveItemWithFiles {
  return {
    ...item,
    collection: findCollectionById(item.collectionId),
    files: listFilesByItem(item.id),
  };
}

export function publicItemView(item: ArchiveItem): ArchiveItemWithFiles | null {
  if (item.status !== 'published') return null;
  if (item.accessLevel === 'restricted') return null;
  return itemWithFiles(item);
}

/** Verifica la preparación editorial de una pieza (bloqueo de publicación). */
export function publicationReadiness(item: ArchiveItem): { ok: boolean; reasons: string[] } {
  const reasons: string[] = [];

  if (!item.authorOrSource && !item.sourceReference) {
    reasons.push('Falta la procedencia (autor o fuente).');
  }
  if (item.rightsStatus === 'rights_unknown' || item.rightsStatus === 'restricted') {
    reasons.push('El estado de derechos no está aclarado.');
  }

  const files = listFilesByItem(item.id);
  const visible = files.filter(
    f => f.isPublic && (f.fileRole === 'access_copy' || f.fileRole === 'thumbnail' || f.fileRole === 'transcript'),
  );
  if (visible.length === 0) {
    reasons.push('No existe un derivado visible autorizado.');
  }
  if (files.some(f => !isCanonicalSha256(f.sha256))) {
    reasons.push('Existen archivos sin resumen SHA-256 canónico.');
  }

  return { ok: reasons.length === 0, reasons };
}

/* ------------------------------------------------------------------ */
/* Colecciones                                                          */
/* ------------------------------------------------------------------ */

export function archiveCollections(publicOnly = true): ArchiveCollection[] {
  return listCollections(publicOnly);
}

export function resolveCollectionId(slug: string): string | null {
  return findCollectionBySlug(slug)?.id ?? null;
}

/* ------------------------------------------------------------------ */
/* Flujo editorial                                                      */
/* ------------------------------------------------------------------ */

export function createItem(
  actor: ArchiveActor,
  input: {
    collectionId: string;
    slug: string;
    title: string;
    summary: string;
    description?: string;
    assetType: ArchiveItem['assetType'];
    accessLevel: ArchiveItem['accessLevel'];
    rightsStatus: ArchiveItem['rightsStatus'];
    authorOrSource?: string;
    sourceReference?: string;
    donorName?: string;
    license?: string;
    historicalDateStart?: string;
    historicalDateEnd?: string;
    datePrecision: ArchiveItem['datePrecision'];
    locationName?: string;
    latitude?: number;
    longitude?: number;
    people: string[];
    organizations: string[];
    tags: string[];
  },
): { ok: true; item: ArchiveItem } | { ok: false; reason: string } {
  const denied = assertArchiveAction(actor.role, 'create_item');
  if (!denied.ok) return denied;

  const collection = findCollectionById(input.collectionId);
  if (!collection) return { ok: false, reason: 'Colección no encontrada.' };
  if (findItemBySlug(input.slug)) return { ok: false, reason: 'SLUG_ALREADY_IN_USE' };

  const now = Date.now();
  const item: ArchiveItem = {
    id: newUuid(),
    collectionId: input.collectionId,
    slug: input.slug,
    title: input.title,
    summary: input.summary,
    description: input.description ?? null,
    assetType: input.assetType,
    status: 'draft',
    accessLevel: input.accessLevel,
    rightsStatus: input.rightsStatus,
    authorOrSource: input.authorOrSource ?? null,
    sourceReference: input.sourceReference ?? null,
    donorName: input.donorName ?? null,
    license: input.license ?? null,
    historicalDateStart: input.historicalDateStart ?? null,
    historicalDateEnd: input.historicalDateEnd ?? null,
    datePrecision: input.datePrecision,
    locationName: input.locationName ?? null,
    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,
    people: input.people,
    organizations: input.organizations,
    tags: input.tags,
    publishedAt: null,
    withdrawnAt: null,
    withdrawnReason: null,
    createdAt: now,
    updatedAt: now,
  };
  upsertItem(item);
  scheduleItemPersist(item);
  archiveAudit({ itemId: item.id, actorId: actor.userId, eventType: 'created' });
  emit(item.id, 'archive.item.created', { slug: item.slug });
  return { ok: true, item };
}

export function registerFile(
  actor: ArchiveActor,
  input: {
    itemId: string;
    storageBucket: ArchiveFileRecord['storageBucket'];
    objectPath: string;
    fileRole: ArchiveFileRole;
    mimeType: string;
    byteSize: number;
    sha256: string;
    width?: number;
    height?: number;
    durationSeconds?: number;
    isPublic: boolean;
  },
): { ok: true; file: ArchiveFileRecord } | { ok: false; reason: string } {
  const denied = assertArchiveAction(actor.role, 'upload_file');
  if (!denied.ok) return denied;

  const item = findItemById(input.itemId);
  if (!item) return { ok: false, reason: 'Pieza no encontrada.' };
  if (!isCanonicalSha256(input.sha256)) {
    return { ok: false, reason: 'SHA256_INVALID' };
  }

  const file: ArchiveFileRecord = {
    id: newUuid(),
    itemId: input.itemId,
    storageBucket: input.storageBucket,
    objectPath: input.objectPath,
    fileRole: input.fileRole,
    mimeType: input.mimeType,
    byteSize: input.byteSize,
    sha256: input.sha256,
    width: input.width ?? null,
    height: input.height ?? null,
    durationSeconds: input.durationSeconds ?? null,
    isPublic: input.isPublic,
    createdAt: Date.now(),
  };
  upsertFile(file);
  archiveAudit({ itemId: input.itemId, actorId: actor.userId, eventType: 'updated', metadata: { fileRole: input.fileRole } });
  return { ok: true, file };
}

function transition(
  actor: ArchiveActor,
  itemId: string,
  action: ArchiveAction,
  toStatus: ArchiveItem['status'],
  changeReason: string,
  eventType: ArchiveEventType,
  auditType: ArchiveAuditEventType,
  metadata?: Record<string, unknown>,
): { ok: true; item: ArchiveItem } | { ok: false; reason: string } {
  const denied = assertArchiveAction(actor.role, action);
  if (!denied.ok) return denied;

  const item = findItemById(itemId);
  if (!item) return { ok: false, reason: 'Pieza no encontrada.' };

  const now = Date.now();
  const next: ArchiveItem = { ...item, updatedAt: now };

  if (toStatus === 'pending_review') {
    if (item.status !== 'draft') return { ok: false, reason: 'Solo los borradores se envían a revisión.' };
    next.status = 'pending_review';
  } else if (toStatus === 'approved') {
    if (item.status !== 'pending_review') return { ok: false, reason: 'Solo lo pendiente de revisión puede aprobarse.' };
    next.status = 'approved';
  } else if (toStatus === 'published') {
    if (item.status !== 'approved' && item.status !== 'pending_review') {
      return { ok: false, reason: 'Solo lo aprobado (o en revisión por el revisor) puede publicarse.' };
    }
    const ready = publicationReadiness(item);
    if (!ready.ok) {
      return { ok: false, reason: `No se puede publicar: ${ready.reasons.join(' ')}` };
    }
    next.status = 'published';
    next.publishedAt = now;
  } else if (toStatus === 'withdrawn') {
    if (item.status !== 'published') return { ok: false, reason: 'Solo lo publicado puede retirarse.' };
    next.status = 'withdrawn';
    next.withdrawnAt = now;
    next.withdrawnReason = changeReason;
  }

  next.updatedAt = now;

  const snapshot = { ...next };
  const revisionNumber = nextRevisionNumber(itemId);
  addRevision({
    id: newUuid(),
    itemId,
    revisionNumber,
    snapshot: snapshot as unknown as Record<string, unknown>,
    changeReason,
    createdAt: now,
  });

  upsertItem(next);
  scheduleItemPersist(next);
  archiveAudit({ itemId, actorId: actor.userId, eventType: auditType, metadata: { changeReason, ...metadata } });
  emit(itemId, eventType, { changeReason });
  return { ok: true, item: next };
}

export function submitItem(
  actor: ArchiveActor,
  itemId: string,
  changeReason: string,
): ReturnType<typeof transition> {
  return transition(actor, itemId, 'submit_item', 'pending_review', changeReason, 'archive.item.submitted', 'submitted_for_review');
}

export function approveItem(
  actor: ArchiveActor,
  itemId: string,
  changeReason: string,
): ReturnType<typeof transition> {
  return transition(actor, itemId, 'approve_item', 'approved', changeReason, 'archive.item.approved', 'approved');
}

export function publishItem(
  actor: ArchiveActor,
  itemId: string,
  changeReason: string,
): ReturnType<typeof transition> {
  return transition(actor, itemId, 'publish_item', 'published', changeReason, 'archive.item.published', 'published');
}

export function withdrawItem(
  actor: ArchiveActor,
  itemId: string,
  changeReason: string,
): ReturnType<typeof transition> {
  return transition(actor, itemId, 'withdraw_item', 'withdrawn', changeReason, 'archive.item.withdrawn', 'withdrawn');
}

/* ------------------------------------------------------------------ */
/* Entrega pública segura                                              */
/* ------------------------------------------------------------------ */

export function listPublishedItems(limit = 48, offset = 0): ArchiveItemWithFiles[] {
  return listItems()
    .filter(i => i.status === 'published' && i.accessLevel !== 'restricted')
    .sort((a, b) => (b.publishedAt ?? 0) - (a.publishedAt ?? 0))
    .slice(offset, offset + limit)
    .map(itemWithFiles);
}

export function getPublishedItemBySlug(slug: string): ArchiveItemWithFiles | null {
  const item = findItemBySlug(slug);
  return item ? publicItemView(item) : null;
}

export function getPublishedItemById(id: string): ArchiveItemWithFiles | null {
  const item = findItemById(id);
  return item ? publicItemView(item) : null;
}

/** Genera un enlace firmado a un derivado aprobado (nunca al original). */
export async function requestPublicDownload(
  itemId: string,
  fileRole: ArchiveFileRole,
): Promise<
  | { ok: true; url: string; expiresAt: number; fileName: string; mimeType: string }
  | { ok: false; reason: string; status?: number }
> {
  const item = findItemById(itemId);
  if (!item || item.status !== 'published') return { ok: false, reason: 'NO_ENCONTRADO', status: 404 };
  if (item.accessLevel === 'restricted') return { ok: false, reason: 'NO_ENCONTRADO', status: 404 };
  if (item.accessLevel === 'view_only') {
    return { ok: false, reason: 'Solo vista previa: este material no admite descarga.', status: 403 };
  }
  if (fileRole === 'original') return { ok: false, reason: 'El original no se entrega al público.', status: 403 };

  const file = listFilesByItem(itemId).find(f => f.fileRole === fileRole && f.isPublic);
  if (!file) return { ok: false, reason: 'NO_ENCONTRADO', status: 404 };
  if (!isCanonicalSha256(file.sha256)) return { ok: false, reason: 'Integridad no verificada.', status: 409 };

  const signed = await createSignedDownloadUrl({
    bucket: file.storageBucket,
    objectPath: file.objectPath,
    mimeType: file.mimeType,
  });
  if (!signed.ok) return { ok: false, reason: 'No se pudo firmar la descarga.' };

  archiveAudit({ itemId, eventType: 'download_requested', metadata: { fileRole } });
  emit(itemId, 'archive.item.downloaded', { fileRole });
  return { ok: true, url: signed.url, expiresAt: signed.expiresAt, fileName: file.objectPath.split('/').pop() ?? 'descarga', mimeType: file.mimeType };
}

/** Genera una URL firmada de lectura en línea (vista previa). No
 *  registra evento de descarga y no exige permiso de descarga: la
 *  consulta en línea es válida también para material `view_only`. */
export async function requestPublicPreview(
  itemId: string,
  fileRole: ArchiveFileRole,
): Promise<
  | { ok: true; url: string; expiresAt: number; fileName: string; mimeType: string }
  | { ok: false; reason: string; status?: number }
> {
  const item = findItemById(itemId);
  if (!item || item.status !== 'published') return { ok: false, reason: 'NO_ENCONTRADO', status: 404 };
  if (item.accessLevel === 'restricted') return { ok: false, reason: 'NO_ENCONTRADO', status: 404 };
  if (fileRole === 'original') return { ok: false, reason: 'El original no se expone al público.', status: 403 };

  const file = listFilesByItem(itemId).find(f => f.fileRole === fileRole && f.isPublic);
  if (!file) return { ok: false, reason: 'NO_ENCONTRADO', status: 404 };
  if (!isCanonicalSha256(file.sha256)) return { ok: false, reason: 'Integridad no verificada.', status: 409 };

  const signed = await createSignedDownloadUrl({
    bucket: file.storageBucket,
    objectPath: file.objectPath,
    mimeType: file.mimeType,
    expiresInSeconds: 600,
  });
  if (!signed.ok) return { ok: false, reason: 'No se pudo firmar la vista previa.' };

  return { ok: true, url: signed.url, expiresAt: signed.expiresAt, fileName: file.objectPath.split('/').pop() ?? 'preview', mimeType: file.mimeType };
}

/** Resumen editorial para el panel de administración. */
export function archiveSummary() {
  const items = listItems();
  const byStatus: Record<string, number> = {};
  for (const item of items) byStatus[item.status] = (byStatus[item.status] ?? 0) + 1;
  return {
    collections: listCollections(false).length,
    items: items.length,
    byStatus,
  };
}

/** Resuelve el rol de un actor (desde la tabla interna o demo). */
export function archiveRoleFor(userId: string): ArchiveRole | null {
  return roleOf(userId)?.role ?? null;
}
