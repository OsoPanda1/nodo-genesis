/* ================================================================== */
/* ARCHIVO HISTÓRICO — Tipos del dominio                               */
/* ================================================================== */
/* Tipos de dominio del Archivo Histórico RDM Digital. Reflejan las    */
/* tablas de la migración 004 pero con nombres camelCase para el       */
/* runtime en memoria.                                                 */
/* ================================================================== */

export type ArchiveItemStatus =
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'published'
  | 'withdrawn'
  | 'archived';

export type ArchiveAssetType =
  | 'photograph'
  | 'document'
  | 'newspaper'
  | 'map'
  | 'audio'
  | 'video'
  | 'oral_history'
  | 'artifact'
  | 'three_d_model';

export type ArchiveAccessLevel =
  | 'open'
  | 'download_only'
  | 'view_only'
  | 'restricted';

export type ArchiveRightsStatus =
  | 'public_domain'
  | 'permission_granted'
  | 'copyrighted'
  | 'rights_unknown'
  | 'restricted';

export type ArchiveRole =
  | 'contributor'
  | 'archivist'
  | 'reviewer'
  | 'archive_admin';

export type ArchiveFileRole =
  | 'original'
  | 'access_copy'
  | 'thumbnail'
  | 'transcript'
  | 'manifest';

export type ArchiveBucket =
  | 'archive-originals'
  | 'archive-public'
  | 'archive-restricted';

export interface ArchiveCollection {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  coverImagePath: string | null;
  isPublic: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface ArchiveItem {
  id: string;
  collectionId: string;
  slug: string;
  title: string;
  summary: string;
  description: string | null;
  assetType: ArchiveAssetType;
  status: ArchiveItemStatus;
  accessLevel: ArchiveAccessLevel;
  rightsStatus: ArchiveRightsStatus;
  authorOrSource: string | null;
  sourceReference: string | null;
  donorName: string | null;
  license: string | null;
  historicalDateStart: string | null;
  historicalDateEnd: string | null;
  datePrecision: 'exact' | 'month' | 'year' | 'circa' | 'unknown';
  locationName: string | null;
  latitude: number | null;
  longitude: number | null;
  people: string[];
  organizations: string[];
  tags: string[];
  publishedAt: number | null;
  withdrawnAt: number | null;
  withdrawnReason: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface ArchiveFileRecord {
  id: string;
  itemId: string;
  storageBucket: ArchiveBucket;
  objectPath: string;
  fileRole: ArchiveFileRole;
  mimeType: string;
  byteSize: number;
  sha256: string;
  width: number | null;
  height: number | null;
  durationSeconds: number | null;
  isPublic: boolean;
  createdAt: number;
}

export interface ArchiveRevision {
  id: string;
  itemId: string;
  revisionNumber: number;
  snapshot: Record<string, unknown>;
  changeReason: string;
  createdAt: number;
}

export type ArchiveAuditEventType =
  | 'created'
  | 'updated'
  | 'submitted_for_review'
  | 'approved'
  | 'published'
  | 'withdrawn'
  | 'download_requested'
  | 'integrity_verified';

export interface ArchiveAuditEvent {
  id: string;
  itemId: string | null;
  actorId: string | null;
  eventType: ArchiveAuditEventType;
  traceId: string | null;
  correlationId: string | null;
  metadata: Record<string, unknown>;
  occurredAt: number;
}

export interface ArchiveStaffRole {
  userId: string;
  role: ArchiveRole;
  grantedAt: number;
}

/** Pieza con sus archivos resueltos (vista pública/editorial). */
export interface ArchiveItemWithFiles extends ArchiveItem {
  collection: ArchiveCollection | null;
  files: ArchiveFileRecord[];
}
