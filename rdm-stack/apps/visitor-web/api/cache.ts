export type CacheEntry<T = unknown> = {
  value: T;
  expiresAt: number;
};

export interface CacheMetrics {
  hits: number;
  misses: number;
  evictions: number;
}

export class Cache {
  private store = new Map<string, CacheEntry>();
  private frequency = new Map<string, number>();
  private metrics: CacheMetrics = { hits: 0, misses: 0, evictions: 0 };
  private maxSize?: number;

  constructor(maxSize?: number) {
    this.maxSize = maxSize;
  }

  get<T = unknown>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) {
      this.metrics.misses += 1;
      return undefined;
    }

    if (Date.now() >= entry.expiresAt) {
      this.store.delete(key);
      this.frequency.delete(key);
      this.metrics.misses += 1;
      return undefined;
    }

    this.metrics.hits += 1;
    this.frequency.set(key, (this.frequency.get(key) || 0) + 1);
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    const expiresAt = Date.now() + ttlMs;
    this.store.set(key, { value, expiresAt });

    // Inicializa frecuencia en 0 (aún no hay lecturas).
    if (!this.frequency.has(key)) {
      this.frequency.set(key, 0);
    }

    // Si hay límite de tamaño, aplica política de evicción.
    if (this.maxSize !== undefined && this.store.size > this.maxSize) {
      this.evictLFU(this.maxSize);
    }
  }

  has(key: string): boolean {
    const entry = this.store.get(key);
    if (!entry) return false;
    if (Date.now() >= entry.expiresAt) {
      this.store.delete(key);
      this.frequency.delete(key);
      return false;
    }
    return true;
  }

  delete(key: string): void {
    if (this.store.delete(key)) {
      this.frequency.delete(key);
      this.metrics.evictions += 1;
    }
  }

  clear(): void {
    this.store.clear();
    this.frequency.clear();
  }

  get size(): number {
    this.evictExpired();
    return this.store.size;
  }

  getStats(): CacheMetrics {
    // Devuelve una copia para evitar mutaciones externas.
    return { ...this.metrics };
  }

  evictExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now >= entry.expiresAt) {
        this.store.delete(key);
        this.frequency.delete(key);
        this.metrics.evictions += 1;
      }
    }
  }

  /**
   * Evicción por LFU (Least Frequently Used), no por LRU.
   * Elimina las claves con menor frecuencia de acceso hasta alcanzar maxSize.
   */
  evictLFU(maxSize: number): void {
    this.evictExpired();
    if (this.store.size <= maxSize) return;

    const sorted = [...this.frequency.entries()].sort((a, b) => a[1] - b[1]);
    const toEvict = this.store.size - maxSize;

    for (let i = 0; i < toEvict && i < sorted.length; i++) {
      const key = sorted[i][0];
      this.store.delete(key);
      this.frequency.delete(key);
      this.metrics.evictions += 1;
    }
  }
}

let defaultInstance: Cache | null = null;

export function getCache(maxSize?: number): Cache {
  if (!defaultInstance) {
    defaultInstance = new Cache(maxSize);
  }
  return defaultInstance;
}
