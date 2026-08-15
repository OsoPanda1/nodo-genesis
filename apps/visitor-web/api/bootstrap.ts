import { getCache } from "./cache";
import { getCorsHeaders } from "./_shared/cors";

export interface BootstrapConfig {
  nodeId: string;
  environment: "development" | "production" | "staging";
  version: string;
  startedAt: string;
}

let config: BootstrapConfig | null = null;

export function init(): BootstrapConfig {
  if (config) return config;

  const nodeId = process.env.NODE_ID || `nodo-${Date.now().toString(36)}`;
  const env =
    process.env.NODE_ENV === "production"
      ? ("production" as const)
      : process.env.NODE_ENV === "staging"
        ? ("staging" as const)
        : ("development" as const);

  config = {
    nodeId,
    environment: env,
    version: process.env.npm_package_version || "1.0.0",
    startedAt: new Date().toISOString(),
  };

  const cache = getCache();
  cache.set("bootstrap:config", config, 24 * 60 * 60 * 1000);

  return config;
}

export function getConfig(): BootstrapConfig {
  if (!config) return init();
  return config;
}
