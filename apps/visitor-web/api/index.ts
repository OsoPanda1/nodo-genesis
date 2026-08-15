import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getCorsHeaders } from "./_shared/cors";
import { getConfig, init } from "./bootstrap";

const config = init();

export default function handler(req: VercelRequest, res: VercelResponse) {
  const origin = (req.headers.origin as string | undefined) ?? null;
  const cors = getCorsHeaders(origin);
  Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === "OPTIONS") return res.status(204).end();

  res.status(200).json({
    service: "RDM Digital Hub API",
    version: config.version,
    nodeId: config.nodeId,
    environment: config.environment,
    startedAt: config.startedAt,
  });
}
