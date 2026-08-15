import { describe, it, expect } from 'vitest';
import { seedListings } from '@/lib/marketplace/marketplace-store';
import { marketplaceSummary, checkLicense, usageEntitlement } from '@/lib/marketplace/marketplace-license';
import { searchListings, acquireListing } from '@/lib/marketplace/marketplace-search';

describe('marketplace-summary · panorama del mercado', () => {
  it('cuenta listados y tipos', () => {
    const summary = marketplaceSummary(seedListings());
    expect(summary.total).toBe(seedListings().length);
    expect(summary.published + summary.pending).toBe(summary.total);
    expect(summary.byType['dataset']).toBeGreaterThanOrEqual(1);
  });
});

describe('marketplace-search · filtros y orden', () => {
  it('filtra por tipo y palabra clave', () => {
    const datasets = searchListings({ type: 'dataset' });
    expect(datasets.length).toBeGreaterThanOrEqual(1);
    expect(datasets.every((l) => l.type === 'dataset')).toBe(true);

    const water = searchListings({ query: 'agua' });
    expect(water.length).toBeGreaterThanOrEqual(1);
  });

  it('ordena por rating descendente', () => {
    const offers = searchListings({});
    const sorted = offers.every((l, i) => i === 0 || offers[i - 1].rating >= l.rating);
    expect(sorted).toBe(true);
  });
});

describe('marketplace-license · control de licencias', () => {
  it('listado gratuito se permite sin suscripción', () => {
    const free = seedListings().find((l) => l.price.model === 'free')!;
    expect(checkLicense(free, undefined).allowed).toBe(true);
  });

  it('listado de pago exige suscripción activa', () => {
    const paid = seedListings().find((l) => l.price.model !== 'free')!;
    expect(checkLicense(paid, undefined).allowed).toBe(false);
  });

  it('entitlement nulo salvo uso medido', () => {
    const free = seedListings().find((l) => l.price.model === 'free')!;
    expect(usageEntitlement(free, undefined)).toBeNull();
  });
});

describe('marketplace-acquire · adquisición', () => {
  it('adquiere listado gratuito sin suscripción', () => {
    const free = seedListings().find((l) => l.price.model === 'free')!;
    const result = acquireListing(free.id, 'tester');
    expect(result.ok).toBe(true);
    expect(result.subscription).toBeUndefined();
  });

  it('rechaza listados no publicados', () => {
    const pending = seedListings().find((l) => l.status === 'pending')!;
    expect(acquireListing(pending.id, 'tester').ok).toBe(false);
  });

  it('crea suscripción para listados de pago', () => {
    const paid = seedListings().find((l) => l.price.model === 'subscription')!;
    const result = acquireListing(paid.id, 'tester');
    expect(result.ok).toBe(true);
    expect(result.subscription?.status).toBe('active');
  });
});
