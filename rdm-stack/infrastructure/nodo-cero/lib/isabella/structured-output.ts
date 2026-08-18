/* ------------------------------------------------------------------ */
/* ISA API — Structured Output (envelope ISA-AI)                       */
/* ------------------------------------------------------------------ */
/* Construye un envelope ISA-AI validado a partir del resultado        */
/* canónico de processPerception. No realiza egress ni ejecuta        */
/* herramientas: sólo normaliza metadatos ya presentes en memoria.    */
/* ------------------------------------------------------------------ */

import {
  ISA_AI_CONTRACT_VERSION,
  isaAiEnvelopeSchema,
  type IsaAiEnvelope,
  type IsaAiHeptaDomain,
  type IsaAiSafeJson,
  type IsaAiSecurityDecision,
  type IsaAiStructuredType,
  type IsaAiToolExecution,
  type IsaAiToolKind,
  type IsaAiToolStatus,
} from '@/lib/core/contracts/isa-ai';
import { sha256 } from '@/lib/continuity/hash-chain';
import type { CanonicalDomain } from './intention-parser';
import type {
  IsabellaDecision,
  IsabellaProcessResult,
  PolicyStatus,
  RiskLevel,
} from './contracts';

export const ISA_AI_VERSION = ISA_AI_CONTRACT_VERSION;
export const ISA_AI_DEFAULT_MODEL = 'mexa-ai-v2';

const MAX_CONTENT_CHARS = 24_000;
const MAX_TOPIC_CHARS = 240;
const MAX_TOOL_COUNT = 16;
const MAX_KB_ENTRIES = 24;
const MAX_LATENCY_MS = 120_000;

/* ------------------------------------------------------------------ */
/* Mapeos de dominio y herramientas                                   */
/* ------------------------------------------------------------------ */

const CANONICAL_TO_HEPTA: Record<CanonicalDomain, IsaAiHeptaDomain> = {
  submission: 'tourism',
  library: 'rdm',
  constitution: 'governance',
  governance: 'governance',
  ecosystem: 'rdm',
  education: 'tourism',
  skills: 'tourism',
  ethics: 'governance',
};

const CANONICAL_TO_STRUCTURED_TYPE: Record<
  CanonicalDomain,
  IsaAiStructuredType
> = {
  submission: 'text',
  library: 'faq',
  constitution: 'text',
  governance: 'text',
  ecosystem: 'rdm-node',
  education: 'faq',
  skills: 'text',
  ethics: 'text',
};

const TOOL_KIND_BY_NAME: Record<string, IsaAiToolKind> = {
  get_territory_status: 'radar',
  get_yun_overview: 'radar',
  get_gamification_status: 'radar',
  get_world_status: 'radar',
  list_world_proposals: 'governance',
  propose_world_change: 'governance',
  get_upcoming_events: 'library',
  get_tourism_routes: 'library',
  get_rdm_dicho: 'library',
  get_business_directory: 'library',
  get_poi_info: 'library',
  get_zombie_challenge: 'governance',
};

/* ------------------------------------------------------------------ */
/* Tipos y utilidades                                                 */
/* ------------------------------------------------------------------ */

export interface BuildStructuredEnvelopeOptions {
  text: string;
  prompt: string;
  latencyMs: number;
  provider: string;
  model: string;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function clampConfidence(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? clamp(value, 0, 1)
    : 0;
}

function normalizeLatency(value: unknown): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return undefined;
  }

  return clamp(Math.round(value), 0, MAX_LATENCY_MS);
}

function truncate(value: string, maxChars: number): string {
  return value.length <= maxChars ? value : value.slice(0, maxChars);
}

function safeText(value: unknown, fallback: string, maxChars: number): string {
  if (typeof value !== 'string') return fallback;

  const normalized = value.trim();
  return normalized ? truncate(normalized, maxChars) : fallback;
}

function confidenceBand(
  confidence: number,
): 'very-low' | 'low' | 'medium' | 'high' | 'very-high' {
  if (confidence >= 0.9) return 'very-high';
  if (confidence >= 0.75) return 'high';
  if (confidence >= 0.5) return 'medium';
  if (confidence >= 0.25) return 'low';
  return 'very-low';
}

function canonicalDomainOf(decision: IsabellaDecision): CanonicalDomain {
  const raw = decision.details.canonicalIntent;

  if (
    raw === 'submission' ||
    raw === 'library' ||
    raw === 'constitution' ||
    raw === 'governance' ||
    raw === 'ecosystem' ||
    raw === 'education' ||
    raw === 'skills' ||
    raw === 'ethics'
  ) {
    return raw;
  }

  return 'submission';
}

function toolStatus(status: unknown): IsaAiToolStatus {
  if (status === 'success') return 'applied';
  if (status === 'error') return 'failed';
  return 'skipped';
}

/*
 * PolicyStatus y RiskLevel provienen de ./contracts y pueden no incluir
 * todos los literales usados aquí. Se compara como string para evitar
 * TS2678 sin perder el comportamiento en runtime ni mentir sobre el tipo.
 */
function policyDecision(
  status: PolicyStatus | undefined,
): IsaAiSecurityDecision {
  const raw = String(status ?? '');

  if (raw === 'allowed') return 'allow';
  if (raw === 'denied') return 'deny';
  if (raw === 'degraded') return 'degrade';
  if (raw === 'pending') return 'require-approval';

  return 'unavailable';
}

function riskTier(
  level: RiskLevel | undefined,
): 'R0' | 'R1' | 'R2' | 'R3' | 'R4' {
  const raw = String(level ?? '');

  if (raw === 'critical') return 'R4';
  if (raw === 'high') return 'R3';
  if (raw === 'medium') return 'R2';
  if (raw === 'low') return 'R1';

  return 'R1';
}

function radarStatus(
  status: PolicyStatus | undefined,
): 'healthy' | 'degraded' | 'unavailable' | 'skipped' {
  const raw = String(status ?? '');

  if (raw === 'allowed') return 'healthy';
  if (raw === 'degraded') return 'degraded';
  if (raw === 'pending') return 'skipped';

  return 'unavailable';
}

function securityStatus(
  level: RiskLevel | undefined,
): 'healthy' | 'degraded' | 'blocked' | 'unavailable' {
  const raw = String(level ?? '');

  if (raw === 'low') return 'healthy';
  if (raw === 'medium') return 'degraded';
  if (raw === 'high' || raw === 'critical') return 'blocked';

  return 'unavailable';
}

/*
 * Limita result/data a JSON serializable, sin ciclos, functions,
 * BigInt, Date, prototypes no seguros o claves de prototype pollution.
 */
function isSafeJson(
  value: unknown,
  depth = 0,
  seen = new WeakSet<object>(),
): value is IsaAiSafeJson {
  if (depth > 8) return false;

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
      value.length <= 100 &&
      value.every((item) => isSafeJson(item, depth + 1, seen))
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

  if (entries.length > 100) {
    return false;
  }

  return entries.every(
    ([key, item]) =>
      key.length <= 200 &&
      !['__proto__', 'prototype', 'constructor'].includes(key) &&
      isSafeJson(item, depth + 1, seen),
  );
}

function safeJsonOrUndefined(value: unknown): IsaAiSafeJson | undefined {
  return isSafeJson(value) ? value : undefined;
}

function normalizeTool(
  tool: IsabellaDecision['toolCalls'][number],
): IsaAiToolExecution {
  const status = toolStatus(tool.status);
  const result = safeJsonOrUndefined(tool.result);

  const base = {
    name: safeText(tool.tool, 'unnamed-tool', 120),
    kind: TOOL_KIND_BY_NAME[tool.tool] ?? 'library',
    status,
    ...(result === undefined ? {} : { result }),
  };

  if (status === 'failed') {
    return {
      ...base,
      errorCode: 'TOOL_EXECUTION_FAILED',
    };
  }

  return base;
}

function sha256EnvelopeHash(value: string): string | undefined {
  try {
    const digest = sha256(value);

    if (/^[a-f0-9]{64}$/i.test(digest)) {
      return `sha256:${digest.toLowerCase()}`;
    }
  } catch {
    // La trazabilidad es opcional; no invalida un envelope seguro.
  }

  return undefined;
}

function normalizeAppliedPolicies(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => String(item).trim())
    .filter(
      (item) =>
        item.length > 0 &&
        item.length <= 160 &&
        /^[a-zA-Z0-9][a-zA-Z0-9._:/@-]*$/.test(item),
    )
    .slice(0, 32);
}

function normalizeKnowledgeEntries(sources: unknown) {
  if (!Array.isArray(sources)) return [];

  return sources
    .map((source) => String(source).trim())
    .filter(
      (id) =>
        id.length > 0 &&
        id.length <= 160 &&
        /^[a-zA-Z0-9][a-zA-Z0-9._:/@-]*$/.test(id),
    )
    .slice(0, MAX_KB_ENTRIES)
    .map((id) => ({
      id,
      score: 1,
      status: 'approved' as const,
      sourceVersion: 'nodo-cero-v1',
      citationIds: [],
    }));
}

/* ------------------------------------------------------------------ */
/* Constructor del envelope                                           */
/* ------------------------------------------------------------------ */

export function buildStructuredEnvelope(
  result: IsabellaProcessResult,
  options: BuildStructuredEnvelopeOptions,
): IsaAiEnvelope {
  const { decision } = result;
  const canonical = canonicalDomainOf(decision);
  const confidence = clampConfidence(decision.confidence);
  const decisionValue = policyDecision(decision.policyStatus);
  const currentRiskTier = riskTier(decision.riskLevel);
  const latencyMs = normalizeLatency(options.latencyMs);
  const now = new Date().toISOString();

  const tools = decision.toolCalls
    .slice(0, MAX_TOOL_COUNT)
    .map(normalizeTool);

  const structuredType: IsaAiStructuredType =
    tools.length > 0 ? 'tool' : CANONICAL_TO_STRUCTURED_TYPE[canonical];

  const guardSeverity = safeText(
    decision.details.guardSeverity,
    'none',
    80,
  );

  const riskScore =
    typeof decision.details.riskScore === 'number' &&
    Number.isFinite(decision.details.riskScore)
      ? decision.details.riskScore
      : null;

  const structuredData = safeJsonOrUndefined({
    riskScore,
    engines: Array.isArray(decision.engines) ? decision.engines.map(String) : [],
    guardSeverity,
    riskLevel: typeof decision.riskLevel === 'string'
      ? decision.riskLevel
      : 'unknown',
  });

  const inputHash = sha256EnvelopeHash(options.prompt);
  const outputHash = sha256EnvelopeHash(options.text);

  const entriesUsed = normalizeKnowledgeEntries(decision.sources);

  /*
   * El contrato requiere citas verificables para respuestas con
   * `heptaDomain`. Las fuentes legadas sólo incluyen IDs, no citas
   * verificables; por eso no se emite heptaDomain hasta que Knowledge
   * entregue citation metadata completa.
   */
  const hasVerifiableEvidence = false;

  /*
   * R4 requiere aprobación. El resultado existente no trae approvalId,
   * por lo que se degrada de forma segura a unavailable en vez de
   * afirmar una aprobación inexistente.
   */
  const requiresApproval =
    currentRiskTier === 'R4' || decisionValue === 'require-approval';

  const finalPolicyDecision: IsaAiSecurityDecision = requiresApproval
    ? 'unavailable'
    : decisionValue;

  const responseMode =
    finalPolicyDecision === 'deny'
      ? 'safe-refusal'
      : finalPolicyDecision === 'degrade' ||
          finalPolicyDecision === 'unavailable'
        ? 'degraded'
        : 'answer';

  const envelope = {
    version: ISA_AI_VERSION,
    provider: 'isa-ai' as const,
    model: safeText(options.model, ISA_AI_DEFAULT_MODEL, 180),

    traceId: result.traceId,
    requestId: crypto.randomUUID(),
    issuedAt: now,

    intent: canonical,
    responseMode,
    confidence,
    confidenceBand: confidenceBand(confidence),

    ...(hasVerifiableEvidence
      ? { heptaDomain: CANONICAL_TO_HEPTA[canonical] }
      : {}),
    ...(decision.details.intent !== undefined
      ? {
          topic: safeText(
            String(decision.details.intent),
            canonical,
            MAX_TOPIC_CHARS,
          ),
        }
      : {}),
    ...(result.sessionId ? { sessionId: result.sessionId } : {}),

    content: safeText(
      options.text,
      'Isabella no generó una respuesta disponible.',
      MAX_CONTENT_CHARS,
    ),

    structured: {
      type: structuredType,
      ...(tools.length > 0 ? { toolName: tools[0].name } : {}),
      tools,
      pipelines: {
        ...(inputHash ? { inputHash } : {}),
        ...(outputHash ? { outputHash } : {}),
        policyVersion: ISA_AI_VERSION,
        knowledgeRevision: 'nodo-cero-v1',
      },
      ...(structuredData === undefined ? {} : { data: structuredData }),
    },

    policy: {
      alignment: 'local-cultural',
      dataScope: 'public' as const,
      riskTier: currentRiskTier,
      decision: finalPolicyDecision,
      appliedPolicies: normalizeAppliedPolicies(
        decision.details.appliedPolicies,
      ),
      humanReviewRequired: false,
    },

    observability: {
      generatedAt: now,
      ...(latencyMs === undefined ? {} : { latencyMs }),
      radars: [
        {
          name: 'radar_ojo_de_ra',
          status: radarStatus(decision.policyStatus),
          ...(latencyMs === undefined ? {} : { latencyMs }),
        },
      ],
    },

    security: {
      systems: [
        {
          name: 'anubis_core',
          status: securityStatus(decision.riskLevel),
          decision: finalPolicyDecision,
        },
        {
          name: 'crown_prompt_guard',
          status:
            guardSeverity === 'critical'
              ? 'blocked'
              : guardSeverity === 'high'
                ? 'degraded'
                : 'healthy',
          decision:
            guardSeverity === 'critical'
              ? 'deny'
              : 'allow',
          reasonCode: guardSeverity,
        },
      ],
      promptInjectionDetected: guardSeverity === 'critical',
      secretsExposed: false as const,
      sandboxed: true,
    },

    kb: {
      entriesUsed,
      citations: [],
      retrievalMode: entriesUsed.length > 0 ? 'hybrid' as const : 'none' as const,
      evidenceSufficient: false,
    },
  };

  return isaAiEnvelopeSchema.parse(envelope);
}

export function validateStructuredEnvelope(
  envelope: IsaAiEnvelope,
): { ok: true; envelope: IsaAiEnvelope } | { ok: false; reason: string } {
  const parsed = isaAiEnvelopeSchema.safeParse(envelope);

  if (!parsed.success) {
    return {
      ok: false,
      reason: parsed.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join('; '),
    };
  }

  return {
    ok: true,
    envelope: parsed.data,
  };
}
