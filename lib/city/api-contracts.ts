/* ================================================================== */
/* CITY YUN — Contratos de API (zod)                                   */
/* ================================================================== */
/* Cuerpos de las rutas /api/city/*. Sustituyen la validación manual   */
/* de dominios/severidades dispersa en los handlers.                   */
/* ================================================================== */

import { z } from 'zod';

export const cityDomains = z.enum([
  'police', 'fire', 'traffic', 'utilities', 'publicWorks', 'health',
  'civilProtection', 'mobility', 'energy', 'water', 'environment',
]);

export const citySeverities = z.enum(['low', 'medium', 'high', 'critical']);
export const cityIncidentStatuses = z.enum(['open', 'triaged', 'assigned', 'mitigated', 'closed']);
export const cityIncidentSources = z.enum(['sensor', 'citizen', 'operator', 'integration', 'ai']);

/** Alta de un incidente en el IOC (POST /api/city/incidents). */
export const cityIncidentSchema = z.object({
  id: z.string().trim().max(64).optional(),
  domain: cityDomains,
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(500).optional(),
  severity: citySeverities.default('medium'),
  source: cityIncidentSources.default('operator'),
  tags: z.array(z.string().trim().max(40)).max(12).optional(),
  relatedEntityIds: z.array(z.string().trim().max(64)).max(12).optional(),
});

export type CityIncidentInput = z.infer<typeof cityIncidentSchema>;

/** Parche de un incidente (PATCH /api/city/incidents). */
export const cityIncidentPatchSchema = z.object({
  id: z.string().trim().min(1).max(64),
  status: cityIncidentStatuses.optional(),
  severity: citySeverities.optional(),
  description: z.string().trim().max(500).optional(),
  tags: z.array(z.string().trim().max(40)).max(12).optional(),
});

export type CityIncidentPatchInput = z.infer<typeof cityIncidentPatchSchema>;

/** Publicación de un evento de ciudad (POST /api/city/events). */
export const cityEventSchema = z.object({
  type: z.string().trim().min(1).max(80).default('city.event'),
  domain: cityDomains,
  severity: citySeverities.default('medium'),
  payload: z.record(z.string(), z.unknown()).default({}),
});

export type CityEventInput = z.infer<typeof cityEventSchema>;
