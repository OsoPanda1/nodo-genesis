/* ================================================================== */
/* CITEMESH — Contratos de la malla federada autopoietica             */
/* ================================================================== */
/* Espejo ejecutable del blueprint `tamv-nexus-core`: gobernanza       */
/* criptográfica multi-nivel, topología de celdas federadas (F1-F3)    */
/* y paquetes de ruta firmados. Todos los contratos son `.strict()`:   */
/* cualquier clave extra invalida el documento (fail-closed).          */
/* ================================================================== */

import { z } from 'zod';

export const CITEMESH_SEMANTIC_VERSION = 'citemesh.mesh.v1';
export const CITEMESH_PROVIDER = 'citemesh';

/* Poder de gobernanza de un nodo dentro de la malla. */
export const governancePowerSchema = z.enum(['LOGICAL', 'EXECUTIVE', 'OBSERVER', 'HUMAN']);

/* Nivel de calidad del renderizado híbrido (CITEMESH HRO). */
export const qualityLevelSchema = z.enum(['Q0', 'Q1', 'Q2', 'Q3']);

/* Topología de celda federada a la que pertenece el nodo. */
export const cellTopologySchema = z.enum(['F1', 'F2', 'F3']);

/* Configuración de un nodo edge P2P de la malla. */
export const citemeshNodeConfigSchema = z
  .object({
    nodeId: z.string().trim().min(1, 'nodeId es requerido').max(120),
    cellTopology: cellTopologySchema,
    governancePower: governancePowerSchema,
    hroQuality: qualityLevelSchema,
    endpoint: z.string().url('endpoint debe ser una URL válida'),
    p2pPublicKey: z.string().trim().min(16, 'p2pPublicKey con longitud inválida').max(256),
    failoverActive: z.boolean().default(false),
  })
  .strict();

export type GovernancePower = z.infer<typeof governancePowerSchema>;
export type QualityLevel = z.infer<typeof qualityLevelSchema>;
export type CellTopology = z.infer<typeof cellTopologySchema>;
export type CitemeshNodeConfig = z.infer<typeof citemeshNodeConfigSchema>;

/* Paquete de ruta firmado que circula entre nodos de la malla. */
export const citemeshRoutePacketSchema = z
  .object({
    traceId: z.string().trim().min(1).max(160),
    sourceNode: z.string().trim().min(1).max(120),
    targetCell: z.string().trim().min(1).max(120),
    payload: z.record(z.string(), z.unknown()).default({}),
    signature: z.string().trim().min(16, 'signature con longitud inválida').max(512),
    timestamp: z.number().int().nonnegative('timestamp debe ser un epoch válido'),
  })
  .strict();

export type CitemeshRoutePacket = z.infer<typeof citemeshRoutePacketSchema>;

/* Solicitud de registro: configuración + credencial derivada de la
   p2pPublicKey (probar conocimiento de la identidad P2P). */
export const citemeshRegisterNodeRequestSchema = z
  .object({
    config: citemeshNodeConfigSchema,
    nodeSecret: z.string().trim().min(1, 'nodeSecret es requerido').max(256),
  })
  .strict();

export type CitemeshRegisterNodeRequest = z.infer<typeof citemeshRegisterNodeRequestSchema>;
