import { register } from "@/infra/metrics/prometheus";

export async function GET() {
  return new Response(await register.metricsText(), {
    headers: {
      "Content-Type": "text/plain; version=0.0.4; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
