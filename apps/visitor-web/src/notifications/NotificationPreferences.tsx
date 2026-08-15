import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, BellOff, Volume2, Moon, User, Mail, MessageSquare, Smartphone, Globe } from "lucide-react";
import type { SoundIntensity, UserMode, NotificationChannel } from "./types";

interface NotificationPreferencesProps {
  initial?: {
    soundIntensity?: SoundIntensity;
    userMode?: UserMode;
    muted?: boolean;
    channelsEnabled?: NotificationChannel[];
    quietHoursEnabled?: boolean;
    quietHoursStart?: string;
    quietHoursEnd?: string;
  };
  onSave: (prefs: {
    soundIntensity: SoundIntensity;
    userMode: UserMode;
    muted: boolean;
    channelsEnabled: NotificationChannel[];
    quietHours?: { start: string; end: string } | null;
  }) => void;
}

const INTENSITY_OPTIONS: { value: SoundIntensity; label: string; desc: string }[] = [
  { value: "basic", label: "Básico", desc: "Sonidos cortos y planos" },
  { value: "rich", label: "Rico", desc: "Con armonía y ambiente" },
  { value: "ceremonial", label: "Ceremonial", desc: "Versión épica e inmersiva" },
];

const MODE_OPTIONS: { value: UserMode; label: string; desc: string; icon: typeof User }[] = [
  { value: "turista", label: "Turista", desc: "Eventos, rutas, cultura", icon: Globe },
  { value: "local", label: "Local", desc: "Avisos cívicos, comunidad", icon: User },
  { value: "creator", label: "Creador", desc: "Música, XR, estadísticas", icon: Volume2 },
  { value: "gov", label: "Gobernanza", desc: "Alertas cívicas, seguridad", icon: Bell },
  { value: "default", label: "General", desc: "Configuración estándar", icon: User },
];

const CHANNEL_OPTIONS: { value: NotificationChannel; label: string; icon: typeof Bell }[] = [
  { value: "in_app", label: "In-App", icon: Bell },
  { value: "web_push", label: "Push Web", icon: MessageSquare },
  { value: "email", label: "Email", icon: Mail },
  { value: "sms", label: "SMS", icon: Smartphone },
];

export function NotificationPreferences({ initial, onSave }: NotificationPreferencesProps) {
  const [soundIntensity, setSoundIntensity] = useState<SoundIntensity>(initial?.soundIntensity ?? "basic");
  const [userMode, setUserMode] = useState<UserMode>(initial?.userMode ?? "default");
  const [muted, setMuted] = useState(initial?.muted ?? false);
  const [channelsEnabled, setChannelsEnabled] = useState<NotificationChannel[]>(
    initial?.channelsEnabled ?? ["in_app"],
  );
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(initial?.quietHoursEnabled ?? false);
  const [quietHoursStart, setQuietHoursStart] = useState(initial?.quietHoursStart ?? "22:00");
  const [quietHoursEnd, setQuietHoursEnd] = useState(initial?.quietHoursEnd ?? "07:00");

  const toggleChannel = (ch: NotificationChannel) => {
    setChannelsEnabled((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch],
    );
  };

  const handleSave = () => {
    onSave({
      soundIntensity,
      userMode,
      muted,
      channelsEnabled,
      quietHours: quietHoursEnabled ? { start: quietHoursStart, end: quietHoursEnd } : null,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-card p-6 space-y-6"
    >
      <h3 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
        <Bell className="w-5 h-5 text-electric" />
        Centro de Notificaciones Territoriales
      </h3>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {muted ? <BellOff className="w-4 h-4 text-muted-foreground" /> : <Bell className="w-4 h-4 text-electric" />}
          <span className="text-sm text-foreground">Silenciar todas las notificaciones</span>
        </div>
        <button
          onClick={() => setMuted(!muted)}
          className={`relative w-10 h-5 rounded-full transition-colors ${muted ? "bg-muted" : "bg-electric"}`}
        >
          <div
            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${muted ? "left-0.5" : "left-[22px]"}`}
          />
        </button>
      </div>

      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Intensidad de Sonido
        </label>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {INTENSITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSoundIntensity(opt.value)}
              className={`p-3 rounded-xl text-left text-xs transition-all ${
                soundIntensity === opt.value
                  ? "bg-electric/20 border border-electric/40 text-electric"
                  : "bg-muted/50 border border-transparent text-muted-foreground hover:bg-muted"
              }`}
            >
              <div className="font-semibold">{opt.label}</div>
              <div className="opacity-70 mt-0.5">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Modo de Usuario
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
          {MODE_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                onClick={() => setUserMode(opt.value)}
                className={`p-3 rounded-xl text-left text-xs transition-all ${
                  userMode === opt.value
                    ? "bg-electric/20 border border-electric/40 text-electric"
                    : "bg-muted/50 border border-transparent text-muted-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-4 h-4 mb-1" />
                <div className="font-semibold">{opt.label}</div>
                <div className="opacity-70 mt-0.5">{opt.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Canales Activos
        </label>
        <div className="flex flex-wrap gap-2 mt-2">
          {CHANNEL_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isOn = channelsEnabled.includes(opt.value);
            return (
              <button
                key={opt.value}
                onClick={() => toggleChannel(opt.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all ${
                  isOn
                    ? "bg-electric/20 text-electric border border-electric/30"
                    : "bg-muted/50 text-muted-foreground border border-transparent hover:bg-muted"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Moon className="w-3.5 h-3.5" />
            Horario de Silencio
          </label>
          <button
            onClick={() => setQuietHoursEnabled(!quietHoursEnabled)}
            className={`relative w-10 h-5 rounded-full transition-colors ${quietHoursEnabled ? "bg-electric" : "bg-muted"}`}
          >
            <div
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${quietHoursEnabled ? "left-[22px]" : "left-0.5"}`}
            />
          </button>
        </div>
        {quietHoursEnabled && (
          <div className="flex gap-3 mt-2">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground">Inicio</label>
              <input
                type="time"
                value={quietHoursStart}
                onChange={(e) => setQuietHoursStart(e.target.value)}
                className="w-full mt-1 px-3 py-1.5 rounded-lg bg-muted border border-border text-foreground text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-muted-foreground">Fin</label>
              <input
                type="time"
                value={quietHoursEnd}
                onChange={(e) => setQuietHoursEnd(e.target.value)}
                className="w-full mt-1 px-3 py-1.5 rounded-lg bg-muted border border-border text-foreground text-sm"
              />
            </div>
          </div>
        )}
      </div>

      <button
        onClick={handleSave}
        className="w-full py-2 rounded-xl bg-electric text-white text-sm font-semibold hover:bg-electric/90 transition-colors"
      >
        Guardar Preferencias
      </button>
    </motion.div>
  );
}
