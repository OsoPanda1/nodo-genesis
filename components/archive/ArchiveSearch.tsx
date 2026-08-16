'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';

export interface ArchiveFiltersState {
  q: string;
  assetType: string;
  yearFrom: string;
  yearTo: string;
}

interface ArchiveSearchProps {
  initial?: Partial<ArchiveFiltersState>;
  onSearch: (filters: ArchiveFiltersState) => void;
  total?: number;
}

const ASSET_TYPES = [
  ['', 'Todos los tipos'],
  ['photograph', 'Fotografía'],
  ['document', 'Documento'],
  ['newspaper', 'Prensa'],
  ['map', 'Mapa'],
  ['audio', 'Audio'],
  ['video', 'Video'],
  ['oral_history', 'Memoria oral'],
  ['artifact', 'Objeto'],
  ['three_d_model', 'Modelo 3D'],
];

export function ArchiveSearch({ initial, onSearch, total }: ArchiveSearchProps) {
  const [filters, setFilters] = useState<ArchiveFiltersState>({
    q: initial?.q ?? '',
    assetType: initial?.assetType ?? '',
    yearFrom: initial?.yearFrom ?? '',
    yearTo: initial?.yearTo ?? '',
  });
  const [advanced, setAdvanced] = useState(false);

  const patch = (key: keyof ArchiveFiltersState, value: string) => setFilters(f => ({ ...f, [key]: value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  const clear = () => {
    const empty = { q: '', assetType: '', yearFrom: '', yearTo: '' };
    setFilters(empty);
    onSearch(empty);
  };

  const inputCls =
    'w-full rounded-xl border border-white/15 bg-white/[0.05] px-3.5 py-2.5 text-sm text-[#e8edef] placeholder:text-[#647a84] focus:border-[#2e9cff] focus:outline-none transition-all';

  return (
    <form onSubmit={submit} className="rounded-3xl border border-white/10 bg-white/[0.06] backdrop-blur-md p-5 shadow-[0_16px_50px_rgba(13,70,82,0.10)]">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#93a5ad]" />
          <input
            value={filters.q}
            onChange={e => patch('q', e.target.value)}
            placeholder="Buscar en la memoria del Real: minas, personas, lugares, fiestas…"
            className={`${inputCls} pl-10`}
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="submit"
            className="rounded-xl bg-[#0d4652] px-5 py-2.5 text-xs font-bold text-white shadow-[0_8px_24px_rgba(13,70,82,0.25)] transition-all hover:shadow-[0_10px_32px_rgba(13,70,82,0.4)]"
          >
            Buscar
          </button>
          <button
            type="button"
            onClick={() => setAdvanced(a => !a)}
            className={`rounded-xl border px-4 py-2.5 text-xs font-bold transition-all flex items-center gap-2 ${advanced ? 'border-[#2e9cff] text-[#2e9cff] bg-[#2e9cff]/8' : 'border-white/15 text-[#c9d0d4] hover:text-[#2e9cff]'}`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filtros
          </button>
          {(filters.q || filters.assetType || filters.yearFrom || filters.yearTo) && (
            <button
              type="button"
              onClick={clear}
              className="rounded-xl p-2.5 text-[#93a5ad] hover:text-[#a9481e] transition-colors"
              title="Limpiar filtros"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {advanced && (
        <div className="mt-4 grid grid-cols-1 gap-3 border-t border-white/10 pt-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#2e9cff]">Tipo de pieza</label>
            <select value={filters.assetType} onChange={e => patch('assetType', e.target.value)} className={inputCls}>
              {ASSET_TYPES.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#2e9cff]">Desde el año</label>
            <input value={filters.yearFrom} onChange={e => patch('yearFrom', e.target.value)} placeholder="p. ej. 1766" className={inputCls} inputMode="numeric" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#2e9cff]">Hasta el año</label>
            <input value={filters.yearTo} onChange={e => patch('yearTo', e.target.value)} placeholder="p. ej. 1980" className={inputCls} inputMode="numeric" />
          </div>
        </div>
      )}

      {typeof total === 'number' && (
        <p className="mt-3 text-[11px] font-mono text-[#93a5ad]">
          {total} pieza{total === 1 ? '' : 's'} encontrada{total === 1 ? '' : 's'} en el catálogo público
        </p>
      )}
    </form>
  );
}
