/* ================================================================== */
/* BARRIL DE COMPATIBILIDAD — Utils de Isabella                       */
/* ================================================================== */
/* Los helpers genéricos (uuid, nowIso, fnv1aChecksum, clamp) son      */
/* transversales. La implementación canónica vive en lib/core/utils/.  */
/* Este archivo re-exporta para no romper los imports existentes.      */
/* ================================================================== */

export * from '@/lib/core/utils';
