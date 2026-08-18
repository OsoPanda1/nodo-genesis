import type { MarketplaceListing, Subscription } from './marketplace-types';
import { registerHydrator, schedulePersist } from '@/lib/core/persistence';
import { loadListings, loadSubscriptions, upsertListing, upsertSubscription } from './repository';

const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString();

export function seedListings(): MarketplaceListing[] {
  return [
    {
      id: 'lst-001',
      slug: 'dt-model-transformador',
      type: 'model',
      title: 'Modelo DTDL de transformador',
      description: 'Gemelo digital de transformador de distribución con telemetría de temperatura, carga y vibración.',
      provider: 'Nodo Cero',
      publisher: 'YUN Energy Labs',
      status: 'published',
      price: { model: 'free' },
      rating: 4.8,
      ratingCount: 32,
      downloads: 2140,
      tags: ['dtdl', 'transformer', 'energy'],
      compatibleDomains: ['energy', 'assets'],
      createdAt: daysAgo(120),
      updatedAt: daysAgo(5),
    },
    {
      id: 'lst-002',
      slug: 'dataset-calidad-agua',
      type: 'dataset',
      title: 'Dataset de calidad de agua 2025',
      description: 'Series históricas de pH, ppm y presión de la red hídrica municipal.',
      provider: 'OOMAPAS',
      publisher: 'OOMAPAS',
      status: 'published',
      price: { model: 'one-time', amountUsd: 250 },
      rating: 4.5,
      ratingCount: 18,
      downloads: 640,
      tags: ['dataset', 'water', 'quality'],
      compatibleDomains: ['water', 'environment'],
      createdAt: daysAgo(200),
      updatedAt: daysAgo(12),
    },
    {
      id: 'lst-003',
      slug: 'service-monitoreo-fleet',
      type: 'service',
      title: 'Monitoreo de flota municipal',
      description: 'Servicio SaaS de seguimiento GPS y mantenimiento predictivo para flotas de transporte.',
      provider: 'GeoMóvil',
      publisher: 'GeoMóvil',
      status: 'published',
      price: { model: 'subscription', amountUsd: 89, period: 'monthly' },
      rating: 4.2,
      ratingCount: 9,
      downloads: 210,
      tags: ['service', 'fleet', 'gps'],
      compatibleDomains: ['mobility', 'assets'],
      createdAt: daysAgo(90),
      updatedAt: daysAgo(1),
    },
    {
      id: 'lst-004',
      slug: 'playbook-proteccion-civil',
      type: 'playbook',
      title: 'Playbook de respuesta Protección Civil',
      description: 'Secuencia de acciones semiautomatizadas para emergencias de protección civil.',
      provider: 'Isabella',
      publisher: 'Isabella',
      status: 'published',
      price: { model: 'free' },
      rating: 4.9,
      ratingCount: 41,
      downloads: 3210,
      tags: ['playbook', 'emergency', 'automation'],
      compatibleDomains: ['civilProtection', 'emergency'],
      createdAt: daysAgo(60),
      updatedAt: daysAgo(2),
    },
    {
      id: 'lst-005',
      slug: 'dataset-mineria-historica',
      type: 'dataset',
      title: 'Datasets históricos de minería',
      description: 'Registros del acervo minero histórico del territorio para modelos de patrimonio.',
      provider: 'Patronato',
      publisher: 'Patronato del Real',
      status: 'pending',
      price: { model: 'free' },
      rating: 0,
      ratingCount: 0,
      downloads: 0,
      tags: ['dataset', 'mining', 'heritage'],
      compatibleDomains: ['environment', 'assets'],
      createdAt: daysAgo(3),
      updatedAt: daysAgo(3),
    },
  ];
}

export type MarketplaceStore = { listings: MarketplaceListing[]; subscriptions: Subscription[] };

const g = globalThis as unknown as { __rdmMarketplace?: MarketplaceStore };

export function getMarketplaceStore(): MarketplaceStore {
  if (!g.__rdmMarketplace) g.__rdmMarketplace = { listings: seedListings(), subscriptions: [] };
  return g.__rdmMarketplace;
}

/** Carga inicial desde Postgres: los listings/suscripciones persistidos
 *  se fusionan con el catálogo semilla (los persistidos ganan por id). */
registerHydrator('marketplace', async () => {
  const [listings, subscriptions] = await Promise.all([loadListings(), loadSubscriptions()]);
  const store = getMarketplaceStore();
  for (const listing of listings) {
    const idx = store.listings.findIndex((l) => l.id === listing.id);
    if (idx >= 0) store.listings[idx] = listing;
    else store.listings.push(listing);
  }
  for (const sub of subscriptions) {
    if (!store.subscriptions.some((s) => s.id === sub.id)) store.subscriptions.push(sub);
  }
});

export function listListings(): MarketplaceListing[] {
  return getMarketplaceStore().listings;
}

export function getListing(id: string): MarketplaceListing | undefined {
  return getMarketplaceStore().listings.find((l) => l.id === id);
}

export function publishListing(listing: Omit<MarketplaceListing, 'id' | 'slug' | 'createdAt' | 'updatedAt' | 'rating' | 'ratingCount' | 'downloads'>): MarketplaceListing {
  const store = getMarketplaceStore();
  const full: MarketplaceListing = {
    ...listing,
    id: `lst-${Math.random().toString(36).slice(2, 8)}`,
    slug: `${listing.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 48)}-${Math.random().toString(36).slice(2, 5)}`,
    rating: 0,
    ratingCount: 0,
    downloads: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.listings.push(full);
  schedulePersist('marketplace.listing', () => upsertListing(full));
  return full;
}

export function subscribeListing(listingId: string, licensee: string): Subscription {
  const store = getMarketplaceStore();
  const listing = getListing(listingId);
  const subscription: Subscription = {
    id: `sub-${Math.random().toString(36).slice(2, 10)}`,
    listingId,
    licensee,
    licensedAt: new Date().toISOString(),
    expiresAt: listing?.price.model === 'subscription' && listing.price.period === 'monthly' ? new Date(Date.now() + 30 * 86_400_000).toISOString() : undefined,
    status: 'active',
    usageCount: 0,
  };
  store.subscriptions.push(subscription);
  schedulePersist('marketplace.subscription', () => upsertSubscription(subscription));
  return subscription;
}

export function listSubscriptions(): Subscription[] {
  return getMarketplaceStore().subscriptions;
}
