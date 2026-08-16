'use client';

import { CalendarDays, MapPin, Landmark } from 'lucide-react';
import type { ArchiveItemWithFiles } from '@/lib/archive/archive-types';

const ASSET_LABELS: Record<string, string> = {
  photograph: 'Fotografía',
  document: 'Documento',
  newspaper: 'Prensa',
  map: 'Mapa',
  audio: 'Audio',
  video: 'Video',
  oral_history: 'Memoria oral',
  artifact: 'Objeto',
  three_d_model: 'Modelo 3D',
};

interface ArchiveItemCardProps {
  item: ArchiveItemWithFiles;
  onSelect: (item: ArchiveItemWithFiles) => void;
}

export function ArchiveItemCard({ item, onSelect }: ArchiveItemCardProps) {
  const thumbnail = item.files.find(f => f.fileRole === 'thumbnail');
  const accessCopy = item.files.find(f => f.fileRole === 'access_copy' && f.isPublic);

  return (
    <button
      onClick={() => onSelect(item)}
      className="group w-full text-left rounded-3xl overflow-hidden border border-white/10 bg-white/[0.06] backdrop-blur-sm shadow-[0_10px_30px_rgba(13,70,82,0.06)] transition-all hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(13,70,82,0.16)]"
    >
      <div className="relative h-44 overflow-hidden bg-gradient-to-br from-[#0d4652] to-[#082f3b]">
        {thumbnail && thumbnail.mimeType.startsWith('image/') ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={thumbnail.objectPath} alt={item.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Landmark className="h-12 w-12 text-[#d97832] opacity-80" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#082f3b]/85 via-transparent to-transparent" />
        <div className="absolute left-3 top-3 flex gap-2">
          <span className="rounded-full border border-[#d97832]/50 bg-[#082f3b]/85 px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-widest text-[#d97832]">
            {ASSET_LABELS[item.assetType] ?? item.assetType}
          </span>
          {item.accessLevel === 'view_only' && (
            <span className="rounded-full border border-white/30 bg-black/40 px-2.5 py-1 text-[10px] font-mono text-white">
              Solo consulta
            </span>
          )}
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <span className="flex items-center gap-1 text-[11px] text-white/90 font-mono">
            <CalendarDays className="h-3.5 w-3.5" />
            {item.historicalDateStart?.slice(0, 4) ?? 's. f.'}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-white/90 font-mono">
            <MapPin className="h-3.5 w-3.5" />
            {item.collection?.title ?? 'Archivo'}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-2">
        <h3 className="font-patrimonial text-lg font-bold leading-snug text-[#eef2f2] group-hover:text-[#2e9cff] transition-colors line-clamp-2">
          {item.title}
        </h3>
        <p className="text-xs leading-relaxed text-[#c9d0d4] line-clamp-3">{item.summary}</p>
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#d97832]">
            {item.rightsStatus === 'public_domain' ? 'Dominio público' : 'Con derechos'}
          </span>
          {accessCopy ? (
            <span className="text-[10px] font-mono font-bold text-[#2e9cff] uppercase tracking-wider">
              Ver pieza →
            </span>
          ) : (
            <span className="text-[10px] font-mono text-[#93a5ad]">Solo vista</span>
          )}
        </div>
      </div>
    </button>
  );
}
