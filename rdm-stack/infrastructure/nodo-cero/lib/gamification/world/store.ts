/* ================================================================== */
/* GAMIFICATION YUN — World Runtime · Almacén en memoria              */
/* ================================================================== */
/* Estado caliente del World Runtime Territorial: mundos, manifiestos,*/
/* sesiones, propuestas, anclas y deduplicación de observaciones.     */
/* Persistencia real: adaptar sin tocar adjudicación ni Isabella.     */
/* ================================================================== */

import type {
  GameObservation,
  PositionalAnchor,
  WorldEnvironment,
  WorldManifest,
  WorldProposalRecord,
  WorldRecord,
  WorldSession,
} from './contracts';

interface WorldStoreShape {
  worlds: Map<string, WorldRecord>;
  manifests: Map<string, WorldManifest>;
  /** worldId → revision → manifestId */
  revisions: Map<string, Map<number, string>>;
  sessions: Map<string, WorldSession>;
  proposals: Map<string, WorldProposalRecord>;
  anchors: Map<string, PositionalAnchor>;
  /** idempotencyKey → eventId (replay) */
  observationIndex: Map<string, string>;
  /** eventId → resultado serializable */
  observationResults: Map<string, unknown>;
  seeded: boolean;
}

const g = globalThis as unknown as { __rdmWorldStore?: WorldStoreShape };

function getStore(): WorldStoreShape {
  if (!g.__rdmWorldStore) {
    g.__rdmWorldStore = {
      worlds: new Map(),
      manifests: new Map(),
      revisions: new Map(),
      sessions: new Map(),
      proposals: new Map(),
      anchors: new Map(),
      observationIndex: new Map(),
      observationResults: new Map(),
      seeded: false,
    };
  }
  return g.__rdmWorldStore;
}

/* ------------------------------------------------------------------ */
/* Mundos                                                              */
/* ------------------------------------------------------------------ */

export function upsertWorld(record: WorldRecord): WorldRecord {
  const store = getStore();
  store.worlds.set(record.worldId, record);
  return record;
}

export function getWorld(worldId: string): WorldRecord | undefined {
  return getStore().worlds.get(worldId);
}

export function listWorlds(environment?: WorldEnvironment): WorldRecord[] {
  const all = Array.from(getStore().worlds.values());
  return environment ? all.filter((w) => w.environment === environment) : all;
}

export function updateWorld(
  worldId: string,
  patch: Partial<Omit<WorldRecord, 'worldId'>>,
): WorldRecord | undefined {
  const store = getStore();
  const current = store.worlds.get(worldId);
  if (!current) return undefined;
  const next = { ...current, ...patch, updatedAt: Date.now() };
  store.worlds.set(worldId, next);
  return next;
}

/* ------------------------------------------------------------------ */
/* Manifiestos                                                         */
/* ------------------------------------------------------------------ */

export function putManifest(manifest: WorldManifest): WorldManifest {
  const store = getStore();
  store.manifests.set(manifest.manifestId, manifest);
  let revMap = store.revisions.get(manifest.worldId);
  if (!revMap) {
    revMap = new Map();
    store.revisions.set(manifest.worldId, revMap);
  }
  revMap.set(manifest.revision, manifest.manifestId);
  return manifest;
}

export function getManifest(manifestId: string): WorldManifest | undefined {
  return getStore().manifests.get(manifestId);
}

export function getManifestByRevision(
  worldId: string,
  revision: number,
): WorldManifest | undefined {
  const revMap = getStore().revisions.get(worldId);
  const manifestId = revMap?.get(revision);
  return manifestId ? getStore().manifests.get(manifestId) : undefined;
}

export function getPublishedManifest(worldId: string): WorldManifest | undefined {
  const world = getWorld(worldId);
  if (!world?.publishedManifestId) return undefined;
  return getManifest(world.publishedManifestId);
}

export function listManifests(worldId: string): WorldManifest[] {
  const revMap = getStore().revisions.get(worldId);
  if (!revMap) return [];
  return Array.from(revMap.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([, id]) => getStore().manifests.get(id))
    .filter((m): m is WorldManifest => Boolean(m));
}

/* ------------------------------------------------------------------ */
/* Sesiones                                                            */
/* ------------------------------------------------------------------ */

export function putSession(session: WorldSession): WorldSession {
  getStore().sessions.set(session.id, session);
  return session;
}

export function getWorldSession(sessionId: string): WorldSession | undefined {
  return getStore().sessions.get(sessionId);
}

export function updateWorldSession(
  sessionId: string,
  patch: Partial<Omit<WorldSession, 'id'>>,
): WorldSession | undefined {
  const store = getStore();
  const current = store.sessions.get(sessionId);
  if (!current) return undefined;
  const next = { ...current, ...patch };
  store.sessions.set(sessionId, next);
  return next;
}

export function listActiveWorldSessions(now = Date.now()): WorldSession[] {
  return Array.from(getStore().sessions.values()).filter((s) => s.expiresAt > now);
}

/* ------------------------------------------------------------------ */
/* Propuestas                                                          */
/* ------------------------------------------------------------------ */

export function putProposal(proposal: WorldProposalRecord): WorldProposalRecord {
  getStore().proposals.set(proposal.proposalId, proposal);
  return proposal;
}

export function getProposal(proposalId: string): WorldProposalRecord | undefined {
  return getStore().proposals.get(proposalId);
}

export function listProposals(worldId?: string): WorldProposalRecord[] {
  const all = Array.from(getStore().proposals.values());
  const filtered = worldId ? all.filter((p) => p.worldId === worldId) : all;
  return filtered.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
}

export function updateProposal(
  proposalId: string,
  patch: Partial<WorldProposalRecord>,
): WorldProposalRecord | undefined {
  const store = getStore();
  const current = store.proposals.get(proposalId);
  if (!current) return undefined;
  const next = { ...current, ...patch };
  store.proposals.set(proposalId, next);
  return next;
}

/* ------------------------------------------------------------------ */
/* Anclas posicionales                                                    */
/* ------------------------------------------------------------------ */

export function putAnchor(anchor: PositionalAnchor): PositionalAnchor {
  getStore().anchors.set(anchor.anchorId, anchor);
  return anchor;
}

export function getAnchor(anchorId: string): PositionalAnchor | undefined {
  return getStore().anchors.get(anchorId);
}

export function getActiveAnchorForEntity(entityId: string): PositionalAnchor | undefined {
  return Array.from(getStore().anchors.values()).find(
    (a) => a.entityId === entityId && a.active,
  );
}

export function listAnchors(entityId?: string): PositionalAnchor[] {
  const all = Array.from(getStore().anchors.values());
  return entityId ? all.filter((a) => a.entityId === entityId) : all;
}

/* ------------------------------------------------------------------ */
/* Observaciones (idempotencia)                                        */
/* ------------------------------------------------------------------ */

export function findObservationByIdempotency(
  idempotencyKey: string,
): { eventId: string; result: unknown } | undefined {
  const store = getStore();
  const eventId = store.observationIndex.get(idempotencyKey);
  if (!eventId) return undefined;
  return { eventId, result: store.observationResults.get(eventId) };
}

export function rememberObservation(
  observation: Pick<GameObservation, 'eventId' | 'idempotencyKey'>,
  result: unknown,
): void {
  const store = getStore();
  store.observationIndex.set(observation.idempotencyKey, observation.eventId);
  store.observationResults.set(observation.eventId, result);
  /* Acota el índice para no crecer sin límite en demos largas. */
  if (store.observationIndex.size > 5000) {
    const firstKey = store.observationIndex.keys().next().value;
    if (firstKey) {
      const oldEventId = store.observationIndex.get(firstKey);
      store.observationIndex.delete(firstKey);
      if (oldEventId) store.observationResults.delete(oldEventId);
    }
  }
}

/* ------------------------------------------------------------------ */
/* Seed flag                                                           */
/* ------------------------------------------------------------------ */

export function isWorldSeeded(): boolean {
  return getStore().seeded;
}

export function markWorldSeeded(): void {
  getStore().seeded = true;
}

/** Solo tests: limpia el almacén del World Runtime. */
export function __resetWorldStoreForTests(): void {
  g.__rdmWorldStore = {
    worlds: new Map(),
    manifests: new Map(),
    revisions: new Map(),
    sessions: new Map(),
    proposals: new Map(),
    anchors: new Map(),
    observationIndex: new Map(),
    observationResults: new Map(),
    seeded: false,
  };
}
