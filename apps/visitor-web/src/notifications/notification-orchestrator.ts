import type {
  DomainEvent,
  NotificationIntent,
  NotificationPreferences,
  NotificationPayload,
  UserMode,
  NotificationChannel,
} from "./types";
import { resolveSound, getPriorityForEvent } from "./sound-engine";

type EventHandler = (event: DomainEvent) => NotificationIntent[];

class NotificationOrchestrator {
  private handlers = new Map<string, EventHandler[]>();

  on(eventType: string, handler: EventHandler) {
    const handlers = this.handlers.get(eventType) || [];
    handlers.push(handler);
    this.handlers.set(eventType, handlers);
  }

  processEvent(event: DomainEvent): NotificationIntent[] {
    const handlers = this.handlers.get(event.type) || [];
    if (handlers.length === 0) {
      return this.defaultHandler(event);
    }
    return handlers.flatMap((h) => h(event));
  }

  private defaultHandler(event: DomainEvent): NotificationIntent[] {
    const priority = getPriorityForEvent(event.type);
    return [
      {
        id: `nt_${event.aggregate_id}_${Date.now()}`,
        userId: event.user_id || "system",
        eventType: event.type,
        title: formatTitle(event),
        body: formatBody(event),
        priority,
        territories: [event.territory_id],
        channels: ["in_app"],
        soundConfig: {
          eventType: event.type,
          channel: "web",
          userMode: "default",
        },
        createdAt: event.occurred_at,
      },
    ];
  }

  resolveForDelivery(
    intent: NotificationIntent,
    prefs: NotificationPreferences,
  ): (NotificationPayload & { channel: NotificationChannel })[] {
    const results: (NotificationPayload & { channel: NotificationChannel })[] = [];

    for (const channel of intent.channels) {
      if (!prefs.channelsEnabled.includes(channel)) continue;
      if (isInQuietHours(prefs) && !(prefs.allowHighPriorityDuringQuietHours && intent.priority === "high")) continue;

      const sound = resolveSound({
        eventType: intent.eventType,
        channel: mapChannel(channel),
        userMode: prefs.userMode,
        intensityOverride: prefs.soundIntensity !== "basic" ? prefs.soundIntensity : undefined,
      });

      results.push({
        id: intent.id,
        title: intent.title,
        body: intent.body,
        eventType: intent.eventType,
        priority: intent.priority,
        channel,
        soundUrl: sound?.urlPath,
        soundConfig: sound
          ? {
              soundId: sound.soundId,
              intensity: sound.intensity,
              durationMs: sound.durationMs,
              volume: sound.volume,
            }
          : undefined,
        createdAt: intent.createdAt,
      });
    }

    return results;
  }

  generateNotificationIntents(event: DomainEvent): NotificationIntent[] {
    return this.processEvent(event);
  }
}

function mapChannel(ch: NotificationChannel): "web" | "mobile" | "xr" | "email" | "sms" {
  if (ch === "web_push" || ch === "in_app") return "web";
  if (ch === "xr") return "xr";
  if (ch === "email") return "email";
  if (ch === "sms") return "sms";
  return "web";
}

function isInQuietHours(prefs: NotificationPreferences): boolean {
  if (!prefs.quietHours) return false;
  const now = new Date();
  const current = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  return current >= prefs.quietHours.start || current < prefs.quietHours.end;
}

function formatTitle(event: DomainEvent): string {
  const titles: Record<string, string> = {
    "music.track_played": "Reproduciendo",
    "music.playlist_completed": "Lista Completada",
    "event.live_now": "¡En Vivo Ahora!",
    "tour.booking_confirmed": "Reserva Confirmada",
    "mecenas.donation_completed": "Donación Recibida",
    "community.mention_you": "Te Mencionaron",
    "gov.alert_major": "Aviso Importante",
    "system.security_warning": "Alerta de Seguridad",
  };
  return titles[event.type] || "Notificación";
}

function formatBody(event: DomainEvent): string {
  const payload = event.payload;
  if (typeof payload.title === "string") return payload.title;
  if (typeof payload.track_id === "string" || typeof payload.event_id === "string") {
    return `Evento: ${event.type}`;
  }
  return `Nueva actualización de ${event.type}`;
}

export const orchestrator = new NotificationOrchestrator();
