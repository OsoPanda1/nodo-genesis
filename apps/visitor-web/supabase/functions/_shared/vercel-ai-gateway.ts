export interface GatewayResponse {
  provider: string;
  model: string;
  output: string;
  meta: { latencyMs?: number; traceId: string };
}

const GATEWAY_URL = Deno.env.get("VERCEL_AI_GATEWAY_URL");
const GATEWAY_TOKEN = Deno.env.get("VERCEL_AI_GATEWAY_TOKEN");
const GATEWAY_MODEL = Deno.env.get("VERCEL_AI_GATEWAY_MODEL") ?? "claude-sonnet-4-20250514";

function isConfigured(): boolean {
  return !!GATEWAY_URL && !!GATEWAY_TOKEN;
}

export async function callGatewayChat(
  systemPrompt: string,
  userPrompt: string,
  options: { temperature?: number; maxTokens?: number; model?: string } = {},
): Promise<GatewayResponse | null> {
  if (!isConfigured()) return null;

  const traceId = crypto.randomUUID();
  const start = Date.now();

  try {
    const res = await fetch(`${GATEWAY_URL}/openai/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GATEWAY_TOKEN}`,
      },
      body: JSON.stringify({
        model: options.model ?? GATEWAY_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: options.maxTokens ?? 1024,
        temperature: options.temperature ?? 0.85,
      }),
    });

    if (!res.ok) {
      console.error("[vercel-ai-gateway] HTTP error:", res.status, await res.text().catch(() => ""));
      return null;
    }

    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content ?? "";

    return {
      provider: "vercel-ai-gateway",
      model: options.model ?? GATEWAY_MODEL,
      output: text,
      meta: { latencyMs: Date.now() - start, traceId },
    };
  } catch (e) {
    console.error("[vercel-ai-gateway] fetch failed:", e);
    return null;
  }
}

export async function callGatewayMessages(
  messages: Array<{ role: string; content: string }>,
  options: { temperature?: number; maxTokens?: number; model?: string } = {},
): Promise<GatewayResponse | null> {
  if (!isConfigured()) return null;

  const traceId = crypto.randomUUID();
  const start = Date.now();

  try {
    const res = await fetch(`${GATEWAY_URL}/openai/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GATEWAY_TOKEN}`,
      },
      body: JSON.stringify({
        model: options.model ?? GATEWAY_MODEL,
        messages,
        max_tokens: options.maxTokens ?? 1024,
        temperature: options.temperature ?? 0.85,
      }),
    });

    if (!res.ok) {
      console.error("[vercel-ai-gateway] HTTP error:", res.status, await res.text().catch(() => ""));
      return null;
    }

    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content ?? "";

    return {
      provider: "vercel-ai-gateway",
      model: options.model ?? GATEWAY_MODEL,
      output: text,
      meta: { latencyMs: Date.now() - start, traceId },
    };
  } catch (e) {
    console.error("[vercel-ai-gateway] fetch failed:", e);
    return null;
  }
}
