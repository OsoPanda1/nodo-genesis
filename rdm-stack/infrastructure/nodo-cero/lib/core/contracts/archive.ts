/* ================================================================== */
/* ARCHIVO HISTÓRICO — Contratos zod del dominio de patrimonio         */
/* ================================================================== */
/* Única fuente de verdad sobre la forma de las peticiones del Archivo */
/* Histórico RDM Digital. Los cuerpos de las rutas /api/archive/* se   */
/* validan con estos contratos (nunca validación manual duplicada).    */
/* Los límites reducen abuso de memoria, rutas no previstas y          */
/* metadatos sin acotar.                                               */
/* ================================================================== */

import { z } from 'zod';

export const archiveAssetTypeSchema = z.enum([
  'photograph',
  'document',
  'newspaper',
  'map',
  'audio',
  'video',
  'oral_history',
  'artifact',
  'three_d_model',
]);

export const archiveAccessLevelSchema = z.enum([
  'open',
  'download_only',
  'view_only',
  'restricted',
]);

export const archiveRightsStatusSchema = z.enum([
  'public_domain',
  'permission_granted',
  'copyrighted',
  'rights_unknown',
  'restricted',
]);

export const archiveStatusSchema = z.enum([
  'draft',
  'pending_review',
  'approved',
  'published',
  'withdrawn',
  'archived',
]);

export const archiveRoleSchema = z.enum([
  'contributor',
  'archivist',
  'reviewer',
  'archive_admin',
]);

export const archiveFileRoleSchema = z.enum([
  'original',
  'access_copy',
  'thumbnail',
  'transcript',
  'manifest',
]);

export const archiveBucketSchema = z.enum([
  'archive-originals',
  'archive-public',
  'archive-restricted',
]);

export const slugSchema = z
  .string()
  .min(3)
  .max(140)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

/** Consulta pública de búsqueda y listado. */
export const archiveSearchSchema = z
  .object({
    q: z.string().trim().min(1).max(120).optional(),
    collection: slugSchema.optional(),
    assetType: archiveAssetTypeSchema.optional(),
    yearFrom: z.coerce.number().int().min(1500).max(2100).optional(),
    yearTo: z.coerce.number().int().min(1500).max(2100).optional(),
    page: z.coerce.number().int().min(1).max(500).default(1),
    pageSize: z.coerce.number().int().min(1).max(48).default(18),
  })
  .strict();

/** Alta de ficha editorial (borrador). */
export const createArchiveItemSchema = z
  .object({
    collectionId: z.string().uuid(),
    slug: slugSchema,
    title: z.string().trim().min(3).max(240),
    summary: z.string().trim().min(20).max(800),
    description: z.string().trim().max(20_000).optional(),

    assetType: archiveAssetTypeSchema,
    accessLevel: archiveAccessLevelSchema.default('open'),
    rightsStatus: archiveRightsStatusSchema,
    authorOrSource: z.string().trim().max(300).optional(),
    sourceReference: z.string().trim().max(500).optional(),
    donorName: z.string().trim().max(300).optional(),
    license: z.string().trim().max(200).optional(),

    historicalDateStart: isoDateSchema.optional(),
    historicalDateEnd: isoDateSchema.optional(),
    datePrecision: z
      .enum(['exact', 'month', 'year', 'circa', 'unknown'])
      .default('unknown'),

    locationName: z.string().trim().max(200).optional(),
    latitude: z.number().finite().min(-90).max(90).optional(),
    longitude: z.number().finite().min(-180).max(180).optional(),

    people: z.array(z.string().trim().min(1).max(160)).max(50).default([]),
    organizations: z.array(z.string().trim().min(1).max(160)).max(50).default([]),
    tags: z.array(z.string().trim().min(1).max(80)).max(50).default([]),
  })
  .strict();

/** Registro de un archivo subido a Storage. */
export const uploadArchiveFileSchema = z
  .object({
    itemId: z.string().uuid(),
    fileRole: archiveFileRoleSchema,
    storageBucket: archiveBucketSchema,
    objectPath: z.string().trim().min(1).max(500),
    mimeType: z.enum([
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/tiff',
      'application/pdf',
      'audio/mpeg',
      'audio/wav',
      'video/mp4',
      'text/plain',
      'application/json',
    ]),
    byteSize: z.number().int().positive().max(52_428_800),
    sha256: z.string().regex(/^sha256:[a-f0-9]{64}$/),
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
    durationSeconds: z.number().int().nonnegative().optional(),
    isPublic: z.boolean().default(false),
  })
  .strict();

/** Solicitud de URL firmada de subida. */
export const archiveUploadUrlSchema = z
  .object({
    itemId: z.string().uuid(),
    fileName: z.string().trim().min(1).max(200),
    fileRole: archiveFileRoleSchema,
    mimeType: z.enum([
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/tiff',
      'application/pdf',
      'audio/mpeg',
      'audio/wav',
      'video/mp4',
      'text/plain',
      'application/json',
    ]),
    byteSize: z.number().int().positive().max(52_428_800),
  })
  .strict();

/** Transición editorial (submit/approve/publish/withdraw). */
export const archivePublicationSchema = z
  .object({
    changeReason: z.string().trim().min(3).max(500),
  })
  .strict();

/** Solicitud de descarga pública de un derivado. */
export const archiveDownloadSchema = z
  .object({
    fileRole: archiveFileRoleSchema
      .default('access_copy')
      .refine(v => v !== 'original', { message: 'el original nunca se descarga públicamente' }),
  })
  .strict();

export type ArchiveSearchInput = z.infer<typeof archiveSearchSchema>;
export type CreateArchiveItemInput = z.infer<typeof createArchiveItemSchema>;
export type UploadArchiveFileInput = z.infer<typeof uploadArchiveFileSchema>;
export type ArchiveUploadUrlInput = z.infer<typeof archiveUploadUrlSchema>;
export type ArchivePublicationInput = z.infer<typeof archivePublicationSchema>;
export type ArchiveDownloadInput = z.infer<typeof archiveDownloadSchema>;
