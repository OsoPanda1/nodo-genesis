/* ================================================================== */
/* GAMIFICATION YUN — World Runtime · Errores tipados                 */
/* ================================================================== */
/* Códigos de error fail-closed del World Runtime. Se serializan a    */
/* respuestas HTTP estables sin filtrar stack traces.                 */
/* ================================================================== */

export type WorldErrorCode =
  | 'WORLD_NOT_FOUND'
  | 'WORLD_REVISION_STALE'
  | 'WORLD_REVISION_REVOKED'
  | 'WORLD_SESSION_EXPIRED'
  | 'WORLD_SESSION_NOT_FOUND'
  | 'MANIFEST_BUDGET_EXCEEDED'
  | 'MANIFEST_UNKNOWN_PREFAB'
  | 'MANIFEST_BOUNDS_VIOLATION'
  | 'MANIFEST_DUPLICATE_ENTITY'
  | 'MANIFEST_INTEGRITY_FAILED'
  | 'MANIFEST_NOT_FOUND'
  | 'OBSERVATION_INVALID'
  | 'OBSERVATION_REJECTED'
  | 'OBSERVATION_DUPLICATE'
  | 'OBSERVATION_PAYLOAD_INVALID'
  | 'PROPOSAL_INVALID'
  | 'PROPOSAL_NOT_FOUND'
  | 'PROPOSAL_NOT_APPROVABLE'
  | 'ANCHOR_REQUIRED'
  | 'ANCHOR_INACTIVE'
  | 'POLICY_DENIED';

export interface WorldErrorInit {
  code: WorldErrorCode;
  clientMessage: string;
  reason: string;
  httpStatus?: number;
  details?: Record<string, unknown>;
}

export class WorldError extends Error {
  readonly code: WorldErrorCode;
  readonly clientMessage: string;
  readonly reason: string;
  readonly httpStatus: number;
  readonly details: Record<string, unknown>;

  constructor(init: WorldErrorInit) {
    super(init.reason);
    this.name = 'WorldError';
    this.code = init.code;
    this.clientMessage = init.clientMessage;
    this.reason = init.reason;
    this.httpStatus = init.httpStatus ?? 400;
    this.details = init.details ?? {};
  }

  toJSON() {
    return {
      ok: false as const,
      error: this.code,
      message: this.clientMessage,
      reason: this.reason,
      ...this.details,
    };
  }
}

export function isWorldError(value: unknown): value is WorldError {
  return value instanceof WorldError;
}
