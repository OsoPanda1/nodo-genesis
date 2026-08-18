import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getCorsHeaders } from "./_shared/cors";
import { checkRateLimit, RATE_LIMITS } from "./_shared/rate-limit";
import { emitTelemetry } from "./_shared/telemetry";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  sessionId?: string;
  stream?: boolean;
  gateway?: "primary" | "gemini";
}

interface ChatError {
  code: string;
  message: string;
  retryable: boolean;
}

const PRIMARY_GATEWAY_URL = process.env.ISABELLA_PRIMARY_GATEWAY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const RATE_LIMIT_KEY = "ai";

function buildError(code: string, message: string, retryable = false): ChatError {
  return { code, message, retryable };
}

async function callPrimaryGateway(messages: ChatMessage[]): Promise<{ result: string; latencyMs: number }> {
  const start = Date.now();
  const res = await fetch(`${PRIMARY_GATEWAY_URL}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.ISABELLA_GATEWAY_TOKEN || ""}`,
    },
    body: JSON.stringify({
      model: "isabella-1",
      messages,
      max_tokens: 400,
      temperature: 0.7,
    }),
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => "");
    throw buildError("GATEWAY_ERROR", `Primary gateway returned ${res.status}: ${errorBody.slice(0, 200)}`, true);
  }

  const json = await res.json();
  return { result: json?.choices?.[0]?.message?.content ?? "", latencyMs: Date.now() - start };
}

async function callGeminiFallback(messages: ChatMessage[]): Promise<{ result: string; latencyMs: number }> {
  const start = Date.now();

  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents }),
      signal: AbortSignal.timeout(20000),
    },
  );

  if (!res.ok) {
    const errorBody = await res.text().catch(() => "");
    throw buildError("FALLBACK_ERROR", `Gemini fallback returned ${res.status}: ${errorBody.slice(0, 200)}`, false);
  }

  const json = await res.json();
  const result = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return { result, latencyMs: Date.now() - start };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const start = Date.now();
  const origin = (req.headers.origin as string | undefined) ?? null;
  const cors = getCorsHeaders(origin);
  Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ip = (req.headers["x-forwarded-for"] as string) || req.socket?.remoteAddress || "unknown";
  const rateLimit = checkRateLimit(new Request(`http://localhost?ip=${ip}`), RATE_LIMITS.ai);

  if (!rateLimit.allowed) {
    emitTelemetry({
      level: "warn",
      message: "Rate limit hit on isabella-chat",
      data: { ip, retryAfter: rateLimit.retryAfter },
    });
    return res.status(429).json({
      error: "Demasiadas solicitudes. Intenta de nuevo en unos segundos.",
      retryAfter: rateLimit.retryAfter,
    });
  }

  try {
    const body = req.body as ChatRequest;
    const messages = body?.messages;

    if (!messages?.length) {
      return res.status(400).json(buildError("INVALID_REQUEST", "Messages array is required and must not be empty."));
    }

    let response: { result: string; latencyMs: number };
    const useGemini = body.gateway === "gemini" || !PRIMARY_GATEWAY_URL;

    if (useGemini) {
      if (!GEMINI_API_KEY) {
        return res.status(500).json(buildError("CONFIG_ERROR", "Gemini API key is not configured."));
      }
      response = await callGeminiFallback(messages);
    } else {
      try {
        response = await callPrimaryGateway(messages);
      } catch (primaryErr) {
        emitTelemetry({
          level: "warn",
          message: "Primary gateway failed, attempting Gemini fallback",
          data: { error: primaryErr instanceof Error ? primaryErr.message : "unknown" },
        });

        if (!GEMINI_API_KEY) {
          throw buildError("ALL_GATEWAYS_FAILED", "Primary gateway failed and no fallback key configured.");
        }

        try {
          response = await callGeminiFallback(messages);
        } catch (fallbackErr) {
          throw buildError("ALL_GATEWAYS_FAILED", "Primary and fallback gateways both failed.");
        }
      }
    }

    const totalLatency = Date.now() - start;

    emitTelemetry({
      level: "info",
      message: "isabella-chat response",
      data: {
        gateway: useGemini ? "gemini" : "primary",
        latencyMs: totalLatency,
        responseLength: response.result.length,
      },
    });

    return res.status(200).json({
      content: response.result,
      latencyMs: totalLatency,
      gateway: useGemini ? "gemini" : "primary",
      usage: {
        totalLatencyMs: totalLatency,
        gatewayLatencyMs: response.latencyMs,
        tokens: Math.ceil(response.result.length / 4),
      },
    });
  } catch (err) {
    const error = err as ChatError;
    emitTelemetry({
      level: "error",
      message: "Critical Runtime Failure inside Isabella Core",
      data: { code: error?.code, message: error?.message },
    });
    return res.status(500).json({
      error: {
        code: error?.code || "INTERNAL_ERROR",
        message: error?.message || "An unexpected error occurred.",
        retryable: error?.retryable ?? false,
      },
    });
  }
}
