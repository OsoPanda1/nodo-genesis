/* ================================================================== */
/* GAMIFICATION YUN — World Runtime · Estado legible (Isabella)       */
/* ================================================================== */
/* Capa de SOLO lectura para SOPHIA/tools. No importa módulos de      */
/* Isabella (evita ciclos). Consume store/seed/proposals.             */
/* ================================================================== */

import { listWorldProposals } from './proposals';
import { ensureDefaultWorld, DEFAULT_WORLD_ID } from './seed';
import {
  getPublishedManifest,
  getWorld,
  listActiveWorldSessions,
  listWorlds,
} from './store';

export interface WorldRuntimeStatus {
  ok: boolean;
  defaultWorldId: string;
  worlds: number;
  publishedRevision: number | null;
  entityCount: number;
  activeSessions: number;
  pendingProposals: number;
  entities: Array<{
    stableKey: string;
    kind: string;
    tags: string[];
  }>;
  pendingProposalSummaries: Array<{
    proposalId: string;
    intent: string;
    source: string;
    riskClassification: string;
    submittedAt: string;
  }>;
}

/** Estado del World Runtime para paneles e Isabella. */
export function getWorldRuntimeStatus(worldId?: string): WorldRuntimeStatus {
  ensureDefaultWorld();
  const id = worldId ?? DEFAULT_WORLD_ID;
  const world = getWorld(id);
  const manifest = getPublishedManifest(id);
  const pending = listWorldProposals({ worldId: id, status: 'pending_approval' });

  return {
    ok: true,
    defaultWorldId: DEFAULT_WORLD_ID,
    worlds: listWorlds().length,
    publishedRevision: world?.publishedRevision ?? null,
    entityCount: manifest?.entities.length ?? 0,
    activeSessions: listActiveWorldSessions().length,
    pendingProposals: pending.length,
    entities:
      manifest?.entities.map((e) => ({
        stableKey: e.stableKey,
        kind: e.kind,
        tags: e.tags,
      })) ?? [],
    pendingProposalSummaries: pending.slice(0, 5).map((p) => ({
      proposalId: p.proposalId,
      intent: p.intent.slice(0, 160),
      source: p.provenance.source,
      riskClassification: p.riskClassification,
      submittedAt: p.submittedAt,
    })),
  };
}
