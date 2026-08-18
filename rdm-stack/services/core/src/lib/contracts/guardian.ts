import { z } from "zod";

/* ================================================================== */
/* DOMINIO — Guardian (Consola HITL, cola de acciones de alto impacto) */
/* ================================================================== */

export const GuardianActionTypeSchema = z.enum([
  "ECONOMIC_FREEZE",
  "CONTENT_MEDIATION",
  "IDENTITY_RECOVERY",
  "POLICY_CHANGE",
  "IDENTITY_RECOVERY_REQUEST",
]);

export const GuardianRecommendationSchema = z.enum(["approve", "deny", "escalate"]);

export const GuardianActionSchema = z.object({
  id: z.string().min(1).max(60),
  actionType: GuardianActionTypeSchema,
  target: z.string().min(1).max(200),
  recommendation: GuardianRecommendationSchema,
  explanation: z.string().min(1).max(2000),
  confidence: z.number().min(0).max(1),
  flags: z.array(z.string()),
  createdAt: z.string().datetime({ offset: true }),
});

export type GuardianAction = z.infer<typeof GuardianActionSchema>;

export const GuardianDecisionSchema = z.enum(["ratificar", "bloquear"]);

export const GuardianResolveSchema = z.object({
  actionId: z.string().min(1).max(60),
  decision: GuardianDecisionSchema,
  guardianId: z.string().min(1).max(120),
  note: z.string().max(2000).optional(),
});

export type GuardianResolve = z.infer<typeof GuardianResolveSchema>;

export const GuardianResolveResultSchema = z.object({
  ok: z.boolean(),
  actionId: z.string(),
  decision: GuardianDecisionSchema,
  sealed: z.boolean().describe("Indica si la resolución quedó sellada en BookPI"),
  hash: z.string().regex(/^[a-f0-9]{64}$/).describe("Hash SHA-256 de la resolución sellada"),
});

export type GuardianResolveResult = z.infer<typeof GuardianResolveResultSchema>;
