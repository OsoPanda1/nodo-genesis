/* ================================================================== */
/* CONTINUITY — Lease manager & fencing tokens                        */
/* ================================================================== */
/* Toda escritura del primario debe requerir un token de época/        */
/* leadership. Cuando YUN BE se promueve con una época más alta, el    */
/* primario antiguo queda incapaz de aceptar escrituras aunque vuelva  */
/* de forma parcial (previene corrupción por escritura concurrente).   */
/*                                                                     */
/* El fencing token es: <epoch>.<instanceId>.<random>                  */
/* ================================================================== */

import crypto from 'node:crypto';

interface LeaseState {
  leaderInstanceId: string | null;
  epoch: number;
  leaseExpiresAt: number | null;
}

const state: LeaseState = {
  leaderInstanceId: null,
  epoch: 0,
  leaseExpiresAt: null,
};

export const DEFAULT_LEASE_MS = 60_000;

export function initLease(instanceId: string, ttlMs = DEFAULT_LEASE_MS): void {
  state.leaderInstanceId = instanceId;
  state.epoch += 1;
  state.leaseExpiresAt = Date.now() + ttlMs;
}

/** El bastión asume el liderazgo SIN subir la época (ya subida por la
 *  promoción). Permite emitir fencing tokens de la época nueva. */
export function assumeLeadership(instanceId: string, ttlMs = DEFAULT_LEASE_MS): void {
  state.leaderInstanceId = instanceId;
  state.leaseExpiresAt = Date.now() + ttlMs;
}

export function heartbeatLease(ttlMs = DEFAULT_LEASE_MS): boolean {
  if (state.leaderInstanceId === null) return false;
  state.leaseExpiresAt = Date.now() + ttlMs;
  return true;
}

export function isLeaseActive(now = Date.now()): boolean {
  return state.leaderInstanceId !== null && state.leaseExpiresAt !== null && now < state.leaseExpiresAt;
}

export function leaseExpired(now = Date.now()): boolean {
  return state.leaderInstanceId !== null && (state.leaseExpiresAt === null || now >= state.leaseExpiresAt);
}

export function getEpoch(): number {
  return state.epoch;
}

/** Incrementa la época al promover (invalida escritores de la época anterior). */
export function promoteEpoch(): number {
  state.epoch += 1;
  state.leaseExpiresAt = null;
  state.leaderInstanceId = null;
  return state.epoch;
}

/** Fencing token de la época actual (fail-closed si no hay líder). */
export function issueFencingToken(instanceId: string): { token: string; epoch: number } | null {
  if (!isLeaseActive()) return null;
  const nonce = crypto.randomBytes(16).toString('hex');
  return { token: `${state.epoch}.${instanceId}.${nonce}`, epoch: state.epoch };
}

/** Valida un fencing token: época mayor o igual que la actual. */
export function isValidFencingToken(token: string | null | undefined): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const epoch = Number(parts[0]);
  if (!Number.isInteger(epoch) || epoch < 0) return false;
  return epoch >= state.epoch;
}

export function leaseStatus(now = Date.now()): {
  leaderInstanceId: string | null;
  epoch: number;
  active: boolean;
  expired: boolean;
  leaseExpiresAt: number | null;
} {
  return {
    leaderInstanceId: state.leaderInstanceId,
    epoch: state.epoch,
    active: isLeaseActive(now),
    expired: leaseExpired(now),
    leaseExpiresAt: state.leaseExpiresAt,
  };
}

export function resetLeaseForTests(): void {
  state.leaderInstanceId = null;
  state.epoch = 0;
  state.leaseExpiresAt = null;
}
