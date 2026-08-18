import type { SoundIntensity, UserMode, SoundMetadata } from "./types";
import { soundManifest, getSoundById } from "./sound-registry";

interface ResolveSoundOptions {
  eventType: string;
  channel: "web" | "mobile" | "xr" | "email" | "sms";
  userMode: UserMode;
  intensityOverride?: SoundIntensity;
}

export interface ResolvedSound {
  soundId: string;
  urlPath: string;
  intensity: SoundIntensity;
  durationMs: number;
  volume: number;
}

const INTENSITY_FALLBACKS: Record<SoundIntensity, SoundIntensity[]> = {
  ceremonial: ["ceremonial", "rich", "basic"],
  rich: ["rich", "basic"],
  basic: ["basic"],
};

export function resolveSound(options: ResolveSoundOptions): ResolvedSound | null {
  const rule = soundManifest.mapping.find(
    (m) =>
      m.eventType === options.eventType &&
      m.channel === options.channel &&
      m.userMode === options.userMode,
  );

  if (!rule) {
    const fallbackRule = soundManifest.mapping.find(
      (m) =>
        m.eventType === options.eventType && m.channel === options.channel && m.userMode === "default",
    );
    if (!fallbackRule) return null;
    return resolveSoundFromRule(fallbackRule, options.intensityOverride);
  }

  return resolveSoundFromRule(rule, options.intensityOverride);
}

function resolveSoundFromRule(
  rule: typeof soundManifest.mapping[number],
  intensityOverride?: SoundIntensity,
): ResolvedSound | null {
  const targetIntensity = intensityOverride || rule.intensityOverride || "basic";
  const candidates = INTENSITY_FALLBACKS[targetIntensity];

  for (const intensity of candidates) {
    const fileName = `${rule.soundId}_${intensity}.ogg`;
    const sound = findSoundByFileName(fileName);
    if (sound) {
      return {
        soundId: rule.soundId,
        urlPath: sound.urlPath,
        intensity: intensity as SoundIntensity,
        durationMs: sound.durationMs,
        volume: sound.defaultVolume,
      };
    }
  }

  const baseSound = getSoundById(rule.soundId);
  if (!baseSound) return null;

  return {
    soundId: rule.soundId,
    urlPath: baseSound.urlPath,
    intensity: "basic" as SoundIntensity,
    durationMs: baseSound.durationMs,
    volume: baseSound.defaultVolume,
  };
}

function findSoundByFileName(fileName: string): SoundMetadata | undefined {
  return soundManifest.sounds.find((s) => s.fileName === fileName);
}

export function resolveActualSound(
  eventType: string,
  channel: "web" | "mobile" | "xr" | "email" | "sms" = "web",
  userMode: UserMode = "default",
): ResolvedSound {
  const resolved = resolveSound({ eventType, channel, userMode });
  if (resolved) return resolved;

  return {
    soundId: "legacy-info",
    urlPath: "/assets/notificaciones/notificacion2.mp3",
    intensity: "basic",
    durationMs: 800,
    volume: 0.5,
  };
}

export function getPriorityForEvent(eventType: string): "low" | "normal" | "high" {
  const highPriority = [
    "event.live_now",
    "gov.alert_major",
    "system.security_warning",
    "event.spot_lost",
    "mecenas.tier_upgraded",
  ];
  const lowPriority = [
    "system.update_available",
    "digest.daily_summary",
    "community.new_message",
    "music.track_played",
  ];

  if (highPriority.includes(eventType)) return "high";
  if (lowPriority.includes(eventType)) return "low";
  return "normal";
}
