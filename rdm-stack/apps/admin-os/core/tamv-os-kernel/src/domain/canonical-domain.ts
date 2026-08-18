export type CanonicalAggregateType =
  | "TERRITORY"
  | "TERRITORY_SESSION"
  | "DECISION_CASE"
  | "PAYMENT_ORDER"
  | "GEO_FENCE";

export type TerritoryLifecycleState =
  | "INITIALIZING"
  | "ACTIVE"
  | "DEGRADED"
  | "MAINTENANCE"
  | "SUSPENDED";

export type SessionLifecycleState = "CREATED" | "INTERACTING" | "AT_RISK_EXIT" | "RETAINED" | "CLOSED";

export type DecisionLifecycleState = "PENDING_EVIDENCE" | "EVALUATED" | "ACTIONED" | "REVIEWED";

export type PaymentLifecycleState =
  | "INITIATED"
  | "SESSION_CREATED"
  | "AUTHORIZED"
  | "CAPTURED"
  | "SETTLED"
  | "FAILED"
  | "REFUNDED";

export type GeoFenceLifecycleState = "DEFINED" | "ENFORCED" | "TRIGGERED" | "ARCHIVED";

export type CanonicalEntityState =
  | TerritoryLifecycleState
  | SessionLifecycleState
  | DecisionLifecycleState
  | PaymentLifecycleState
  | GeoFenceLifecycleState;

export type CanonicalEventType =
  | "TERRITORY_REGISTERED"
  | "TERRITORY_ACTIVATED"
  | "TERRITORY_DEGRADED"
  | "TERRITORY_RECOVERED"
  | "TERRITORY_SUSPENDED"
  | "SESSION_STARTED"
  | "SESSION_INTERACTION_RECORDED"
  | "SESSION_AT_RISK_DETECTED"
  | "SESSION_RETAINED"
  | "SESSION_CLOSED"
  | "DECISION_EVALUATED"
  | "DECISION_ACTION_DISPATCHED"
  | "DECISION_REVIEWED"
  | "PAYMENT_INITIATED"
  | "PAYMENT_SESSION_CREATED"
  | "PAYMENT_AUTHORIZED"
  | "PAYMENT_CAPTURED"
  | "PAYMENT_SETTLED"
  | "PAYMENT_FAILED"
  | "PAYMENT_REFUNDED"
  | "GEOFENCE_DEFINED"
  | "GEOFENCE_ENFORCED"
  | "GEOFENCE_TRIGGERED"
  | "GEOFENCE_ARCHIVED";

export interface CanonicalAggregateRoot {
  aggregateType: CanonicalAggregateType;
  aggregateId: string;
  territoryId: string;
  federation: "DEKATEOTL" | "ANUBIS" | "BOOKPI" | "PHOENIX" | "MDD_TAMV" | "KAOS" | "CHRONOS";
  state: CanonicalEntityState;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface DomainTransitionRule {
  aggregateType: CanonicalAggregateType;
  eventType: CanonicalEventType;
  from: CanonicalEntityState[];
  to: CanonicalEntityState;
}

const RULES: DomainTransitionRule[] = [
  { aggregateType: "TERRITORY", eventType: "TERRITORY_REGISTERED", from: ["INITIALIZING"], to: "ACTIVE" },
  { aggregateType: "TERRITORY", eventType: "TERRITORY_ACTIVATED", from: ["MAINTENANCE", "DEGRADED"], to: "ACTIVE" },
  { aggregateType: "TERRITORY", eventType: "TERRITORY_DEGRADED", from: ["ACTIVE"], to: "DEGRADED" },
  { aggregateType: "TERRITORY", eventType: "TERRITORY_RECOVERED", from: ["DEGRADED"], to: "ACTIVE" },
  { aggregateType: "TERRITORY", eventType: "TERRITORY_SUSPENDED", from: ["ACTIVE", "DEGRADED", "MAINTENANCE"], to: "SUSPENDED" },

  { aggregateType: "TERRITORY_SESSION", eventType: "SESSION_STARTED", from: ["CREATED"], to: "INTERACTING" },
  { aggregateType: "TERRITORY_SESSION", eventType: "SESSION_INTERACTION_RECORDED", from: ["INTERACTING", "AT_RISK_EXIT"], to: "INTERACTING" },
  { aggregateType: "TERRITORY_SESSION", eventType: "SESSION_AT_RISK_DETECTED", from: ["INTERACTING"], to: "AT_RISK_EXIT" },
  { aggregateType: "TERRITORY_SESSION", eventType: "SESSION_RETAINED", from: ["AT_RISK_EXIT"], to: "RETAINED" },
  { aggregateType: "TERRITORY_SESSION", eventType: "SESSION_CLOSED", from: ["INTERACTING", "AT_RISK_EXIT", "RETAINED"], to: "CLOSED" },

  { aggregateType: "DECISION_CASE", eventType: "DECISION_EVALUATED", from: ["PENDING_EVIDENCE"], to: "EVALUATED" },
  { aggregateType: "DECISION_CASE", eventType: "DECISION_ACTION_DISPATCHED", from: ["EVALUATED"], to: "ACTIONED" },
  { aggregateType: "DECISION_CASE", eventType: "DECISION_REVIEWED", from: ["ACTIONED"], to: "REVIEWED" },

  { aggregateType: "PAYMENT_ORDER", eventType: "PAYMENT_INITIATED", from: ["INITIATED"], to: "SESSION_CREATED" },
  { aggregateType: "PAYMENT_ORDER", eventType: "PAYMENT_SESSION_CREATED", from: ["INITIATED", "SESSION_CREATED"], to: "SESSION_CREATED" },
  { aggregateType: "PAYMENT_ORDER", eventType: "PAYMENT_AUTHORIZED", from: ["SESSION_CREATED"], to: "AUTHORIZED" },
  { aggregateType: "PAYMENT_ORDER", eventType: "PAYMENT_CAPTURED", from: ["AUTHORIZED"], to: "CAPTURED" },
  { aggregateType: "PAYMENT_ORDER", eventType: "PAYMENT_SETTLED", from: ["CAPTURED"], to: "SETTLED" },
  { aggregateType: "PAYMENT_ORDER", eventType: "PAYMENT_FAILED", from: ["INITIATED", "SESSION_CREATED", "AUTHORIZED", "CAPTURED"], to: "FAILED" },
  { aggregateType: "PAYMENT_ORDER", eventType: "PAYMENT_REFUNDED", from: ["SETTLED", "CAPTURED"], to: "REFUNDED" },

  { aggregateType: "GEO_FENCE", eventType: "GEOFENCE_DEFINED", from: ["DEFINED"], to: "ENFORCED" },
  { aggregateType: "GEO_FENCE", eventType: "GEOFENCE_ENFORCED", from: ["DEFINED", "ENFORCED"], to: "ENFORCED" },
  { aggregateType: "GEO_FENCE", eventType: "GEOFENCE_TRIGGERED", from: ["ENFORCED"], to: "TRIGGERED" },
  { aggregateType: "GEO_FENCE", eventType: "GEOFENCE_ARCHIVED", from: ["DEFINED", "ENFORCED", "TRIGGERED"], to: "ARCHIVED" },
];

export function getTransitionRules(): DomainTransitionRule[] {
  return RULES;
}

export function resolveNextState(
  aggregateType: CanonicalAggregateType,
  eventType: CanonicalEventType,
  currentState: CanonicalEntityState,
): CanonicalEntityState {
  const rule = RULES.find(
    (item) => item.aggregateType === aggregateType && item.eventType === eventType && item.from.includes(currentState),
  );

  if (!rule) {
    throw new Error(
      `Invalid canonical transition: ${aggregateType} cannot apply ${eventType} from state ${currentState}`,
    );
  }

  return rule.to;
}
