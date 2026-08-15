import type { CanonicalAggregateType, CanonicalEntityState, CanonicalEventType } from "./canonical-domain";

export type Federation =
  | "DEKATEOTL"
  | "ANUBIS"
  | "BOOKPI"
  | "PHOENIX"
  | "MDD_TAMV"
  | "KAOS"
  | "CHRONOS";

export type LegacyDomainEventType =
  | "TOURISM_INTERACTION"
  | "DICHO_CONSULTED"
  | "PAYMENT_COMPLETED"
  | "ALERT_SECURITY"
  | "CITY_FEEDBACK"
  | "SYSTEM_METRIC";

export type CivicEventType = LegacyDomainEventType | CanonicalEventType;

export interface CivicEvent<TPayload = unknown> {
  id: string;
  type: CivicEventType;
  federation: Federation;
  payload: TPayload;
  occurredAt: string;
  source: "WEB_PORTAL" | "EDGE_NODE" | "MOBILE_APP" | "BACKOFFICE";
  correlationId?: string;
  canonical?: {
    aggregateType: CanonicalAggregateType;
    aggregateId: string;
    previousState?: CanonicalEntityState;
    nextState?: CanonicalEntityState;
  };
}
