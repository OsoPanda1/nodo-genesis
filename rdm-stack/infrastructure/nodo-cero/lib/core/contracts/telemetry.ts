import { z } from 'zod';

export const TELEMETRY_CONTRACT_VERSION = 'telemetry-v1' as const;

export const telemetryLevelSchema = z.enum([
  'debug',
  'info',
  'warn',
  'error',
  'fatal',
]);

export const telemetryScopeSchema = z.enum([
  'ui',
  'api',
  'isabella',
  'federation',
  'governance',
  'security',
  'persistence',
  'system',
]);

export const federationStatusSchema = z.enum([
  'online',
  'degraded',
  'offline',
  'unknown',
]);

export const telemetryHealthStatusSchema = z.enum([
  'healthy',
  'degraded',
  'offline',
  'unknown',
]);

export const telemetryEventSchema = z.object({
  version: z.literal(TELEMETRY_CONTRACT_VERSION),
  id: z.string().uuid(),
  occurredAt: z.string().datetime({ offset: true }),
  level: telemetryLevelSchema,
  scope: telemetryScopeSchema,
  source: z.string().min(2).max(120),
  event: z.string().min(2).max(120),
  message: z.string().min(1).max(1_000),
  route: z.string().max(300).optional(),
  traceId: z.string().max(160).optional(),
  requestId: z.string().uuid().optional(),
  sessionId: z.string().max(160).optional(),
  userId: z.string().max(160).optional(),
  details: z.record(z.string(), z.unknown()).default({}),
});

export const federationStatusSchemaV1 = z.object({
  key: z.string().min(1).max(80),
  name: z.string().min(1).max(160),
  status: federationStatusSchema,
  latency_ms: z.number().finite().min(0).max(120_000),
  metric: z.string().max(180),
  detail: z.string().max(500),
  checked_at: z.string().datetime({ offset: true }).optional(),
});

export const federationHealthSummarySchema = z.object({
  online: z.number().int().nonnegative(),
  degraded: z.number().int().nonnegative(),
  offline: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
  avg_latency_ms: z.number().finite().min(0).max(120_000),
  integrity: z.number().finite().min(0).max(1),
  checked_at: z.string().datetime({ offset: true }).optional(),
});

export const federationHealthResponseSchema = z.object({
  federations: z.array(federationStatusSchemaV1).max(32).default([]),
  summary: federationHealthSummarySchema.nullable().default(null),
});

export const telemetryKpiSchema = z.object({
  places_active: z.number().int().nonnegative(),
  businesses_verified: z.number().int().nonnegative(),
  events_upcoming: z.number().int().nonnegative(),
  premium_active: z.number().int().nonnegative(),
  commerce_active: z.number().int().nonnegative(),
  tracking_events_24h: z.number().int().nonnegative(),
  redemptions_24h: z.number().int().nonnegative(),
  measured_at: z.string().datetime({ offset: true }).optional(),
});

export const metricsAggregatesResponseSchema = z.object({
  kpis: telemetryKpiSchema.nullable().default(null),
});

export const telemetryHealthSchema = z.object({
  status: telemetryHealthStatusSchema,
  checkedAt: z.string().datetime({ offset: true }),
  service: z.string().min(2).max(120),
  version: z.string().max(80).optional(),
  latencyMs: z.number().int().nonnegative().max(120_000).optional(),
  message: z.string().max(300).optional(),
});

export type TelemetryEvent = z.infer<typeof telemetryEventSchema>;
export type TelemetryLevel = z.infer<typeof telemetryLevelSchema>;
export type TelemetryScope = z.infer<typeof telemetryScopeSchema>;
export type FederationStatus = z.infer<typeof federationStatusSchema>;
export type FederationStatusItem = z.infer<typeof federationStatusSchemaV1>;
export type FederationHealthSummary = z.infer<
  typeof federationHealthSummarySchema
>;
export type FederationHealthResponse = z.infer<
  typeof federationHealthResponseSchema
>;
export type TelemetryKpi = z.infer<typeof telemetryKpiSchema>;
export type MetricsAggregatesResponse = z.infer<
  typeof metricsAggregatesResponseSchema
>;
export type TelemetryHealth = z.infer<typeof telemetryHealthSchema>;
