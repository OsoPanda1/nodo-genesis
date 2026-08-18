/* ================================================================== */
/* GAMIFICATION YUN — World Runtime · Reglas y presupuestos           */
/* ================================================================== */
/* Validación fail-closed de un manifiesto antes de publicarlo:        */
/* presupuesto de rendimiento, prefabs del catálogo, bounds del mundo  */
/* y unicidad de entidades. Todo incumplimiento lanza WorldError.      */
/* ================================================================== */

import { WorldError, type WorldErrorCode } from './world-errors';
import { getPrefabEntry, validatePrefabUsage } from './entity-catalog';
import {
  MAX_MANIFEST_ENTITIES,
  type WorldEntityKind,
  type WorldManifest,
  type WorldManifestHashInput,
} from './contracts';

export const WORLD_BUDGET_LIMITS = {
  maxEntities: MAX_MANIFEST_ENTITIES,
  maxEstimatedTriangles: 2_000_000,
  maxEstimatedTextureMemoryMb: 1024,
  maxEstimatedDrawCalls: 25_000,
} as const;

function fail(code: WorldErrorCode, reason: string): never {
  throw new WorldError({
    code,
    httpStatus: 422,
    clientMessage: 'El manifiesto no cumple las reglas de publicación del mundo.',
    reason,
  });
}

function countBudget(entities: WorldManifest['entities']) {
  return entities.reduce(
    (acc, entity) => {
      const entry = getPrefabEntry(entity.prefabKey);
      acc.triangles += entry?.estimatedTriangles ?? 0;
      acc.textureMb += entry?.estimatedTextureMemoryMb ?? 0;
      acc.drawCalls += entry?.estimatedDrawCalls ?? 0;
      return acc;
    },
    { triangles: 0, textureMb: 0, drawCalls: 0 },
  );
}

/** Valida todas las reglas de publicación. Lanza WorldError si falla. */
export function validateWorldManifestForPublish(manifest: WorldManifestHashInput): void {
  if (manifest.entities.length > MAX_MANIFEST_ENTITIES) {
    fail('MANIFEST_BUDGET_EXCEEDED', 'excede el límite de entidades');
  }

  const budget = countBudget(manifest.entities);
  if (budget.triangles > WORLD_BUDGET_LIMITS.maxEstimatedTriangles) {
    fail('MANIFEST_BUDGET_EXCEEDED', `triángulos estimados ${budget.triangles}`);
  }
  if (budget.textureMb > WORLD_BUDGET_LIMITS.maxEstimatedTextureMemoryMb) {
    fail('MANIFEST_BUDGET_EXCEEDED', `memoria de texturas ${budget.textureMb}Mb`);
  }
  if (budget.drawCalls > WORLD_BUDGET_LIMITS.maxEstimatedDrawCalls) {
    fail('MANIFEST_BUDGET_EXCEEDED', `draw calls estimados ${budget.drawCalls}`);
  }

  const bounds = manifest.worldBounds;
  const seenIds = new Set<string>();
  const seenKeys = new Set<string>();
  for (const entity of manifest.entities) {
    const placement = validatePrefabUsage(entity.prefabKey, entity.kind as WorldEntityKind);
    if (!placement.ok) fail('MANIFEST_UNKNOWN_PREFAB', placement.reason);
    if (!isInsideBounds(entity.transform.position, bounds)) {
      fail('MANIFEST_BOUNDS_VIOLATION', `entidad fuera de bounds: ${entity.stableKey}`);
    }
    if (seenIds.has(entity.entityId)) {
      fail('MANIFEST_DUPLICATE_ENTITY', `entityId duplicado: ${entity.entityId}`);
    }
    if (seenKeys.has(entity.stableKey)) {
      fail('MANIFEST_DUPLICATE_ENTITY', `stableKey duplicado: ${entity.stableKey}`);
    }
    seenIds.add(entity.entityId);
    seenKeys.add(entity.stableKey);
  }
}

function isInsideBounds(
  position: { x: number; y: number; z: number },
  bounds: WorldManifestHashInput['worldBounds'],
): boolean {
  return (
    position.x >= bounds.min.x &&
    position.x <= bounds.max.x &&
    position.y >= bounds.min.y &&
    position.y <= bounds.max.y &&
    position.z >= bounds.min.z &&
    position.z <= bounds.max.z
  );
}

/** Sanity para valores de observación (plausibilidad numérica). */
export function assertPlausibleObservation(
  observation: { clientMonotonicMs: number; occurredAt: string },
  sessionStartedAt: number,
): void {
  if (observation.clientMonotonicMs < 0) {
    throw new WorldError({
      code: 'OBSERVATION_REJECTED',
      clientMessage: 'Observación rechazada por plausibilidad.',
      reason: 'clientMonotonicMs negativo',
    });
  }
  const occurred = Date.parse(observation.occurredAt);
  if (Number.isNaN(occurred)) {
    throw new WorldError({
      code: 'OBSERVATION_INVALID',
      clientMessage: 'Observación con fecha inválida.',
      reason: 'occurredAt no es una fecha ISO válida',
    });
  }
  if (occurred < sessionStartedAt) {
    throw new WorldError({
      code: 'OBSERVATION_REJECTED',
      clientMessage: 'Observación rechazada por plausibilidad.',
      reason: 'occurredAt anterior al inicio de la sesión',
    });
  }
}
