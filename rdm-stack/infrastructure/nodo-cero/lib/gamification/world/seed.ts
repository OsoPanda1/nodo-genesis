/* ================================================================== */
/* GAMIFICATION YUN — World Runtime · Semilla del mundo Nodo Cero     */
/* ================================================================== */
/* Publica un manifiesto v1 del territorio con el núcleo y terminales  */
/* canónicos. Idempotente: solo corre una vez por proceso.            */
/* ================================================================== */

import { uuid } from '@/lib/core/utils';
import { nowIso } from '@/lib/core/utils/datetime';
import { sealWorldManifest } from './integrity';
import { validateWorldManifestForPublish } from './rules';
import {
  isWorldSeeded,
  markWorldSeeded,
  putAnchor,
  putManifest,
  upsertWorld,
} from './store';
import type { WorldManifestHashInput } from './contracts';

/** UUID estable del mundo canónico de desarrollo (demo). */
export const DEFAULT_WORLD_ID = 'a0000000-0000-4000-8000-000000000001';
export const DEFAULT_CORE_ENTITY_ID = 'a0000000-0000-4000-8000-000000000011';
export const DEFAULT_TERMINAL_ENTITY_ID = 'a0000000-0000-4000-8000-000000000012';
export const DEFAULT_TOTEM_ENTITY_ID = 'a0000000-0000-4000-8000-000000000013';
export const DEFAULT_MANIFEST_ID = 'a0000000-0000-4000-8000-000000000021';

function buildSeedManifest(): WorldManifestHashInput {
  const createdAt = nowIso();
  return {
    schemaVersion: '1.0',
    manifestId: DEFAULT_MANIFEST_ID,
    worldId: DEFAULT_WORLD_ID,
    environment: 'development',
    revision: 1,
    parentRevision: null,
    status: 'published',
    createdAt,
    publishedAt: createdAt,
    expiresAt: null,
    provenance: {
      origin: 'system',
      requestedBy: 'world-seed',
      proposalId: null,
      approvedBy: 'system',
      policyDecisionId: null,
    },
    worldBounds: {
      min: { x: -500, y: 0, z: -500 },
      max: { x: 500, y: 120, z: 500 },
    },
    performanceBudget: {
      maxEntities: 200,
      maxEstimatedTriangles: 2_000_000,
      maxEstimatedTextureMemoryMb: 1024,
      maxEstimatedDrawCalls: 25_000,
    },
    entities: [
      {
        entityId: DEFAULT_CORE_ENTITY_ID,
        stableKey: 'nodo-cero-core',
        kind: 'nodo-cero-core',
        prefabKey: 'rdm/nodo-cero/core',
        transform: {
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0, w: 1 },
          scale: { x: 1, y: 1, z: 1 },
        },
        state: { active: true, label: 'Nodo Cero' },
        references: {},
        tags: ['core', 'nodo-cero'],
      },
      {
        entityId: DEFAULT_TERMINAL_ENTITY_ID,
        stableKey: 'mission-terminal-plaza',
        kind: 'mission-terminal',
        prefabKey: 'rdm/mission/terminal',
        transform: {
          position: { x: 12, y: 0, z: 8 },
          rotation: { x: 0, y: 0, z: 0, w: 1 },
          scale: { x: 1, y: 1, z: 1 },
        },
        state: { active: true, missionId: 'm-guardian-01' },
        references: { missionId: 'm-guardian-01' },
        tags: ['mission', 'plaza'],
      },
      {
        entityId: DEFAULT_TOTEM_ENTITY_ID,
        stableKey: 'heritage-totem-mina',
        kind: 'heritage-totem',
        prefabKey: 'rdm/heritage/totem',
        transform: {
          position: { x: -18, y: 0, z: 22 },
          rotation: { x: 0, y: 0.707, z: 0, w: 0.707 },
          scale: { x: 1, y: 1, z: 1 },
        },
        state: { active: true },
        references: { turismoPlaceId: 'mina-la-dificultad' },
        tags: ['heritage', 'mina'],
      },
    ],
  };
}

/** Garantiza que el mundo canónico exista y esté publicado. */
export function ensureDefaultWorld(): {
  worldId: string;
  revision: number;
  manifestId: string;
} {
  if (isWorldSeeded()) {
    return {
      worldId: DEFAULT_WORLD_ID,
      revision: 1,
      manifestId: DEFAULT_MANIFEST_ID,
    };
  }

  const draft = buildSeedManifest();
  validateWorldManifestForPublish(draft);
  const sealed = sealWorldManifest(draft, null);
  const now = Date.now();

  upsertWorld({
    worldId: DEFAULT_WORLD_ID,
    environment: 'development',
    name: 'Nodo Cero Territorial',
    description: 'Mundo canónico del Real del Monte para el World Runtime YUN.',
    createdAt: now,
    updatedAt: now,
    latestRevision: 1,
    publishedRevision: 1,
    publishedManifestId: sealed.manifestId,
    flags: ['seed', 'canonical'],
  });

  putManifest(sealed);

  putAnchor({
    anchorId: uuid(),
    entityId: DEFAULT_TOTEM_ENTITY_ID,
    position: { x: -18, y: 0, z: 22 },
    radiusMeters: 25,
    attachedBy: 'system',
    provenanceRef: 'seed:heritage-totem-mina',
    createdAt: nowIso(),
    active: true,
  });

  putAnchor({
    anchorId: uuid(),
    entityId: DEFAULT_TERMINAL_ENTITY_ID,
    position: { x: 12, y: 0, z: 8 },
    radiusMeters: 15,
    attachedBy: 'system',
    provenanceRef: 'seed:mission-terminal-plaza',
    createdAt: nowIso(),
    active: true,
  });

  markWorldSeeded();

  return {
    worldId: DEFAULT_WORLD_ID,
    revision: 1,
    manifestId: sealed.manifestId,
  };
}
