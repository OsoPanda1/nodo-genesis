export interface RedisCache {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds: number): Promise<void>;
  increment(key: string, ttlSeconds: number): Promise<number>;
}

/**
 * Implementa este adaptador con el cliente Redis generado por tu integración.
 * No retornes datos sensibles y no uses Redis como base de verdad.
 */
export const redis: RedisCache = {
  async get() {
    return null;
  },
  async set() {
    return;
  },
  async increment() {
    return 1;
  },
};
