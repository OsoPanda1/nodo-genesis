import { describe, expect, it } from 'vitest';
import { buildVoiceCacheKey } from '@/lib/isabella/voice/cache-key';

describe('buildVoiceCacheKey', () => {
  it('produce la misma clave para la misma entrada', () => {
    const input = {
      normalizedText: 'Bienvenida a Real del Monte.',
      profile: 'isabella.welcome' as const,
      provider: 'google',
      voiceId: 'es-MX-Neural2-A',
      locale: 'es-MX' as const,
      format: 'mp3' as const,
    };

    expect(buildVoiceCacheKey(input)).toBe(buildVoiceCacheKey(input));
  });

  it('cambia clave si cambia el perfil', () => {
    const base = {
      normalizedText: 'Atención.',
      provider: 'google',
      voiceId: 'es-MX-Neural2-A',
      locale: 'es-MX' as const,
      format: 'mp3' as const,
    };

    expect(
      buildVoiceCacheKey({ ...base, profile: 'isabella.default' }),
    ).not.toBe(buildVoiceCacheKey({ ...base, profile: 'isabella.alert' }));
  });
});
