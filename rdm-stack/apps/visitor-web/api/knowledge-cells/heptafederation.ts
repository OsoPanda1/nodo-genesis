import { safeFetch } from "../_shared/network-utils";

export interface KnowledgeCellPayload {
  id: string;
  version: number;
  data: Record<string, any>;
  updatedAt: string;
}

export interface SyncResult {
  federationUrl: string;
  success: boolean;
  statusCode?: number;
  error?: string;
}

const TAMV_FEDERATION_NODES = [
  "https://fed1.visitarealdelmonte.online/api/sync",
  "https://fed2.visitarealdelmonte.online/api/sync",
  "https://fed3.visitarealdelmonte.online/api/sync",
  "https://fed4.visitarealdelmonte.online/api/sync",
  "https://fed5.visitarealdelmonte.online/api/sync",
  "https://fed6.visitarealdelmonte.online/api/sync",
  "https://fed7.visitarealdelmonte.online/api/sync",
];

async function sendSyncRequest(
  nodeUrl: string,
  payload: KnowledgeCellPayload,
  retries = 3,
  delay = 300
): Promise<SyncResult> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await safeFetch(nodeUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        return { federationUrl: nodeUrl, success: true, statusCode: response.status };
      }

      if (response.status >= 400 && response.status < 500) {
        return { federationUrl: nodeUrl, success: false, statusCode: response.status, error: `Client error: ${response.statusText}` };
      }
    } catch (err: any) {
      if (attempt === retries) {
        return { federationUrl: nodeUrl, success: false, error: err.message || "Connection error" };
      }
    }
    await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, attempt)));
  }

  return { federationUrl: nodeUrl, success: false, error: "Exhausted all retries" };
}

export async function broadcastToHeptafederation(payload: KnowledgeCellPayload): Promise<{
  quorumReached: boolean;
  successfulNodes: number;
  results: SyncResult[];
}> {
  const syncPromises = TAMV_FEDERATION_NODES.map((node) => sendSyncRequest(node, payload));
  const results = await Promise.all(syncPromises);

  const successfulNodes = results.filter((r) => r.success).length;
  const REQUIRED_QUORUM = 4;
  const quorumReached = successfulNodes >= REQUIRED_QUORUM;

  if (!quorumReached) {
    console.error(`CRITICAL: Heptafederation quorum failed — ${successfulNodes}/${TAMV_FEDERATION_NODES.length} confirmed`);
  }

  return { quorumReached, successfulNodes, results };
}
