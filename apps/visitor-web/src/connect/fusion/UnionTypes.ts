import type {
  ConnectSubject,
  ConnectTokenResponse,
  ConnectorConfig,
  Installation,
  TriggerDestination,
  TriggerEvent,
} from "../types";
import type { ContractVersion } from "./contracts";

export type FusionOperation =
  | { type: "token:issue"; connectorUid: string; subject: ConnectSubject; scopes?: string[]; installationId?: string; version?: ContractVersion }
  | { type: "token:verify"; token: string; version?: ContractVersion }
  | { type: "token:revoke"; tokenId: string; version?: ContractVersion }
  | { type: "connector:register"; config: Omit<ConnectorConfig, "createdAt">; version?: ContractVersion }
  | { type: "connector:get"; uid: string; version?: ContractVersion }
  | { type: "connector:unregister"; uid: string; version?: ContractVersion }
  | { type: "connector:list"; version?: ContractVersion }
  | { type: "installation:add"; connectorUid: string; installation: Installation; version?: ContractVersion }
  | { type: "trigger:register"; dest: TriggerDestination; version?: ContractVersion }
  | { type: "trigger:forward"; event: TriggerEvent; version?: ContractVersion }
  | { type: "inspect:stats"; version?: ContractVersion };

export type FusionResult =
  | { ok: true; operation: FusionOperation["type"]; data: ConnectTokenResponse }
  | { ok: true; operation: "token:verify"; data: boolean }
  | { ok: true; operation: "token:revoke"; data: boolean }
  | { ok: true; operation: "connector:register"; data: ConnectorConfig }
  | { ok: true; operation: "connector:get"; data: ConnectorConfig | null }
  | { ok: true; operation: "connector:unregister"; data: boolean }
  | { ok: true; operation: "connector:list"; data: ConnectorConfig[] }
  | { ok: true; operation: "installation:add"; data: void }
  | { ok: true; operation: "trigger:register"; data: void }
  | { ok: true; operation: "trigger:forward"; data: void }
  | { ok: true; operation: "inspect:stats"; data: Record<string, unknown> }
  | { ok: false; operation: FusionOperation["type"]; error: FusionError };

export class FusionError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 500,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "FusionError";
  }
}

export const FusionErrors = {
  ConnectorNotFound: (uid: string) => new FusionError("CONNECTOR_NOT_FOUND", `Connector "${uid}" not found`, 404),
  TokenExpired: () => new FusionError("TOKEN_EXPIRED", "Token has expired", 401),
  TokenInvalid: () => new FusionError("TOKEN_INVALID", "Token is invalid", 401),
  UnsupportedVersion: (v: string) => new FusionError("UNSUPPORTED_VERSION", `Unsupported version "${v}"`, 400),
  SubjectRejected: (reason: string) => new FusionError("SUBJECT_REJECTED", `Subject rejected: ${reason}`, 403),
  ContractViolation: (reason: string) => new FusionError("CONTRACT_VIOLATION", reason, 400),
  Internal: (msg: string) => new FusionError("INTERNAL_ERROR", msg, 500),
};
