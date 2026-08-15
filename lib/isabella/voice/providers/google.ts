import type {
  TtsProvider,
  TtsSynthesisInput,
  TtsSynthesisResult,
} from './types';

export class GoogleTtsProvider implements TtsProvider {
  readonly name = 'google';
  readonly voiceId =
    process.env.GOOGLE_CLOUD_TTS_VOICE_NAME ?? 'es-MX-Neural2-A';

  async synthesize(input: TtsSynthesisInput): Promise<TtsSynthesisResult> {
    const apiKey = process.env.GOOGLE_CLOUD_TTS_API_KEY;

    if (!apiKey) {
      throw new Error('Falta GOOGLE_CLOUD_TTS_API_KEY.');
    }

    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          input: { ssml: input.ssml },
          voice: {
            languageCode: input.locale,
            name: this.voiceId,
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 1,
            pitch: 0,
          },
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Google TTS respondió ${response.status}.`);
    }

    const payload = (await response.json()) as { audioContent?: string };

    if (!payload.audioContent) {
      throw new Error('Google TTS no devolvió audioContent.');
    }

    return {
      audio: Uint8Array.from(Buffer.from(payload.audioContent, 'base64')),
      contentType: 'audio/mpeg',
      provider: this.name,
      voiceId: this.voiceId,
    };
  }
}
