'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { ArchiveCollection, ArchiveItemWithFiles } from '@/lib/archive/archive-types';
import { ArchiveExplorer } from './ArchiveExplorer';

export function ArchiveView() {
  const [collections, setCollections] = useState<ArchiveCollection[]>([]);
  const [featured, setFeatured] = useState<ArchiveItemWithFiles[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [colRes, itemRes] = await Promise.all([
          fetch('/api/archive/collections', { cache: 'no-store' }),
          fetch('/api/archive/items?limit=9', { cache: 'no-store' }),
        ]);
        const colData = (await colRes.json()) as { ok: boolean; collections?: ArchiveCollection[] };
        const itemData = (await itemRes.json()) as { ok: boolean; items?: ArchiveItemWithFiles[] };
        if (!active) return;
        if (colData.ok) setCollections(colData.collections ?? []);
        if (itemData.ok) setFeatured(itemData.items ?? []);
        if (!colData.ok || !itemData.ok) setError('El Archivo aún no responde; intenta más tarde.');
      } catch {
        if (active) setError('No se pudo conectar con el Archivo.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center gap-3 text-[#0d4652]">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="text-xs font-mono uppercase tracking-widest">Abriendo el Archivo Histórico…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="rounded-3xl border border-rose-200 bg-rose-50 px-8 py-10 text-center">
          <p className="font-patrimonial text-xl text-rose-800">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-xl bg-[#0d4652] px-5 py-2.5 text-xs font-bold text-[#f2cc76]"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return <ArchiveExplorer collections={collections} featured={featured} />;
}
