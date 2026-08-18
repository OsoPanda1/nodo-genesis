import { describe, it, expect } from 'vitest';
import {
  publishListingSchema,
  assetRegisterSchema,
  gameplayEventSchema,
  reasonSchema,
} from '@/lib/core/contracts';

describe('contrato · publishListingSchema', () => {
  it('acepta un listado mínimo y aplica defaults', () => {
    const parsed = publishListingSchema.parse({ title: 'Gemelo de la mina', provider: 'RDM' });
    expect(parsed.type).toBe('dataset');
    expect(parsed.status).toBe('pending');
    expect(parsed.price.model).toBe('free');
    expect(parsed.tags).toEqual([]);
  });

  it('rechaza title vacío', () => {
    const result = publishListingSchema.safeParse({ title: '  ', provider: 'RDM' });
    expect(result.success).toBe(false);
  });

  it('rechaza provider ausente', () => {
    const result = publishListingSchema.safeParse({ title: 'Gemelo' });
    expect(result.success).toBe(false);
  });

  it('valida price estructurado', () => {
    const parsed = publishListingSchema.parse({
      title: 'Modelo IA',
      provider: 'RDM',
      price: { model: 'subscription', amountUsd: 99, period: 'monthly' },
    });
    expect(parsed.price.amountUsd).toBe(99);
  });
});

describe('contrato · assetRegisterSchema', () => {
  it('acepta registro mínimo con defaults de dominio', () => {
    const parsed = assetRegisterSchema.parse({ name: 'Transformador norte' });
    expect(parsed.category).toBe('structure');
    expect(parsed.criticality).toBe('medium');
    expect(parsed.status).toBe('operational');
    expect(parsed.strategy).toBe('preventive');
    expect(parsed.designLifeYears).toBe(15);
  });

  it('rechaza nombre ausente', () => {
    expect(assetRegisterSchema.safeParse({}).success).toBe(false);
  });

  it('acepta ubicación y telemetría completas', () => {
    const parsed = assetRegisterSchema.parse({
      name: 'Bomba',
      location: { zone: 'Tanque norte', coordinates: { lat: 20.14, lng: -98.66 } },
      telemetry: { temperatureC: 62, runtimeHours: 1200, loadPercent: 78, lastUpdated: '2026-01-01T00:00:00Z' },
    });
    expect(parsed.location?.coordinates?.lat).toBe(20.14);
    expect(parsed.telemetry?.temperatureC).toBe(62);
  });

  it('rechaza categoría inválida', () => {
    expect(assetRegisterSchema.safeParse({ name: 'X', category: 'nave' }).success).toBe(false);
  });
});

describe('contrato · gameplayEventSchema', () => {
  it('acepta un kill-zombie con campos extra (passthrough)', () => {
    const parsed = gameplayEventSchema.parse({
      type: 'kill-zombie',
      sessionId: 's1',
      rarity: 'epico',
      zone: 'mina',
    });
    expect(parsed.type).toBe('kill-zombie');
    expect(parsed.sessionId).toBe('s1');
  });

  it('rechaza tipo de evento no soportado', () => {
    expect(gameplayEventSchema.safeParse({ type: 'hack', sessionId: 's1' }).success).toBe(false);
  });

  it('rechaza sessionId ausente', () => {
    expect(gameplayEventSchema.safeParse({ type: 'combo' }).success).toBe(false);
  });
});

describe('contrato · reasonSchema', () => {
  it('acepta query con modos válidos', () => {
    expect(reasonSchema.parse({ query: '¿Por qué se llamó Real del Monte?' }).mode).toBeUndefined();
    expect(reasonSchema.parse({ query: 'x', mode: 'trace' }).mode).toBe('trace');
    expect(reasonSchema.parse({ query: 'x', context: { a: 1 } }).context).toEqual({ a: 1 });
  });

  it('rechaza query vacía', () => {
    expect(reasonSchema.safeParse({ query: '   ' }).success).toBe(false);
  });

  it('rechaza modo inválido', () => {
    expect(reasonSchema.safeParse({ query: 'x', mode: 'gpt' }).success).toBe(false);
  });
});
