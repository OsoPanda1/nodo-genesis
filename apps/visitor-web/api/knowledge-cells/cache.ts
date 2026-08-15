export interface CacheConfig {
  ttlMs: number;
  maxEntries: number;
}

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class TamvMemoryCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private readonly ttlMs: number;
  private readonly maxEntries: number;

  constructor(config: CacheConfig = { ttlMs: 60000, maxEntries: 500 }) {
    this.ttlMs = config.ttlMs;
    this.maxEntries = config.maxEntries;
  }

  set(key: string, value: T): void {
    if (value === undefined || value === null) return;
    if (Array.isArray(value) && value.length === 0) return;

    if (this.cache.size >= this.maxEntries) {
      const oldest = this.cache.keys().next().value;
      if (oldest) this.cache.delete(oldest);
    }

    this.cache.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.value;
  }

  clear(): void {
    this.cache.clear();
  }

  prune(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache) {
      if (now > entry.expiresAt) this.cache.delete(key);
    }
  }

  get size(): number {
    return this.cache.size;
  }
}

export const knowledgeCellsCache = new TamvMemoryCache<any>({
  ttlMs: 5 * 60 * 1000,
  maxEntries: 300,
});
