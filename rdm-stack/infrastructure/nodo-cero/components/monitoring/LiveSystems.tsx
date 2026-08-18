'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  watchPosition,
  distanceToCenter,
  RDM_CENTER,
  speedKmh,
  type GeoPosition,
} from '@/lib/geo/geolocation';
import {
  subscribeTopic,
  inboxFor,
  sendMessage,
  unreadFor,
  type RdmMessage,
} from '@/lib/messaging/bus';
import { notify, subscribeNotifications } from '@/lib/notifications/notifier';
import { playSound } from '@/lib/notifications/sound';
import { Crosshair, MessageSquare, BellRing } from 'lucide-react';

export function LiveSystems() {
  const [geo, setGeo] = useState<GeoPosition | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [messages, setMessages] = useState<RdmMessage[]>(() => inboxFor('operador', 8));
  const [unread, setUnread] = useState(() => unreadFor('operador'));
  const [draft, setDraft] = useState('');

  const refreshMessages = useCallback(() => {
    setMessages(inboxFor('operador', 8));
    setUnread(unreadFor('operador'));
  }, []);

  useEffect(() => {
    const unsubscribeTopic = subscribeTopic('canal-nodo', () => refreshMessages());
    const unsubscribeNotif = subscribeNotifications(() => refreshMessages());

    const handle = watchPosition({
      onPosition: setGeo,
      onError: (code, message) => setGeoError(`${code}: ${message}`),
    });

    return () => {
      handle?.stop();
      unsubscribeTopic();
      unsubscribeNotif();
    };
  }, [refreshMessages]);

  const send = (): void => {
    if (!draft.trim()) return;
    sendMessage('operador', draft.trim(), { topic: 'canal-nodo', to: 'isabella' });
    setDraft('');
    refreshMessages();
  };

  const testNotification = (): void => {
    notify(
      'Prueba del Nodo',
      'Sistema de notificaciones operativo. Sonido y canal activos.',
      'success',
      'nodo',
      { sound: true },
    );
    playSound('success');
    refreshMessages();
  };

  const distance = geo ? distanceToCenter(geo) : null;
  const speed = geo ? speedKmh(geo.speed) : null;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <section className="glass-panel rounded-2xl p-4">
        <div className="mb-2 flex items-center gap-2">
          <Crosshair className="h-4 w-4 text-[#c8a356]" />
          <h2 className="font-patrimonial text-sm font-semibold text-[#d4b26a]">
            Geolocalización en tiempo real
          </h2>
        </div>
        {geo ? (
          <div className="space-y-1 font-mono text-xs text-slate-300">
            <p>lat: {geo.latitude.toFixed(5)}</p>
            <p>lng: {geo.longitude.toFixed(5)}</p>
            <p>
              precisión: {geo.accuracy.toFixed(1)} m
            </p>
            <p className="text-[#d4b26a]">
              distancia al centro: {distance ? `${distance.toFixed(2)} km` : '—'}
            </p>
            <p>velocidad: {speed !== null ? `${speed.toFixed(1)} km/h` : 'estático'}</p>
          </div>
        ) : (
          <p className="text-xs text-slate-500">
            {geoError ?? 'Solicitando permiso de ubicación…'}
          </p>
        )}
        <p className="mt-2 text-[10px] text-slate-600">
          Centro de referencia: {RDM_CENTER.latitude}, {RDM_CENTER.longitude} · Real del Monte
        </p>
      </section>

      <section className="glass-panel rounded-2xl p-4">
        <div className="mb-2 flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-[#c8a356]" />
          <h2 className="font-patrimonial text-sm font-semibold text-[#d4b26a]">
            Mensajería del Nodo{unread > 0 ? ` · ${unread} sin leer` : ''}
          </h2>
        </div>
        <div className="mb-2 max-h-32 space-y-1 overflow-y-auto">
          {messages.length === 0 && (
            <p className="text-xs text-slate-500">Sin mensajes en el canal.</p>
          )}
          {messages.map(m => (
            <div key={m.id} className="rounded border border-amber-900/15 bg-black/25 px-2 py-1">
              <span className="text-[10px] font-semibold text-[#c8a356]">{m.from}</span>
              <span className="ml-1 text-xs text-slate-300">{m.text}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Mensaje a Isabella…"
            className="w-full rounded-lg border border-amber-900/30 bg-black/40 px-2 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:border-[#c8a356]/60 focus:outline-none"
          />
          <button
            type="button"
            onClick={send}
            className="rounded-lg border border-[#c8a356]/40 bg-[#c8a356]/10 px-3 text-xs font-medium text-[#d4b26a] hover:bg-[#c8a356]/20"
          >
            Enviar
          </button>
        </div>
      </section>

      <section className="glass-panel rounded-2xl p-4">
        <div className="mb-2 flex items-center gap-2">
          <BellRing className="h-4 w-4 text-[#c8a356]" />
          <h2 className="font-patrimonial text-sm font-semibold text-[#d4b26a]">
            Alertas con sonido
          </h2>
        </div>
        <button
          type="button"
          onClick={testNotification}
          className="w-full rounded-lg border border-[#c8a356]/40 bg-[#c8a356]/10 px-3 py-2 text-sm font-medium text-[#d4b26a] transition hover:bg-[#c8a356]/20"
        >
          Disparar notificación de prueba (con sonido)
        </button>
        <p className="mt-2 text-[11px] text-slate-500">
          Las capturas de zombis, incidentes del IOC y misiones disparan notificaciones con sonido
          de forma automática.
        </p>
      </section>
    </div>
  );
}
