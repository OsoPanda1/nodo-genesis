/* ================================================================== */
/* TWINS YUN — Contratos de API (zod)                                  */
/* ================================================================== */
/* Cuerpos de las rutas /api/twins/*. Sustituyen la validación manual  */
/* de campos obligatorios dispersa en los handlers.                    */
/* ================================================================== */

import { z } from 'zod';

export const twinDomains = z.enum([
  'building', 'energy', 'water', 'vehicle', 'publicSpace', 'cityService', 'custom',
]);

export const twinStatuses = z.enum(['healthy', 'warning', 'critical', 'offline']);

/** Alta de un modelo DTDL (POST /api/twins/models). */
export const twinModelSchema = z.object({
  id: z.string().trim().max(160).optional(),
  dtmi: z.string().trim().min(1).max(200),
  name: z.string().trim().min(1).max(120),
  version: z.number().int().min(1).max(9999).default(1),
  domain: twinDomains.default('custom'),
  schema: z.unknown().refine(v => v !== null && typeof v === 'object', 'schema debe ser un objeto'),
});

export type TwinModelInput = z.infer<typeof twinModelSchema>;

/** Alta de una instancia gemela (POST /api/twins/instances). */
export const twinInstanceSchema = z.object({
  id: z.string().trim().min(1).max(120),
  modelId: z.string().trim().min(1).max(200),
  name: z.string().trim().min(1).max(120),
  externalRef: z.string().trim().max(160).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  properties: z.record(z.string(), z.unknown()).default({}),
  telemetry: z.record(z.string(), z.unknown()).default({}),
  status: twinStatuses.default('healthy'),
});

export type TwinInstanceInput = z.infer<typeof twinInstanceSchema>;

/** Simulación de un gemelo (POST /api/twins/simulate). */
export const twinSimulateSchema = z.object({
  id: z.string().trim().max(120).optional(),
  modelId: z.string().trim().max(200).optional(),
  name: z.string().trim().max(120).optional(),
  properties: z.record(z.string(), z.unknown()).default({}),
  telemetry: z.record(z.string(), z.unknown()).default({}),
});

export type TwinSimulateInput = z.infer<typeof twinSimulateSchema>;
