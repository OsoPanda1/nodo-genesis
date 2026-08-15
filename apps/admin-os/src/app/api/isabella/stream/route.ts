import { bus } from "@/core/infra/event-bus";
import { streamConnections } from "@/infra/metrics/prometheus";

const HEARTBEAT_MS = 25_000;
const RETRY_MS = 3_000;

export async function GET() {
  let eventId = 0;
  let keepAlive: ReturnType<typeof setInterval> | null = null;
  const encoder = new TextEncoder();

  const listener = (payload: unknown) => {
    streamController?.enqueue(
      encoder.encode(`id: ${eventId++}\nretry: ${RETRY_MS}\ndata: ${JSON.stringify(payload)}\n\n`),
    );
  };

  let streamController: ReadableStreamDefaultController<Uint8Array> | null = null;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      streamController = controller;
      streamConnections.inc();
      bus.on("isabella:decision", listener);

      keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(`: heartbeat ${Date.now()}\n\n`));
      }, HEARTBEAT_MS);

      controller.enqueue(encoder.encode(`event: ready\ndata: {"ok":true}\n\n`));
    },
    cancel() {
      if (keepAlive) {
        clearInterval(keepAlive);
        keepAlive = null;
      }
      bus.off("isabella:decision", listener);
      streamConnections.dec();
      streamController = null;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
