/* ================================================================== */
/* KNOWLEDGE — Memoria canónica del Nodo (ADR-0006)                   */
/* ================================================================== */
/* Registro canónico de conocimiento: hechos validados con procedencia */
/* y anclas de confianza. A diferencia de la memoria de sesión de      */
/* Isabella (lib/isabella/memory.ts), esto es la fuente de verdad del  */
/* Nodo: cada registro emite un evento de conocimiento al bus YUN.     */
/* ================================================================== */

import { publishEvent } from '@/lib/core/events';
import { nowIso, uuid } from '@/lib/core/utils';

export type KnowledgeProvenance = 'constitution' | 'operator' | 'federation' | 'agent' | 'citizen';

export type KnowledgeStatus = 'proposed' | 'verified' | 'deprecated';

export interface CanonicalKnowledgeRecord {
  id: string;
  statement: string;
  provenance: KnowledgeProvenance;
  status: KnowledgeStatus;
  version: number;
  sources: string[];
  createdAt: string;
  updatedAt: string;
}

const KNOWLEDGE_KEY = '__rdmCanonicalKnowledge';

function store(): Map<string, CanonicalKnowledgeRecord> {
  const g = globalThis as unknown as Record<string, unknown>;
  g[KNOWLEDGE_KEY] ??= new Map<string, CanonicalKnowledgeRecord>();
  return g[KNOWLEDGE_KEY] as Map<string, CanonicalKnowledgeRecord>;
}

/** Crea (o versiona) un registro canónico de conocimiento y emite el
 *  evento `knowledge.record.upserted`. */
export function upsertKnowledge(input: {
  statement: string;
  provenance: KnowledgeProvenance;
  sources?: string[];
  id?: string;
}): CanonicalKnowledgeRecord {
  const records = store();
  const existing = input.id ? records.get(input.id) : undefined;
  const now = nowIso();
  const record: CanonicalKnowledgeRecord = existing
    ? { ...existing, statement: input.statement, provenance: input.provenance, version: existing.version + 1, sources: input.sources ?? existing.sources, status: 'verified', updatedAt: now }
    : {
        id: input.id ?? `kn-${uuid().slice(0, 8)}`,
        statement: input.statement,
        provenance: input.provenance,
        status: 'proposed',
        version: 1,
        sources: input.sources ?? [],
        createdAt: now,
        updatedAt: now,
      };

  records.set(record.id, record);
  publishEvent({
    type: 'knowledge.record.upserted',
    source: 'knowledge',
    domain: 'knowledge',
    version: 1,
    severity: existing ? 'info' : 'warning',
    data: {
      id: record.id,
      status: record.status,
      provenance: record.provenance,
      version: record.version,
    },
    meta: { entityId: record.id, federation: 'operacion' },
  });
  return record;
}

/** Marca un registro como verificado (aceptado como fuente de verdad). */
export function verifyKnowledge(id: string): CanonicalKnowledgeRecord | null {
  const records = store();
  const record = records.get(id);
  if (!record) return null;
  const updated: CanonicalKnowledgeRecord = { ...record, status: 'verified', updatedAt: nowIso() };
  records.set(id, updated);
  publishEvent({
    type: 'knowledge.record.verified',
    source: 'knowledge',
    domain: 'knowledge',
    version: 1,
    data: { id },
    meta: { entityId: id, federation: 'operacion' },
  });
  return updated;
}

/** Depreca un registro (ya no es fuente de verdad, se conserva). */
export function deprecateKnowledge(id: string): CanonicalKnowledgeRecord | null {
  const records = store();
  const record = records.get(id);
  if (!record) return null;
  const updated: CanonicalKnowledgeRecord = { ...record, status: 'deprecated', updatedAt: nowIso() };
  records.set(id, updated);
  publishEvent({
    type: 'knowledge.record.deprecated',
    source: 'knowledge',
    domain: 'knowledge',
    version: 1,
    severity: 'warning',
    data: { id },
    meta: { entityId: id, federation: 'operacion' },
  });
  return updated;
}

export function getKnowledge(id: string): CanonicalKnowledgeRecord | null {
  return store().get(id) ?? null;
}

/** Consulta canónica: solo registros verificados, por defecto. */
export function queryKnowledge(query: string, includeDeprecated = false): CanonicalKnowledgeRecord[] {
  const q = query.toLowerCase().trim();
  return [...store().values()].filter(r => {
    if (r.status === 'deprecated' && !includeDeprecated) return false;
    if (!q) return true;
    return `${r.statement} ${r.sources.join(' ')}`.toLowerCase().includes(q);
  });
}

export function knowledgeStats(): { total: number; verified: number; deprecated: number; proposed: number } {
  const values = [...store().values()];
  return {
    total: values.length,
    verified: values.filter(v => v.status === 'verified').length,
    deprecated: values.filter(v => v.status === 'deprecated').length,
    proposed: values.filter(v => v.status === 'proposed').length,
  };
}

export function resetKnowledgeForTests(): void {
  store().clear();
}
