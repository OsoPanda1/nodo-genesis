/* ================================================================== */
/* GAMIFICATION YUN — World Runtime · Propuestas (IA = solo propuestas)*/
/* ================================================================== */
/* Isabella y curadores pueden proponer cambios al mundo. Nunca se    */
/* aplican efectos directos: toda propuesta exige aprobación humana   */
/* (requiresApproval: true) antes de publicar una nueva revisión.     */
/* ================================================================== */

import { uuid } from '@/lib/core/utils';
import { nowIso } from '@/lib/core/utils/datetime';
import {
  worldProposalSchema,
  type WorldEnvironment,
  type WorldProposal,
  type WorldProposalOrigin,
  type WorldProposalRecord,
  type WorldProposalStatus,
} from './contracts';
import { recordWorldProposalEvent } from './events';
import { sealWorldManifest } from './integrity';
import { validateWorldManifestForPublish } from './rules';
import { ensureDefaultWorld } from './seed';
import {
  getProposal,
  getPublishedManifest,
  getWorld,
  listProposals,
  putManifest,
  putProposal,
  updateProposal,
  updateWorld,
} from './store';
import { WorldError } from './world-errors';
import type { WorldManifest, WorldManifestHashInput } from './contracts';

const POLICY_VERSION = 'world-proposal-v1';

export interface CreateWorldProposalInput {
  worldId?: string;
  environment?: WorldEnvironment;
  intent: string;
  origin?: WorldProposalOrigin;
  requestedBy: string;
  source: 'isabella' | 'curator' | 'system';
  modelRunId?: string;
  addEntities?: WorldManifest['entities'];
  removeStableKeys?: string[];
  updateEntities?: Array<Partial<WorldManifest['entities'][number]> & { stableKey: string }>;
  riskClassification?: WorldProposal['riskClassification'];
  acceptanceCriteria?: string[];
  allowedAssetReferences?: WorldProposal['allowedAssetReferences'];
}

/** Crea una propuesta de cambio. Isabella solo llega hasta aquí. */
export function createWorldProposal(input: CreateWorldProposalInput): WorldProposalRecord {
  ensureDefaultWorld();
  const worldId = input.worldId ?? ensureDefaultWorld().worldId;
  const world = getWorld(worldId);
  if (!world) {
    throw new WorldError({
      code: 'WORLD_NOT_FOUND',
      httpStatus: 404,
      clientMessage: 'Mundo no encontrado para proponer cambios.',
      reason: `worldId ${worldId}`,
    });
  }

  const published = getPublishedManifest(worldId);
  const budget = published?.performanceBudget ?? {
    maxEntities: 200,
    maxEstimatedTriangles: 2_000_000,
    maxEstimatedTextureMemoryMb: 1024,
    maxEstimatedDrawCalls: 25_000,
  };

  const draft: WorldProposal = {
    worldId,
    environment: input.environment ?? world.environment,
    intent: input.intent,
    origin: input.origin ?? (input.source === 'isabella' ? 'ai-assisted' : 'human'),
    requestedBy: input.requestedBy,
    requestedChangeSet: {
      addEntities: input.addEntities ?? [],
      removeStableKeys: input.removeStableKeys ?? [],
      updateEntities: input.updateEntities ?? [],
    },
    allowedAssetReferences: input.allowedAssetReferences ?? {
      turismoPlaceIds: [],
      archiveItemIds: [],
      missionIds: [],
      routeIds: [],
    },
    estimatedPerformanceBudget: budget,
    riskClassification: input.riskClassification ?? (input.source === 'isabella' ? 'medium' : 'low'),
    acceptanceCriteria:
      input.acceptanceCriteria ??
      [
        'El manifiesto resultante pasa validateWorldManifestForPublish',
        'No se superan presupuestos de rendimiento',
        'Aprobación humana explícita antes de publicar',
      ],
    requiresApproval: true,
    provenance: {
      source: input.source,
      modelRunId: input.modelRunId,
      policyVersion: POLICY_VERSION,
      createdAt: nowIso(),
    },
  };

  const parsed = worldProposalSchema.safeParse(draft);
  if (!parsed.success) {
    throw new WorldError({
      code: 'PROPOSAL_INVALID',
      clientMessage: 'La propuesta de mundo no cumple el contrato.',
      reason: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
    });
  }

  const proposalId = uuid();
  const record: WorldProposalRecord = {
    ...parsed.data,
    proposalId,
    status: 'pending_approval',
    submittedAt: nowIso(),
    decidedAt: null,
    decidedBy: null,
    decisionReason: null,
  };

  putProposal(record);
  recordWorldProposalEvent(record, 'created');
  return record;
}

/** Lista propuestas (filtro opcional por mundo o estado). */
export function listWorldProposals(filter?: {
  worldId?: string;
  status?: WorldProposalStatus;
}): WorldProposalRecord[] {
  ensureDefaultWorld();
  let items = listProposals(filter?.worldId);
  if (filter?.status) items = items.filter((p) => p.status === filter.status);
  return items;
}

function applyChangeSet(
  base: WorldManifest,
  proposal: WorldProposalRecord,
): WorldManifest['entities'] {
  const byKey = new Map(base.entities.map((e) => [e.stableKey, { ...e }]));

  for (const key of proposal.requestedChangeSet.removeStableKeys) {
    byKey.delete(key);
  }

  for (const patch of proposal.requestedChangeSet.updateEntities as Array<
    Partial<WorldManifest['entities'][number]> & { stableKey: string }
  >) {
    const current = byKey.get(patch.stableKey);
    if (!current) continue;
    byKey.set(patch.stableKey, {
      ...current,
      ...patch,
      transform: patch.transform ? { ...current.transform, ...patch.transform } : current.transform,
      references: patch.references
        ? { ...current.references, ...patch.references }
        : current.references,
      state: patch.state ? { ...current.state, ...patch.state } : current.state,
    });
  }

  for (const entity of proposal.requestedChangeSet.addEntities as WorldManifest['entities']) {
    if (byKey.has(entity.stableKey)) {
      throw new WorldError({
        code: 'PROPOSAL_INVALID',
        clientMessage: 'La propuesta añade una entidad con stableKey duplicado.',
        reason: `stableKey ${entity.stableKey}`,
      });
    }
    byKey.set(entity.stableKey, entity);
  }

  return Array.from(byKey.values());
}

/**
 * Aprueba una propuesta y publica una nueva revisión del manifiesto.
 * Solo curador/sistema — Isabella no invoca esta función.
 */
export function approveAndPublishProposal(input: {
  proposalId: string;
  approvedBy: string;
  decisionReason?: string;
}): { proposal: WorldProposalRecord; manifest: WorldManifest } {
  ensureDefaultWorld();
  const proposal = getProposal(input.proposalId);
  if (!proposal) {
    throw new WorldError({
      code: 'PROPOSAL_NOT_FOUND',
      httpStatus: 404,
      clientMessage: 'Propuesta no encontrada.',
      reason: input.proposalId,
    });
  }
  if (proposal.status !== 'pending_approval' && proposal.status !== 'validated') {
    throw new WorldError({
      code: 'PROPOSAL_NOT_APPROVABLE',
      httpStatus: 409,
      clientMessage: 'La propuesta no está en estado aprobable.',
      reason: `status=${proposal.status}`,
    });
  }

  const world = getWorld(proposal.worldId);
  if (!world) {
    throw new WorldError({
      code: 'WORLD_NOT_FOUND',
      httpStatus: 404,
      clientMessage: 'Mundo no encontrado.',
      reason: proposal.worldId,
    });
  }

  const published = getPublishedManifest(proposal.worldId);
  if (!published) {
    throw new WorldError({
      code: 'MANIFEST_NOT_FOUND',
      httpStatus: 404,
      clientMessage: 'No hay manifiesto base publicado.',
      reason: proposal.worldId,
    });
  }

  const nextRevision = (world.latestRevision ?? published.revision) + 1;
  const entities = applyChangeSet(published, proposal);
  const createdAt = nowIso();

  const draft: WorldManifestHashInput = {
    schemaVersion: '1.0',
    manifestId: uuid(),
    worldId: proposal.worldId,
    environment: proposal.environment,
    revision: nextRevision,
    parentRevision: published.revision,
    status: 'published',
    createdAt,
    publishedAt: createdAt,
    expiresAt: null,
    provenance: {
      origin: proposal.origin,
      requestedBy: proposal.requestedBy,
      proposalId: proposal.proposalId,
      approvedBy: input.approvedBy,
      policyDecisionId: uuid(),
    },
    worldBounds: published.worldBounds,
    performanceBudget: proposal.estimatedPerformanceBudget,
    entities,
  };

  validateWorldManifestForPublish(draft);
  const sealed = sealWorldManifest(draft, null);
  putManifest(sealed);
  updateWorld(proposal.worldId, {
    latestRevision: nextRevision,
    publishedRevision: nextRevision,
    publishedManifestId: sealed.manifestId,
  });

  const decided = updateProposal(proposal.proposalId, {
    status: 'published',
    decidedAt: nowIso(),
    decidedBy: input.approvedBy,
    decisionReason: input.decisionReason ?? 'aprobada y publicada',
  });

  if (!decided) {
    throw new WorldError({
      code: 'PROPOSAL_NOT_FOUND',
      httpStatus: 404,
      clientMessage: 'Propuesta no encontrada tras aprobar.',
      reason: input.proposalId,
    });
  }

  recordWorldProposalEvent(decided, 'approved');
  recordWorldProposalEvent(decided, 'published');
  return { proposal: decided, manifest: sealed };
}

/** Rechaza una propuesta (sin efectos sobre el manifiesto publicado). */
export function rejectWorldProposal(input: {
  proposalId: string;
  decidedBy: string;
  decisionReason: string;
}): WorldProposalRecord {
  const proposal = getProposal(input.proposalId);
  if (!proposal) {
    throw new WorldError({
      code: 'PROPOSAL_NOT_FOUND',
      httpStatus: 404,
      clientMessage: 'Propuesta no encontrada.',
      reason: input.proposalId,
    });
  }
  if (proposal.status !== 'pending_approval' && proposal.status !== 'validated') {
    throw new WorldError({
      code: 'PROPOSAL_NOT_APPROVABLE',
      httpStatus: 409,
      clientMessage: 'La propuesta no se puede rechazar en su estado actual.',
      reason: `status=${proposal.status}`,
    });
  }

  const decided = updateProposal(proposal.proposalId, {
    status: 'rejected',
    decidedAt: nowIso(),
    decidedBy: input.decidedBy,
    decisionReason: input.decisionReason,
  });

  if (!decided) {
    throw new WorldError({
      code: 'PROPOSAL_NOT_FOUND',
      httpStatus: 404,
      clientMessage: 'Propuesta no encontrada.',
      reason: input.proposalId,
    });
  }

  recordWorldProposalEvent(decided, 'rejected');
  return decided;
}
