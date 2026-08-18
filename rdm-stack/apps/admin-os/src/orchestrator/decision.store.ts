import type { IsabellaDecision } from "@/core/models";
import { sha256Hex } from "@/lib/crypto/sha256";

export interface AuditedDecision {
  decision: IsabellaDecision;
  hash: string;
  decidedAt: string;
  version: number;
}

export class DecisionStore {
  private lastDecision: IsabellaDecision | null = null;
  private readonly ledger: AuditedDecision[] = [];

  save(decision: IsabellaDecision) {
    this.lastDecision = decision;

    const version = this.ledger.length + 1;
    const raw = JSON.stringify({
      traceId: decision.traceId,
      total: decision.score.total,
      retentionIntent: decision.retentionIntent,
      factors: decision.score.factors,
      version,
    });

    const hash = sha256Hex(raw);

    this.ledger.push({
      decision,
      hash,
      decidedAt: new Date().toISOString(),
      version,
    });
  }

  getLastDecision() {
    return this.lastDecision;
  }

  getLedger(limit = 50) {
    return this.ledger.slice(-limit);
  }

  explain(traceId: string) {
    const found = this.ledger.find((entry) => entry.decision.traceId === traceId);
    if (!found) return null;

    return {
      traceId: found.decision.traceId,
      level: found.decision.level,
      retentionIntent: found.decision.retentionIntent,
      score: found.decision.score,
      explainability: found.decision.explainability,
      hash: found.hash,
      version: found.version,
      decidedAt: found.decidedAt,
    };
  }
}

export const decisionStore = new DecisionStore();
