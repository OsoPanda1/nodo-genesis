export type NotificationPriority = "low" | "normal" | "high";

export type SoundIntensity = "basic" | "rich" | "ceremonial";

export type UserMode = "turista" | "local" | "creator" | "gov" | "default";

export type NotificationChannel =
  | "web_push"
  | "in_app"
  | "email"
  | "sms"
  | "xr";

export type SoundCategory =
  | "music"
  | "event"
  | "tour"
  | "xr"
  | "mecenas"
  | "community"
  | "gov"
  | "system"
  | "digest";

export interface SoundMetadata {
  id: string;
  fileName: string;
  urlPath: string;
  category: SoundCategory;
  intensity: SoundIntensity;
  durationMs: number;
  maxReplayIntervalSec: number;
  defaultVolume: number;
  tags: string[];
  locale: "es-MX";
}

export interface SoundMappingRule {
  eventType: string;
  channel: "web" | "mobile" | "xr" | "email" | "sms";
  userMode: UserMode;
  intensityOverride?: SoundIntensity;
  soundId: string;
}

export interface NotificationIntent {
  id: string;
  userId: string;
  eventType: string;
  title: string;
  body: string;
  priority: NotificationPriority;
  territories: string[];
  channels: NotificationChannel[];
  soundConfig?: {
    eventType: string;
    channel: "web" | "mobile" | "xr" | "email" | "sms";
    userMode: UserMode;
  };
  createdAt: string;
}

export interface NotificationPreferences {
  userId: string;
  channelsEnabled: NotificationChannel[];
  soundIntensity: SoundIntensity;
  userMode: UserMode;
  quietHours?: {
    start: string;
    end: string;
  };
  allowHighPriorityDuringQuietHours: boolean;
}

export interface NotificationPayload {
  id: string;
  title: string;
  body: string;
  eventType: string;
  priority: NotificationPriority;
  soundUrl?: string;
  soundConfig?: {
    soundId: string;
    intensity: SoundIntensity;
    durationMs: number;
    volume: number;
  };
  createdAt: string;
}

export interface DomainEvent {
  type: string;
  aggregate_id: string;
  territory_id: string;
  user_id: string | null;
  payload: Record<string, unknown>;
  occurred_at: string;
}

export interface SoundManifest {
  sounds: SoundMetadata[];
  mapping: SoundMappingRule[];
}
