import { safeFetch } from "../_shared/network-utils";

export interface IsaResponse {
  answer: string;
  confidence: number;
  sources: string[];
  metadata: {
    intent: string;
    federationTarget: number;
  };
}

function sanitizeIsaResponse(payload: any): IsaResponse {
  if (!payload || typeof payload !== "object") {
    throw new Error("AI response is not a valid JSON object");
  }
  return {
    answer: typeof payload.answer === "string" ? payload.answer : "",
    confidence: typeof payload.confidence === "number" ? payload.confidence : 0.0,
    sources: Array.isArray(payload.sources) ? payload.sources.map((s: any) => String(s)) : [],
    metadata: payload.metadata && typeof payload.metadata === "object"
      ? {
          intent: typeof payload.metadata.intent === "string" ? payload.metadata.intent : "unknown",
          federationTarget: typeof payload.metadata.federationTarget === "number" ? payload.metadata.federationTarget : 1,
        }
      : { intent: "unknown", federationTarget: 1 },
  };
}

export async function queryIsabellaAI(prompt: string, gatewayUrl: string, apiKey: string): Promise<IsaResponse> {
  if (!apiKey) throw new Error("Isabella AI API key not configured");

  const payload = {
    model: "gpt-4o",
    messages: [
      { role: "system", content: "Respond strictly in JSON format aligned to isa-ai.schema.json" },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
  };

  try {
    const response = await safeFetch(gatewayUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Vercel AI Gateway error: ${response.status} ${response.statusText}`);
    }

    const rawData = await response.json();
    const aiMessageContent = rawData.choices?.[0]?.message?.content;
    if (!aiMessageContent) throw new Error("AI gateway returned empty structure");

    const parsedContent = JSON.parse(aiMessageContent);
    return sanitizeIsaResponse(parsedContent);
  } catch (error: any) {
    console.error("CRITICAL: isa-ai.ts query failed ->", error.message);
    return {
      answer: "Lo siento, Isabella está experimentando problemas de conectividad temporal.",
      confidence: 0.0,
      sources: [],
      metadata: { intent: "fallback", federationTarget: 1 },
    };
  }
}
