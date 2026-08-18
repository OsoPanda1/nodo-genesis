import { queryIsabellaAI } from "./isa-ai";
import { corsJsonResponse, handleCors } from "../_shared/cors";

export const config = { runtime: "edge" };

export default async function handler(request: Request): Promise<Response> {
  const cors = handleCors(request);
  if (cors) return cors;

  if (request.method !== "POST") {
    return corsJsonResponse(request, { error: "Method not allowed" }, 405);
  }

  const { prompt } = await request.json();

  if (!prompt || typeof prompt !== "string") {
    return corsJsonResponse(request, { error: '"prompt" is required' }, 400);
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let aborted = false;
      request.signal.addEventListener("abort", () => { aborted = true; });

      try {
        const gatewayUrl = process.env.VERCEL_AI_GATEWAY_URL || "";
        const apiKey = process.env.OPENAI_API_KEY || "";
        const response = await queryIsabellaAI(prompt, gatewayUrl, apiKey);

        if (aborted) { controller.close(); return; }

        const words = response.answer.split(" ");
        for (let i = 0; i < words.length; i++) {
          if (aborted) break;
          const chunk = JSON.stringify({ token: words[i] + (i === words.length - 1 ? "" : " "), index: i, done: i === words.length - 1 }) + "\n";
          controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));
          await new Promise((r) => setTimeout(r, 50));
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (err: any) {
        console.error("CRITICAL: isabella-chat.ts ->", err.message);
        if (!aborted) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "Stream error" })}\n\n`));
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
