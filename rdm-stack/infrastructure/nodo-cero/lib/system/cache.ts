/* ================================================================== */
/* LATENCIA — Cache TTL en memoria                                    */
/* ================================================================== */
/* Capa de caché edge-safe (sin node APIs) para reducir latencia en   */
/* lecturas repetidas: snapshots del monitor, estados de dominios,     */
/* respuestas determinísticas.                                         */
/* ================================================================== */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class TtlCache<T> {
  private store = new Map<string, CacheEntry<T>>();

  constructor(private defaultTtlMs = 1000) {}

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  /** Devuelve el valor en caché o lo computa y lo guarda. */
  getOrSet(key: string, producer: () => T, ttlMs = this.defaultTtlMs): T {
    const cached = this.get(key);
    if (cached !== undefined) return cached;
    const value = producer();
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
    return value;
  }

  async getOrSetAsync(key: string, producer: () => Promise<T>, ttlMs = this.defaultTtlMs): Promise<T> {
    const cached = this.get(key);
    if (cached !== undefined) return cached;
    const value = await producer();
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
    return value;
  }

  set(key: string, value: T, ttlMs = this.defaultTtlMs): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  invalidate(key: string): void {
    this.store.delete(key);
  }

  invalidatePrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) this.store.delete(key);
    }
  }

  size(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  /** Poda entradas expiradas (mantenimiento en tercer plano). */
  sweep(): number {
    const now = Date.now();
    let removed = 0;
    for (const [key, entry] of this.store) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
        removed += 1;
      }
    }
    return removed;
  }
}

/** Caché global de respuestas de dominio (TTL por defecto 1.5 s). */
export const domainCache = new TtlCache<unknown>(1500);
