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

export type RateLimitStore = "memory" | "database";

export interface RateLimitProvider {
  check(key: string, config: RateLimitConfig): RateLimitResult;
  cleanup(): void;
}
