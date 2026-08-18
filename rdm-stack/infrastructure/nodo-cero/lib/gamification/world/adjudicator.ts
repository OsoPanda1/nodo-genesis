/* ================================================================== */
/* GAMIFICATION YUN — World Runtime · Adjudicador server-authoritative */
/* ================================================================== */
/* El cliente solo envía observaciones. Este módulo decide si se      */
/* aceptan, qué efectos producen y qué mensaje recibe el jugador.     */
/* Nunca confía en puntos o recompensas declaradas por el cliente.    */
/* ================================================================== */

import {
  WORLD_OBSERVATION_MAX_PAYLOAD_BYTES,
  WORLD_TIMESTAMP_SKEW_MS,
  worldPayloadSchemas,
  type GameObservation,
  type WorldEffect,
  type WorldEventResult,
  type WorldManifest,
  type WorldSession,
} from './contracts';
import { recordWorldAdjudication } from './events';
import { assertPlausibleObservation } from './rules';
import {
  findObservationByIdempotency,
  getActiveAnchorForEntity,
  getPublishedManifest,
  getWorld,
  getWorldSession,
  rememberObservation,
} from './store';
import { ensureDefaultWorld } from './seed';
import { WorldError } from './world-errors';

function payloadByteLength(payload: Record<string, unknown>): number {
  try {
    return Buffer.byteLength(JSON.stringify(payload), 'utf8');
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}

function validatePayload(observation: GameObservation): void {
  const schema = worldPayloadSchemas[observation.eventType];
  const parsed = schema.safeParse(observation.payload);
  if (!parsed.success) {
    throw new WorldError({
      code: 'OBSERVATION_PAYLOAD_INVALID',
      clientMessage: 'Payload de observación inválido.',
      reason: parsed.error.issues.map((i) => i.message).join('; '),
      details: { eventType: observation.eventType },
    });
  }
  if (payloadByteLength(observation.payload) > WORLD_OBSERVATION_MAX_PAYLOAD_BYTES) {
    throw new WorldError({
      code: 'OBSERVATION_PAYLOAD_INVALID',
      clientMessage: 'Payload de observación demasiado grande.',
      reason: `excede ${WORLD_OBSERVATION_MAX_PAYLOAD_BYTES} bytes`,
    });
  }
}

function assertTimestampSkew(occurredAt: string, now = Date.now()): void {
  const occurred = Date.parse(occurredAt);
  if (Number.isNaN(occurred)) {
    throw new WorldError({
      code: 'OBSERVATION_INVALID',
      clientMessage: 'Observación con fecha inválida.',
      reason: 'occurredAt no es ISO válido',
    });
  }
  if (Math.abs(now - occurred) > WORLD_TIMESTAMP_SKEW_MS) {
    throw new WorldError({
      code: 'OBSERVATION_REJECTED',
      clientMessage: 'Observación rechazada por desfase temporal.',
      reason: `skew > ${WORLD_TIMESTAMP_SKEW_MS}ms`,
    });
  }
}

function assertSession(session: WorldSession | undefined, sessionId: string, now: number): WorldSession {
  if (!session) {
    throw new WorldError({
      code: 'WORLD_SESSION_NOT_FOUND',
      httpStatus: 404,
      clientMessage: 'Sesión de mundo no encontrada.',
      reason: `sessionId ${sessionId}`,
    });
  }
  if (session.expiresAt <= now) {
    throw new WorldError({
      code: 'WORLD_SESSION_EXPIRED',
      httpStatus: 401,
      clientMessage: 'La sesión de mundo ha expirado.',
      reason: 'expiresAt superado',
    });
  }
  return session;
}

function assertWorldRevision(
  observation: GameObservation,
  session: WorldSession,
): { worldId: string; revision: number; manifest: WorldManifest } {
  ensureDefaultWorld();
  const worldId = observation.worldId ?? session.worldId;
  const world = getWorld(worldId);
  if (!world) {
    throw new WorldError({
      code: 'WORLD_NOT_FOUND',
      httpStatus: 404,
      clientMessage: 'Mundo territorial no encontrado.',
      reason: `worldId ${worldId}`,
    });
  }

  const manifest = getPublishedManifest(worldId);
  if (!manifest || manifest.status === 'revoked') {
    throw new WorldError({
      code: 'WORLD_REVISION_REVOKED',
      httpStatus: 409,
      clientMessage: 'La revisión publicada del mundo no está disponible.',
      reason: 'sin manifiesto publicado o revocado',
    });
  }

  const clientRevision = observation.worldRevision ?? session.worldRevision;
  if (clientRevision !== manifest.revision) {
    throw new WorldError({
      code: 'WORLD_REVISION_STALE',
      httpStatus: 409,
      clientMessage: 'Tu cliente tiene una revisión de mundo desactualizada. Sincroniza de nuevo.',
      reason: `cliente=${clientRevision} publicada=${manifest.revision}`,
      details: { publishedRevision: manifest.revision, clientRevision },
    });
  }

  return { worldId, revision: manifest.revision, manifest };
}

function resolveEntity(
  observation: GameObservation,
  manifest: WorldManifest,
): WorldManifest['entities'][number] | null {
  if (!observation.entityId) return null;
  return manifest.entities.find((e) => e.entityId === observation.entityId) ?? null;
}

function adjudicateEffects(
  observation: GameObservation,
  manifest: WorldManifest,
): { effects: WorldEffect[]; accepted: boolean; reason?: string; outcome: WorldEventResult['outcome'] } {
  const entity = resolveEntity(observation, manifest);

  switch (observation.eventType) {
    case 'telemetry.performance.observed': {
      return {
        accepted: true,
        outcome: 'accepted-no-reward',
        effects: [
          {
            kind: 'telemetry',
            detail: `fps=${String(observation.payload.fps ?? '?')} frameMs=${String(observation.payload.frameMs ?? '?')}`,
          },
        ],
      };
    }

    case 'arena.kill.observed': {
      const combo = typeof observation.payload.comboCount === 'number' ? observation.payload.comboCount : 0;
      const base = 100;
      const amount = Math.min(5000, base + combo * 10);
      return {
        accepted: true,
        outcome: 'accepted',
        effects: [{ kind: 'reward', amount, detail: `kill:${String(observation.payload.archetypeId ?? 'unknown')}` }],
      };
    }

    case 'arena.wave.observed': {
      const wave = typeof observation.payload.waveNumber === 'number' ? observation.payload.waveNumber : 1;
      const amount = Math.min(2000, 50 * wave);
      return {
        accepted: true,
        outcome: 'accepted',
        effects: [{ kind: 'reward', amount, detail: `wave:${wave}` }],
      };
    }

    case 'arena.combo.observed': {
      const combo = typeof observation.payload.comboCount === 'number' ? observation.payload.comboCount : 1;
      return {
        accepted: true,
        outcome: 'accepted',
        effects: [{ kind: 'reward', amount: Math.min(500, combo * 5), detail: `combo:${combo}` }],
      };
    }

    case 'mission.objective.observed': {
      return {
        accepted: true,
        outcome: 'accepted',
        effects: [
          {
            kind: 'objective-marked',
            amount: 150,
            detail: `mission:${String(observation.payload.missionId)}/${String(observation.payload.objectiveId)}`,
          },
        ],
      };
    }

    case 'territory.entity.interacted': {
      if (!entity) {
        return {
          accepted: false,
          outcome: 'rejected',
          reason: 'entidad no existe en el manifiesto publicado',
          effects: [],
        };
      }
      const anchor = getActiveAnchorForEntity(entity.entityId);
      if (!anchor) {
        return {
          accepted: false,
          outcome: 'rejected',
          reason: 'la entidad no tiene ancla posicional activa',
          effects: [],
        };
      }
      return {
        accepted: true,
        outcome: 'accepted',
        effects: [
          {
            kind: 'interaction-recorded',
            amount: 25,
            detail: `${entity.stableKey}:${String(observation.payload.action ?? 'inspect')}`,
          },
        ],
      };
    }

    case 'territory.route.checkpoint.observed': {
      return {
        accepted: true,
        outcome: 'accepted',
        effects: [
          {
            kind: 'checkpoint-recorded',
            amount: 40,
            detail: `route:${String(observation.payload.routeId)}#${String(observation.payload.checkpointOrder)}`,
          },
        ],
      };
    }

    case 'territory.portal.requested': {
      return {
        accepted: true,
        outcome: 'accepted',
        effects: [
          {
            kind: 'portal-granted',
            detail: `to:${String(observation.payload.destinationExperienceId)}`,
          },
        ],
      };
    }

    case 'prize.redemption.requested': {
      return {
        accepted: true,
        outcome: 'accepted',
        effects: [
          {
            kind: 'prize-redeemed',
            detail: `prize:${String(observation.payload.prizeId)}`,
          },
        ],
      };
    }

    default:
      return {
        accepted: false,
        outcome: 'rejected',
        reason: 'eventType no adjudicado',
        effects: [],
      };
  }
}

function clientMessageFor(outcome: WorldEventResult['outcome'], reason?: string): string {
  switch (outcome) {
    case 'accepted':
      return 'Observación aceptada.';
    case 'accepted-no-reward':
      return 'Observación registrada sin recompensa.';
    case 'duplicate-replayed':
      return 'Observación duplicada: se reenvía el resultado original.';
    case 'rejected':
      return reason ? `Observación rechazada: ${reason}` : 'Observación rechazada.';
    case 'session-expired':
      return 'La sesión de mundo ha expirado.';
    case 'world-revision-stale':
      return 'Revisión de mundo desactualizada. Sincroniza el manifiesto.';
    case 'world-revision-revoked':
      return 'La revisión del mundo fue revocada.';
    case 'retryable-transient-failure':
      return 'Fallo transitorio. Reintenta.';
    default:
      return 'Resultado de adjudicación.';
  }
}

/**
 * Adjudica una observación de juego. Idempotente por idempotencyKey.
 * Fail-closed: cualquier validación fallida lanza WorldError o devuelve rejected.
 */
export function adjudicateObservation(observation: GameObservation): WorldEventResult {
  ensureDefaultWorld();
  const now = Date.now();

  const replay = findObservationByIdempotency(observation.idempotencyKey);
  if (replay && replay.result && typeof replay.result === 'object') {
    const previous = replay.result as WorldEventResult;
    return {
      ...previous,
      outcome: 'duplicate-replayed',
      clientMessage: clientMessageFor('duplicate-replayed'),
    };
  }

  validatePayload(observation);
  assertTimestampSkew(observation.occurredAt, now);

  const session = assertSession(getWorldSession(observation.sessionId), observation.sessionId, now);
  assertPlausibleObservation(observation, session.startedAt);

  let worldId: string;
  let revision: number;
  let manifest: WorldManifest;
  try {
    ({ worldId, revision, manifest } = assertWorldRevision(observation, session));
  } catch (err) {
    if (err instanceof WorldError) {
      const outcome =
        err.code === 'WORLD_REVISION_STALE'
          ? 'world-revision-stale'
          : err.code === 'WORLD_REVISION_REVOKED'
            ? 'world-revision-revoked'
            : 'rejected';
      const result: WorldEventResult = {
        outcome,
        accepted: false,
        eventId: observation.eventId,
        sessionId: observation.sessionId,
        worldId: observation.worldId,
        worldRevision: observation.worldRevision,
        effects: [],
        reason: err.reason,
        clientMessage: err.clientMessage,
      };
      rememberObservation(observation, result);
      recordWorldAdjudication({
        result,
        actorId: session.actorId,
        eventType: observation.eventType,
      });
      return result;
    }
    throw err;
  }

  const decision = adjudicateEffects(observation, manifest);
  const result: WorldEventResult = {
    outcome: decision.outcome,
    accepted: decision.accepted,
    eventId: observation.eventId,
    sessionId: observation.sessionId,
    worldId,
    worldRevision: revision,
    effects: decision.effects,
    reason: decision.reason,
    clientMessage: clientMessageFor(decision.outcome, decision.reason),
  };

  rememberObservation(observation, result);
  recordWorldAdjudication({
    result,
    actorId: session.actorId,
    eventType: observation.eventType,
  });

  return result;
}
