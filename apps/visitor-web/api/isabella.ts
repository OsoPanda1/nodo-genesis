import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getCorsHeaders } from "./_shared/cors";
import { checkRateLimit, RATE_LIMITS } from "./_shared/rate-limit";
import { requireAuth } from "./_shared/auth.js";
import { sendWebResponse, vercelRequestToWebRequest } from "./_shared/network-utils";
import { emitTelemetry } from "./_shared/telemetry";

interface IsabellaRequest {
  model?: string;
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
  context?: { federation?: string; useCase?: string; userId?: string | null };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = (req.headers.origin as string | undefined) ?? null;
  const cors = getCorsHeaders(origin);
  Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const webRequest = vercelRequestToWebRequest(req);

  const auth = await requireAuth(webRequest);
  if (auth.errorResponse) return sendWebResponse(res, auth.errorResponse);

  const rateLimit = checkRateLimit(webRequest, RATE_LIMITS.ai);
  if (!rateLimit.allowed) {
    return res.status(429).json({ error: "Rate limit exceeded", retryAfter: rateLimit.retryAfter });
  }

  try {
    const body = req.body as IsabellaRequest;
    if (!body?.messages?.length) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    const modelApiUrl = `${process.env.VERCEL_URL || "http://localhost:3000"}/api/model-router`;
    const modelResponse = await fetch(modelApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: req.headers.authorization || "",
      },
      body: JSON.stringify({
        model: body.model || "isabella-1",
        prompt: body.messages.map((m) => m.content).join("\n"),
        max_tokens: body.max_tokens,
        temperature: body.temperature,
        context: body.context,
      }),
    });

    if (!modelResponse.ok) {
      const err = await modelResponse.json();
      return res.status(modelResponse.status).json(err);
    }

    const modelData = await modelResponse.json();
    return res.status(200).json({
      content: modelData.output,
      provider: modelData.provider,
      model: modelData.model,
      meta: modelData.meta,
    });
  } catch (err) {
    emitTelemetry({
      level: "error",
      message: "Isabella facade error",
      data: { error: err instanceof Error ? err.message : "Unknown" },
    });
    return res.status(500).json({ error: "Isabella facade error" });
  }
}
