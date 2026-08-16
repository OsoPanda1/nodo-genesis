'use client';

import { useEffect, useState } from 'react';
import {
  ArrowLeft, Download, Loader2, Play, FileText, MapPin, Share2,
} from 'lucide-react';
import type { ArchiveItemWithFiles } from '@/lib/archive/archive-types';
import { ArchiveRightsNotice } from './ArchiveRightsNotice';
import { ArchiveTimeline } from './ArchiveTimeline';
import { ArchiveMap } from './ArchiveMap';

interface ArchiveItemViewerProps {
  item: ArchiveItemWithFiles;
  onBack: () => void;
}

export function ArchiveItemViewer({ item, onBack }: ArchiveItemViewerProps) {
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const accessCopy = item.files.find(f => f.fileRole === 'access_copy' && f.isPublic);
  const thumbnail = item.files.find(f => f.fileRole === 'thumbnail' && f.isPublic);
  const transcript = item.files.find(f => f.fileRole === 'transcript' && f.isPublic);
  const canDownload = item.accessLevel === 'open' || item.accessLevel === 'download_only';

  const isEmbeddable =
    accessCopy !== undefined &&
    (accessCopy.mimeType === 'application/pdf' || accessCopy.mimeType.startsWith('text/') || accessCopy.mimeType.startsWith('image/'));

  useEffect(() => {
    let cancelled = false;
    if (!isEmbeddable) return;
    const params = new URLSearchParams({ fileRole: accessCopy.fileRole });
    fetch(`/api/archive/items/${item.id}/preview?${params.toString()}`, { cache: 'no-store' })
      .then(async res => {
        const data = (await res.json()) as { ok: boolean; url?: string; error?: string };
        if (!res.ok || !data.url) throw new Error(data.error ?? 'No se pudo preparar la vista previa.');
        return data.url;
      })
      .then(url => {
        if (!cancelled) setPreviewUrl(url);
      })
      .catch((e: unknown) => {
        if (!cancelled) setPreviewError(e instanceof Error ? e.message : 'Error de vista previa');
      });
    return () => {
      cancelled = true;
    };
  }, [item.id, accessCopy, isEmbeddable]);

  const handleDownload = async (fileRole: string) => {
    setDownloading(true);
    setDownloadError(null);
    try {
      const res = await fetch(`/api/archive/items/${item.id}/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileRole }),
      });
      const data = (await res.json()) as { ok: boolean; url?: string; fileName?: string; error?: string };
      if (!res.ok || !data.url) {
        setDownloadError(data.error ?? 'No se pudo generar la descarga.');
        return;
      }
      const link = document.createElement('a');
      link.href = data.url;
      link.download = data.fileName ?? 'archivo-rdm';
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      setDownloadError('Error de red al solicitar la descarga.');
    } finally {
      setDownloading(false);
    }
  };

  const renderViewer = () => {
    if (!accessCopy) {
      return (
        <div className="flex h-72 items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-br from-[#0d4652] to-[#082f3b]">
          <div className="text-center text-white/80">
            <FileText className="mx-auto h-10 w-10 text-[#d97832]" />
            <p className="mt-3 font-patrimonial text-lg">Pieza sin derivado público</p>
            <p className="text-xs font-mono text-white/60">Disponible para consulta presencial en el Archivo</p>
          </div>
        </div>
      );
    }

    if (accessCopy.mimeType.startsWith('image/')) {
      return (
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#082f3b]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={accessCopy.objectPath} alt={item.title} className="mx-auto max-h-[28rem] w-auto object-contain" onError={e => { (e.currentTarget as HTMLImageElement).src = '/images/real-1.jpg'; }} />
        </div>
      );
    }
    if (accessCopy.mimeType.startsWith('audio/')) {
      return (
        <div className="flex h-72 flex-col items-center justify-center gap-4 rounded-3xl border border-white/10 bg-gradient-to-br from-[#0d4652] to-[#082f3b] p-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#d97832]/20 border border-[#d97832]/40">
            <Play className="h-7 w-7 text-[#d97832]" />
          </div>
          <div className="text-white">
            <p className="font-patrimonial text-xl">{item.title}</p>
            <p className="mt-1 text-xs font-mono text-white/60">
              {accessCopy.durationSeconds ? `${Math.floor(accessCopy.durationSeconds / 60)} min` : ''} · Memoria oral
            </p>
          </div>
          {canDownload && (
            <button onClick={() => void handleDownload('access_copy')} disabled={downloading} className="crystal-button px-5 py-2.5 text-xs font-bold">
              {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Escuchar el fragmento público
            </button>
          )}
        </div>
      );
    }
    if (accessCopy.mimeType === 'application/pdf' || accessCopy.mimeType.startsWith('text/')) {
      return (
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white">
          {previewUrl ? (
            <iframe
              src={previewUrl}
              title={item.title}
              className="h-[34rem] w-full bg-white"
            />
          ) : previewError ? (
            <div className="flex h-72 flex-col items-center justify-center gap-3 px-6 text-center">
              <FileText className="h-12 w-12 text-[#d97832]" />
              <p className="font-patrimonial text-xl text-[#082f3b]">{item.title}</p>
              <p className="text-xs font-mono text-[#8a97a4]">{previewError}</p>
            </div>
          ) : (
            <div className="flex h-72 items-center justify-center gap-3 bg-gradient-to-br from-[#0d4652] to-[#082f3b]">
              <Loader2 className="h-6 w-6 animate-spin text-[#d97832]" />
              <span className="text-xs font-mono uppercase tracking-widest text-white/70">Preparando la lectura…</span>
            </div>
          )}
          {canDownload && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-white/[0.06] px-5 py-4">
              <p className="text-xs font-mono text-[#c9d0d4]">
                Documento digitalizado del Archivo · vista previa en línea
              </p>
              <button onClick={() => void handleDownload('access_copy')} disabled={downloading} className="crystal-button px-5 py-2.5 text-xs font-bold">
                {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Descargar documento
              </button>
            </div>
          )}
        </div>
      );
    }
    return (
      <div className="flex h-72 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.06]">
        <p className="text-sm font-mono text-[#c9d0d4]">Formato multimedia · {accessCopy.mimeType}</p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2 text-xs font-bold text-[#2e9cff] transition-all hover:border-[#2e9cff]">
        <ArrowLeft className="h-4 w-4" /> Volver al Archivo
      </button>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[#2e9cff]/30 bg-[#2e9cff]/8 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-widest text-[#2e9cff]">
                {item.collection?.title}
              </span>
              <span className="rounded-full border border-white/15 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-[#c9d0d4]">
                {item.assetType.replace(/_/g, ' ')}
              </span>
            </div>
            <h2 className="font-patrimonial text-3xl sm:text-4xl font-bold leading-tight text-[#eef2f2]">{item.title}</h2>
            <p className="text-sm leading-relaxed text-[#c9d0d4]">{item.summary}</p>
          </div>

          {renderViewer()}

          {item.description && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-sm leading-relaxed text-[#eef2f2] whitespace-pre-line">{item.description}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ArchiveTimeline
              historicalDateStart={item.historicalDateStart}
              historicalDateEnd={item.historicalDateEnd}
              datePrecision={item.datePrecision}
              locationName={item.locationName}
              people={item.people}
              organizations={item.organizations}
              tags={item.tags}
            />
            <ArchiveRightsNotice rightsStatus={item.rightsStatus} license={item.license} donorName={item.donorName} />
          </div>
        </div>

        <div className="space-y-4">
          {item.latitude !== null && item.longitude !== null && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#2e9cff]" />
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#2e9cff]">Lugar del territorio</span>
              </div>
              <ArchiveMap latitude={item.latitude} longitude={item.longitude} locationName={item.locationName} />
            </div>
          )}

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-[#2e9cff]">Procedencia y autoría</h4>
            <dl className="space-y-2 text-xs">
              {item.authorOrSource && (
                <div className="flex justify-between gap-3">
                  <dt className="text-[#93a5ad]">Autor / fuente</dt>
                  <dd className="font-medium text-[#eef2f2] text-right">{item.authorOrSource}</dd>
                </div>
              )}
              {item.sourceReference && (
                <div className="flex justify-between gap-3">
                  <dt className="text-[#93a5ad]">Referencia</dt>
                  <dd className="font-mono text-[#2e9cff] text-right">{item.sourceReference}</dd>
                </div>
              )}
              {item.donorName && (
                <div className="flex justify-between gap-3">
                  <dt className="text-[#93a5ad]">Donante</dt>
                  <dd className="font-medium text-[#eef2f2] text-right">{item.donorName}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-[#2e9cff]">Archivos del expediente</h4>
            <ul className="space-y-2 text-xs">
              {item.files.map(file => (
                <li key={file.id} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-[#c9d0d4]">
                    <FileText className="h-3.5 w-3.5" />
                    {file.fileRole.replace(/_/g, ' ')}
                  </span>
                  {file.isPublic && file.fileRole !== 'original' && canDownload ? (
                    <button
                      onClick={() => void handleDownload(file.fileRole)}
                      className="flex items-center gap-1 rounded-lg bg-[#2e9cff]/8 px-2.5 py-1 font-bold text-[#2e9cff] hover:bg-[#2e9cff] hover:text-white transition-colors"
                    >
                      {downloading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
                      Descargar
                    </button>
                  ) : (
                    <span className="font-mono text-[10px] text-[#93a5ad]">{file.mimeType}</span>
                  )}
                </li>
              ))}
              {item.files.length === 0 && <li className="text-[#93a5ad]">Sin archivos digitalizados aún.</li>}
            </ul>
          </div>

          {canDownload && transcript && (
            <button
              onClick={() => void handleDownload('transcript')}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#d97832] px-4 py-3 text-xs font-bold text-white shadow-md transition-all hover:shadow-lg"
            >
              <Share2 className="h-4 w-4" /> Descargar transcripción
            </button>
          )}

          {downloadError && (
            <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-300">{downloadError}</div>
          )}
        </div>
      </div>
    </div>
  );
}
