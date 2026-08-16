'use client';

import { CalendarDays, MapPin, Users, Building2, Tags } from 'lucide-react';

interface ArchiveTimelineProps {
  historicalDateStart?: string | null;
  historicalDateEnd?: string | null;
  datePrecision?: string;
  locationName?: string | null;
  people?: string[];
  organizations?: string[];
  tags?: string[];
}

export function ArchiveTimeline({
  historicalDateStart,
  historicalDateEnd,
  datePrecision,
  locationName,
  people = [],
  organizations = [],
  tags = [],
}: ArchiveTimelineProps) {
  const precisionLabel = datePrecision
    ? ({ exact: 'Fecha exacta', month: 'Mes', year: 'Año', circa: 'Circa', unknown: 'Sin precisar' }[datePrecision] ?? datePrecision)
    : 'Sin precisar';

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 space-y-4">
      <div className="flex items-center gap-2">
        <CalendarDays className="h-4 w-4 text-[#d97832]" />
        <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-[#2e9cff]">Contexto histórico</h4>
      </div>

      <div className="flex items-center gap-3">
        <div className="font-patrimonial text-2xl font-bold text-[#eef2f2]">
          {historicalDateStart?.slice(0, 4) ?? '—'}
        </div>
        {historicalDateEnd && historicalDateEnd !== historicalDateStart && (
          <>
            <span className="text-[#93a5ad]">→</span>
            <div className="font-patrimonial text-2xl font-bold text-[#eef2f2]">{historicalDateEnd.slice(0, 4)}</div>
          </>
        )}
        <span className="rounded-full border border-white/15 px-2.5 py-1 text-[10px] font-mono text-[#c9d0d4]">
          {precisionLabel}
        </span>
      </div>

      {locationName && (
        <div className="flex items-center gap-2 text-xs text-[#c9d0d4]">
          <MapPin className="h-3.5 w-3.5 text-[#2e9cff]" />
          {locationName}
        </div>
      )}

      {people.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-[#93a5ad]" />
          {people.map(person => (
            <span key={person} className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] font-medium text-[#2e9cff]">{person}</span>
          ))}
        </div>
      )}

      {organizations.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <Building2 className="h-3.5 w-3.5 text-[#93a5ad]" />
          {organizations.map(org => (
            <span key={org} className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] font-medium text-[#d97832]">{org}</span>
          ))}
        </div>
      )}

      {tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <Tags className="h-3.5 w-3.5 text-[#93a5ad]" />
          {tags.map(tag => (
            <span key={tag} className="rounded-md border border-white/15 px-2 py-0.5 text-[10px] font-mono text-[#c9d0d4]">#{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
}
