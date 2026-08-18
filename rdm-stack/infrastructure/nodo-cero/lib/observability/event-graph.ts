/* ================================================================== */
/* OBSERVABILIDAD YUN — Grafo causal de eventos                        */
/* ================================================================== */
/* Construye un grafo dirigido sobre el bus YUN usando causationId,    */
/* correlationId y traceId. Las etapas de madurez cognitiva avanzan    */
/* de observación a correlación, sospecha y confirmación según la      */
/* severidad y los vínculos causales.                                  */
/* ================================================================== */

import type { YunEventEnvelope, EventSeverity } from '@/lib/core/events';

export type GraphStage = 'observed' | 'correlated' | 'suspected' | 'confirmed';

export interface GraphNode {
  id: string;
  type: string;
  domain: string;
  source: string;
  severity: EventSeverity;
  correlationId: string;
  causationId: string;
  traceId: string;
  at: number;
  stage: GraphStage;
  children: string[];
}

const MAX_NODES = 2000;
const MAX_TRANSACTIONS = 300;

export interface TraceReport {
  correlationId: string;
  nodes: GraphNode[];
  root: string | null;
  confirmed: number;
}

export class EventGraph {
  private nodes = new Map<string, GraphNode>();
  private transactions = new Map<string, string[]>();

  ingest(envelope: YunEventEnvelope): GraphNode {
    const node: GraphNode = {
      id: envelope.id,
      type: envelope.type,
      domain: envelope.domain,
      source: envelope.source,
      severity: envelope.severity,
      correlationId: envelope.correlationId,
      causationId: envelope.causationId,
      traceId: envelope.traceId,
      at: Date.parse(envelope.timestamp),
      stage: 'observed',
      children: [],
    };

    const parent = envelope.causationId ? this.nodes.get(envelope.causationId) : undefined;
    if (parent) {
      parent.children.push(node.id);
      node.stage = 'correlated';
    }

    if (node.severity === 'warning') node.stage = 'suspected';
    if (node.severity === 'critical') node.stage = 'confirmed';

    const existing = this.nodes.get(node.id);
    if (existing && existing.children.length > 0) {
      node.children = existing.children;
    }
    this.nodes.set(node.id, node);

    const tx = this.transactions.get(node.correlationId) ?? [];
    tx.push(node.id);
    this.transactions.set(node.correlationId, tx);

    if (this.nodes.size > MAX_NODES) this.prune();
    return node;
  }

  node(id: string): GraphNode | null {
    return this.nodes.get(id) ?? null;
  }

  trace(correlationId: string): TraceReport {
    const ids = this.transactions.get(correlationId) ?? [];
    const nodes = ids
      .map(id => this.nodes.get(id))
      .filter((n): n is GraphNode => n !== undefined)
      .sort((a, b) => a.at - b.at);
    return {
      correlationId,
      nodes,
      root: nodes.find(n => !n.causationId)?.id ?? null,
      confirmed: nodes.filter(n => n.stage === 'confirmed').length,
    };
  }

  summary(): {
    total: number;
    observed: number;
    correlated: number;
    suspected: number;
    confirmed: number;
    transactions: number;
  } {
    let observed = 0;
    let correlated = 0;
    let suspected = 0;
    let confirmed = 0;
    for (const node of this.nodes.values()) {
      if (node.stage === 'observed') observed += 1;
      else if (node.stage === 'correlated') correlated += 1;
      else if (node.stage === 'suspected') suspected += 1;
      else confirmed += 1;
    }
    return {
      total: this.nodes.size,
      observed,
      correlated,
      suspected,
      confirmed,
      transactions: this.transactions.size,
    };
  }

  clear(): void {
    this.nodes.clear();
    this.transactions.clear();
  }

  private prune(): void {
    const entries = [...this.nodes.entries()].sort((a, b) => a[1].at - b[1].at);
    const drop = entries.slice(0, entries.length - MAX_NODES + MAX_NODES / 2);
    for (const [id] of drop) this.nodes.delete(id);
    for (const [corr, ids] of [...this.transactions.entries()]) {
      this.transactions.set(corr, ids.filter(id => this.nodes.has(id)));
      if (this.transactions.get(corr)?.length === 0) this.transactions.delete(corr);
    }
    const txEntries = [...this.transactions.entries()];
    if (txEntries.length > MAX_TRANSACTIONS) {
      txEntries.sort((a, b) => (this.nodes.get(a[1][0])?.at ?? 0) - (this.nodes.get(b[1][0])?.at ?? 0));
      for (const [corr] of txEntries.slice(0, txEntries.length - MAX_TRANSACTIONS)) {
        this.transactions.delete(corr);
      }
    }
  }
}
