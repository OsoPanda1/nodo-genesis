/* ================================================================== */
/* CONTINUITY — Tipos del Bastión de Emergencia (YUN BE)              */
/* ================================================================== */
/* Subsistema de continuidad autónomo del Nodo Cero. Su misión no es   */
/* reemplazar la plataforma en tiempo real, sino preservar las          */
/* funciones constitucionales mínimas, la integridad de eventos, la     */
/* identidad de sesión, las decisiones críticas y la capacidad de       */
/* recuperación ordenada. Principio rector:                            */
/*                                                                     */
/*   "Continuidad sin inventar estado."                                */
/*                                                                     */
/* Si YUN BE no puede demostrar autorización, integridad, versión de   */
/* política o frescura de un dato, degrada o deniega; no simula         */
/* normalidad.                                                          */
/* ================================================================== */

export type YunBeMode =
  | 'DORMANT'
  | 'READY'
  | 'SUSPECT'
  | 'ISOLATED'
  | 'ACTIVE_ISLAND'
  | 'RECOVERY_PENDING'
  | 'RECONCILING';

export type EmergencyDisposition =
  | 'ACCEPTED'
  | 'QUEUED'
  | 'DENIED'
  | 'REPLAYED'
  | 'CONFLICT'
  | 'COMPENSATED';

export type IntentClassification =
  | 'PUBLIC'
  | 'INTERNAL_LOW'
  | 'CONFIDENTIAL'
  | 'SOVEREIGN'
  | 'RESTRICTED';

export interface ContinuityState {
  mode: YunBeMode;
  epoch: number;
  instanceId: string;
  policyVersion: string;
  policyDigest: string;
  primaryLastHeartbeatAt?: string;
  leaseExpiresAt?: string;
  lastVerifiedSnapshotAt?: string;
  updatedAt: string;
}

export interface EmergencyIntent {
  eventId: string;
  idempotencyKey: string;
  traceId: string;
  domain: string;
  federationId?: string;
  eventType: string;
  classification: IntentClassification;
  payload: unknown;
  occurredAt: string;
  actorSubjectId?: string;
}

export interface JournalEntry {
  sequenceId: number;
  eventId: string;
  idempotencyKey: string;
  traceId: string;
  domain: string;
  eventType: string;
  classification: IntentClassification;
  payload: unknown;
  policyVersion: string;
  fencingEpoch: number;
  disposition: EmergencyDisposition;
  previousHash: string | null;
  entryHash: string;
  occurredAt: string;
  receivedAt: string;
  actorSubjectId?: string;
}

export interface ReconciliationOutcome {
  eventId: string;
  idempotencyKey: string;
  primaryReceiptId?: string;
  outcome: 'PENDING' | 'APPLIED' | 'DUPLICATE' | 'CONFLICT' | 'COMPENSATED' | 'REJECTED';
  resolutionNote?: string;
}

export interface ContinuityCapabilities {
  reads: boolean;
  writes: 'full' | 'queued' | 'denied';
  identity: 'active' | 'readonly' | 'denied';
  commerce: 'read' | 'queued' | 'denied';
  isabella: 'full' | 'local-readonly' | 'off';
  gamification: 'full' | 'degraded' | 'suspended';
}
