import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders as sharedCors, jsonResponse } from "../_shared/cors.ts";
import { verifyAuth } from "../_shared/auth.ts";
import { callGatewayChat } from "../_shared/vercel-ai-gateway.ts";

const ALLOWED_ORIGINS = [
  "https://www.visitarealdelmonte.online",
  "https://visitarealdelmonte.online",
  "https://real-del-monte-digital-hub.vercel.app",
  ...(Deno.env.get("ENV") === "development"
    ? ["http://localhost:5173", "http://localhost:8080"]
    : []),
];

function corsHeaders(origin: string | null) {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return { ...sharedCors, "Access-Control-Allow-Origin": allowed, "Access-Control-Max-Age": "86400" };
}

const SYSTEM_PROMPT = `Eres REALITO, el asistente digital oficial de Real del Monte, Pueblo Mágico. 
Eres parte del ecosistema TAMV / Real del Monte Digital Hub creado por Edwin Oswaldo Castillo Trejo.

Personalidad:
- Eres amigable, entusiasta y conocedor de todo lo relacionado con Real del Monte
- Hablas con orgullo sobre la historia minera, la gastronomía, la cultura cornish y los paisajes
- Das recomendaciones precisas y verificables sobre rutas, lugares, horarios y eventos
- Usas un lenguaje cálido y accesible, como un guía local experto

Conoces a fondo:
- Historia de la minería en Real del Monte (Mina de Acosta, Panteón Inglés, Cornish)
- Gastronomía local (pastes, café de olla, dulces típicos)
- Lugares turísticos (Plaza Principal, Parroquia, Peña del Cuervo, museos)
- Eventos culturales y festividades del pueblo
- Rutas y recorridos recomendados
- Hospedaje, restaurantes y comercios locales

Cuando no sepas algo con certeza, sé honesto y sugiere consultar fuentes oficiales.
Sé siempre respetuoso, útil y promueve el turismo responsable.`;



interface ModelRouterResponse {
  provider: string;
  model: string;
  output: string;
  meta: { latencyMs?: number; traceId: string };
}

async function callModelRouter(prompt: string, userId: string): Promise<ModelRouterResponse> {
  const gatewayResp = await callGatewayChat(SYSTEM_PROMPT, prompt, { temperature: 0.8, maxTokens: 1024 });
  if (gatewayResp) return gatewayResp;

  const routerUrl = Deno.env.get("MODEL_ROUTER_URL");
  const routerToken = Deno.env.get("MODEL_ROUTER_TOKEN");
  const modelName = Deno.env.get("REALITO_MODEL_NAME") ?? "Qwen/Qwen1.5-72B-Chat";

  if (routerUrl) {
    try {
      const res = await fetch(routerUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(routerToken ? { Authorization: `Bearer ${routerToken}` } : {}),
        },
        body: JSON.stringify({
          model: modelName,
          prompt,
          max_tokens: 1024,
          temperature: 0.8,
          context: { federation: "F6", useCase: "turismo", userId },
        }),
      });
      if (res.ok) return await res.json();
      console.error("Model router failed, falling back to Gemini:", res.status);
    } catch (e) {
      console.error("Model router error:", e);
    }
  }

  const geminiKey = Deno.env.get("GEMINI_API_KEY");
  if (geminiKey) {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.8, topK: 40, topP: 0.95, maxOutputTokens: 1024 },
        }),
      },
    );
    if (!geminiRes.ok) throw new Error(`Gemini API error: ${await geminiRes.text()}`);
    const geminiData = await geminiRes.json();
    const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    return { provider: "gemini", model: "gemini-2.0-flash", output: text, meta: { traceId: crypto.randomUUID() } };
  }

  return { provider: "fallback", model: "builtin", output: SYSTEM_PROMPT.split("\n")[0], meta: { traceId: crypto.randomUUID() } };
}

async function logPromptOutput(prompt: string, output: string, modelResp: ModelRouterResponse, userId: string, traceId: string) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !supabaseKey) return;
  try {
    await fetch(`${supabaseUrl}/rest/v1/ai_prompts_log`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        user_id: userId,
        federation: "F6",
        use_case: "turismo",
        model_name: modelResp.model,
        provider: modelResp.provider,
        prompt,
        output,
        trace_id: traceId,
        meta: { latencyMs: modelResp.meta.latencyMs },
      }),
    });
  } catch {
    // non-critical
  }
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const headers = { ...corsHeaders(origin), "Content-Type": "application/json" };

  if (req.method === "OPTIONS") return new Response("ok", { headers });

  try {
    const userId = await verifyAuth(req.headers.get("Authorization"), Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const body = await req.json().catch(() => ({}));
    const messages = body.messages ?? [];
    const stream = body.stream ?? false;

    const lastUserMsg = [...messages].reverse().find((m: { role: string }) => m.role === "user");
    const prompt = lastUserMsg?.content || messages.map((m: { content: string }) => m.content).join("\n") || "";

    if (!prompt) {
      return new Response(JSON.stringify({ error: "No user message found" }), { status: 400, headers });
    }

    const traceId = crypto.randomUUID();
    const fullPrompt = `${SYSTEM_PROMPT}\n\nUsuario: ${prompt}\n\nREALITO:`;
    const modelResp = await callModelRouter(fullPrompt, userId);

    await logPromptOutput(prompt, modelResp.output, modelResp, userId, traceId);

    if (stream) {
      const encoder = new TextEncoder();
      const chunks = modelResp.output.match(/[\s\S]{1,20}/g) ?? [modelResp.output];
      const body = new ReadableStream({
        async start(controller) {
          for (const chunk of chunks) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: chunk } }] })}\n\n`));
            await new Promise((r) => setTimeout(r, 30));
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, traceId, provider: modelResp.provider })}\n\n`));
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        },
      });
      return new Response(body, {
        headers: { ...headers, "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
      });
    }

    return new Response(JSON.stringify({ choices: [{ message: { content: modelResp.output } }], traceId, provider: modelResp.provider }), { headers });
  } catch (e) {
    const status = e instanceof Error && (e.message === "missing_auth" || e.message === "invalid_token") ? 401 : 500;
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), { status, headers });
  }
});
