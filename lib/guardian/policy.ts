/* ================================================================== */
/* GUARDIAN YUN — Contratos de política                                */
/* ================================================================== */
/* Contratos zod del Guardian Kernel: políticas de autorización con    */
/* deny-by-default, mínimo privilegio y autonomía acotada.             */
/* ================================================================== */

import { z } from 'zod';

export const guardianPolicySchema = z.object({
  id: z.string().min(1),
  /** Sujeto (p.ej. `service:gamification`, `user:o`; `*` = cualquiera). */
  principal: z.string().min(1),
  /** Acción (p.ej. `publish`, `emergency.arm`). */
  action: z.string().min(1),
  /** Recurso (`api:marketplace:publish`; `*` = todos). */
  resource: z.string().min(1),
  effect: z.enum(['allow', 'deny']),
  /** True si puede ejecutarse sin intervención humana. */
  autonomous: z.boolean().default(true),
  /** True si la acción puede revertirse de forma idempotente. */
  reversible: z.boolean().default(false),
});

export type GuardianPolicy = z.infer<typeof guardianPolicySchema>;

export const guardianRequestSchema = z.object({
  principal: z.string().min(1),
  action: z.string().min(1),
  resource: z.string().min(1),
  /** Clave para deduplicar decisiones (idempotencia). */
  idempotencyKey: z.string().optional(),
});

export type GuardianRequest = z.infer<typeof guardianRequestSchema>;

export const guardianDecisionSchema = z.object({
  effect: z.enum(['allow', 'deny']),
  reason: z.string(),
  matchedPolicyId: z.string().nullable(),
  needsHuman: z.boolean(),
  autonomy: z.enum(['L0', 'L1', 'L2', 'L3']),
  emergencyLevel: z.number().int().min(0).max(4),
  reversible: z.boolean(),
  replayed: z.boolean().default(false),
});

export type GuardianDecision = z.infer<typeof guardianDecisionSchema>;
