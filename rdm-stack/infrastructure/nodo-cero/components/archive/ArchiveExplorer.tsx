'use client';

import { useEffect, useState } from 'react';
import { Landmark, Sparkles, Loader2, Library, FolderOpen, ExternalLink } from 'lucide-react';
import type {
  ArchiveCollection,
  ArchiveItemWithFiles,
} from '@/lib/archive/archive-types';
import { ArchiveItemCard } from './ArchiveItemCard';
import { ArchiveItemViewer } from './ArchiveItemViewer';
import { ArchiveSearch } from './ArchiveSearch';

type ArchiveSearchFilters = {
  q: string;
  assetType: string;
  yearFrom: string;
  yearTo: string;
  collection?: string;
};

interface ArchiveExplorerProps {
  collections: ArchiveCollection[];
  featured: ArchiveItemWithFiles[];
}

export function ArchiveExplorer({ collections, featured }: ArchiveExplorerProps) {
  const [selected, setSelected] = useState<ArchiveItemWithFiles | null>(null);
  const [results, setResults] = useState<ArchiveItemWithFiles[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runSearch = async (filters: ArchiveSearchFilters) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.q) params.set('q', filters.q);
      if (filters.assetType) params.set('assetType', filters.assetType);
      if (filters.yearFrom) params.set('yearFrom', filters.yearFrom);
      if (filters.yearTo) params.set('yearTo', filters.yearTo);
      if (filters.collection) params.set('collection', filters.collection);
      const res = await fetch(`/api/archive/search?${params.toString()}`, { cache: 'no-store' });
      const data = (await res.json()) as { ok: boolean; items?: ArchiveItemWithFiles[]; error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Error de búsqueda');
      setResults(data.items ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error de búsqueda');
    } finally {
      setLoading(false);
    }
  };

  const total = results?.length;
  const displayed = results ?? featured;

  if (selected) {
    return <ArchiveItemViewer item={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div className="space-y-10">
      <div className="rounded-3xl border border-[#f2cc76]/30 bg-gradient-to-br from-[#0d4652] via-[#0a3a45] to-[#082f3b] p-8 sm:p-12 text-white relative overflow-hidden">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#f2cc76]/10 blur-2xl" />
        <div className="pointer-events-none absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-[#2e9cff]/10 blur-2xl" />
        <div className="relative max-w-2xl space-y-4">
          <div className="flex items-center gap-2 text-[#f2cc76]">
            <Landmark className="h-5 w-5" />
            <span className="text-xs font-mono font-bold uppercase tracking-[0.25em]">Archivo Histórico RDM Digital</span>
          </div>
          <h2 className="font-patrimonial text-3xl sm:text-4xl font-bold leading-tight">
            La memoria del Real del Monte,
            <span className="text-[#f2cc76]"> conservada y compartida</span>.
          </h2>
          <p className="text-sm leading-relaxed text-white/75 max-w-xl">
            Documentos, fotografías y testimonios que cuentan cómo este pueblo de minas se convirtió en
            Patrimonio Mundial de la UNESCO. Busca, navega y pide copias de las piezas del acervo.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {['Documentos', 'Fotografías', 'Memoria oral', 'Mapas', 'Objetos'].map(chip => (
              <span key={chip} className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-white/85">
                {chip}
              </span>
            ))}
          </div>
        </div>
      </div>

      <ArchiveSearch onSearch={runSearch} total={results === null ? undefined : total} />

      {loading && (
        <div className="flex items-center justify-center gap-3 py-10 text-[#0d4652]">
          <Loader2 className="h-5 w-5 animate-spin" /> <span className="text-xs font-mono uppercase tracking-widest">Buscando en la memoria del pueblo…</span>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-rose-300 bg-rose-50 px-5 py-4 text-sm text-rose-700">{error}</div>
      )}

      {!loading && !error && (
        <>
          {results === null ? (
            <>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#c89a45]" />
                  <h3 className="text-sm font-mono font-bold uppercase tracking-widest text-[#0d4652]">Piezas destacadas</h3>
                </div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {displayed.map(item => (
                    <ArchiveItemCard key={item.id} item={item} onSelect={setSelected} />
                  ))}
                </div>
                {featured.length === 0 && (
                  <p className="text-sm text-[#536b86]">El catálogo se está poblando. Las primeras piezas llegarán pronto.</p>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Library className="h-4 w-4 text-[#c89a45]" />
                  <h3 className="text-sm font-mono font-bold uppercase tracking-widest text-[#0d4652]">Colecciones del acervo</h3>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {collections.map(col => (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => runSearch({ q: '', assetType: '', yearFrom: '', yearTo: '', collection: col.slug })}
                      className="group flex items-center gap-4 rounded-2xl border border-[#c9d0d4]/60 bg-white/75 p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(13,70,82,0.14)]"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0d4652] to-[#082f3b] text-[#f2cc76]">
                        <FolderOpen className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-patrimonial text-lg font-bold leading-tight text-[#082f3b] group-hover:text-[#0d4652] transition-colors">
                          {col.title}
                        </h4>
                        <p className="mt-0.5 line-clamp-2 text-xs text-[#536b86]">{col.description}</p>
                        <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-widest text-[#c89a45]">
                          Explorar <ExternalLink className="h-3 w-3" />
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : results.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#c9d0d4] bg-white/50 px-8 py-14 text-center">
              <p className="font-patrimonial text-xl text-[#0d4652]">No encontramos piezas con esos filtros</p>
              <p className="mt-2 text-xs font-mono text-[#8a97a4]">Prueba otros términos o amplía el rango de años.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-sm font-mono font-bold uppercase tracking-widest text-[#0d4652]">Resultados del catálogo</h3>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {results.map(item => (
                  <ArchiveItemCard key={item.id} item={item} onSelect={setSelected} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
