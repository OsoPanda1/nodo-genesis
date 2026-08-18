import type { LicenseCheckResult, MarketplaceListing, Subscription } from './marketplace-types';

export function checkLicense(listing: MarketplaceListing, subscription: Subscription | undefined, usageCost = 1): LicenseCheckResult {
  if (!subscription || subscription.status !== 'active') {
    if (listing.price.model === 'free') {
      return { allowed: true, reason: 'Listado gratuito sin licencia requerida.' };
    }
    return { allowed: false, reason: 'No existe suscripción activa para este listado.' };
  }

  if (subscription.expiresAt && new Date(subscription.expiresAt).getTime() < Date.now()) {
    return { allowed: false, reason: 'Suscripción expirada.', subscriptionId: subscription.id };
  }

  if (listing.price.model === 'usage-based' && subscription.usageCount >= 1000) {
    return { allowed: false, reason: 'Cupo de uso agotado.', subscriptionId: subscription.id, remaining: 0 };
  }

  return {
    allowed: true,
    reason: 'Licencia vigente.',
    subscriptionId: subscription.id,
    remaining: listing.price.model === 'usage-based' ? 1000 - subscription.usageCount : undefined,
  };
}

export function usageEntitlement(listing: MarketplaceListing, subscription: Subscription | undefined): number | null {
  if (listing.price.model !== 'usage-based') return null;
  if (!subscription) return 0;
  return Math.max(0, 1000 - subscription.usageCount);
}

export function marketplaceSummary(listings: MarketplaceListing[]) {
  const published = listings.filter((l) => l.status === 'published');
  return {
    total: listings.length,
    published: published.length,
    pending: listings.filter((l) => l.status === 'pending').length,
    free: listings.filter((l) => l.price.model === 'free').length,
    paid: listings.filter((l) => l.price.model !== 'free').length,
    byType: listings.reduce<Record<string, number>>((acc, l) => {
      acc[l.type] = (acc[l.type] ?? 0) + 1;
      return acc;
    }, {}),
    totalDownloads: published.reduce((sum, l) => sum + l.downloads, 0),
    avgRating: published.length ? Math.round((published.reduce((sum, l) => sum + l.rating, 0) / published.length) * 10) / 10 : 0,
  };
}
