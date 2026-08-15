/* ================================================================== */
/* GEMET — Contratos del Grafo de Conocimiento Federado              */
/* ================================================================== */
/* Espejo ejecutable del blueprint `tamv-nexus-core`: el grafo de      */
/* conocimiento federado (GEMET) distribuye registros ontológicos      */
/* firmados por checksum entre réplicas del Nodo Cero.                 */
/*                                                                     */
/*   - Registro de nodo: identificador, ontología (URI), propiedades,  */
/*     checksum sha256 canónico y versión.                             */
/*   - Consulta: profundidad, consistencia estricta y filtro por       */
/*     ontología.                                                      */
/*                                                                     */
/* Todos los contratos son `.strict()`: cualquier clave extra invalida */
/* el documento (fail-closed en la capa HTTP).                         */
/* ================================================================== */

import { z } from 'zod';

export const GEMET_SEMANTIC_VERSION = 'gemet.graph.v1';
export const GEMET_PROVIDER = 'gemet';
export const GEMET_QUERY_ENDPOINT = '/gemet/query';
export const GEMET_MAX_DEPTH = 6;

/* Registro de conocimiento distribuido en el grafo federado. */
export const gemetNodeRecordSchema = z
  .object({
    id: z.string().trim().min(1, 'id es requerido').max(160),
    ontologyUri: z.string().url('ontologyUri debe ser una URL válida'),
    properties: z.record(z.string(), z.unknown()).default({}),
    checksum: z.string().regex(/^[a-f0-9]{64}$/, 'checksum sha256 inválido'),
    version: z.number().int().nonnegative('version inválida'),
  })
  .strict();

/* Opciones de consulta al grafo federado. */
export const gemetQueryOptionsSchema = z
  .object({
    depth: z.number().int().min(0).max(GEMET_MAX_DEPTH).optional().default(1),
    strictConsistency: z.boolean().optional().default(true),
    filterByOntology: z.string().url('filterByOntology debe ser una URL válida').optional(),
  })
  .strict();

/* Solicitud de consulta (envuelve id + opciones). */
export const gemetQueryRequestSchema = z
  .object({
    id: z.string().trim().min(1, 'id es requerido').max(160),
    options: gemetQueryOptionsSchema.optional(),
  })
  .strict();

export type GemetNodeRecord = z.infer<typeof gemetNodeRecordSchema>;
export type GemetQueryOptions = z.infer<typeof gemetQueryOptionsSchema>;
export type GemetQueryRequest = z.infer<typeof gemetQueryRequestSchema>;
