const TELEMETRY_ENDPOINT = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}/api/telemetry`
  : "http://localhost:3000/api/telemetry";

const SENSITIVE_KEYS = ["password", "token", "jwt", "secret", "authorization", "apiKey", "stripe", "key"];

export interface TelemetryPayload {
  level: "info" | "warn" | "error";
  message: string;
  traceId?: string;
  data?: Record<string, unknown>;
}

function sanitize(data: any): any {
  if (!data || typeof data !== "object") return data;
  const out: any = Array.isArray(data) ? [...data] : { ...data };
  for (const key of Object.keys(out)) {
    if (SENSITIVE_KEYS.some((s) => key.toLowerCase().includes(s))) {
      out[key] = "[MASKED]";
    } else if (typeof out[key] === "object") {
      out[key] = sanitize(out[key]);
    }
  }
  return out;
}

let pending: TelemetryPayload[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

async function flush(): Promise<void> {
  const batch = pending.splice(0);
  pending = [];
  try {
    await fetch(TELEMETRY_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events: batch.map((e) => ({ ...e, data: sanitize(e.data) })) }),
    });
  } catch {
    // Silently drop telemetry on failure
  }
}

function scheduleFlush(): void {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    flush();
  }, 1000);
}

export function emitTelemetry(payload: TelemetryPayload): void {
  pending.push(payload);
  if (pending.length >= 10) {
    if (flushTimer) {
      clearTimeout(flushTimer);
      flushTimer = null;
    }
    flush();
  } else {
    scheduleFlush();
  }
}
