/* ================================================================== */
/* CONTRACTS — Esquemas de validación ejecutables (zod)               */
/* ================================================================== */
/* Contratos de las rutas de la API. Un contrato ES el mismo documento */
/* que valida el cuerpo en runtime y tipa la entrada del handler.      */
/* Regla: nunca validar a mano lo que un contrato ya valida.           */
/* ================================================================== */

import { z } from 'zod';

/* ------------------------------------------------------------------ */
/* MARKETPLACE — publicación de listados                               */
/* ------------------------------------------------------------------ */

export const listingTypeSchema = z.enum(['twin', 'model', 'dataset', 'service', 'playbook', 'license']);

export const priceModelSchema = z
  .object({
    model: z.enum(['free', 'one-time', 'subscription', 'usage-based']),
    amountUsd: z.number().nonnegative().optional(),
    period: z.enum(['monthly', 'yearly']).optional(),
    perUnitUsd: z.number().nonnegative().optional(),
  })
  .default({ model: 'free' });

export const publishListingSchema = z.object({
  type: listingTypeSchema.default('dataset'),
  title: z.string().trim().min(1, 'title es requerido').max(160),
  description: z.string().max(500).default(''),
  provider: z.string().trim().min(1, 'provider es requerido').max(120),
  publisher: z.string().trim().max(120).optional(),
  status: z.enum(['published', 'pending']).default('pending'),
  price: priceModelSchema,
  tags: z.array(z.string()).max(12).default([]),
  compatibleDomains: z.array(z.string()).max(12).default([]),
});

export type PublishListingInput = z.infer<typeof publishListingSchema>;

/* ------------------------------------------------------------------ */
/* EAM/APM — registro de activos                                       */
/* ------------------------------------------------------------------ */

export const assetCategorySchema = z.enum([
  'transformer', 'switchgear', 'pump', 'valve', 'pipe',
  'vehicle', 'conveyor', 'compressor', 'structure', 'hvac',
]);

export const assetRegisterSchema = z.object({
  code: z.string().max(40).optional(),
  name: z.string().trim().min(1, 'name es requerido').max(160),
  category: assetCategorySchema.default('structure'),
  criticality: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  status: z.enum(['operational', 'degraded', 'maintenance', 'failure', 'retired']).default('operational'),
  condition: z.enum(['excellent', 'good', 'fair', 'poor', 'critical']).default('good'),
  strategy: z.enum(['reactive', 'preventive', 'predictive', 'condition-based']).default('preventive'),
  location: z
    .object({
      zone: z.string(),
      building: z.string().optional(),
      coordinates: z.object({ lat: z.number(), lng: z.number() }).optional(),
    })
    .optional(),
  manufacturer: z.string().max(120).optional(),
  model: z.string().max(120).optional(),
  serialNumber: z.string().max(80).optional(),
  designLifeYears: z.number().int().nonnegative().default(15),
  telemetry: z
    .object({
      temperatureC: z.number(),
      vibrationMmS: z.number().optional(),
      pressureBar: z.number().optional(),
      runtimeHours: z.number(),
      loadPercent: z.number(),
      lastUpdated: z.string(),
    })
    .optional(),
  tags: z.array(z.string()).max(12).default([]),
});

export type AssetRegisterInput = z.infer<typeof assetRegisterSchema>;

/* ------------------------------------------------------------------ */
/* GAMIFICATION — registro de eventos de juego                         */
/* ------------------------------------------------------------------ */

export const gameplayEventSchema = z
  .object({
    type: z.enum(['kill-zombie', 'wave-completed', 'combo', 'mission-completed', 'prize-redeemed']),
    sessionId: z.string().min(1, 'sessionId es requerido'),
    token: z.string().optional(),
    timestamp: z.number().optional(),
  })
  .passthrough();

export type GameplayEventInput = z.infer<typeof gameplayEventSchema>;

/* ------------------------------------------------------------------ */
/* ISA — razonamiento estructurado                                     */
/* ------------------------------------------------------------------ */

export const reasonSchema = z.object({
  query: z.string().trim().min(1, 'query es requerida'),
  context: z.record(z.string(), z.unknown()).optional(),
  mode: z.enum(['trace', 'answer', 'audit']).optional(),
});

export type ReasonInput = z.infer<typeof reasonSchema>;

/* ------------------------------------------------------------------ */
/* CONTINUITY — intenciones del Bastión de Emergencia (YUN BE)         */
/* ------------------------------------------------------------------ */

export const intentClassificationSchema = z.enum([
  'PUBLIC',
  'INTERNAL_LOW',
  'CONFIDENTIAL',
  'SOVEREIGN',
  'RESTRICTED',
]);

export const emergencyIntentSchema = z.object({
  eventId: z.string().trim().min(1, 'eventId es requerido').max(160),
  idempotencyKey: z.string().trim().min(1, 'idempotencyKey es requerido').max(160),
  traceId: z.string().trim().min(1, 'traceId es requerido').max(160),
  domain: z.string().trim().min(1, 'domain es requerido').max(120),
  federationId: z.string().trim().max(120).optional(),
  eventType: z.string().trim().min(1, 'eventType es requerido').max(120),
  classification: intentClassificationSchema,
  payload: z.record(z.string(), z.unknown()).default({}),
  occurredAt: z.string().min(1, 'occurredAt es requerido'),
  actorSubjectId: z.string().max(160).optional(),
});

export type EmergencyIntentInput = z.infer<typeof emergencyIntentSchema>;

export const activateIslandSchema = z.object({
  operatorConfirmed: z.boolean().optional(),
});

export const isolatePrimarySchema = z.object({
  reason: z.string().trim().max(500).optional(),
});

export const reconcileSchema = z.object({
  primaryRecovered: z.boolean(),
  dualApproval: z.boolean().optional(),
  replayReceipts: z
    .array(
      z.object({
        idempotencyKey: z.string().trim().min(1),
        status: z.enum(['APPLIED', 'DUPLICATE', 'REJECTED', 'CONFLICT']),
      }),
    )
    .max(500)
    .default([]),
});

export type ReconcileInput = z.infer<typeof reconcileSchema>;
