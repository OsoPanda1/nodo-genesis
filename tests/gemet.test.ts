import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  gemetNodeRecordSchema,
  gemetQueryOptionsSchema,
  gemetQueryRequestSchema,
  GEMET_SEMANTIC_VERSION,
  type GemetNodeRecord,
} from '@/lib/gemet';
import {
  registerNode,
  getNode,
  listNodes,
  queryNode,
  cacheNode,
  addReplica,
  listReplicas,
  gemetStatus,
  resetGemetForTests,
  gemetChecksum,
  gemetCacheSeal,
  GEMET_CHECKSUM_MISMATCH,
  GEMET_NODE_NOT_FOUND,
} from '@/lib/gemet';
import { eventHistory, resetBusForTests } from '@/lib/core/events';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

const record = (overrides: Partial<GemetNodeRecord> = {}): GemetNodeRecord => {
  const base = {
    id: 'concepto:memoria',
    ontologyUri: 'https://rdm.local/ontologia/memoria',
    properties: { nombre: 'Memoria Minera' },
    version: 1,
  };
  const merged = { ...base, ...overrides };
  return { ...merged, checksum: merged.checksum ?? gemetChecksum(merged) };
};

beforeEach(() => {
  resetBusForTests();
  resetGemetForTests();
});

describe('contrato · grafo GEMET', () => {
  it('define la versión semántica del grafo', () => {
    expect(GEMET_SEMANTIC_VERSION).toBe('gemet.graph.v1');
  });

  it('acepta un registro con checksum canónico válido', () => {
    const parsed = gemetNodeRecordSchema.parse(record());
    expect(parsed.checksum).toMatch(/^[a-f0-9]{64}$/);
  });

  it('rechaza claves extra (strict, fail-closed)', () => {
    const result = gemetNodeRecordSchema.safeParse({ ...record(), extra: 1 });
    expect(result.success).toBe(false);
  });

  it('rechaza un checksum que no es sha256', () => {
    const result = gemetNodeRecordSchema.safeParse({ ...record(), checksum: 'abc' });
    expect(result.success).toBe(false);
  });

  it('rechaza una ontología que no es URI', () => {
    const result = gemetNodeRecordSchema.safeParse({
      ...record(),
      ontologyUri: 'no-uri',
    });
    expect(result.success).toBe(false);
  });

  it('aplica defaults de profundidad y consistencia estricta', () => {
    const parsed = gemetQueryOptionsSchema.parse({});
    expect(parsed.depth).toBe(1);
    expect(parsed.strictConsistency).toBe(true);
  });

  it('rechaza profundidades fuera del rango permitido', () => {
    const result = gemetQueryOptionsSchema.safeParse({ depth: 99 });
    expect(result.success).toBe(false);
  });

  it('valida la solicitud de consulta con id y opciones', () => {
    const parsed = gemetQueryRequestSchema.parse({ id: 'concepto:memoria' });
    expect(parsed.id).toBe('concepto:memoria');
    expect(parsed.options).toBeUndefined();
  });
});

describe('grafo · registro de conocimiento', () => {
  it('registra un nodo con checksum válido y lo indexa', () => {
    const node = registerNode(record());
    expect(getNode('concepto:memoria')).toEqual(node);
    expect(listNodes()).toHaveLength(1);
  });

  it('lanza GEMET_CHECKSUM_MISMATCH si el checksum no coincide', () => {
    const bad = record({ checksum: '0'.repeat(64) });
    expect(() => registerNode(bad)).toThrow(GEMET_CHECKSUM_MISMATCH);
    expect(listNodes()).toHaveLength(0);
  });

  it('detecta manipulaciones del contenido vía checksum', () => {
    const base = { id: 'concepto:agua', ontologyUri: 'https://rdm.local/ontologia/agua', properties: { uso: 'consumo' } };
    const good = { ...base, checksum: gemetChecksum(base), version: 1 };
    registerNode(good);
    const tampered = { ...good, properties: { uso: 'riego' } };
    expect(gemetChecksum(tampered)).not.toBe(tampered.checksum);
  });

  it('emite eventos de registro y rechazo al bus YUN', () => {
    registerNode(record());
    expect(() => registerNode(record({ id: 'otro', checksum: '1'.repeat(64) }))).toThrow();
    const registered = eventHistory(50, { type: 'gemet.node.registered' });
    const denied = eventHistory(50, { type: 'gemet.node.register.denied' });
    expect(registered.length).toBe(1);
    expect(denied.length).toBe(1);
  });
});

describe('grafo · consulta federada', () => {
  it('responde de la réplica local cuando existe', async () => {
    registerNode(record());
    const result = await queryNode('concepto:memoria');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.source).toBe('local');
    }
  });

  it('cae a la caché firmada cuando no hay registro local', async () => {
    const node = record();
    expect(cacheNode(node)).toBe(true);
    const result = await queryNode('concepto:memoria');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.source).toBe('cache');
  });

  it('rechaza escribir en caché un registro con checksum inválido', () => {
    expect(cacheNode(record({ checksum: '2'.repeat(64) }))).toBe(false);
  });

  it('detecta una caché manipulada y la descarta', async () => {
    const node = record();
    cacheNode(node);
    /* El sello no coincide tras manipular el registro en caché. */
    const g = globalThis as unknown as { __rdmGemetStore?: { cache: Map<string, unknown> } };
    const store = g.__rdmGemetStore;
    const cacheEntry = store?.cache.get('concepto:memoria') as { record: GemetNodeRecord } | undefined;
    if (cacheEntry) cacheEntry.record = { ...node, properties: { nombre: 'alterado' } };
    const result = await queryNode('concepto:memoria');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe(GEMET_NODE_NOT_FOUND);
  });

  it('falla con GEMET_NODE_NOT_FOUND sin réplica ni caché', async () => {
    const result = await queryNode('concepto:inexistente');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe(GEMET_NODE_NOT_FOUND);
  });

  it('consulta réplicas remotas en consistencia estricta', async () => {
    /* Réplica remota simulada vía fetch. */
    const remoteRecord = record({ id: 'concepto:lejano' });
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.endsWith('/gemet/query')) {
        const header = (init?.headers as Record<string, string> | undefined) ?? {};
        expect(header['x-gemet-depth']).toBe('2');
        return {
          ok: true,
          json: async () => ({ record: remoteRecord }),
        } as Response;
      }
      return originalFetch(input, init);
    }) as typeof fetch;

    addReplica('https://replica.rdm.local');
    const result = await queryNode('concepto:lejano', { depth: 2, strictConsistency: true });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.source).toBe('replica');
  });
});

describe('grafo · réplicas y salud', () => {
  it('registra réplicas sin duplicados', () => {
    addReplica('https://replica-a.rdm.local');
    addReplica('https://replica-a.rdm.local');
    addReplica('https://replica-b.rdm.local');
    expect(listReplicas()).toEqual([
      'https://replica-a.rdm.local',
      'https://replica-b.rdm.local',
    ]);
  });

  it('reporta nodos, réplicas y caché', () => {
    registerNode(record());
    cacheNode(record({ id: 'concepto:otro' }));
    addReplica('https://replica.rdm.local');
    const status = gemetStatus();
    expect(status.provider).toBe('gemet');
    expect(status.version).toBe(GEMET_SEMANTIC_VERSION);
    expect(status.nodes).toBe(1);
    expect(status.replicas).toBe(1);
    expect(status.cacheEntries).toBe(1);
  });

  it('el sello de caché es estable por registro', () => {
    const node = record();
    expect(gemetCacheSeal(node)).toBe(gemetCacheSeal(node));
  });

  it('resetea el estado entre pruebas', () => {
    registerNode(record());
    addReplica('https://replica.rdm.local');
    resetGemetForTests();
    expect(gemetStatus().nodes).toBe(0);
    expect(gemetStatus().replicas).toBe(0);
  });
});
