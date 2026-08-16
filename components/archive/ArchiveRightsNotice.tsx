'use client';

import { ShieldAlert, ShieldCheck, Landmark } from 'lucide-react';
import type { ArchiveRightsStatus } from '@/lib/archive/archive-types';

const RIGHTS_META: Record<ArchiveRightsStatus, { label: string; tone: 'ok' | 'warn' }> = {
  public_domain: { label: 'Dominio público', tone: 'ok' },
  permission_granted: { label: 'Con permiso del titular', tone: 'ok' },
  copyrighted: { label: 'Protegido por derechos de autor', tone: 'warn' },
  rights_unknown: { label: 'Derechos sin aclarar', tone: 'warn' },
  restricted: { label: 'Acceso restringido', tone: 'warn' },
};

interface ArchiveRightsNoticeProps {
  rightsStatus: ArchiveRightsStatus;
  license?: string | null;
  donorName?: string | null;
}

export function ArchiveRightsNotice({ rightsStatus, license, donorName }: ArchiveRightsNoticeProps) {
  const meta = RIGHTS_META[rightsStatus];
  const ok = meta.tone === 'ok';

  return (
    <div className={`rounded-2xl border p-4 text-xs ${ok ? 'border-emerald-400/30 bg-emerald-500/10' : 'border-amber-400/30 bg-amber-500/10'}`}>
      <div className="flex items-center gap-2 font-bold text-[#eef2f2]">
        {ok ? <ShieldCheck className="h-4 w-4 text-emerald-400" /> : <ShieldAlert className="h-4 w-4 text-amber-400" />}
        {meta.label}
      </div>
      <p className="mt-1.5 leading-relaxed text-[#c9d0d4]">
        {license ? `Licencia: ${license}. ` : ''}
        {donorName ? `Donación: ${donorName}. ` : ''}
        El uso debe respetar la atribución y las condiciones de la pieza. Si dudas sobre los derechos,
        consulta con el consejo del Archivo antes de reutilizar.
      </p>
      <div className="mt-2 flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-[#93a5ad]">
        <Landmark className="h-3 w-3" /> Archivo Histórico RDM Digital
      </div>
    </div>
  );
}
