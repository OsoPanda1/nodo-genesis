import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TtlCache, domainCache } from '@/lib/system/cache';
import {
  scheduleThirdPlane,
  stopThirdPlane,
  thirdPlaneStatus,
  lazyPlanesStatus,
  PLANES,
} from '@/lib/system/planes';

describe('sistema · caché con TTL', () => {
  it('almacena y recupera valores antes del vencimiento', () => {
    const cache = new TtlCache(50_000);
    cache.set('k', { v: 1 });
    expect(cache.get('k')).toEqual({ v: 1 });
  });

  it('invalida entradas vencidas', async () => {
    const cache = new TtlCache(1);
    cache.set('k', 'x');
    await new Promise(r => setTimeout(r, 5));
    expect(cache.get('k')).toBeUndefined();
  });

  it('barre entradas vencidas y expone el tamaño', async () => {
    const cache = new TtlCache(1);
    cache.set('a', 1);
    cache.set('b', 2);
    expect(cache.size()).toBe(2);
    await new Promise(r => setTimeout(r, 5));
    expect(cache.sweep()).toBe(2);
    expect(cache.size()).toBe(0);
  });

  it('soporta invalidación explícita y por prefijo', () => {
    const cache = new TtlCache(1000);
    cache.set('k', 1);
    cache.set('map:a', 1);
    cache.set('map:b', 2);
    cache.invalidate('k');
    expect(cache.get('k')).toBeUndefined();
    cache.invalidatePrefix('map:');
    expect(cache.get('map:a')).toBeUndefined();
    expect(cache.get('map:b')).toBeUndefined();
  });

  it('getOrSetAsync memoriza el resultado de un loader', async () => {
    const loader = vi.fn().mockResolvedValue('valor');
    const first = await domainCache.getOrSetAsync('mapa', loader);
    const second = await domainCache.getOrSetAsync('mapa', loader);
    expect(first).toBe('valor');
    expect(second).toBe('valor');
    expect(loader).toHaveBeenCalledTimes(1);
    domainCache.invalidate('mapa');
  });
});

describe('sistema · planos lazy', () => {
  it('define los tres planos de carga', () => {
    expect(PLANES).toEqual(['first', 'second', 'third']);
  });

  it('agenda, ejecuta y detiene el tercer plano', async () => {
    const run = vi.fn().mockResolvedValue(undefined);
    scheduleThirdPlane({ id: 'poda', plane: 'third', intervalMs: 10_000, run });
    expect(thirdPlaneStatus()).toHaveLength(1);
    await new Promise(r => setTimeout(r, 5));
    expect(run).toHaveBeenCalled();
    stopThirdPlane('poda');
    expect(thirdPlaneStatus()).toHaveLength(0);
  });

  it('expone el estado de los planos', () => {
    const status = lazyPlanesStatus();
    expect(status.planes).toEqual(PLANES);
    expect(Array.isArray(status.third)).toBe(true);
  });
});
