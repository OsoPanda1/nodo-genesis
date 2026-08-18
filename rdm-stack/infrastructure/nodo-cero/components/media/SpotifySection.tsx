"use client";

import React, { useEffect, useState } from 'react';
import { Disc3, User, Clock, ListMusic, Play, Pause, RefreshCw, ExternalLink, Wifi, WifiOff, Music2 } from 'lucide-react';

type OverviewData = {
  profile: { id: string; display_name: string | null; email?: string; images?: { url: string }[] } | null;
  history: { track: { id: string; name: string; artists: { name: string }[]; album?: { images: { url: string }[] } }; played_at: string }[];
  playlists: { id: string; name: string; images: { url: string }[]; tracks?: { total?: number } }[];
  playback: { is_playing?: boolean; item?: { name: string; artists: { name: string }[]; album?: { images: { url: string }[] } } | null } | null;
  warnings?: { domain: string; error: string }[];
};

type StatusData = {
  configured: boolean;
  connected: boolean;
  profileId: string | null;
  profileName: string | null;
};

/* Panel de gestión de la cuenta Spotify del Nodo. Detecta el estado
   (configurado / conectado), ofrece conectar con OAuth PKCE y muestra
   el historial reciente, las listas y la reproducción actual. */
export default function SpotifySection() {
  const [status, setStatus] = useState<StatusData | null>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/spotify/status')
      .then((res) => res.json())
      .then((data: StatusData & { ok: boolean }) => {
        setStatus(data);
        setLoading(false);
        if (data.connected) {
          fetch('/api/spotify/overview')
            .then((r) => r.json())
            .then((o: OverviewData & { ok: boolean }) => {
              if (o.ok === false) {
                setError('No se pudo cargar el panel de Spotify');
                setOverview(null);
              } else {
                setOverview(o);
              }
            })
            .catch(() => setError('No se pudo cargar el panel de Spotify'));
        }
      })
      .catch(() => {
        setLoading(false);
        setError('No se pudo contactar el estado de Spotify');
      });
  }, []);

  const handleConnect = async () => {
    setConnecting(true);
    setError(null);
    try {
      const state = crypto.randomUUID().replace(/-/g, '').slice(0, 32);
      const res = await fetch('/api/spotify/auth/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state }),
      });
      const data = (await res.json()) as { ok: boolean; url?: string; error?: string };
      if (data.ok && data.url) {
        window.location.assign(data.url);
      } else {
        setError(data.error ?? 'No se pudo iniciar la conexión con Spotify');
        setConnecting(false);
      }
    } catch {
      setError('No se pudo iniciar la conexión con Spotify');
      setConnecting(false);
    }
  };

  const handleRevoke = async () => {
    await fetch('/api/spotify/revoke', { method: 'POST' });
    setStatus((s) => (s ? { ...s, connected: false, profileId: null, profileName: null } : s));
    setOverview(null);
    setNotice('Sesión de Spotify desconectada');
    setTimeout(() => setNotice(null), 3000);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/spotify/overview');
      const data = (await res.json()) as OverviewData & { ok: boolean };
      if (data.ok === false) {
        setError('No se pudo cargar el panel de Spotify');
        setOverview(null);
      } else {
        setOverview(data);
        setError(null);
      }
    } catch {
      setError('No se pudo cargar el panel de Spotify');
      setOverview(null);
    } finally {
      setRefreshing(false);
    }
  };

  /* Reproductor: instancia el Web Playback SDK con el token público. */
  const activatePlayer = async () => {
    setNotice(null);
    try {
      const res = await fetch('/api/spotify/player/token');
      const data = (await res.json()) as { ok: boolean; token?: string; error?: string };
      if (!data.ok || !data.token) {
        setNotice(data.error ?? 'No hay reproductor disponible');
        return;
      }
      if (typeof window !== 'undefined' && !window.Spotify) {
        const script = document.createElement('script');
        script.src = 'https://sdk.scdn.co/spotify-player.js';
        script.async = true;
        document.body.appendChild(script);
        await new Promise<void>((resolve) => {
          const wait = () => {
            if (window.Spotify) resolve();
            else setTimeout(wait, 150);
          };
          wait();
        });
      }
      const sdk = window.Spotify;
      if (!sdk) {
        setNotice('El reproductor de Spotify no está disponible');
        return;
      }
      const player = new sdk.Player({
        name: 'RDM Digital Hub',
        getOAuthToken: (cb: (t: string) => void) => cb(data.token as string),
        volume: 0.7,
      });
      await new Promise<void>((resolve) => {
        player.addListener('ready', () => {
          void player.activateElement();
          resolve();
        });
        player.connect();
        setTimeout(() => {
          void player.activateElement();
          resolve();
        }, 800);
      });
      setNotice('Reproductor del Nodo activado en tu dispositivo');
      setTimeout(() => setNotice(null), 3500);
    } catch {
      setNotice('No se pudo activar el reproductor');
    }
  };

  const fmtDuration = (ms?: number): string => {
    if (ms === undefined) return '';
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const fmtDate = (iso: string): string =>
    new Date(iso).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  const profileImage = overview?.profile?.images?.[0]?.url;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl glass-panel border border-white/10 p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-green-500 to-emerald-600 flex items-center justify-center shrink-0 shadow-lg">
              <Disc3 className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                RDM Digital Hub — Spotify
                {status?.connected ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <Wifi className="w-3 h-3" /> Conectado
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
                    <WifiOff className="w-3 h-3" /> Sin conexión
                  </span>
                )}
              </h3>
              <p className="text-[11px] font-mono text-slate-400">
                Historial, listas y reproducción en vivo de la cuenta autorizada
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {status?.connected ? (
              <>
                <button
                  onClick={() => void handleRefresh()}
                  disabled={refreshing}
                  className="px-3 py-2 rounded-xl text-xs font-mono font-bold border border-white/10 text-slate-300 hover:text-white hover:border-white/30 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                  Actualizar
                </button>
                <button
                  onClick={() => void activatePlayer()}
                  className="px-3 py-2 rounded-xl text-xs font-mono font-bold bg-gradient-to-tr from-green-500 to-emerald-600 text-slate-950 hover:opacity-90 transition-all flex items-center gap-2"
                >
                  <Music2 className="w-3.5 h-3.5" />
                  Reproductor del Nodo
                </button>
                <button
                  onClick={() => void handleRevoke()}
                  className="px-3 py-2 rounded-xl text-xs font-mono font-bold border border-red-500/30 text-red-300 hover:bg-red-500/10 transition-all"
                >
                  Desconectar
                </button>
              </>
            ) : (
              <button
                onClick={() => void handleConnect()}
                disabled={connecting}
                className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-gradient-to-tr from-green-500 to-emerald-600 text-slate-950 hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {connecting ? 'Conectando…' : 'Conectar con Spotify'}
              </button>
            )}
          </div>
        </div>

        {notice && (
          <div className="text-xs font-mono text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 rounded-xl px-3 py-2">
            {notice}
          </div>
        )}
        {error && (
          <div className="text-xs font-mono text-red-300 bg-red-950/40 border border-red-500/30 rounded-xl px-3 py-2">
            {error}
          </div>
        )}

        {!status?.configured && !loading && (
          <div className="text-xs font-mono text-slate-400 bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-2">
            Spotify aún no está configurado en este despliegue del Nodo (faltan credenciales).
          </div>
        )}

        {status?.connected && overview && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Perfil */}
            <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4 space-y-3">
              <div className="flex items-center gap-3">
                {profileImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profileImage} alt="Perfil" className="w-12 h-12 rounded-full border border-white/10 object-cover" loading="lazy" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
                    <User className="w-6 h-6 text-slate-400" />
                  </div>
                )}
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-white truncate">{overview.profile?.display_name ?? 'Cuenta Spotify'}</h4>
                  <p className="text-[11px] font-mono text-slate-400 truncate">@{overview.profile?.id}</p>
                </div>
              </div>
              {overview.profile?.email && (
                <p className="text-[11px] font-mono text-slate-400 truncate">{overview.profile.email}</p>
              )}
              {overview.playback?.item && (
                <div className="pt-2 border-t border-white/10">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Reproduciendo ahora</p>
                  <p className="text-xs font-bold text-white truncate mt-1 flex items-center gap-1.5">
                    {overview.playback.is_playing ? <Play className="w-3 h-3 text-green-400" /> : <Pause className="w-3 h-3 text-amber-400" />}
                    {overview.playback.item.name}
                  </p>
                  <p className="text-[11px] font-mono text-slate-400 truncate">
                    {overview.playback.item.artists.map((a) => a.name).join(', ')}
                  </p>
                </div>
              )}
            </div>

            {/* Historial reciente */}
            <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4 space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-purple-400" /> Escuchado recientemente
              </h4>
              {overview.history.length === 0 ? (
                <p className="text-xs font-mono text-slate-500">Sin historial todavía.</p>
              ) : (
                <ul className="space-y-2">
                  {overview.history.slice(0, 8).map((item, i) => (
                    <li key={`${item.track.id}-${i}`} className="flex items-center gap-2.5">
                      {item.track.album?.images?.[0]?.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.track.album.images[0].url} alt="" className="w-8 h-8 rounded-md object-cover border border-white/10" loading="lazy" />
                      ) : (
                        <div className="w-8 h-8 rounded-md bg-slate-800 flex items-center justify-center">
                          <Music2 className="w-4 h-4 text-slate-500" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{item.track.name}</p>
                        <p className="text-[10px] font-mono text-slate-400 truncate">
                          {item.track.artists.map((a) => a.name).join(', ')}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 shrink-0">{fmtDate(item.played_at)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Listas */}
            <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4 space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <ListMusic className="w-3.5 h-3.5 text-cyan-400" /> Tus listas de reproducción
              </h4>
              {overview.playlists.length === 0 ? (
                <p className="text-xs font-mono text-slate-500">Sin listas disponibles.</p>
              ) : (
                <ul className="space-y-2">
                  {overview.playlists.slice(0, 6).map((pl) => (
                    <li key={pl.id} className="flex items-center gap-2.5">
                      {pl.images?.[0]?.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={pl.images[0].url} alt="" className="w-8 h-8 rounded-md object-cover border border-white/10" loading="lazy" />
                      ) : (
                        <div className="w-8 h-8 rounded-md bg-slate-800 flex items-center justify-center">
                          <ListMusic className="w-4 h-4 text-slate-500" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{pl.name}</p>
                        <p className="text-[10px] font-mono text-slate-400">
                          {pl.tracks?.total ?? 0} canciones
                        </p>
                      </div>
                      <ExternalLink className="w-3 h-3 text-slate-600 shrink-0" />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
