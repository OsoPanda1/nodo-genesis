/* ================================================================== */
/* GAMIFICATION YUN — World Runtime · Contratos del mundo territorial */
/* ================================================================== */
/* Contrato canónico de observaciones, manifiestos de mundo,          */
/* propuestas y sesiones del World Runtime Territorial.               */
/*                                                                     */
/* Principios:                                                         */
/*   ClientObservation != DomainFact   (el cliente solo observa)       */
/*   El servidor es el adjudicador (nunca acepta efectos declarados).  */
/*   Los manifiestos publicados son inmutables (hash-direccionados).   */
/* ================================================================== */

import { z } from 'zod';

/* ------------------------------------------------------------------ */
/* Tipos básicos                                                       */
/* ------------------------------------------------------------------ */

export const worldEnvironmentSchema = z.enum(['development', 'staging', 'production']);
export type WorldEnvironment = z.infer<typeof worldEnvironmentSchema>;

export const worldEntityKindSchema = z.enum([
  'nodo-cero-core',
  'mission-terminal',
  'heritage-totem',
  'tourist-route-marker',
  'territorial-portal',
  'collectible',
  'arena-gate',
  'event-stage',
  'environment-prop',
  'community-monument',
]);
export type WorldEntityKind = z.infer<typeof worldEntityKindSchema>;

export const worldRevisionStatusSchema = z.enum([
  'draft',
  'preview',
  'approved',
  'published',
  'revoked',
]);
export type WorldRevisionStatus = z.infer<typeof worldRevisionStatusSchema>;

export const worldProposalStatusSchema = z.enum([
  'draft',
  'validated',
  'pending_approval',
  'approved',
  'rejected',
  'superseded',
  'published',
]);
export type WorldProposalStatus = z.infer<typeof worldProposalStatusSchema>;

export const worldProposalOriginSchema = z.enum(['human', 'ai-assisted', 'system']);
export type WorldProposalOrigin = z.infer<typeof worldProposalOriginSchema>;

/* ------------------------------------------------------------------ */
/* Observación de juego (client-observed facts)                        */
/* ------------------------------------------------------------------ */

export const worldEventTypeSchema = z.enum([
  'arena.kill.observed',
  'arena.wave.observed',
  'arena.combo.observed',
  'mission.objective.observed',
  'territory.entity.interacted',
  'territory.route.checkpoint.observed',
  'territory.portal.requested',
  'prize.redemption.requested',
  'telemetry.performance.observed',
]);
export type WorldEventType = z.infer<typeof worldEventTypeSchema>;

/** Envelope canónico de una observación enviada por el cliente. */
export const gameObservationSchema = z
  .object({
    schemaVersion: z.literal('1.0'),
    eventId: z.string().uuid(),
    idempotencyKey: z.string().uuid(),
    sessionId: z.string().uuid(),
    actorId: z.string().uuid().optional(),
    worldId: z.string().uuid().nullable(),
    worldRevision: z.number().int().positive().nullable(),
    entityId: z.string().uuid().nullable(),
    eventType: worldEventTypeSchema,
    occurredAt: z.string().datetime(),
    clientMonotonicMs: z.number().int().nonnegative(),
    nonce: z.string().min(16).max(256),
    payload: z.record(z.string(), z.unknown()).default({}),
  })
  .strict();

export type GameObservation = z.infer<typeof gameObservationSchema>;

/* ------------------------------------------------------------------ */
/* Allowlists de payload por eventType (strict, fail-closed)           */
/* ------------------------------------------------------------------ */

export const arenaKillPayloadSchema = z
  .object({
    archetypeId: z.string().min(1).max(64),
    zone: z.enum(['mina', 'cultura', 'naturaleza', 'gastronomia', 'calles']).optional(),
    poiId: z.string().max(64).optional(),
    distanceMeters: z.number().finite().min(0).max(10000).optional(),
    comboCount: z.number().int().min(0).max(1000).optional(),
    night: z.boolean().optional(),
    fog: z.boolean().optional(),
    latencyMs: z.number().int().min(0).max(60000).optional(),
  })
  .strict();

export const arenaWavePayloadSchema = z
  .object({
    waveNumber: z.number().int().min(1).max(1000),
    latencyMs: z.number().int().min(0).max(60000).optional(),
  })
  .strict();

export const arenaComboPayloadSchema = z
  .object({
    comboCount: z.number().int().min(1).max(1000),
  })
  .strict();

export const missionObjectivePayloadSchema = z
  .object({
    missionId: z.string().min(1).max(64),
    objectiveId: z.string().min(1).max(64),
  })
  .strict();

export const entityInteractedPayloadSchema = z
  .object({
    action: z.enum(['inspect', 'activate', 'pulse', 'approach', 'deposit']),
  })
  .strict();

export const routeCheckpointPayloadSchema = z
  .object({
    routeId: z.string().min(1).max(128),
    placeId: z.string().min(1).max(128),
    checkpointOrder: z.number().int().min(0).max(10000),
  })
  .strict();

export const portalRequestedPayloadSchema = z
  .object({
    destinationExperienceId: z.string().min(1).max(128),
    reason: z.string().max(512).optional(),
  })
  .strict();

export const prizeRedemptionPayloadSchema = z
  .object({
    prizeId: z.string().min(1).max(64),
  })
  .strict();

export const telemetryPerformancePayloadSchema = z
  .object({
    fps: z.number().finite().min(1).max(1000),
    frameMs: z.number().finite().min(0).max(5000),
    drawCalls: z.number().int().min(0).max(100000),
    entityCount: z.number().int().min(0).max(100000),
  })
  .strict();

/** Payload máximo admitido para una observación (bytes aproximados). */
export const WORLD_OBSERVATION_MAX_PAYLOAD_BYTES = 4096;

export const worldPayloadSchemas: Record<WorldEventType, z.ZodType> = {
  'arena.kill.observed': arenaKillPayloadSchema,
  'arena.wave.observed': arenaWavePayloadSchema,
  'arena.combo.observed': arenaComboPayloadSchema,
  'mission.objective.observed': missionObjectivePayloadSchema,
  'territory.entity.interacted': entityInteractedPayloadSchema,
  'territory.route.checkpoint.observed': routeCheckpointPayloadSchema,
  'territory.portal.requested': portalRequestedPayloadSchema,
  'prize.redemption.requested': prizeRedemptionPayloadSchema,
  'telemetry.performance.observed': telemetryPerformancePayloadSchema,
};

/** Desviación temporal máxima entre occurredAt y el reloj del servidor. */
export const WORLD_TIMESTAMP_SKEW_MS = 90_000;

/* ------------------------------------------------------------------ */
/* Catálogo de prefabs (aprobado, resolvible por el cliente Unity)     */
/* ------------------------------------------------------------------ */

export const prefabCatalogEntrySchema = z
  .object({
    prefabKey: z.string().regex(/^rdm\/[a-z0-9/-]+$/),
    supportedKinds: z.array(worldEntityKindSchema).min(1),
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    estimatedTriangles: z.number().int().nonnegative(),
    estimatedTextureMemoryMb: z.number().finite().nonnegative(),
    estimatedDrawCalls: z.number().int().nonnegative(),
    allowedComponents: z.array(z.string()).default([]),
    forbiddenComponents: z.array(z.string()).default([]),
    deprecated: z.boolean().default(false),
    provenance: z.string().min(1),
    licenseRef: z.string().optional(),
  })
  .strict();

export type PrefabCatalogEntry = z.infer<typeof prefabCatalogEntrySchema>;

/* ------------------------------------------------------------------ */
/* Manifiesto de mundo (versión inmutable)                             */
/* ------------------------------------------------------------------ */

export const worldManifestSchema = z
  .object({
    schemaVersion: z.literal('1.0'),
    manifestId: z.string().uuid(),
    worldId: z.string().uuid(),
    environment: worldEnvironmentSchema,
    revision: z.number().int().positive(),
    parentRevision: z.number().int().nonnegative().nullable(),
    status: worldRevisionStatusSchema,
    createdAt: z.string().datetime(),
    publishedAt: z.string().datetime().nullable(),
    expiresAt: z.string().datetime().nullable(),
    provenance: z
      .object({
        origin: worldProposalOriginSchema,
        requestedBy: z.string().min(1),
        proposalId: z.string().uuid().nullable(),
        approvedBy: z.string().min(1).nullable(),
        policyDecisionId: z.string().uuid().nullable(),
      })
      .strict(),
    worldBounds: z
      .object({
        min: z.object({ x: z.number(), y: z.number(), z: z.number() }).strict(),
        max: z.object({ x: z.number(), y: z.number(), z: z.number() }).strict(),
      })
      .strict(),
    performanceBudget: z
      .object({
        maxEntities: z.number().int().positive(),
        maxEstimatedTriangles: z.number().int().positive(),
        maxEstimatedTextureMemoryMb: z.number().positive(),
        maxEstimatedDrawCalls: z.number().int().positive(),
      })
      .strict(),
    entities: z
      .array(
        z
          .object({
            entityId: z.string().uuid(),
            stableKey: z.string().regex(/^[a-z0-9][a-z0-9-]{2,127}$/),
            kind: worldEntityKindSchema,
            prefabKey: z.string().regex(/^rdm\/[a-z0-9/-]+$/),
            transform: z
              .object({
                position: z.object({ x: z.number(), y: z.number(), z: z.number() }).strict(),
                rotation: z
                  .object({ x: z.number(), y: z.number(), z: z.number(), w: z.number() })
                  .strict(),
                scale: z
                  .object({
                    x: z.number().positive(),
                    y: z.number().positive(),
                    z: z.number().positive(),
                  })
                  .strict(),
              })
              .strict(),
            state: z.record(z.string(), z.unknown()).default({}),
            references: z
              .object({
                turismoPlaceId: z.string().optional(),
                archiveItemId: z.string().uuid().optional(),
                missionId: z.string().optional(),
                routeId: z.string().optional(),
                twinId: z.string().uuid().optional(),
                eventId: z.string().optional(),
              })
              .default({}),
            tags: z.array(z.string().min(1).max(64)).max(24).default([]),
          })
          .strict(),
      )
      .min(1)
      .max(500),
    integrity: z
      .object({
        canonicalization: z.literal('JCS-RFC8785'),
        hashAlgorithm: z.literal('SHA-256'),
        payloadHash: z.string().regex(/^[a-f0-9]{64}$/),
        journalEntryId: z.string().uuid().nullable(),
      })
      .strict(),
  })
  .strict();

export type WorldManifest = z.infer<typeof worldManifestSchema>;

/** El hash se computa sobre el manifiesto sin el bloque `integrity`. */
export type WorldManifestHashInput = Omit<WorldManifest, 'integrity'>;

export const MAX_MANIFEST_ENTITIES = 500;
export const MAX_MANIFEST_PAYLOAD_BYTES = 512 * 1024;

/* ------------------------------------------------------------------ */
/* Propuesta (IA = solo propuestas, jamás efectos directos)            */
/* ------------------------------------------------------------------ */

export const worldProposalSchema = z
  .object({
    proposalId: z.string().uuid().optional(),
    worldId: z.string().uuid(),
    environment: worldEnvironmentSchema.default('development'),
    intent: z.string().min(8).max(4000),
    origin: worldProposalOriginSchema,
    requestedBy: z.string().min(1).max(128),
    requestedChangeSet: z
      .object({
        addEntities: z.array(z.any()).max(50).default([]),
        removeStableKeys: z.array(z.string().regex(/^[a-z0-9][a-z0-9-]{2,127}$/)).max(50).default([]),
        updateEntities: z.array(z.any()).max(50).default([]),
      })
      .strict(),
    allowedAssetReferences: z
      .object({
        turismoPlaceIds: z.array(z.string().max(128)).max(100).default([]),
        archiveItemIds: z.array(z.string().uuid()).max(100).default([]),
        missionIds: z.array(z.string().max(64)).max(100).default([]),
        routeIds: z.array(z.string().max(128)).max(100).default([]),
      })
      .strict(),
    estimatedPerformanceBudget: z
      .object({
        maxEntities: z.number().int().positive(),
        maxEstimatedTriangles: z.number().int().positive(),
        maxEstimatedTextureMemoryMb: z.number().positive(),
        maxEstimatedDrawCalls: z.number().int().positive(),
      })
      .strict(),
    riskClassification: z.enum(['low', 'medium', 'high', 'critical']),
    acceptanceCriteria: z.array(z.string().min(4).max(1000)).min(1).max(20),
    requiresApproval: z.literal(true),
    provenance: z
      .object({
        source: z.enum(['isabella', 'curator', 'system']),
        modelRunId: z.string().max(128).optional(),
        policyVersion: z.string().min(1).max(64),
        createdAt: z.string().datetime(),
      })
      .strict(),
  })
  .strict();

export type WorldProposal = z.infer<typeof worldProposalSchema>;

/* ------------------------------------------------------------------ */
/* Sesión de mundo territorial                                         */
/* ------------------------------------------------------------------ */

export const worldSessionSchema = z
  .object({
    id: z.string().uuid(),
    actorId: z.string().min(1).max(128),
    deviceId: z.string().min(1).max(128),
    worldId: z.string().uuid(),
    worldRevision: z.number().int().positive(),
    capabilities: z.array(z.string()).default(['read', 'interact']),
    startedAt: z.number().int(),
    expiresAt: z.number().int(),
    schemaVersions: z.array(z.string()).default(['1.0']),
    clientMinimumBuild: z.string().default('1.0.0'),
    flags: z.array(z.string()).default([]),
    state: z.record(z.string(), z.unknown()).default({}),
  })
  .strict();

export type WorldSession = z.infer<typeof worldSessionSchema>;

export const WORLD_SESSION_TTL_MS = 6 * 60 * 60 * 1000;

/* ------------------------------------------------------------------ */
/* Resultado de la adjudicación                                        */
/* ------------------------------------------------------------------ */

export const worldEventOutcomeSchema = z.enum([
  'accepted',
  'accepted-no-reward',
  'rejected',
  'duplicate-replayed',
  'retryable-transient-failure',
  'session-expired',
  'world-revision-stale',
  'world-revision-revoked',
]);
export type WorldEventOutcome = z.infer<typeof worldEventOutcomeSchema>;

export interface WorldEventResult {
  outcome: WorldEventOutcome;
  accepted: boolean;
  eventId: string;
  sessionId: string;
  worldId: string | null;
  worldRevision: number | null;
  effects: WorldEffect[];
  reason?: string;
  clientMessage: string;
}

export interface WorldEffect {
  kind: 'reward' | 'objective-marked' | 'checkpoint-recorded' | 'interaction-recorded' | 'portal-granted' | 'prize-redeemed' | 'telemetry';
  amount?: number;
  detail: string;
}

/* ------------------------------------------------------------------ */
/* Contratos de entrada/salida de las rutas world                      */
/* ------------------------------------------------------------------ */

export const worldSyncRequestSchema = z
  .object({
    worldId: z.string().uuid(),
    deviceId: z.string().trim().min(1).max(128),
    sessionId: z.string().uuid().optional(),
    token: z.string().trim().min(1).max(512).optional(),
    actorId: z.string().trim().min(1).max(128).optional(),
  })
  .strict();

export type WorldSyncRequest = z.infer<typeof worldSyncRequestSchema>;

export const worldEventRequestSchema = gameObservationSchema;

export type WorldEventRequest = GameObservation;

export const worldManifestQuerySchema = z
  .object({
    worldId: z.string().uuid(),
    revision: z.coerce.number().int().positive().optional(),
  })
  .strict();

export type WorldManifestQuery = z.infer<typeof worldManifestQuerySchema>;

export const worldRevisionActionSchema = z
  .object({
    changeReason: z.string().trim().min(8).max(2000),
  })
  .strict();

export type WorldRevisionAction = z.infer<typeof worldRevisionActionSchema>;

/* ------------------------------------------------------------------ */
/* Ancla posicional (curation)                                         */
/* ------------------------------------------------------------------ */
/* El ancla la fija un curador/sistema para anclar una entidad a una   */
/* ubicación física real. La adjudicación la usa para eventos de       */
/* interacción (la entidad debe estar anclada y activa).               */
/* ------------------------------------------------------------------ */

export const positionalAnchorSchema = z
  .object({
    anchorId: z.string().uuid(),
    entityId: z.string().uuid(),
    position: z.object({ x: z.number(), y: z.number(), z: z.number() }).strict(),
    radiusMeters: z.number().finite().positive().max(5000),
    attachedBy: z.enum(['curator', 'system', 'isabella']),
    provenanceRef: z.string().min(1).max(256),
    createdAt: z.string().datetime(),
    active: z.boolean().default(true),
  })
  .strict();

export type PositionalAnchor = z.infer<typeof positionalAnchorSchema>;

/* ------------------------------------------------------------------ */
/* Registro de mundo (metadatos operativos)                            */
/* ------------------------------------------------------------------ */

export interface WorldRecord {
  worldId: string;
  environment: WorldEnvironment;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  latestRevision: number;
  publishedRevision: number | null;
  publishedManifestId: string | null;
  flags: string[];
}

/* ------------------------------------------------------------------ */
/* Propuesta con estado (registro de workflow)                         */
/* ------------------------------------------------------------------ */

export interface WorldProposalRecord extends WorldProposal {
  proposalId: string;
  status: WorldProposalStatus;
  submittedAt: string;
  decidedAt: string | null;
  decidedBy: string | null;
  decisionReason: string | null;
}
