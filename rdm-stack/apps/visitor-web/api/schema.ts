import { z } from "zod";

export const GeoPointSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  alt: z.number().optional(),
});

export const BoundingBoxSchema = z.object({
  minLat: z.number(),
  maxLat: z.number(),
  minLng: z.number(),
  maxLng: z.number(),
});

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const MessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1),
});

export const IsabellaRequestSchema = z.object({
  model: z.string().optional(),
  messages: z.array(MessageSchema).min(1),
  max_tokens: z.number().int().min(1).max(8192).optional(),
  temperature: z.number().min(0).max(2).optional(),
  stream: z.boolean().optional(),
  context: z
    .object({
      federation: z.string().optional(),
      useCase: z.string().optional(),
      userId: z.string().nullable().optional(),
    })
    .optional(),
});

export const ModelRouterRequestSchema = z.object({
  model: z.string().min(1),
  prompt: z.string().min(1),
  max_tokens: z.number().int().min(1).max(8192).default(512),
  temperature: z.number().min(0).max(2).default(0.7),
  context: z
    .object({
      federation: z.string().optional(),
      useCase: z.string().optional(),
      userId: z.string().nullable().optional(),
    })
    .optional(),
});

export const TelemetryEventSchema = z.object({
  level: z.enum(["info", "warn", "error"]),
  message: z.string().min(1),
  traceId: z.string().optional(),
  data: z.record(z.unknown()).optional(),
});

export const FederationCommandSchema = z.object({
  type: z.string().min(1),
  federation: z.string().min(1),
  payload: z.record(z.unknown()),
  userId: z.string().optional(),
});

export type GeoPoint = z.infer<typeof GeoPointSchema>;
export type IsabellaRequest = z.infer<typeof IsabellaRequestSchema>;
export type ModelRouterRequest = z.infer<typeof ModelRouterRequestSchema>;
export type TelemetryEvent = z.infer<typeof TelemetryEventSchema>;
export type FederationCommand = z.infer<typeof FederationCommandSchema>;
