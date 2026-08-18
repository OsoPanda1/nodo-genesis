/* ================================================================== */
/* GAMIFICATION YUN — World Runtime · Sesiones y sincronización       */
/* ================================================================== */
/* Emite/renueva sesiones de mundo ligadas a un manifiesto publicado. */
/* El cliente recibe el manifiesto y el token de sesión de juego.     */
/* ================================================================== */

import { uuid } from '@/lib/core/utils';
import { signSessionToken } from '@/lib/security/auth-tokens';
import {
  WORLD_SESSION_TTL_MS,
  type WorldManifest,
  type WorldSession,
  type WorldSyncRequest,
} from './contracts';
import { verifyWorldManifestIntegrity } from './integrity';
import { ensureDefaultWorld } from './seed';
import {
  getManifestByRevision,
  getPublishedManifest,
  getWorld,
  getWorldSession,
  putSession,
  updateWorldSession,
} from './store';
import { WorldError } from './world-errors';

export interface WorldSyncResult {
  ok: true;
  worldId: string;
  worldRevision: number;
  session: WorldSession;
  manifest: WorldManifest;
  token: string;
  tokenMode: 'signed' | 'open';
  serverTime: number;
  resumed: boolean;
}

export function syncWorldSession(input: WorldSyncRequest): WorldSyncResult {
  ensureDefaultWorld();
  const worldId = input.worldId;
  const world = getWorld(worldId);
  if (!world) {
    throw new WorldError({
      code: 'WORLD_NOT_FOUND',
      httpStatus: 404,
      clientMessage: 'Mundo territorial no encontrado.',
      reason: worldId,
    });
  }

  const manifest = getPublishedManifest(worldId);
  if (!manifest || manifest.status === 'revoked') {
    throw new WorldError({
      code: 'WORLD_REVISION_REVOKED',
      httpStatus: 409,
      clientMessage: 'No hay revisión publicada del mundo.',
      reason: worldId,
    });
  }

  verifyWorldManifestIntegrity(manifest);

  const now = Date.now();
  const actorId =
    input.actorId?.replace(/[<>]/g, '').slice(0, 128) ??
    `guardian-${input.deviceId.slice(0, 12)}`;

  if (input.sessionId) {
    const existing = getWorldSession(input.sessionId);
    if (existing && existing.deviceId === input.deviceId && existing.expiresAt > now) {
      const refreshed = updateWorldSession(existing.id, {
        worldRevision: manifest.revision,
        worldId: manifest.worldId,
        expiresAt: now + WORLD_SESSION_TTL_MS,
        actorId: existing.actorId || actorId,
      });
      const session = refreshed ?? existing;
      const token = signSessionToken({
        sessionId: session.id,
        deviceId: session.deviceId,
        actorId: session.actorId,
      });
      return {
        ok: true,
        worldId: manifest.worldId,
        worldRevision: manifest.revision,
        session,
        manifest,
        token: token.token,
        tokenMode: token.mode,
        serverTime: now,
        resumed: true,
      };
    }
  }

  const session: WorldSession = {
    id: uuid(),
    actorId,
    deviceId: input.deviceId.slice(0, 128),
    worldId: manifest.worldId,
    worldRevision: manifest.revision,
    capabilities: ['read', 'interact'],
    startedAt: now,
    expiresAt: now + WORLD_SESSION_TTL_MS,
    schemaVersions: ['1.0'],
    clientMinimumBuild: '1.0.0',
    flags: [],
    state: {},
  };

  putSession(session);
  const token = signSessionToken({
    sessionId: session.id,
    deviceId: session.deviceId,
    actorId: session.actorId,
  });

  return {
    ok: true,
    worldId: manifest.worldId,
    worldRevision: manifest.revision,
    session,
    manifest,
    token: token.token,
    tokenMode: token.mode,
    serverTime: now,
    resumed: false,
  };
}

export function getWorldManifestForClient(worldId: string, revision?: number): WorldManifest {
  ensureDefaultWorld();
  const world = getWorld(worldId);
  if (!world) {
    throw new WorldError({
      code: 'WORLD_NOT_FOUND',
      httpStatus: 404,
      clientMessage: 'Mundo no encontrado.',
      reason: worldId,
    });
  }

  if (revision != null) {
    const specific = getManifestByRevision(worldId, revision);
    if (!specific) {
      throw new WorldError({
        code: 'MANIFEST_NOT_FOUND',
        httpStatus: 404,
        clientMessage: 'Revisión de manifiesto no encontrada.',
        reason: `worldId=${worldId} revision=${revision}`,
      });
    }
    verifyWorldManifestIntegrity(specific);
    return specific;
  }

  const published = getPublishedManifest(worldId);
  if (!published) {
    throw new WorldError({
      code: 'MANIFEST_NOT_FOUND',
      httpStatus: 404,
      clientMessage: 'Sin manifiesto publicado.',
      reason: worldId,
    });
  }
  verifyWorldManifestIntegrity(published);
  return published;
}
