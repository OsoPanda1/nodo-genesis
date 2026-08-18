import { createTraceId } from "@/core/context/trace";
import { getLastDecision } from "@/lib/isabella";
import { runRealitoKernel } from "@/lib/kernel";
import { withSpan } from "@/instrumentation.node";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const decision = getLastDecision();
  const traceId = body.traceId ?? decision?.traceId ?? createTraceId();

  const response = await withSpan(
    "isabella.recommendations",
    () => {
      const result = runRealitoKernel(body.query ?? "", decision ?? undefined);
      return {
        traceId,
        territory: body.territory ?? decision?.territory ?? "RDM",
        decision,
        ...result,
      };
    },
    {
      traceId,
      territory: body.territory ?? decision?.territory ?? "RDM",
    },
  );

  return new Response(JSON.stringify(response), {
    headers: { "Content-Type": "application/json" },
  });
}
