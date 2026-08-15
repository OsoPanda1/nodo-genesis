import type { IsabellaVoiceProfile } from './contracts';
import { ISABELLA_PROFILES } from './profiles';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function buildIsabellaSsml(
  normalizedText: string,
  profileId: IsabellaVoiceProfile,
): string {
  const profile = ISABELLA_PROFILES[profileId];

  const textWithBreaks = escapeXml(normalizedText)
    .replace(
      /([.!?])\s+/g,
      `$1<break time="${profile.sentencePauseMs}ms"/>`,
    )
    .replace(
      /\n{2,}/g,
      `<break time="${profile.paragraphPauseMs}ms"/>`,
    );

  return [
    '<speak>',
    `<prosody rate="${profile.rate}" pitch="${profile.pitch}">`,
    textWithBreaks,
    '</prosody>',
    '</speak>',
  ].join('');
}
