'use client';

import { useEffect, useState } from 'react';
import { Plus, Upload, Send, CheckCircle2, Rocket, EyeOff, Loader2, Landmark, KeyRound } from 'lucide-react';
import type { ArchiveCollection } from '@/lib/archive/archive-types';

const ROLE_HEADER = 'x-archive-role';

type Role = 'archivist' | 'reviewer' | 'archive_admin';

const ROLE_LABELS: Record<Role, string> = {
  archivist: 'Archivista',
  reviewer: 'Revisora',
  archive_admin: 'Administradora del archivo',
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  pending_review: 'En revisión',
  approved: 'Aprobado',
  published: 'Publicado',
  withdrawn: 'Retirado',
  archived: 'Archivado',
};

interface CreatedItem {
  id: string;
  status: string;
}

export function ArchiveAdminPanel() {
  const [role, setRole] = useState<Role>('archive_admin');
  const [collections, setCollections] = useState<ArchiveCollection[]>([]);
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [item, setItem] = useState<CreatedItem | null>(null);

  const [form, setForm] = useState({
    collectionId: '',
    slug: '',
    title: '',
    summary: '',
    assetType: 'photograph',
    rightsStatus: 'public_domain',
    accessLevel: 'open',
    authorOrSource: '',
    sourceReference: '',
    historicalDateStart: '',
    locationName: '',
    tags: '',
    changeReason: '',
  });

  const patch = (key: keyof typeof form, value: string) => setForm(f => ({ ...f, [key]: value }));
  const push = (msg: string) => setLog(l => [msg, ...l].slice(0, 40));

  const headers: Record<string, string> = { [ROLE_HEADER]: role, 'Content-Type': 'application/json' };

  useEffect(() => {
    let active = true;
    (async () => {
      const res = await fetch('/api/archive/collections', { cache: 'no-store' });
      const data = (await res.json()) as { ok: boolean; collections?: ArchiveCollection[] };
      if (!active) return;
      if (data.ok && data.collections?.length) {
        setCollections(data.collections);
        setForm(f => (f.collectionId ? f : { ...f, collectionId: data.collections![0].id }));
      }
    })();
    return () => { active = false; };
  }, []);

  const createItem = async () => {
    setBusy(true);
    try {
      const res = await fetch('/api/archive/admin/items', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          collectionId: form.collectionId,
          slug: form.slug.trim() || undefined,
          title: form.title.trim(),
          summary: form.summary.trim(),
          assetType: form.assetType,
          rightsStatus: form.rightsStatus,
          accessLevel: form.accessLevel,
          authorOrSource: form.authorOrSource.trim() || undefined,
          sourceReference: form.sourceReference.trim() || undefined,
          historicalDateStart: form.historicalDateStart || undefined,
          locationName: form.locationName.trim() || undefined,
          people: [],
          organizations: [],
          tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      });
      const data = (await res.json()) as { ok: boolean; id?: string; status?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? 'No se pudo crear la ficha');
      setItem({ id: data.id!, status: data.status ?? 'draft' });
      push(`Ficha creada (${form.title}) → ${STATUS_LABELS[data.status ?? 'draft']}`);
    } catch (e) {
      push(`Error: ${e instanceof Error ? e.message : 'desconocido'}`);
    } finally {
      setBusy(false);
    }
  };

  const attachDemoFile = async () => {
    if (!item) return;
    setBusy(true);
    try {
      const fileName = `demo-${Date.now()}.jpg`;
      const mimeType = 'image/jpeg';
      const byteSize = 1024 * 200;

      const upRes = await fetch('/api/archive/admin/upload-url', {
        method: 'POST',
        headers,
        body: JSON.stringify({ itemId: item.id, fileName, fileRole: 'access_copy', mimeType, byteSize }),
      });
      const upData = (await upRes.json()) as { ok: boolean; url?: string; bucket?: string; objectPath?: string; error?: string };
      if (!upRes.ok) throw new Error(upData.error ?? 'No se pudo firmar la carga');
      push('URL firmada de carga obtenida.');

      const url = new URL(upData.url!);
      const sigRes = await fetch('/api/archive/demo-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bucket: upData.bucket,
          path: upData.objectPath,
          expires: url.searchParams.get('expires'),
          sig: url.searchParams.get('sig'),
        }),
      });
      const sigData = (await sigRes.json()) as { ok: boolean; error?: string };
      if (!sigRes.ok) throw new Error(sigData.error ?? 'Firma de carga inválida');
      push('Carga demo confirmada por el servidor.');

      const regRes = await fetch(`/api/archive/admin/items/${item.id}/files`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          itemId: item.id,
          fileRole: 'access_copy',
          storageBucket: upData.bucket,
          objectPath: upData.objectPath,
          mimeType,
          byteSize,
          sha256: 'sha256:0000000000000000000000000000000000000000000000000000000000000000',
          isPublic: true,
        }),
      });
      const regData = (await regRes.json()) as { ok: boolean; error?: string };
      if (!regRes.ok) throw new Error(regData.error ?? 'No se pudo registrar el archivo');
      push('Derivado de acceso registrado en el expediente.');
    } catch (e) {
      push(`Error: ${e instanceof Error ? e.message : 'desconocido'}`);
    } finally {
      setBusy(false);
    }
  };

  const transition = async (action: 'submit' | 'approve' | 'publish' | 'withdraw', label: string) => {
    if (!item) return;
    if (!form.changeReason.trim()) {
      push('Escribe una razón de cambio antes de continuar.');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/archive/admin/items/${item.id}/${action}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ changeReason: form.changeReason.trim() }),
      });
      const data = (await res.json()) as { ok: boolean; status?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Transición fallida');
      setItem({ ...item, status: data.status ?? item.status });
      push(`${label} → ${STATUS_LABELS[data.status ?? '']}`);
      setForm(f => ({ ...f, changeReason: '' }));
    } catch (e) {
      push(`Error: ${e instanceof Error ? e.message : 'desconocido'}`);
    } finally {
      setBusy(false);
    }
  };

  const inputCls =
    'w-full rounded-xl border border-white/15 bg-white/[0.05] px-3.5 py-2.5 text-sm text-[#e8edef] placeholder:text-[#647a84] focus:border-[#2e9cff] focus:outline-none transition-all';
  const labelCls = 'text-[10px] font-mono font-bold uppercase tracking-widest text-[#2e9cff]';

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Landmark className="h-4 w-4 text-[#d97832]" />
            <h3 className="text-sm font-mono font-bold uppercase tracking-widest text-[#2e9cff]">Nueva ficha del acervo</h3>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <label className={labelCls}>Título</label>
              <input value={form.title} onChange={e => patch('title', e.target.value)} placeholder="p. ej. Interior de la mina San Cayetano" className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>Slug (URL)</label>
              <input value={form.slug} onChange={e => patch('slug', e.target.value)} placeholder="mina-san-cayetano" className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>Colección</label>
              <select value={form.collectionId} onChange={e => patch('collectionId', e.target.value)} className={inputCls}>
                {collections.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className={labelCls}>Resumen</label>
              <textarea value={form.summary} onChange={e => patch('summary', e.target.value)} rows={2} placeholder="Qué es, qué época cubre y por qué importa." className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>Tipo de pieza</label>
              <select value={form.assetType} onChange={e => patch('assetType', e.target.value)} className={inputCls}>
                <option value="photograph">Fotografía</option>
                <option value="document">Documento</option>
                <option value="newspaper">Prensa</option>
                <option value="map">Mapa</option>
                <option value="audio">Audio</option>
                <option value="oral_history">Memoria oral</option>
                <option value="artifact">Objeto</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>Estado de derechos</label>
              <select value={form.rightsStatus} onChange={e => patch('rightsStatus', e.target.value)} className={inputCls}>
                <option value="public_domain">Dominio público</option>
                <option value="permission_granted">Con permiso</option>
                <option value="copyrighted">Protegido</option>
                <option value="rights_unknown">Sin aclarar</option>
                <option value="restricted">Restringido</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>Acceso público</label>
              <select value={form.accessLevel} onChange={e => patch('accessLevel', e.target.value)} className={inputCls}>
                <option value="open">Abierto</option>
                <option value="download_only">Solo descarga</option>
                <option value="view_only">Solo vista</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>Año (inicio)</label>
              <input value={form.historicalDateStart} onChange={e => patch('historicalDateStart', e.target.value)} placeholder="1766-01-01" className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>Autor / fuente</label>
              <input value={form.authorOrSource} onChange={e => patch('authorOrSource', e.target.value)} placeholder="Concesión minera, AHREM" className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>Ubicación</label>
              <input value={form.locationName} onChange={e => patch('locationName', e.target.value)} placeholder="Real del Monte, Hidalgo" className={inputCls} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className={labelCls}>Etiquetas (separadas por coma)</label>
              <input value={form.tags} onChange={e => patch('tags', e.target.value)} placeholder="minería, barrio del Arrastre" className={inputCls} />
            </div>
          </div>

          <button onClick={() => void createItem()} disabled={busy} className="flex items-center gap-2 rounded-xl bg-[#0d4652] px-5 py-3 text-xs font-bold text-white shadow-md transition-all hover:shadow-lg disabled:opacity-50">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Crear ficha como borrador
          </button>
        </div>

        {item && (
          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-[#d97832]" />
                <h3 className="text-sm font-mono font-bold uppercase tracking-widest text-[#2e9cff]">Expediente activo</h3>
              </div>
              <span className="rounded-full border border-[#2e9cff]/40 bg-[#2e9cff]/8 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-widest text-[#2e9cff]">
                {STATUS_LABELS[item.status]} · {item.id.slice(0, 8)}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button onClick={() => void attachDemoFile()} disabled={busy} className="flex items-center gap-2 rounded-xl bg-[#d97832] px-4 py-2.5 text-xs font-bold text-white hover:shadow-md transition-all disabled:opacity-50">
                <Upload className="h-4 w-4" /> Cargar derivado demo
              </button>
              {item.status === 'draft' && (
                <button onClick={() => void transition('submit', 'Enviada a revisión')} disabled={busy} className="flex items-center gap-2 rounded-xl bg-[#2e9cff] px-4 py-2.5 text-xs font-bold text-white hover:shadow-md transition-all disabled:opacity-50">
                  <Send className="h-4 w-4" /> Enviar a revisión
                </button>
              )}
              {item.status === 'pending_review' && (
                <button onClick={() => void transition('approve', 'Aprobada')} disabled={busy} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:shadow-md transition-all disabled:opacity-50">
                  <CheckCircle2 className="h-4 w-4" /> Aprobar
                </button>
              )}
              {(item.status === 'approved' || item.status === 'pending_review') && (
                <button onClick={() => void transition('publish', 'Publicada')} disabled={busy} className="flex items-center gap-2 rounded-xl bg-[#a9481e] px-4 py-2.5 text-xs font-bold text-white hover:shadow-md transition-all disabled:opacity-50">
                  <Rocket className="h-4 w-4" /> Publicar
                </button>
              )}
              {item.status === 'published' && (
                <button onClick={() => void transition('withdraw', 'Retirada')} disabled={busy} className="flex items-center gap-2 rounded-xl border border-[#a9481e]/50 px-4 py-2.5 text-xs font-bold text-[#a9481e] hover:bg-[#a9481e]/5 transition-all disabled:opacity-50">
                  <EyeOff className="h-4 w-4" /> Retirar
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              <label className={labelCls}>Razón de cambio (obligatoria para avanzar)</label>
              <input value={form.changeReason} onChange={e => patch('changeReason', e.target.value)} placeholder="p. ej. Procedencia verificada con el acta de donación" className={inputCls} />
            </div>
          </div>
        )}

        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 space-y-3">
          <h3 className="text-sm font-mono font-bold uppercase tracking-widest text-[#2e9cff]">Trazo del flujo editorial</h3>
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-[#c9d0d4]">
            {['Borrador', 'En revisión', 'Aprobado', 'Publicado', 'Retirado'].map((step, i, arr) => (
              <span key={step} className="flex items-center gap-2">
                <span className={`rounded-full px-3 py-1.5 border ${['Borrador', 'En revisión', 'Aprobado', 'Publicado', 'Retirado'].indexOf(step) <= ['draft','pending_review','approved','published','withdrawn'].indexOf(item?.status ?? 'draft') ? 'bg-[#0d4652] text-white border-[#0d4652]' : 'bg-white/[0.06] text-[#93a5ad] border-white/15'}`}>
                  {step}
                </span>
                {i < arr.length - 1 && <span>→</span>}
              </span>
            ))}
          </div>
          <p className="text-[11px] leading-relaxed text-[#c9d0d4]">
            Cada transición exige rol suficiente y razón de cambio. Publicar requiere procedencia,
            derechos aclarados y un derivado visible con hash canónico.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 space-y-3">
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-[#d97832]" />
            <h3 className="text-sm font-mono font-bold uppercase tracking-widest text-[#2e9cff]">Rol editorial (demo)</h3>
          </div>
          <p className="text-[11px] text-[#c9d0d4]">
            En producción el rol sale de la sesión y el RLS de Supabase. Aquí se declara la cabecera
            <code className="mx-1 rounded bg-[#2e9cff]/8 px-1.5 py-0.5 font-mono text-[#2e9cff]">x-archive-role</code>.
          </p>
          <select value={role} onChange={e => setRole(e.target.value as Role)} className={inputCls}>
            {(Object.keys(ROLE_LABELS) as Role[]).map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
          </select>
          <p className="text-[10px] font-mono text-[#93a5ad]">Archivista: crea y sube. Revisora: aprueba y publica. Admin: todo.</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 space-y-3">
          <h3 className="text-sm font-mono font-bold uppercase tracking-widest text-[#2e9cff]">Bitácora de sesión</h3>
          <ul className="max-h-72 space-y-1.5 overflow-auto pr-1">
            {log.length === 0 && <li className="text-[11px] text-[#93a5ad]">Sin actividad todavía.</li>}
            {log.map((entry, i) => (
              <li key={i} className="rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-[11px] text-[#eef2f2]">
                {entry}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
