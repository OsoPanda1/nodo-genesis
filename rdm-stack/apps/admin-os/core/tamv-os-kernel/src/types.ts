import type { CanonicalAggregateType, CanonicalEntityState, CanonicalEventType } from "./domain/canonical-domain";

export type Federation =
  | "DEKATEOTL"
  | "ANUBIS"
  | "BOOKPI"
  | "PHOENIX"
  | "MDD_TAMV"
  | "KAOS"
  | "CHRONOS";

export type LegacyCivicEventType =
  | "TOURISM_INTERACTION"
  | "DICHO_CONSULTED"
  | "PAYMENT_COMPLETED"
  | "AI_INTERACTION"
  | "CITY_FEEDBACK";

export type CivicEventType = LegacyCivicEventType | CanonicalEventType;

export interface CanonicalEventMeta {
  aggregateType: CanonicalAggregateType;
  aggregateId: string;
  previousState?: CanonicalEntityState;
  nextState?: CanonicalEntityState;
}

export interface CivicEvent<T = unknown> {
  id: string;
  type: CivicEventType;
  federation: Federation;
  payload: T;
  occurredAt: string;
  source: "WEB_PORTAL" | "EDGE_NODE" | "MOBILE_APP" | "BACKOFFICE";
  correlationId?: string;
  canonical?: CanonicalEventMeta;
}
