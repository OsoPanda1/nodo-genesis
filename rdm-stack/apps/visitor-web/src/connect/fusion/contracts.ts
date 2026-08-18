import type { ConnectorType, ConnectSubject, ConnectTokenRequest } from "../types";

export type ContractVersion = "v1" | "v2" | "latest";

export interface ConnectorContract {
  version: ContractVersion;
  supportedTypes: ConnectorType[];
  tokenTTL: number;
  maxScopes: number;
  requiresInstallationId: boolean;
  allowedSubjectTypes: ConnectSubject["type"][];
  hooks?: {
    beforeIssue?: (req: ConnectTokenRequest) => Promise<ConnectTokenRequest>;
    afterIssue?: (res: { token: string; expiresAt: number }) => Promise<void>;
  };
}

const V1_CONTRACT: ConnectorContract = {
  version: "v1",
  supportedTypes: ["oauth", "api-key"],
  tokenTTL: 3600_000,
  maxScopes: 10,
  requiresInstallationId: false,
  allowedSubjectTypes: ["app", "user"],
};

const V2_CONTRACT: ConnectorContract = {
  version: "v2",
  supportedTypes: ["slack", "github", "oauth", "api-key", "custom"],
  tokenTTL: 7200_000,
  maxScopes: 50,
  requiresInstallationId: false,
  allowedSubjectTypes: ["app", "user", "jwt-bearer"],
  hooks: {
    afterIssue: async () => {},
  },
};

const LATEST_CONTRACT: ConnectorContract = {
  ...V2_CONTRACT,
  version: "latest",
  tokenTTL: 7200_000,
};

const CONTRACTS: Record<ContractVersion, ConnectorContract> = {
  v1: V1_CONTRACT,
  v2: V2_CONTRACT,
  latest: LATEST_CONTRACT,
};

export function getContract(version?: ContractVersion): ConnectorContract {
  return version ? (CONTRACTS[version] ?? V1_CONTRACT) : LATEST_CONTRACT;
}

export function listContracts(): ConnectorContract[] {
  return Object.values(CONTRACTS);
}
