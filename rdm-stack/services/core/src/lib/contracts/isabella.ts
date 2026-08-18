import { z } from "zod";

/* ================================================================== */
/* DOMINIO — Isabella AI (pipeline cognitivo, KEC, decisiones)        */
/* ================================================================== */

export const VAD_SCHEMA = z.object({
  valence: z.number().min(-1).max(1).describe("Valencia emocional (-1..1)"),
  arousal: z.number().min(0).max(1).describe("Activación (0..1)"),
  dominance: z.number().min(0).max(1).describe("Dominancia (0..1)"),
});

export type VAD = z.infer<typeof VAD_SCHEMA>;

export const IsabellaRequestSchema = z.object({
  prompt: z.string().min(1).max(4000),
  sessionId: z.string().min(1).max(120).optional(),
  domain: z.enum(["general", "turismo", "gobernanza", "economia", "identidad", "seguridad"]).default("general"),
  userId: z.string().min(1).max(120).optional(),
});

export type IsabellaRequest = z.infer<typeof IsabellaRequestSchema>;

export const IsabellaResponseSchema = z.object({
  reply: z.string().min(1),
  decision: z.string().min(1),
  confidence: z.number().min(0).max(1),
  explanation: z.string(),
  flags: z.array(z.string()),
  vad: VAD_SCHEMA,
  hitl: z.boolean().describe("Requiere supervisión humana en el bucle"),
  pipelineStage: z.number().int().min(0).max(6),
});

export type IsabellaResponse = z.infer<typeof IsabellaResponseSchema>;

export const IsabellaFeedbackSchema = z.object({
  sessionId: z.string().min(1).max(120),
  helpful: z.boolean(),
  comment: z.string().max(1000).optional(),
});

export type IsabellaFeedback = z.infer<typeof IsabellaFeedbackSchema>;
