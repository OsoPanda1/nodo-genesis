// ============================================================================
// RDM Digital OS — Decision Engine & Integrity Ledger v3
// Tamper-evident, append-only ledger for AI-assisted decisions
// ============================================================================

import { createHash, randomUUID } from "crypto";

// --------------------------------------------------------------------------
// Domain primitives
// --------------------------------------------------------------------------

/**
 * Identificador opaco de decisión.
 * No asume correlación con IDs de UI ni de base de datos.
 */
export type DecisionId = string;

/**
 * Contexto mínimo para que el motor pueda producir una recomendación.
 * Es agnóstico de interfaz y de canal.
 */
export interface DecisionInput {
  traceId: string;
  intent: string;
  payload: unknown;
}

/**
 * Recomendación legible, orientada a experiencia de usuario.
 * El copy es versionable y localizable aguas arriba.
 */
export interface DecisionRecommendation {
  id: DecisionId;
  traceId: string;
  intent: string;
  recommendation: string;
  confidence?: number; // 0–1
}

/**
 * Tipos de eventos que se consideran relevantes para auditoría.
 */
export type DecisionEventKind =
  | "ROUTING"
  | "PRIORITIZATION"
  | "ALERTING"
  | "RECOMMENDATION";

/**
 * Metadata contextual, manteniendo el dominio limpio.
 */
export interface DecisionMetadata {
  kind: DecisionEventKind;
  actorId?: string;  // humano, sistema, agente
  source?: string;   // microservicio / módulo origen
  notes?: string;
}

/**
 * Registro auditable, minimalista y estable a largo plazo.
 * No contiene texto de marketing ni detalles efímeros de UI.
 */
export interface AuditedDecision {
  id: DecisionId;
  traceId: string;
  intent: string;
  score: number;       // 0–1
  territory: string;
  decidedAt: string;   // ISO-8601
  version: number;
  hash: string;
  previousHash: string | null;
}

/**
 * Entrada para persistir una decisión.
 * No incluye campos derivados ni de integridad.
 */
export interface DecisionStoreSaveInput {
  traceId: string;
  intent: string;
  score: number;
  territory: string;
  metadata?: DecisionMetadata;
}

// --------------------------------------------------------------------------
// Utilities
// --------------------------------------------------------------------------

function sha256(data: string): string {
  return createHash("sha256").update(data, "utf8").digest("hex");
}

function isoNow(): string {
  return new Date().toISOString();
}

function normalizeScore(score: number): number {
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(1, score));
}

function nextDecisionId(): DecisionId {
  return randomUUID();
}

// --------------------------------------------------------------------------
// Decision Engine (stateless, pure from the outside)
// --------------------------------------------------------------------------

/**
 * Motor textual ligero: toma el output del modelo y lo adapta
 * a una recomendación explicativa, sin introducir sesgos externos al intent.
 */
export class DecisionEngine {
  /**
   * Construye una recomendación legible desde un output bruto de modelo.
   * No persiste nada; solo traduce y normaliza.
   */
  public buildRecommendation(
    input: DecisionInput,
    rawModelOutput: string,
    confidence?: number,
  ): DecisionRecommendation {
    const safeConfidence =
      confidence === undefined ? undefined : normalizeScore(confidence);

    const base = rawModelOutput.trim();
    const prefix = `Con base en el análisis del contexto asociado a "${input.intent}", el sistema sugiere: `;

    const recommendationText =
      base.length > 0
        ? `${prefix}${base}`
        : `Se analizaron los datos asociados a "${input.intent}", pero no se generó una recomendación específica.`;

    return {
      id: nextDecisionId(),
      traceId: input.traceId,
      intent: input.intent,
      recommendation: recommendationText,
      confidence: safeConfidence,
    };
  }
}

// --------------------------------------------------------------------------
// Decision Store (append-only, tamper-evident)
// --------------------------------------------------------------------------

export interface DecisionStoreConfig {
  defaultLedgerLimit: number;
  enableHashChain: boolean;
  allowFullLedgerRead: boolean;
}

const DEFAULT_DECISION_STORE_CONFIG: DecisionStoreConfig = {
  defaultLedgerLimit: 50,
  enableHashChain: true,
  allowFullLedgerRead: false,
};

interface InternalLedgerEntry {
  decision: AuditedDecision;
  metadata?: DecisionMetadata;
}

export interface LedgerIntegrityReport {
  ok: boolean;
  brokenAtVersion?: number;
  totalDecisions: number;
}

/**
 * Criterios de búsqueda básicos; extensibles sin romper API.
 */
export interface DecisionQuery {
  traceId?: string;
  intent?: string;
  territory?: string;
  kind?: DecisionEventKind;
  limit?: number;
}

/**
 * Ledger in-memory, pensado como building block.
 * Puede adaptarse a un backend persistente manteniendo la misma interfaz.
 */
export class DecisionStore {
  private readonly config: DecisionStoreConfig;
  private readonly ledger: InternalLedgerEntry[] = [];
  private lastDecision: AuditedDecision | null = null;

  constructor(config: Partial<DecisionStoreConfig> = {}) {
    this.config = { ...DEFAULT_DECISION_STORE_CONFIG, ...config };
  }

  private computeHash(
    base: {
      id: DecisionId;
      traceId: string;
      intent: string;
      score: number;
      territory: string;
      version: number;
      previousHash: string | null;
      decidedAt: string;
    },
  ): string {
    return sha256(JSON.stringify(base));
  }

  public save(input: DecisionStoreSaveInput): AuditedDecision {
    const version = this.ledger.length + 1;
    const decidedAt = isoNow();
    const previousHash = this.lastDecision?.hash ?? null;
    const score = normalizeScore(input.score);
    const id = nextDecisionId();

    const baseForHash = {
      id,
      traceId: input.traceId,
      intent: input.intent,
      score,
      territory: input.territory,
      version,
      previousHash: this.config.enableHashChain ? previousHash : null,
      decidedAt,
    };

    const hash = this.computeHash(baseForHash);

    const audited: AuditedDecision = {
      ...baseForHash,
      hash,
    };

    const entry: InternalLedgerEntry = {
      decision: audited,
      metadata: input.metadata,
    };

    this.ledger.push(entry);
    this.lastDecision = audited;

    return audited;
  }

  public getLastDecision(): AuditedDecision | null {
    return this.lastDecision;
  }

  /**
   * Segmento del ledger desde el final hacia atrás.
   * No expone metadata interna para mantener separación de preocupaciones.
   */
  public getLedger(limit = this.config.defaultLedgerLimit): AuditedDecision[] {
    if (!this.config.allowFullLedgerRead) {
      // En entornos estrictos puedes lanzar un error controlado
      // y obligar a usar métodos de consulta filtrados.
    }
    const slice = this.ledger.slice(-limit);
    return slice.map((entry) => entry.decision);
  }

  /**
   * Consulta simple: filtra por traceId, intent, territorio y kind.
   * Útil para construir vistas de auditoría sin exponer todo el ledger.
   */
  public query(q: DecisionQuery): AuditedDecision[] {
    const limit = q.limit ?? this.config.defaultLedgerLimit;

    const results: AuditedDecision[] = [];
    for (let i = this.ledger.length - 1; i >= 0; i--) {
      const { decision, metadata } = this.ledger[i];

      if (q.traceId && decision.traceId !== q.traceId) continue;
      if (q.intent && decision.intent !== q.intent) continue;
      if (q.territory && decision.territory !== q.territory) continue;
      if (q.kind && metadata?.kind !== q.kind) continue;

      results.push(decision);
      if (results.length >= limit) break;
    }

    return results;
  }

  /**
   * Explicación puntual por traceId.
   */
  public explain(traceId: string): AuditedDecision | null {
    const found = this.ledger.find(
      (entry) => entry.decision.traceId === traceId,
    );
    return found?.decision ?? null;
  }

  /**
   * Verifica integridad de toda la cadena.
   * No asume almacenamiento externo; este método
   * se puede reutilizar en un backend persistente.
   */
  public verifyIntegrity(): LedgerIntegrityReport {
    let previousHash: string | null = null;

    for (const entry of this.ledger) {
      const d = entry.decision;

      const baseForHash = {
        id: d.id,
        traceId: d.traceId,
        intent: d.intent,
        score: d.score,
        territory: d.territory,
        version: d.version,
        previousHash: this.config.enableHashChain ? previousHash : null,
        decidedAt: d.decidedAt,
      };

      const recomputed = this.computeHash(baseForHash);

      if (recomputed !== d.hash) {
        return {
          ok: false,
          brokenAtVersion: d.version,
          totalDecisions: this.ledger.length,
        };
      }

      previousHash = d.hash;
    }

    return {
      ok: true,
      totalDecisions: this.ledger.length,
    };
  }
}

// --------------------------------------------------------------------------
// Shared instances
// --------------------------------------------------------------------------

export const decisionEngine = new DecisionEngine();
export const decisionStore = new DecisionStore();
