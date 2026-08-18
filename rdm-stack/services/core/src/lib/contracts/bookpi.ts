import { z } from "zod";

/* ================================================================== */
/* DOMINIO — BookPI Registry (registro encadenado SHA-256)            */
/* ================================================================== */

export const BookPIEntrySchema = z.object({
  id: z.string().regex(/^evt-/).describe("Identificador único del evento"),
  type: z.string().min(1).describe("Tipo de evento, formato <dominio>.<accion>"),
  source: z.string().min(1).describe("Componente emisor"),
  domain: z.string().min(1).describe("Dominio de negocio"),
  timestamp: z.string().datetime({ offset: true }).describe("Marca ISO (UTC)"),
  hash: z.string().regex(/^[a-f0-9]{64}$/).describe("SHA-256 del cuerpo canónico"),
  prevHash: z.string().regex(/^[a-f0-9]{64}$/).nullable().describe("Hash del evento anterior (NULL para génesis)"),
  data: z.record(z.string(), z.unknown()).describe("Payload JSON-serializable"),
});

export type BookPIEntry = z.infer<typeof BookPIEntrySchema>;

export const BookPIWriteRequestSchema = z.object({
  type: z.string().min(1).max(120),
  source: z.string().min(1).max(120),
  domain: z.string().min(1).max(80),
  data: z.record(z.string(), z.unknown()),
});

export type BookPIWriteRequest = z.infer<typeof BookPIWriteRequestSchema>;

export const BookPIWriteResponseSchema = z.object({
  ok: z.boolean(),
  entry: BookPIEntrySchema,
  prevHash: z.string().regex(/^[a-f0-9]{64}$/).nullable(),
});

export type BookPIWriteResponse = z.infer<typeof BookPIWriteResponseSchema>;

export const BookPIQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(50),
  domain: z.string().optional(),
});

export type BookPIQuery = z.infer<typeof BookPIQuerySchema>;
