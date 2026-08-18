/* ========================================================================== */
/* ISA-AI CONTRACT — Envelope semántico seguro, trazable y fail-closed        */
/* ========================================================================== */
/*
 * Propósito:
 * - Contrato canónico de salida de Isabella.
 * - Validación estricta, limitada y serializable.
 * - No transporta secretos, comandos, HTML arbitrario ni resultados crudos
 *   de herramientas.
 * - La ejecución de herramientas ocurre fuera de este contrato y debe pasar
 *   por PolicyEngine + ApprovalService + SandboxRunner.
 *
 * Reglas:
 * - Todo objeto es `.strict()` para rechazar propiedades no reconocidas.
 * - Toda colección tiene límite de longitud para reducir abuso de payload.
 * - Los IDs, URLs, fechas y valores sensibles se validan explícitamente.
 * - `content` es una respuesta final para usuarios; no es un canal de control.
 * - `structured.data` y `tool.result` se restringen a JSON seguro.
 */
/* ========================================================================== */

import { z } from 'zod';

/* -------------------------------------------------------------------------- */
/* Límites canónicos                                                          */
/* -------------------------------------------------------------------------- */

export const ISA_AI_CONTRACT_VERSION = 'mexa-ai-v2.1.0' as const;

export const ISA_AI_LIMITS = {
  contentMaxChars: 24_000,
  topicMaxChars: 240,
  intentMaxChars: 120,
  modelMaxChars: 180,
  errorCodeMaxChars: 80,
  reasonMaxChars: 1_000,
  citationLabelMaxChars: 300,
  toolNameMaxChars: 120,
  toolCountMax: 16,
  radarCountMax: 16,
  securitySystemCountMax: 16,
  knowledgeEntryCountMax: 24,
  appliedPolicyCountMax: 32,
  safeJsonDepthMax: 8,
  safeJsonArrayMax: 100,
  safeJsonObjectKeysMax: 100,
} as const;

/* -------------------------------------------------------------------------- */
/* Primitivos seguros                                                        */
/* -------------------------------------------------------------------------- */

const nonEmptyTrimmedString = (max: number) =>
  z.string().trim().min(1).max(max);

const optionalTrimmedString = (max: number) =>
  z.string().trim().min(1).max(max).optional();

const safeIdentifierSchema = z
  .string()
  .trim()
  .min(1)
  .max(160)
  .regex(
    /^[a-zA-Z0-9][a-zA-Z0-9._:/@-]*$/,
    'Identifier contains unsupported characters',
  );

const sha256Schema = z
  .string()
  .regex(/^sha256:[a-f0-9]{64}$/i, 'Expected sha256:<64 hex chars>');

const isoDateTimeSchema = z.string().datetime({ offset: true });

const uuidSchema = z.string().uuid();

const traceIdSchema = z
  .string()
  .trim()
  .min(16)
  .max(160)
  .regex(
    /^[a-zA-Z0-9][a-zA-Z0-9._:/@-]*$/,
    'traceId contains unsupported characters',
  );

const sessionIdSchema = z
  .string()
  .trim()
  .min(8)
  .max(160)
  .regex(
    /^[a-zA-Z0-9][a-zA-Z0-9._:/@-]*$/,
    'sessionId contains unsupported characters',
  );

const safeUrlSchema = z
  .string()
  .url()
  .max(2_048)
  .refine(
    (value) => {
      const protocol = new URL(value).protocol;
      return protocol === 'https:' || protocol === 'http:';
    },
    { message: 'Only http and https URLs are allowed' },
  );

/* -------------------------------------------------------------------------- */
/* JSON seguro: evita functions, BigInt, ciclos y payload no serializable    */
/* -------------------------------------------------------------------------- */

type SafeJsonValue =
  | null
  | boolean
  | number
  | string
  | SafeJsonValue[]
  | { [key: string]: SafeJsonValue };

function isSafeJsonValue(
  value: unknown,
  depth = 0,
  seen = new WeakSet<object>(),
): value is SafeJsonValue {
  if (depth > ISA_AI_LIMITS.safeJsonDepthMax) return false;

  if (
    value === null ||
    typeof value === 'boolean' ||
    typeof value === 'string'
  ) {
    return true;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value);
  }

  if (Array.isArray(value)) {
    return (
      value.length <= ISA_AI_LIMITS.safeJsonArrayMax &&
      value.every((item) => isSafeJsonValue(item, depth + 1, seen))
    );
  }

  if (!value || typeof value !== 'object' || value instanceof Date) {
    return false;
  }

  if (seen.has(value)) return false;
  seen.add(value);

  const prototype = Object.getPrototypeOf(value);

  if (prototype !== Object.prototype && prototype !== null) {
    return false;
  }

  const entries = Object.entries(value);

  if (entries.length > ISA_AI_LIMITS.safeJsonObjectKeysMax) {
    return false;
  }

  return entries.every(
    ([key, item]) =>
      key.length <= 200 &&
      !['__proto__', 'prototype', 'constructor'].includes(key) &&
      isSafeJsonValue(item, depth + 1, seen),
  );
}

export const isaAiSafeJsonSchema = z.custom<SafeJsonValue>(isSafeJsonValue, {
  message: 'Expected bounded, serializable and prototype-safe JSON',
});

/* -------------------------------------------------------------------------- */
/* Clasificación operativa                                                    */
/* -------------------------------------------------------------------------- */

export const isaAiHeptaDomainSchema = z.enum([
  'tourism',
  'rdm',
  'infra',
  'security',
  'observability',
  'blockchain',
  'governance',
]);

export const isaAiResponseModeSchema = z.enum([
  'answer',
  'clarification',
  'abstention',
  'safe-refusal',
  'degraded',
]);

export const isaAiRiskTierSchema = z.enum([
  'R0',
  'R1',
  'R2',
  'R3',
  'R4',
]);

export const isaAiDataScopeSchema = z.enum([
  'public',
  'internal',
  'restricted',
  'confidential',
]);

export const isaAiConfidenceBandSchema = z.enum([
  'very-low',
  'low',
  'medium',
  'high',
  'very-high',
]);

export const isaAiStructuredTypeSchema = z.enum([
  'text',
  'tool',
  'faq',
  'route',
  'event',
  'rdm-node',
  'diagnostic',
  'knowledge',
  'approval-required',
]);

export const isaAiToolKindSchema = z.enum([
  'filter',
  'security',
  'radar',
  'mdx',
  'blockchain',
  'governance',
  'library',
  'knowledge',
  'diagnostic',
]);

export const isaAiToolStatusSchema = z.enum([
  'applied',
  'failed',
  'skipped',
  'blocked',
  'pending-approval',
]);

export const isaAiSecurityDecisionSchema = z.enum([
  'allow',
  'deny',
  'degrade',
  'require-approval',
  'unavailable',
]);

export const isaAiKnowledgeStatusSchema = z.enum([
  'approved',
  'published',
  'disputed',
  'deprecated',
]);

/* -------------------------------------------------------------------------- */
/* Evidencia, conocimiento y herramientas                                    */
/* -------------------------------------------------------------------------- */

export const isaAiCitationSchema = z
  .object({
    id: safeIdentifierSchema,
    label: nonEmptyTrimmedString(ISA_AI_LIMITS.citationLabelMaxChars),
    sourceType: z.enum([
      'repository',
      'document',
      'knowledge-base',
      'institutional',
      'community',
      'system',
    ]),
    repository: optionalTrimmedString(180),
    commit: optionalTrimmedString(80),
    url: safeUrlSchema.optional(),
    retrievedAt: isoDateTimeSchema.optional(),
    excerptHash: sha256Schema.optional(),
  })
  .strict();

export const isaAiKnowledgeEntrySchema = z
  .object({
    id: safeIdentifierSchema,
    score: z.number().finite().min(0).max(1),
    status: isaAiKnowledgeStatusSchema,
    sourceVersion: nonEmptyTrimmedString(80),
    reviewedAt: isoDateTimeSchema.optional(),
    validUntil: isoDateTimeSchema.optional(),
    citationIds: z.array(safeIdentifierSchema).max(8).default([]),
  })
  .strict();

export const isaAiToolExecutionSchema = z
  .object({
    name: nonEmptyTrimmedString(ISA_AI_LIMITS.toolNameMaxChars),
    kind: isaAiToolKindSchema,
    status: isaAiToolStatusSchema,
    durationMs: z.number().finite().int().nonnegative().max(120_000).optional(),
    result: isaAiSafeJsonSchema.optional(),
    errorCode: optionalTrimmedString(ISA_AI_LIMITS.errorCodeMaxChars),
    policyDecision: isaAiSecurityDecisionSchema.optional(),
    approvalId: uuidSchema.optional(),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.status === 'failed' && !value.errorCode) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['errorCode'],
        message: 'Failed tool execution requires errorCode',
      });
    }

    if (value.status === 'pending-approval' && !value.approvalId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['approvalId'],
        message: 'Pending approval tool execution requires approvalId',
      });
    }

    if (
      value.status === 'blocked' &&
      value.policyDecision !== 'deny' &&
      value.policyDecision !== 'require-approval'
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['policyDecision'],
        message: 'Blocked tool execution requires restrictive policy decision',
      });
    }
  });

export const isaAiPipelineSchema = z
  .object({
    inputHash: sha256Schema.optional(),
    outputHash: sha256Schema.optional(),
    policyVersion: optionalTrimmedString(80),
    knowledgeRevision: optionalTrimmedString(80),
  })
  .strict();

/* -------------------------------------------------------------------------- */
/* Bloques de envelope                                                        */
/* -------------------------------------------------------------------------- */

export const isaAiStructuredSchema = z
  .object({
    type: isaAiStructuredTypeSchema,
    toolName: optionalTrimmedString(ISA_AI_LIMITS.toolNameMaxChars),
    tools: z
      .array(isaAiToolExecutionSchema)
      .max(ISA_AI_LIMITS.toolCountMax)
      .default([]),
    pipelines: isaAiPipelineSchema.optional(),
    data: isaAiSafeJsonSchema.optional(),
  })
  .strict();

export const isaAiPolicySchema = z
  .object({
    alignment: optionalTrimmedString(240),
    dataScope: isaAiDataScopeSchema,
    riskTier: isaAiRiskTierSchema,
    decision: isaAiSecurityDecisionSchema,
    appliedPolicies: z
      .array(safeIdentifierSchema)
      .max(ISA_AI_LIMITS.appliedPolicyCountMax)
      .default([]),
    humanReviewRequired: z.boolean().default(false),
    approvalId: uuidSchema.optional(),
  })
  .strict()
  .superRefine((value, context) => {
    const needsApproval =
      value.decision === 'require-approval' || value.riskTier === 'R4';

    if (needsApproval && !value.humanReviewRequired) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['humanReviewRequired'],
        message: 'High-risk decisions require humanReviewRequired=true',
      });
    }

    if (value.decision === 'require-approval' && !value.approvalId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['approvalId'],
        message: 'require-approval decisions require approvalId',
      });
    }
  });

export const isaAiObservabilitySchema = z
  .object({
    radars: z
      .array(
        z
          .object({
            name: nonEmptyTrimmedString(100),
            status: z.enum(['healthy', 'degraded', 'unavailable', 'skipped']),
            latencyMs: z.number().finite().nonnegative().max(120_000).optional(),
          })
          .strict(),
      )
      .max(ISA_AI_LIMITS.radarCountMax)
      .default([]),
    latencyMs: z.number().finite().nonnegative().max(120_000).optional(),
    generatedAt: isoDateTimeSchema,
  })
  .strict();

export const isaAiSecuritySchema = z
  .object({
    systems: z
      .array(
        z
          .object({
            name: nonEmptyTrimmedString(100),
            status: z.enum(['healthy', 'degraded', 'blocked', 'unavailable']),
            decision: isaAiSecurityDecisionSchema.optional(),
            reasonCode: optionalTrimmedString(ISA_AI_LIMITS.errorCodeMaxChars),
          })
          .strict(),
      )
      .max(ISA_AI_LIMITS.securitySystemCountMax)
      .default([]),
    promptInjectionDetected: z.boolean().default(false),
    secretsExposed: z.literal(false).default(false),
    sandboxed: z.boolean().default(true),
  })
  .strict();

export const isaAiKnowledgeBaseSchema = z
  .object({
    entriesUsed: z
      .array(isaAiKnowledgeEntrySchema)
      .max(ISA_AI_LIMITS.knowledgeEntryCountMax)
      .default([]),
    citations: z.array(isaAiCitationSchema).max(24).default([]),
    retrievalMode: z.enum(['none', 'lexical', 'vector', 'hybrid']).default('none'),
    evidenceSufficient: z.boolean().default(false),
  })
  .strict();

/* -------------------------------------------------------------------------- */
/* Envelope canónico                                                          */
/* -------------------------------------------------------------------------- */

export const isaAiEnvelopeSchema = z
  .object({
    version: z.literal(ISA_AI_CONTRACT_VERSION),
    provider: z.literal('isa-ai'),
    model: nonEmptyTrimmedString(ISA_AI_LIMITS.modelMaxChars),

    traceId: traceIdSchema,
    requestId: uuidSchema,
    issuedAt: isoDateTimeSchema,

    intent: nonEmptyTrimmedString(ISA_AI_LIMITS.intentMaxChars),
    responseMode: isaAiResponseModeSchema,
    confidence: z.number().finite().min(0).max(1),
    confidenceBand: isaAiConfidenceBandSchema,

    heptaDomain: isaAiHeptaDomainSchema.optional(),
    topic: optionalTrimmedString(ISA_AI_LIMITS.topicMaxChars),
    sessionId: sessionIdSchema.optional(),

    content: z.string().trim().min(1).max(ISA_AI_LIMITS.contentMaxChars),
    structured: isaAiStructuredSchema.optional(),

    policy: isaAiPolicySchema,
    observability: isaAiObservabilitySchema,
    security: isaAiSecuritySchema,
    kb: isaAiKnowledgeBaseSchema,
  })
  .strict()
  .superRefine((value, context) => {
    const hasUsableKnowledge =
      value.kb.evidenceSufficient &&
      value.kb.entriesUsed.length > 0 &&
      value.kb.citations.length > 0;

    if (
      value.responseMode === 'answer' &&
      value.heptaDomain &&
      !hasUsableKnowledge
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['kb'],
        message:
          'Domain answers require sufficient approved evidence and at least one citation',
      });
    }

    if (
      ['safe-refusal', 'abstention', 'degraded'].includes(value.responseMode) &&
      value.policy.decision === 'allow'
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['policy', 'decision'],
        message:
          'Refusal, abstention and degraded responses cannot have allow decision',
      });
    }

    if (
      value.security.promptInjectionDetected &&
      value.structured?.tools.some((tool) => tool.status === 'applied')
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['security', 'promptInjectionDetected'],
        message:
          'Applied tools are forbidden when prompt injection is detected',
      });
    }

    if (
      value.policy.riskTier === 'R4' &&
      value.policy.decision !== 'require-approval'
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['policy', 'decision'],
        message: 'R4 actions require require-approval policy decision',
      });
    }
  });

/* -------------------------------------------------------------------------- */
/* Respuesta degradada segura                                                 */
/* -------------------------------------------------------------------------- */

export const ISA_AI_SAFE_FALLBACK_CONTENT =
  'Isabella no puede completar esta solicitud en este momento. ' +
  'La operación fue degradada de forma segura; inténtalo nuevamente más tarde.';

function createFallbackRequestId(): string {
  if (
    typeof globalThis.crypto !== 'undefined' &&
    typeof globalThis.crypto.randomUUID === 'function'
  ) {
    return globalThis.crypto.randomUUID();
  }

  return '00000000-0000-4000-8000-000000000000';
}

export function createIsaAiDegradedEnvelope(input: {
  traceId: string;
  requestId?: string;
  model?: string;
  intent?: string;
  sessionId?: string;
  reasonCode?: string;
  now?: Date;
}): IsaAiEnvelope {
  const now = input.now ?? new Date();

  return isaAiEnvelopeSchema.parse({
    version: ISA_AI_CONTRACT_VERSION,
    provider: 'isa-ai',
    model: input.model ?? 'unavailable',

    traceId: input.traceId,
    requestId: input.requestId ?? createFallbackRequestId(),
    issuedAt: now.toISOString(),

    intent: input.intent ?? 'unknown',
    responseMode: 'degraded',
    confidence: 0,
    confidenceBand: 'very-low',
    ...(input.sessionId ? { sessionId: input.sessionId } : {}),

    content: ISA_AI_SAFE_FALLBACK_CONTENT,

    policy: {
      dataScope: 'public',
      riskTier: 'R1',
      decision: 'degrade',
      appliedPolicies: ['isabella.degraded-response.v1'],
      humanReviewRequired: false,
    },

    observability: {
      generatedAt: now.toISOString(),
      radars: [
        {
          name: 'isa-ai',
          status: 'degraded',
        },
      ],
    },

    security: {
      systems: [
        {
          name: 'isabella-runtime',
          status: 'degraded',
          decision: 'degrade',
          reasonCode: input.reasonCode ?? 'UPSTREAM_UNAVAILABLE',
        },
      ],
      promptInjectionDetected: false,
      secretsExposed: false,
      sandboxed: true,
    },

    kb: {
      entriesUsed: [],
      citations: [],
      retrievalMode: 'none',
      evidenceSufficient: false,
    },
  });
}

/* -------------------------------------------------------------------------- */
/* Parseadores explícitos                                                     */
/* -------------------------------------------------------------------------- */

export function parseIsaAiEnvelope(value: unknown): IsaAiEnvelope {
  return isaAiEnvelopeSchema.parse(value);
}

export function safeParseIsaAiEnvelope(value: unknown) {
  return isaAiEnvelopeSchema.safeParse(value);
}

/* -------------------------------------------------------------------------- */
/* Tipos exportados                                                           */
/* -------------------------------------------------------------------------- */

export type IsaAiSafeJson = z.infer<typeof isaAiSafeJsonSchema>;
export type IsaAiHeptaDomain = z.infer<typeof isaAiHeptaDomainSchema>;
export type IsaAiResponseMode = z.infer<typeof isaAiResponseModeSchema>;
export type IsaAiRiskTier = z.infer<typeof isaAiRiskTierSchema>;
export type IsaAiDataScope = z.infer<typeof isaAiDataScopeSchema>;
export type IsaAiConfidenceBand = z.infer<typeof isaAiConfidenceBandSchema>;
export type IsaAiStructuredType = z.infer<typeof isaAiStructuredTypeSchema>;
export type IsaAiToolKind = z.infer<typeof isaAiToolKindSchema>;
export type IsaAiToolStatus = z.infer<typeof isaAiToolStatusSchema>;
export type IsaAiSecurityDecision = z.infer<
  typeof isaAiSecurityDecisionSchema
>;
export type IsaAiCitation = z.infer<typeof isaAiCitationSchema>;
export type IsaAiKnowledgeEntry = z.infer<typeof isaAiKnowledgeEntrySchema>;
export type IsaAiToolExecution = z.infer<typeof isaAiToolExecutionSchema>;
export type IsaAiStructured = z.infer<typeof isaAiStructuredSchema>;
export type IsaAiPolicy = z.infer<typeof isaAiPolicySchema>;
export type IsaAiObservability = z.infer<typeof isaAiObservabilitySchema>;
export type IsaAiSecurity = z.infer<typeof isaAiSecuritySchema>;
export type IsaAiKnowledgeBase = z.infer<typeof isaAiKnowledgeBaseSchema>;
export type IsaAiEnvelope = z.infer<typeof isaAiEnvelopeSchema>;
