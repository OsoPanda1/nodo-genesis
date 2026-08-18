const store = new Map<string, { timestamps: number[] }>();

const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanupTime = Date.now();

function cleanup(windowMs: number): void {
  const now = Date.now();
  if (now - lastCleanupTime < CLEANUP_INTERVAL_MS) return;
  lastCleanupTime = now;
  const cutoff = now - windowMs * 2;
  for (const [key, record] of store) {
    const active = record.timestamps.filter((t) => t > cutoff);
    if (active.length === 0) store.delete(key);
    else store.set(key, { timestamps: active });
  }
}

function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyPrefix?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
  headers: Record<string, string>;
}

export function checkRateLimit(request: Request, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const { windowMs, maxRequests } = config;

  cleanup(windowMs);

  const ip = getClientIp(request);
  const key = `${config.keyPrefix || "api"}:${ip}`;

  let record = store.get(key);
  if (!record) {
    record = { timestamps: [] };
    store.set(key, record);
  }

  const windowStart = now - windowMs;
  const validTimestamps = record.timestamps.filter((t) => t > windowStart);
  const currentCount = validTimestamps.length;
  const isBlocked = currentCount >= maxRequests;

  if (!isBlocked) {
    validTimestamps.push(now);
    store.set(key, { timestamps: validTimestamps });
  }

  const remaining = Math.max(0, maxRequests - currentCount - (isBlocked ? 0 : 0));
  const oldestValid = validTimestamps.length > 0 ? validTimestamps[0] : now;
  const resetAt = oldestValid + windowMs;
  const retryAfter = isBlocked ? Math.ceil((resetAt - now) / 1000) : undefined;

  const headers: Record<string, string> = {
    "X-RateLimit-Limit": String(maxRequests),
    "X-RateLimit-Remaining": String(isBlocked ? 0 : remaining),
    "X-RateLimit-Reset": String(Math.ceil(resetAt / 1000)),
  };
  if (retryAfter) headers["Retry-After"] = String(retryAfter);

  return {
    allowed: !isBlocked,
    remaining: isBlocked ? 0 : remaining,
    resetAt,
    retryAfter,
    headers,
  };
}

export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  ai: { windowMs: 60_000, maxRequests: 20, keyPrefix: "ai" },
  tts: { windowMs: 60_000, maxRequests: 30, keyPrefix: "tts" },
  health: { windowMs: 60_000, maxRequests: 60, keyPrefix: "health" },
  model: { windowMs: 60_000, maxRequests: 10, keyPrefix: "model" },
  telemetry: { windowMs: 60_000, maxRequests: 30, keyPrefix: "telemetry" },
  default: { windowMs: 60_000, maxRequests: 60, keyPrefix: "default" },
};
