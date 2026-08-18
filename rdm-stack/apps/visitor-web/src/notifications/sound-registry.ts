import type { SoundManifest, SoundMetadata, SoundMappingRule } from "./types";

const SOUND_BASE = "/assets/sounds/rdm-notify";
const LEGACY_BASE = "/assets/notificaciones";

export const legacySounds: SoundMetadata[] = [
  {
    id: "legacy-success",
    fileName: "notificacion1.mp3",
    urlPath: `${LEGACY_BASE}/notificacion1.mp3`,
    category: "digest",
    intensity: "basic",
    durationMs: 1200,
    maxReplayIntervalSec: 10,
    defaultVolume: 0.5,
    tags: ["success", "descending"],
    locale: "es-MX",
  },
  {
    id: "legacy-info",
    fileName: "notificacion2.mp3",
    urlPath: `${LEGACY_BASE}/notificacion2.mp3`,
    category: "music",
    intensity: "basic",
    durationMs: 800,
    maxReplayIntervalSec: 5,
    defaultVolume: 0.45,
    tags: ["info", "chime"],
    locale: "es-MX",
  },
  {
    id: "legacy-warning",
    fileName: "notificacion3.mp3",
    urlPath: `${LEGACY_BASE}/notificacion3.mp3`,
    category: "gov",
    intensity: "basic",
    durationMs: 600,
    maxReplayIntervalSec: 15,
    defaultVolume: 0.55,
    tags: ["warning", "beep"],
    locale: "es-MX",
  },
  {
    id: "legacy-event",
    fileName: "notificacion4.mp3",
    urlPath: `${LEGACY_BASE}/notificacion4.mp3`,
    category: "event",
    intensity: "basic",
    durationMs: 1000,
    maxReplayIntervalSec: 8,
    defaultVolume: 0.5,
    tags: ["event", "territorial"],
    locale: "es-MX",
  },
];

const LEGACY_FALLBACK: Record<string, string> = {
  success: "legacy-success",
  error: "legacy-warning",
  warning: "legacy-warning",
  info: "legacy-info",
  event: "legacy-event",
  food: "legacy-info",
  place: "legacy-event",
  message: "legacy-info",
};

export const soundManifest: SoundManifest = {
  sounds: [
    {
      id: "music-track-played",
      fileName: "music-track-played_basic.ogg",
      urlPath: `${SOUND_BASE}/core/music-track-played_basic.ogg`,
      category: "music",
      intensity: "basic",
      durationMs: 800,
      maxReplayIntervalSec: 10,
      defaultVolume: 0.6,
      tags: ["soft", "warm", "intro"],
      locale: "es-MX",
    },
    {
      id: "music-playlist-completed",
      fileName: "music-playlist-completed_basic.ogg",
      urlPath: `${SOUND_BASE}/core/music-playlist-completed_basic.ogg`,
      category: "music",
      intensity: "basic",
      durationMs: 1200,
      maxReplayIntervalSec: 30,
      defaultVolume: 0.6,
      tags: ["ascending", "bright", "achievement"],
      locale: "es-MX",
    },
    {
      id: "music-new-release-local",
      fileName: "music-new-release-local_basic.ogg",
      urlPath: `${SOUND_BASE}/core/music-new-release-local_basic.ogg`,
      category: "music",
      intensity: "basic",
      durationMs: 600,
      maxReplayIntervalSec: 60,
      defaultVolume: 0.5,
      tags: ["chime", "short", "highlight"],
      locale: "es-MX",
    },
    {
      id: "event-live-now",
      fileName: "event-live-now_web.ogg",
      urlPath: `${SOUND_BASE}/mix/event-live-now_web.ogg`,
      category: "event",
      intensity: "basic",
      durationMs: 1000,
      maxReplayIntervalSec: 30,
      defaultVolume: 0.65,
      tags: ["drum", "metal", "urgent"],
      locale: "es-MX",
    },
    {
      id: "event-reminder-30min",
      fileName: "event-reminder-30min_basic.ogg",
      urlPath: `${SOUND_BASE}/core/event-reminder-30min_basic.ogg`,
      category: "event",
      intensity: "basic",
      durationMs: 500,
      maxReplayIntervalSec: 120,
      defaultVolume: 0.4,
      tags: ["click", "rhythmic", "steps"],
      locale: "es-MX",
    },
    {
      id: "event-spot-lost",
      fileName: "event-spot-lost_basic.ogg",
      urlPath: `${SOUND_BASE}/core/event-spot-lost_basic.ogg`,
      category: "event",
      intensity: "basic",
      durationMs: 700,
      maxReplayIntervalSec: 30,
      defaultVolume: 0.55,
      tags: ["descending", "quick", "alert"],
      locale: "es-MX",
    },
    {
      id: "tour-booking-confirmed",
      fileName: "tour-booking-confirmed_basic.ogg",
      urlPath: `${SOUND_BASE}/core/tour-booking-confirmed_basic.ogg`,
      category: "tour",
      intensity: "basic",
      durationMs: 900,
      maxReplayIntervalSec: 30,
      defaultVolume: 0.6,
      tags: ["major", "warm", "marimba", "success"],
      locale: "es-MX",
    },
    {
      id: "tour-checkin-open",
      fileName: "tour-checkin-open_basic.ogg",
      urlPath: `${SOUND_BASE}/core/tour-checkin-open_basic.ogg`,
      category: "tour",
      intensity: "basic",
      durationMs: 600,
      maxReplayIntervalSec: 60,
      defaultVolume: 0.45,
      tags: ["binaural", "soft", "pulse"],
      locale: "es-MX",
    },
    {
      id: "xr-session-started",
      fileName: "xr-session-started_basic.ogg",
      urlPath: `${SOUND_BASE}/core/xr-session-started_basic.ogg`,
      category: "xr",
      intensity: "basic",
      durationMs: 1500,
      maxReplayIntervalSec: 30,
      defaultVolume: 0.7,
      tags: ["glitch", "spatial", "ambient"],
      locale: "es-MX",
    },
    {
      id: "xr-asset-unlocked",
      fileName: "xr-asset-unlocked_basic.ogg",
      urlPath: `${SOUND_BASE}/core/xr-asset-unlocked_basic.ogg`,
      category: "xr",
      intensity: "basic",
      durationMs: 1100,
      maxReplayIntervalSec: 10,
      defaultVolume: 0.6,
      tags: ["crystal", "chime", "reward"],
      locale: "es-MX",
    },
    {
      id: "mecenas-donation-completed",
      fileName: "mecenas-donation-completed_basic.ogg",
      urlPath: `${SOUND_BASE}/core/mecenas-donation-completed_basic.ogg`,
      category: "mecenas",
      intensity: "basic",
      durationMs: 1400,
      maxReplayIntervalSec: 30,
      defaultVolume: 0.65,
      tags: ["melodic", "bell", "gratitude"],
      locale: "es-MX",
    },
    {
      id: "mecenas-tier-upgraded",
      fileName: "mecenas-tier-upgraded_basic.ogg",
      urlPath: `${SOUND_BASE}/core/mecenas-tier-upgraded_basic.ogg`,
      category: "mecenas",
      intensity: "basic",
      durationMs: 1600,
      maxReplayIntervalSec: 60,
      defaultVolume: 0.7,
      tags: ["ascending", "sub-bass", "prestige"],
      locale: "es-MX",
    },
    {
      id: "community-new-message",
      fileName: "community-new-message_basic.ogg",
      urlPath: `${SOUND_BASE}/core/community-new-message_basic.ogg`,
      category: "community",
      intensity: "basic",
      durationMs: 300,
      maxReplayIntervalSec: 5,
      defaultVolume: 0.35,
      tags: ["pop", "soft", "social"],
      locale: "es-MX",
    },
    {
      id: "community-mention-you",
      fileName: "community-mention-you_basic.ogg",
      urlPath: `${SOUND_BASE}/core/community-mention-you_basic.ogg`,
      category: "community",
      intensity: "basic",
      durationMs: 400,
      maxReplayIntervalSec: 10,
      defaultVolume: 0.5,
      tags: ["pop", "accent", "mention"],
      locale: "es-MX",
    },
    {
      id: "gov-alert-minor",
      fileName: "gov-alert-minor_basic.ogg",
      urlPath: `${SOUND_BASE}/core/gov-alert-minor_basic.ogg`,
      category: "gov",
      intensity: "basic",
      durationMs: 400,
      maxReplayIntervalSec: 60,
      defaultVolume: 0.5,
      tags: ["beep", "neutral", "civic"],
      locale: "es-MX",
    },
    {
      id: "gov-alert-major",
      fileName: "gov-alert-major_basic.ogg",
      urlPath: `${SOUND_BASE}/core/gov-alert-major_basic.ogg`,
      category: "gov",
      intensity: "basic",
      durationMs: 800,
      maxReplayIntervalSec: 120,
      defaultVolume: 0.65,
      tags: ["double-beep", "important", "civic"],
      locale: "es-MX",
    },
    {
      id: "system-security-warning",
      fileName: "system-security-warning_basic.ogg",
      urlPath: `${SOUND_BASE}/core/system-security-warning_basic.ogg`,
      category: "system",
      intensity: "basic",
      durationMs: 600,
      maxReplayIntervalSec: 30,
      defaultVolume: 0.7,
      tags: ["low", "triple", "serious"],
      locale: "es-MX",
    },
    {
      id: "system-update-available",
      fileName: "system-update-available_basic.ogg",
      urlPath: `${SOUND_BASE}/core/system-update-available_basic.ogg`,
      category: "system",
      intensity: "basic",
      durationMs: 400,
      maxReplayIntervalSec: 300,
      defaultVolume: 0.4,
      tags: ["chime", "minimal", "info"],
      locale: "es-MX",
    },
    {
      id: "account-login-new-device",
      fileName: "account-login-new-device_basic.ogg",
      urlPath: `${SOUND_BASE}/core/account-login-new-device_basic.ogg`,
      category: "system",
      intensity: "basic",
      durationMs: 500,
      maxReplayIntervalSec: 60,
      defaultVolume: 0.6,
      tags: ["contrast", "security", "two-notes"],
      locale: "es-MX",
    },
    {
      id: "digest-daily-summary",
      fileName: "digest-daily-summary_basic.ogg",
      urlPath: `${SOUND_BASE}/core/digest-daily-summary_basic.ogg`,
      category: "digest",
      intensity: "basic",
      durationMs: 2000,
      maxReplayIntervalSec: 600,
      defaultVolume: 0.5,
      tags: ["marimba", "long-fade", "daily"],
      locale: "es-MX",
    },
  ],

  mapping: [
    { eventType: "music.track_played", channel: "web", userMode: "default", soundId: "music-track-played" },
    { eventType: "music.track_played", channel: "web", userMode: "creator", soundId: "music-track-played" },
    { eventType: "music.playlist_completed", channel: "web", userMode: "default", soundId: "music-playlist-completed" },
    { eventType: "music.new_release_local", channel: "web", userMode: "default", soundId: "music-new-release-local" },
    { eventType: "event.live_now", channel: "web", userMode: "default", soundId: "event-live-now" },
    { eventType: "event.live_now", channel: "xr", userMode: "default", soundId: "event-live-now" },
    { eventType: "event.reminder_30min", channel: "web", userMode: "default", soundId: "event-reminder-30min" },
    { eventType: "event.spot_lost", channel: "web", userMode: "default", soundId: "event-spot-lost" },
    { eventType: "tour.booking_confirmed", channel: "web", userMode: "default", soundId: "tour-booking-confirmed" },
    { eventType: "tour.checkin_open", channel: "web", userMode: "turista", soundId: "tour-checkin-open" },
    { eventType: "xr.session_started", channel: "xr", userMode: "default", soundId: "xr-session-started" },
    { eventType: "xr.asset_unlocked", channel: "xr", userMode: "default", soundId: "xr-asset-unlocked" },
    { eventType: "mecenas.donation_completed", channel: "web", userMode: "default", soundId: "mecenas-donation-completed" },
    { eventType: "mecenas.tier_upgraded", channel: "web", userMode: "default", soundId: "mecenas-tier-upgraded" },
    { eventType: "community.new_message", channel: "web", userMode: "default", soundId: "community-new-message" },
    { eventType: "community.mention_you", channel: "web", userMode: "default", soundId: "community-mention-you" },
    { eventType: "gov.alert_minor", channel: "web", userMode: "default", soundId: "gov-alert-minor" },
    { eventType: "gov.alert_major", channel: "web", userMode: "default", soundId: "gov-alert-major" },
    { eventType: "gov.alert_major", channel: "web", userMode: "gov", intensityOverride: "rich", soundId: "gov-alert-major" },
    { eventType: "system.security_warning", channel: "web", userMode: "default", soundId: "system-security-warning" },
    { eventType: "system.update_available", channel: "web", userMode: "default", soundId: "system-update-available" },
    { eventType: "account.login_new_device", channel: "web", userMode: "default", soundId: "account-login-new-device" },
    { eventType: "digest.daily_summary", channel: "web", userMode: "default", soundId: "digest-daily-summary" },
  ],
};

export function getSoundById(id: string): SoundMetadata | undefined {
  return soundManifest.sounds.find((s) => s.id === id);
}

export function getSoundsByCategory(category: string): SoundMetadata[] {
  return soundManifest.sounds.filter((s) => s.category === category);
}

export function getMappingsForEvent(eventType: string): SoundMappingRule[] {
  return soundManifest.mapping.filter((m) => m.eventType === eventType);
}

export function getLegacyFallback(notificationType: string): SoundMetadata | undefined {
  const soundId = LEGACY_FALLBACK[notificationType];
  if (!soundId) return undefined;
  return legacySounds.find((s) => s.id === soundId);
}

export function resolveSoundPath(soundId: string, intensity: string = "basic"): string {
  const target = `${soundId}_${intensity}.ogg`;
  const manifest = soundManifest.sounds.find((s) => s.fileName === target);
  if (manifest) return manifest.urlPath;
  return `${SOUND_BASE}/core/${target}`;
}

const SOUND_TO_LEGACY: Record<string, string> = {
  "music-track-played": "legacy-info",
  "music-playlist-completed": "legacy-success",
  "music-new-release-local": "legacy-info",
  "event-live-now": "legacy-event",
  "event-reminder-30min": "legacy-event",
  "event-spot-lost": "legacy-warning",
  "tour-booking-confirmed": "legacy-success",
  "tour-checkin-open": "legacy-info",
  "xr-session-started": "legacy-event",
  "xr-asset-unlocked": "legacy-success",
  "mecenas-donation-completed": "legacy-success",
  "mecenas-tier-upgraded": "legacy-success",
  "community-new-message": "legacy-info",
  "community-mention-you": "legacy-info",
  "gov-alert-minor": "legacy-info",
  "gov-alert-major": "legacy-warning",
  "system-security-warning": "legacy-warning",
  "system-update-available": "legacy-info",
  "account-login-new-device": "legacy-warning",
  "digest-daily-summary": "legacy-success",
};

export function getActualSoundUrl(soundId: string): string {
  const manifestSound = soundManifest.sounds.find((s) => s.id === soundId);
  if (manifestSound) return manifestSound.urlPath;

  const legacyId = SOUND_TO_LEGACY[soundId];
  if (legacyId) {
    const legacy = legacySounds.find((s) => s.id === legacyId);
    if (legacy) return legacy.urlPath;
  }

  return `${LEGACY_BASE}/notificacion2.mp3`;
}
