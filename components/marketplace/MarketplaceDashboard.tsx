'use client';

import { useEffect, useState } from 'react';
import { BadgeCheck, Boxes, Loader2, ShoppingBag, Star } from 'lucide-react';
import type { MarketplaceListing, PriceModel } from '@/lib/marketplace/marketplace-types';

export type MarketplaceSummaryType = ReturnType<typeof import('@/lib/marketplace/marketplace-license').marketplaceSummary>;

const TYPE_ICON: Record<string, string> = {
  twin: 'bg-emerald-500/10 text-emerald-400',
  model: 'bg-sky-500/10 text-sky-400',
  dataset: 'bg-violet-500/10 text-violet-400',
  service: 'bg-amber-500/10 text-amber-400',
  playbook: 'bg-rose-500/10 text-rose-400',
  license: 'bg-indigo-500/10 text-indigo-400',
};

const STATUS_STYLE: Record<string, string> = {
  published: 'bg-emerald-500/10 text-emerald-400',
  pending: 'bg-amber-500/10 text-amber-400',
  licensed: 'bg-sky-500/10 text-sky-400',
  draft: 'bg-slate-500/10 text-slate-400',
  retired: 'bg-slate-500/10 text-slate-400',
};

function priceLabel(price: PriceModel): string {
  switch (price.model) {
    case 'free':
      return 'Gratis';
    case 'one-time':
      return `$${price.amountUsd ?? 0}`;
    case 'subscription':
      return `$${price.amountUsd ?? 0}/${price.period === 'monthly' ? 'mes' : 'año'}`;
    case 'usage-based':
      return `$${price.perUnitUsd ?? 0}/uso`;
  }
}

export type OfferCardProps = {
  listing: MarketplaceListing;
  acquired: boolean;
  onAcquire: (listingId: string) => void;
};

export function OfferCard({ listing, acquired, onAcquire }: OfferCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
      <div className="flex items-start justify-between gap-2">
        <span className={`rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase ${TYPE_ICON[listing.type] ?? 'bg-slate-500/10 text-slate-400'}`}>
          {listing.type}
        </span>
        <span className={`rounded px-1.5 py-0.5 text-[9px] font-medium uppercase ${STATUS_STYLE[listing.status]}`}>{listing.status}</span>
      </div>
      <p className="mt-2 text-sm font-semibold text-slate-100">{listing.title}</p>
      <p className="mt-1 line-clamp-2 text-[10px] text-slate-500">{listing.description}</p>
      <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-500">
        <span className="inline-flex items-center gap-1">
          <Star className="h-3 w-3 text-amber-400" />
          {listing.rating.toFixed(1)} ({listing.ratingCount})
        </span>
        <span>· {listing.downloads} descargas</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {listing.tags.slice(0, 4).map((tag: string) => (
          <span key={tag} className="rounded bg-slate-800/80 px-1.5 py-0.5 text-[9px] text-slate-400">{tag}</span>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-slate-800 pt-3">
        <span className="text-xs font-semibold text-emerald-400">{priceLabel(listing.price)}</span>
        <button
          onClick={() => onAcquire(listing.id)}
          disabled={acquired || listing.status !== 'published'}
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-[10px] font-medium text-slate-200 transition hover:border-emerald-500/50 hover:text-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {acquired ? 'Adquirido' : 'Adquirir'}
        </button>
      </div>
    </div>
  );
}

export type MarketplaceDashboardProps = {
  listings?: MarketplaceListing[];
  summary?: MarketplaceSummaryType;
};

export function MarketplaceDashboard({ listings: initialListings, summary: initialSummary }: MarketplaceDashboardProps) {
  const [listings, setListings] = useState<MarketplaceListing[] | null>(initialListings ?? null);
  const [summary, setSummary] = useState<MarketplaceSummaryType | null>(initialSummary ?? null);
  const [loading, setLoading] = useState(!initialListings);
  const [acquired, setAcquired] = useState<Record<string, boolean>>({});
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (initialListings) return;
    fetch('/api/marketplace/offers')
      .then((r) => r.json())
      .then((data) => {
        setListings(data.offers ?? []);
        setSummary(data.summary ?? null);
      })
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, [initialListings]);

  const handleAcquire = async (listingId: string) => {
    try {
      const res = await fetch('/api/marketplace/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, licensee: 'yun-node' }),
      });
      const result = await res.json();
      if (result.ok) {
        setAcquired((prev) => ({ ...prev, [listingId]: true }));
        setNotice(result.message ?? 'Listado adquirido.');
      } else {
        setNotice(result.error ?? 'No se pudo adquirir.');
      }
    } catch {
      setNotice('Error de red al adquirir el listado.');
    }
    window.setTimeout(() => setNotice(null), 4000);
  };

  if (loading || !listings || !summary) {
    return (
      <div className="flex items-center gap-2 py-16 text-xs text-slate-400">
        <Loader2 className="h-4 w-4 animate-spin" /> Cargando mercado...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-50">Marketplace</h1>
        <p className="mt-1 text-sm text-slate-400">
          Modelos, datasets, servicios y playbooks disponibles para el ecosistema YUN.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-center">
          <p className="text-xl font-semibold text-slate-100">{summary.total}</p>
          <p className="text-[10px] text-slate-500">Listados</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-center">
          <p className="text-xl font-semibold text-emerald-400">{summary.published}</p>
          <p className="text-[10px] text-slate-500">Publicados</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-center">
          <p className="text-xl font-semibold text-amber-400">{summary.pending}</p>
          <p className="text-[10px] text-slate-500">Pendientes</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-center">
          <p className="text-xl font-semibold text-sky-400">{summary.totalDownloads}</p>
          <p className="text-[10px] text-slate-500">Descargas</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-center">
          <p className="text-xl font-semibold text-amber-400">{summary.avgRating.toFixed(1)}</p>
          <p className="text-[10px] text-slate-500">Rating medio</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-center">
          <p className="text-xl font-semibold text-emerald-400">{summary.free}</p>
          <p className="text-[10px] text-slate-500">Gratuitos</p>
        </div>
      </div>

      {notice && (
        <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/20 px-4 py-2.5 text-xs text-emerald-400">
          {notice}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => (
          <OfferCard key={listing.id} listing={listing} acquired={!!acquired[listing.id]} onAcquire={handleAcquire} />
        ))}
      </div>
    </div>
  );
}
