'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  subscribeNotifications,
  recentNotifications,
  unreadCount,
  markAllRead,
  type RdmNotification,
} from '@/lib/notifications/notifier';
import { playSound, isSoundEnabled, setSoundEnabled } from '@/lib/notifications/sound';
import { Bell, Volume2, VolumeX, CheckCheck } from 'lucide-react';

const SEVERITY_DOT: Record<string, string> = {
  info: '#38bdf8',
  success: '#10b981',
  warning: '#facc15',
  critical: '#b91c1c',
};

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<RdmNotification[]>(() => recentNotifications(30));
  const [unread, setUnread] = useState(() => unreadCount());
  const [soundOn, setSoundOn] = useState(() => isSoundEnabled());

  const refresh = useCallback(() => {
    setItems(recentNotifications(30));
    setUnread(unreadCount());
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeNotifications(notification => {
      refresh();
      if (notification.sound) playSound(notification.severity === 'critical' ? 'critical' : 'success');
    });
    return unsubscribe;
  }, [refresh]);

  const toggleSound = (): void => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playSound('success');
  };

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Centro de notificaciones"
        onClick={() => setOpen(o => !o)}
        className="relative rounded-lg border border-amber-900/30 bg-black/40 p-2 text-slate-300 transition hover:border-[#c8a356]/50 hover:text-[#d4b26a]"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#b91c1c] px-1 text-[10px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="glass-panel absolute right-0 z-50 mt-2 w-80 rounded-2xl p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-patrimonial text-sm font-semibold text-[#d4b26a]">
                Notificaciones
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Sonido"
                  onClick={toggleSound}
                  className="rounded p-1.5 text-slate-400 hover:text-[#d4b26a]"
                >
                  {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  aria-label="Marcar leídas"
                  onClick={() => {
                    markAllRead();
                    refresh();
                  }}
                  className="rounded p-1.5 text-slate-400 hover:text-[#d4b26a]"
                >
                  <CheckCheck className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
              {items.length === 0 && (
                <p className="py-6 text-center text-xs text-slate-500">
                  Sin notificaciones. El Nodo te avisará aquí.
                </p>
              )}
              {items.map(n => (
                <div
                  key={n.id}
                  className={`rounded-lg border px-3 py-2 ${n.read ? 'border-amber-900/15 bg-black/20 opacity-70' : 'border-amber-900/30 bg-black/40'}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-medium text-slate-200">{n.title}</span>
                    <span
                      className="mt-1 h-2 w-2 shrink-0 rounded-full"
                      style={{ background: SEVERITY_DOT[n.severity] ?? '#9ca3af' }}
                    />
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-400">{n.body}</p>
                  <span className="mt-1 block text-[10px] uppercase tracking-wider text-slate-600">
                    {n.source} · {new Date(n.at).toLocaleTimeString('es-MX')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
