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
    <div className="rounded-2xl border border-[#c9d0d4]/60 bg-white/70 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <CalendarDays className="h-4 w-4 text-[#c89a45]" />
        <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-[#0d4652]">Contexto histórico</h4>
      </div>

      <div className="flex items-center gap-3">
        <div className="font-patrimonial text-2xl font-bold text-[#082f3b]">
          {historicalDateStart?.slice(0, 4) ?? '—'}
        </div>
        {historicalDateEnd && historicalDateEnd !== historicalDateStart && (
          <>
            <span className="text-[#8a97a4]">→</span>
            <div className="font-patrimonial text-2xl font-bold text-[#082f3b]">{historicalDateEnd.slice(0, 4)}</div>
          </>
        )}
        <span className="rounded-full border border-[#c9d0d4] px-2.5 py-1 text-[10px] font-mono text-[#536b86]">
          {precisionLabel}
        </span>
      </div>

      {locationName && (
        <div className="flex items-center gap-2 text-xs text-[#536b86]">
          <MapPin className="h-3.5 w-3.5 text-[#2e9cff]" />
          {locationName}
        </div>
      )}

      {people.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-[#8a97a4]" />
          {people.map(person => (
            <span key={person} className="rounded-full bg-[#eef1ec] px-2.5 py-1 text-[11px] font-medium text-[#0d4652]">{person}</span>
          ))}
        </div>
      )}

      {organizations.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <Building2 className="h-3.5 w-3.5 text-[#8a97a4]" />
          {organizations.map(org => (
            <span key={org} className="rounded-full bg-[#f7f2e4] px-2.5 py-1 text-[11px] font-medium text-[#7a5b1e]">{org}</span>
          ))}
        </div>
      )}

      {tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <Tags className="h-3.5 w-3.5 text-[#8a97a4]" />
          {tags.map(tag => (
            <span key={tag} className="rounded-md border border-[#c9d0d4] px-2 py-0.5 text-[10px] font-mono text-[#536b86]">#{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
}
