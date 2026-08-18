import type { MarketplaceListing, Subscription } from './marketplace-types';
import { checkLicense } from './marketplace-license';
import { getListing, listListings, listSubscriptions, subscribeListing } from './marketplace-store';

export type MarketplaceQuery = {
  type?: string;
  status?: string;
  tag?: string;
  maxPriceUsd?: number;
  query?: string;
};

export function searchListings(params: MarketplaceQuery): MarketplaceListing[] {
  let results = listListings();
  if (params.type) results = results.filter((l) => l.type === params.type);
  if (params.status) results = results.filter((l) => l.status === params.status);
  if (params.tag) results = results.filter((l) => l.tags.includes(params.tag as string));
  if (params.maxPriceUsd !== undefined) {
    results = results.filter((l) => l.price.model === 'free' || (('amountUsd' in l.price ? l.price.amountUsd : Infinity) <= (params.maxPriceUsd as number)));
  }
  if (params.query) {
    const q = params.query.toLowerCase();
    results = results.filter((l) => l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q) || l.tags.some((t: string) => t.includes(q)));
  }
  return [...results].sort((a, b) => b.rating - a.rating);
}

export function licensedListings(licensee: string): Array<{ listing: MarketplaceListing; subscription: Subscription; check: ReturnType<typeof checkLicense> }> {
  const subs = listSubscriptions().filter((s) => s.licensee === licensee);
  return subs
    .map((sub) => {
      const listing = getListing(sub.listingId);
      if (!listing) return null;
      return { listing, subscription: sub, check: checkLicense(listing, sub) };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
}

export function acquireListing(listingId: string, licensee: string) {
  const listing = getListing(listingId);
  if (!listing) return { ok: false, error: 'Listado no encontrado.' };
  if (listing.status !== 'published') return { ok: false, error: 'El listado no está publicado.' };
  if (listing.price.model === 'free') {
    return { ok: true, listing, subscription: undefined, message: 'Listado gratuito adquirido.' };
  }
  const subscription = subscribeListing(listingId, licensee);
  return { ok: true, listing, subscription, message: 'Suscripción creada.' };
}
