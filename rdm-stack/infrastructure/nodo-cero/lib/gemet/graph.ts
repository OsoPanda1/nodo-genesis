/* ================================================================== */
/* GRAPH GEMET — Grafo de conocimiento federado                       */
/* ================================================================== */
/* Espejo ejecutable del blueprint `tamv-nexus-core`: el Grafo de      */
/* Conocimiento Federado (GEMET) distribuye registros ontológicos      */
/* entre réplicas del Nodo Cero. Cada registro porta un checksum       */
/* sha256 canónico (claves ordenadas) que la consulta verifica.        */
/*                                                                     */
/*   - registerNode   exige checksum válido (GEMET_CHECKSUM_MISMATCH). */
/*   - queryNode      lee de la réplica local; si no existe y la       */
/*     consistencia es estricta, consulta réplicas remotas vía fetch   */
/*     (X-Gemet-Depth) y cae a la caché firmada solo si es íntegra.    */
/*   - El estado vive en memoria del runtime (globalThis); los         */
/*     integradores reales alimentan réplicas desde el Data Fabric.    */
/* ================================================================== */

import { sha256, stableJson } from '@/lib/continuity/hash-chain';
import {
  GEMET_QUERY_ENDPOINT,
  GEMET_SEMANTIC_VERSION,
  gemetNodeRecordSchema,
  gemetQueryOptionsSchema,
  type GemetNodeRecord,
  type GemetQueryOptions,
} from './contracts';
import { emitGemetAudit } from './audit';

export const GEMET_CHECKSUM_MISMATCH = 'GEMET_CHECKSUM_MISMATCH';
export const GEMET_NODE_NOT_FOUND = 'GEMET_NODE_NOT_FOUND';
export const GEMET_REPLICAS_UNREACHABLE = 'GEMET_REPLICAS_UNREACHABLE';
export const GEMET_CACHE_TAMPERED = 'GEMET_CACHE_TAMPERED';

/* Checksum canónico (claves ordenadas) sobre la forma estable del nodo. */
export function gemetChecksum(record: Pick<GemetNodeRecord, 'id' | 'ontologyUri' | 'properties'>): string {
  return sha256(
    stableJson({
      id: record.id,
      ontologyUri: record.ontologyUri,
      properties: record.properties ?? {},
    }),
  );
}

/* Sello firmado de la caché: checksum + forma estable del registro. */
export function gemetCacheSeal(record: GemetNodeRecord): string {
  return sha256(
    stableJson({
      version: GEMET_SEMANTIC_VERSION,
      id: record.id,
      ontologyUri: record.ontologyUri,
      properties: record.properties,
      checksum: record.checksum,
    }),
  );
}

interface GemetReplica {
  endpoint: string;
}

interface GemetStoreShape {
  nodes: Map<string, GemetNodeRecord>;
  replicas: GemetReplica[];
  cache: Map<string, { record: GemetNodeRecord; sealedAt: string }>;
}

/* Persistencia del estado a través de recargas de módulo (HMR). */
const g = globalThis as unknown as { __rdmGemetStore?: GemetStoreShape };

function getStore(): GemetStoreShape {
  if (!g.__rdmGemetStore) {
    g.__rdmGemetStore = { nodes: new Map(), replicas: [], cache: new Map() };
  }
  return g.__rdmGemetStore;
}

/** Registra un nodo en el grafo local. Lanza si el checksum no coincide. */
export function registerNode(record: GemetNodeRecord): GemetNodeRecord {
  const parsed = gemetNodeRecordSchema.parse(record);
  const expected = gemetChecksum(parsed);
  if (expected !== parsed.checksum) {
    emitGemetAudit(
      'gemet.node.register.denied',
      { id: parsed.id, ontologyUri: parsed.ontologyUri, expected, received: parsed.checksum },
      { ontology: parsed.ontologyUri, severity: 'warning' },
    );
    throw new Error(GEMET_CHECKSUM_MISMATCH);
  }

  getStore().nodes.set(parsed.id, parsed);
  emitGemetAudit(
    'gemet.node.registered',
    { id: parsed.id, ontologyUri: parsed.ontologyUri, version: parsed.version },
    { ontology: parsed.ontologyUri },
  );
  return parsed;
}

export function getNode(id: string): GemetNodeRecord | undefined {
  return getStore().nodes.get(id);
}

export function listNodes(): GemetNodeRecord[] {
  return [...getStore().nodes.values()];
}

/** Añade una réplica remota del grafo (endpoint del Data Fabric). */
export function addReplica(endpoint: string): void {
  const store = getStore();
  if (!store.replicas.some((replica) => replica.endpoint === endpoint)) {
    store.replicas.push({ endpoint });
    emitGemetAudit('gemet.replica.added', { endpoint });
  }
}

export function listReplicas(): string[] {
  return getStore().replicas.map((replica) => replica.endpoint);
}

/* Consulta a una réplica remota. Aísla el fetch: nunca bloquea el grafo. */
async function queryReplica(replica: GemetReplica, id: string, options: GemetQueryOptions): Promise<GemetNodeRecord | null> {
  try {
    const response = await fetch(`${replica.endpoint}${GEMET_QUERY_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-gemet-depth': String(options.depth),
        'x-gemet-strict': String(options.strictConsistency),
      },
      body: JSON.stringify({ id, options }),
      signal: AbortSignal.timeout(4_000),
    });
    if (!response.ok) return null;
    const body = (await response.json()) as { record?: GemetNodeRecord };
    if (!body.record) return null;
    const parsed = gemetNodeRecordSchema.parse(body.record);
    return gemetChecksum(parsed) === parsed.checksum ? parsed : null;
  } catch {
    return null;
  }
}

/* Consulta al grafo federado con réplica local, remota y caché firmada. */
export async function queryNode(
  id: string,
  options?: GemetQueryOptions,
): Promise<{ ok: true; record: GemetNodeRecord; source: 'local' | 'replica' | 'cache' } | { ok: false; reason: string }> {
  const opts = gemetQueryOptionsSchema.parse(options ?? {});
  const store = getStore();

  const local = store.nodes.get(id);
  if (local) {
    emitGemetAudit('gemet.query.hit.local', { id, depth: opts.depth });
    return { ok: true, record: local, source: 'local' };
  }

  /* Consistencia estricta: intentar réplicas remotas antes que la caché. */
  if (opts.strictConsistency) {
    for (const replica of store.replicas) {
      const remote = await queryReplica(replica, id, opts);
      if (remote) {
        emitGemetAudit('gemet.query.hit.replica', { id, endpoint: replica.endpoint, depth: opts.depth });
        return { ok: true, record: remote, source: 'replica' };
      }
    }
  }

  /* Caché firmada local: se sirve solo si el sello sigue siendo íntegro. */
  const cached = store.cache.get(id);
  if (cached) {
    const seal = gemetCacheSeal(cached.record);
    if (seal !== cached.sealedAt) {
      emitGemetAudit(
        'gemet.query.cache_tampered',
        { id, reason: GEMET_CACHE_TAMPERED },
        { severity: 'warning' },
      );
      store.cache.delete(id);
    } else {
      emitGemetAudit('gemet.query.hit.cache', { id, depth: opts.depth });
      return { ok: true, record: cached.record, source: 'cache' };
    }
  }

  emitGemetAudit('gemet.query.miss', { id, depth: opts.depth }, { severity: 'warning' });
  return { ok: false, reason: GEMET_NODE_NOT_FOUND };
}

/** Escribe en la caché firmada local (solo registros íntegros). */
export function cacheNode(record: GemetNodeRecord): boolean {
  const parsed = gemetNodeRecordSchema.parse(record);
  if (gemetChecksum(parsed) !== parsed.checksum) {
    emitGemetAudit('gemet.cache.write_denied', { id: parsed.id, reason: GEMET_CHECKSUM_MISMATCH }, { severity: 'warning' });
    return false;
  }
  getStore().cache.set(parsed.id, { record: parsed, sealedAt: gemetCacheSeal(parsed) });
  emitGemetAudit('gemet.cache.write', { id: parsed.id });
  return true;
}

export function gemetStatus(): {
  provider: string;
  version: string;
  nodes: number;
  replicas: number;
  cacheEntries: number;
} {
  const store = getStore();
  return {
    provider: 'gemet',
    version: GEMET_SEMANTIC_VERSION,
    nodes: store.nodes.size,
    replicas: store.replicas.length,
    cacheEntries: store.cache.size,
  };
}

export function resetGemetForTests(): void {
  g.__rdmGemetStore = { nodes: new Map(), replicas: [], cache: new Map() };
}
