import { createHash } from 'node:crypto';
import { ISABELLA_VOICE_VERSION } from './constants';
import type { IsabellaVoiceProfile } from './contracts';

export interface VoiceCacheKeyInput {
  normalizedText: string;
  profile: IsabellaVoiceProfile;
  provider: string;
  voiceId: string;
  locale: 'es-MX';
  format: 'mp3';
}

export function buildVoiceCacheKey(input: VoiceCacheKeyInput): string {
  const payload = JSON.stringify({
    text: input.normalizedText,
    profile: input.profile,
    provider: input.provider,
    voiceId: input.voiceId,
    locale: input.locale,
    format: input.format,
    voiceVersion: ISABELLA_VOICE_VERSION,
  });

  return createHash('sha256').update(payload).digest('hex');
}
