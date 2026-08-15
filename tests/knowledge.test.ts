import { describe, it, expect, beforeEach } from 'vitest';
import {
  upsertKnowledge,
  verifyKnowledge,
  deprecateKnowledge,
  getKnowledge,
  queryKnowledge,
  knowledgeStats,
  resetKnowledgeForTests,
} from '@/lib/knowledge/canonical';
import { eventHistory, resetBusForTests } from '@/lib/core/events';

beforeEach(() => {
  resetKnowledgeForTests();
  resetBusForTests();
});

describe('knowledge · memoria canónica', () => {
  it('crea un registro propuesto con procedencia y eventos', () => {
    const record = upsertKnowledge({
      statement: 'Real del Monte es Patrimonio Cultural',
      provenance: 'constitution',
      sources: ['constitucion-yun'],
    });
    expect(record.status).toBe('proposed');
    expect(record.version).toBe(1);
    const events = eventHistory(10, { type: 'knowledge.record.upserted' });
    expect(events.length).toBe(1);
    expect(events[0].data.id).toBe(record.id);
  });

  it('verifica un registro y lo hace fuente de verdad', () => {
    const record = upsertKnowledge({ statement: 'hecho', provenance: 'operator' });
    const verified = verifyKnowledge(record.id);
    expect(verified?.status).toBe('verified');
    expect(getKnowledge(record.id)?.status).toBe('verified');
    expect(eventHistory(10, { type: 'knowledge.record.verified' }).length).toBe(1);
  });

  it('versiona al actualizar un registro existente', () => {
    const record = upsertKnowledge({ statement: 'v1', provenance: 'agent' });
    const updated = upsertKnowledge({ statement: 'v2', provenance: 'agent', id: record.id });
    expect(updated.version).toBe(2);
    expect(updated.statement).toBe('v2');
  });

  it('depreca sin borrar, y la consulta lo excluye por defecto', () => {
    const record = upsertKnowledge({ statement: 'dato obsoleto', provenance: 'citizen' });
    verifyKnowledge(record.id);
    deprecateKnowledge(record.id);
    expect(getKnowledge(record.id)?.status).toBe('deprecated');
    expect(queryKnowledge('obsoleto')).toHaveLength(0);
    expect(queryKnowledge('obsoleto', true)).toHaveLength(1);
  });

  it('queryKnowledge filtra por texto y solo registros verificados', () => {
    const a = upsertKnowledge({ statement: 'mina La Dificultad', provenance: 'agent' });
    upsertKnowledge({ statement: 'bocamina', provenance: 'agent' });
    verifyKnowledge(a.id);
    const results = queryKnowledge('dificultad');
    expect(results.length).toBe(1);
    expect(results[0].statement).toBe('mina La Dificultad');
  });

  it('knowledgeStats agrega por estado', () => {
    const r = upsertKnowledge({ statement: 'x', provenance: 'operator' });
    verifyKnowledge(r.id);
    const stats = knowledgeStats();
    expect(stats.total).toBe(1);
    expect(stats.verified).toBe(1);
    expect(stats.proposed).toBe(0);
  });
});
