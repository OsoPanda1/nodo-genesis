/* ================================================================== */
/* MARKETPLACE YUN — Contratos de API (zod)                            */
/* ================================================================== */
/* Cuerpos de las rutas /api/marketplace/*.                            */
/* Sustituyen la validación manual de listingId/licensee en handlers.  */
/* ================================================================== */

import { z } from 'zod';

export const licenseeSchema = z
  .string()
  .trim()
  .min(1, 'licensee is required')
  .max(64, 'licensee is too long');

export const listingIdSchema = z
  .string()
  .trim()
  .min(1, 'listingId is required')
  .max(120, 'listingId is too long');

/**
 * Suscripción/adquisición de un listado
 * (POST /api/marketplace/subscribe).
 */
export const subscribeSchema = z.object({
  listingId: listingIdSchema,
  licensee: licenseeSchema.default('yun-node'),
});

export type SubscribeInput = z.infer<typeof subscribeSchema>;

/**
 * Consulta de licencia
 * (POST /api/marketplace/license).
 */
export const licenseCheckSchema = z.object({
  listingId: listingIdSchema,
  licensee: licenseeSchema.default('yun-node'),
});

export type LicenseCheckInput = z.infer<typeof licenseCheckSchema>;
