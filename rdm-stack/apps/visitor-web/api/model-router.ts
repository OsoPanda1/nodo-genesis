import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuth } from "./_shared/auth.js";
import { checkRateLimit, RATE_LIMITS } from "./_shared/rate-limit";
import { sendWebResponse, vercelRequestToWebRequest } from "./_shared/network-utils";

type ModelProvider = "vercel-ai-gateway" | "huggingface" | "openllm" | "fallback";

interface FederationContext {
  nodeId: string;
  federation: string;
  useCase: string;
  environment: "dev" | "staging" | "prod";
  userId?: string | null;
}

interface ModelRouterRequest {
  model: string;
  prompt: string;
  max_tokens?: number;
  temperature?: number;
  context?: {
    federation?: string;
    useCase?: string;
    userId?: string | null;
  };
}

interface ModelRouterResponse {
  provider: ModelProvider;
  model: string;
  output: string;
  meta: {
    tokens?: number;
    latencyMs: number;
    traceId: string;
    federation: FederationContext;
  };
}

interface CircuitState {
  failures: number;
  lastFailure: number;
  isOpen: boolean;
}

const circuitStore = new Map<string, CircuitState>();
const CIRCUIT_THRESHOLD = parseInt(process.env.AI_CIRCUIT_BREAKER_THRESHOLD || "5", 10);
const CIRCUIT_COOLDOWN = parseInt(process.env.AI_CIRCUIT_BREAKER_COOLDOWN_MS || "30000", 10);

function isCircuitOpen(provider: string): boolean {
  const state = circuitStore.get(provider);
  if (!state || !state.isOpen) return false;
  if (Date.now() - state.lastFailure > CIRCUIT_COOLDOWN) {
    circuitStore.set(provider, { failures: 0, lastFailure: 0, isOpen: false });
    return false;
  }
  return true;
}

function recordFailure(provider: string): void {
  const state = circuitStore.get(provider) || { failures: 0, lastFailure: 0, isOpen: false };
  state.failures++;
  state.lastFailure = Date.now();
  if (state.failures >= CIRCUIT_THRESHOLD) state.isOpen = true;
  circuitStore.set(provider, state);
}

function recordSuccess(provider: string): void {
  circuitStore.set(provider, { failures: 0, lastFailure: 0, isOpen: false });
}

function buildFederationContext(
  ctx?: ModelRouterRequest["context"],
  userId?: string,
): FederationContext {
  const env = (process.env.NODE_ENV as "dev" | "staging" | "prod") || "dev";
  return {
    nodeId: process.env.NODE_ID || "nodo-cero-model-router",
    federation: ctx?.federation || "F5",
    useCase: ctx?.useCase || "model-router",
    environment: env,
    userId: ctx?.userId ?? userId ?? null,
  };
}

function sanitizeHuggingFaceModelId(input: string): string | null {
  const value = input.trim();
  if (!value || value.length > 128) return null;
  if (!/^[A-Za-z0-9._/-]+$/.test(value)) return null;
  if (value.includes("..") || value.startsWith("/") || value.endsWith("/") || value.includes("//")) return null;
  return value;
}

async function fetchWithTimeout(url: string, options: RequestInit & { timeout?: number }): Promise<Response> {
  const timeout = options.timeout || 15000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchWithRetry(url: string, options: RequestInit & { timeout?: number }, retries = 2): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetchWithTimeout(url, options);
      return res;
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 200));
    }
  }
  throw new Error("fetchWithRetry exhausted");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const webRequest = vercelRequestToWebRequest(req);

  const auth = await requireAuth(webRequest);
  if (auth.errorResponse) {
    return sendWebResponse(res, auth.errorResponse);
  }

  const rateLimit = checkRateLimit(webRequest, RATE_LIMITS.model);
  if (!rateLimit.allowed) {
    return res.status(429).json({
      error: "Rate limit exceeded",
      retryAfter: rateLimit.retryAfter,
    });
  }

  const start = Date.now();
  const traceId = `${start}-${Math.random().toString(36).slice(2, 10)}`;

  const body = req.body as ModelRouterRequest;
  const federation = buildFederationContext(body.context, auth.userId);

  try {
    const { model, prompt, max_tokens = 512, temperature = 0.7 } = body;

    if (!model || !prompt) {
      return res.status(400).json({ error: "Missing model or prompt" });
    }

    let provider: ModelProvider = "fallback";
    let output = "";
    let tokens: number | undefined;

    const gatewayUrl = process.env.VERCEL_AI_GATEWAY_URL;
    const gatewayToken = process.env.VERCEL_AI_GATEWAY_TOKEN;
    const gatewayModel = process.env.VERCEL_AI_GATEWAY_MODEL || "claude-sonnet-4-20250514";

    if (gatewayUrl && gatewayToken && !isCircuitOpen("vercel-ai-gateway")) {
      try {
        const gatewayRes = await fetchWithRetry(
          `${gatewayUrl}/openai/v1/chat/completions`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${gatewayToken}`,
            },
            body: JSON.stringify({
              model: gatewayModel,
              messages: [{ role: "user", content: prompt }],
              max_tokens,
              temperature,
            }),
            timeout: 20000,
          },
          1,
        );

        if (gatewayRes.ok) {
          const gatewayData = await gatewayRes.json();
          output = gatewayData?.choices?.[0]?.message?.content ?? "";
          provider = "vercel-ai-gateway";
          tokens = typeof gatewayData?.usage?.total_tokens === "number" ? gatewayData.usage.total_tokens : undefined;
          recordSuccess("vercel-ai-gateway");
        } else {
          recordFailure("vercel-ai-gateway");
        }
      } catch (gatewayError) {
        recordFailure("vercel-ai-gateway");
      }
    }

    if (output) {
      const latencyMs = Date.now() - start;
      const response: ModelRouterResponse = {
        provider,
        model: gatewayModel,
        output,
        meta: { tokens, latencyMs, traceId, federation },
      };
      return res.status(200).json(response);
    }

    if (
      model.startsWith("Qwen/") ||
      model.startsWith("mistralai/") ||
      model.startsWith("meta-llama/") ||
      model.startsWith("google/")
    ) {
      provider = "huggingface";
      const hfToken = process.env.HUGGINGFACE_API_TOKEN;

      if (!hfToken) {
        return res.status(500).json({
          error: "HF provider not configured",
          meta: { traceId, federation },
        });
      }

      const safeModel = sanitizeHuggingFaceModelId(model);
      if (!safeModel) {
        return res.status(400).json({ error: "Invalid model identifier" });
      }

      const hfRes = await fetchWithRetry(
        `https://api-inference.huggingface.co/models/${encodeURIComponent(safeModel)}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${hfToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: { max_new_tokens: max_tokens, temperature },
          }),
          timeout: 30000,
        },
      );

      if (!hfRes.ok) {
        const errText = await hfRes.text();
        return res.status(502).json({
          error: "HF API error",
          meta: { traceId, federation },
        });
      }

      const hfData = await hfRes.json();
      const candidate = Array.isArray(hfData) ? hfData[0] : hfData;

      output = candidate?.generated_text ?? JSON.stringify(hfData);
      tokens = typeof candidate?.tokens === "number" ? candidate.tokens : undefined;
    } else {
      const openllmUrl = process.env.OPENLLM_API_URL;

      if (openllmUrl) {
        provider = "openllm";
        try {
          const ollmRes = await fetchWithRetry(
            `${openllmUrl}/v1/chat/completions`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.OPENLLM_API_TOKEN || ""}`,
              },
              body: JSON.stringify({
                model,
                messages: [{ role: "user", content: prompt }],
                max_tokens,
                temperature,
              }),
              timeout: 15000,
            },
          );

          if (!ollmRes.ok) {
            const text = await ollmRes.text();
            output = `Model ${model} unavailable via OpenLLM.`;
          } else {
            const ollmData = await ollmRes.json();
            output = ollmData?.choices?.[0]?.message?.content ?? JSON.stringify(ollmData);
            tokens = typeof ollmData?.usage?.total_tokens === "number" ? ollmData.usage.total_tokens : undefined;
          }
        } catch {
          output = `Model ${model} unavailable via OpenLLM.`;
        }
      } else {
        output = `No provider configured for model: ${model}`;
      }
    }

    const latencyMs = Date.now() - start;
    const response: ModelRouterResponse = {
      provider,
      model,
      output,
      meta: { tokens, latencyMs, traceId, federation },
    };

    return res.status(200).json(response);
  } catch (e: unknown) {
    const errMsg = e instanceof Error ? e.message : "unknown error";
    return res.status(500).json({
      error: "Model router error",
      detail: process.env.NODE_ENV === "development" ? errMsg : undefined,
      meta: { traceId, federation },
    });
  }
}
