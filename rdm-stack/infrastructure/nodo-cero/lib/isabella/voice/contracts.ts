export const ISABELLA_VOICE_PROFILES = [
  'isabella.default',
  'isabella.welcome',
  'isabella.guide',
  'isabella.civic',
  'isabella.alert',
  'isabella.commerce',
  'isabella.education',
  'isabella.accessibility',
] as const;

export type IsabellaVoiceProfile = (typeof ISABELLA_VOICE_PROFILES)[number];

export const ISABELLA_VOICE_PRIORITIES = [
  'critical',
  'normal',
  'ambient',
] as const;

export type IsabellaVoicePriority =
  (typeof ISABELLA_VOICE_PRIORITIES)[number];

export type IsabellaVoiceMode = 'cloud' | 'local' | 'text';

export interface IsabellaVoiceRequest {
  requestId?: string;
  text: string;
  profile?: IsabellaVoiceProfile;
  priority?: IsabellaVoicePriority;
  locale?: 'es-MX';
  federationId?: string;
  userInitiated: boolean;
  allowCloud: boolean;
}

export interface IsabellaVoiceResponse {
  requestId: string;
  status: 'ready' | 'blocked' | 'fallback' | 'error';
  mode: IsabellaVoiceMode;
  normalizedText: string;
  profile: IsabellaVoiceProfile;
  audioUrl?: string;
  cacheHit: boolean;
  durationMs?: number;
  voiceVersion: string;
  reason?: string;
}

export interface IsabellaAudioClip {
  id: string;
  mode: IsabellaVoiceMode;
  priority: IsabellaVoicePriority;
  text: string;
  audioUrl?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
}
