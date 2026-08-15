import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getCorsHeaders } from './_shared/cors';
import { emitTelemetry } from './_shared/telemetry';

const TTS_API_URL = 'https://texttospeech.googleapis.com/v1/text:synthesize';
const TTS_LANGUAGE = 'es-MX';
const TTS_VOICE = 'es-MX-Wavenet-A';
const TTS_SPEAKING_RATE = 0.95;
const TTS_PITCH = -1.0;

function buildTtsRequest(text: string): object {
  return {
    input: { text },
    voice: { languageCode: TTS_LANGUAGE, name: TTS_VOICE },
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: TTS_SPEAKING_RATE,
      pitch: TTS_PITCH,
      effectsProfileId: ['handset-class-device'],
    },
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = (req.headers.origin as string | undefined) ?? null;
  const cors = getCorsHeaders(origin);
  Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GOOGLE_TTS_API_KEY;

  if (!apiKey) {
    emitTelemetry({
      level: "warn",
      message: "Isabella TTS: GOOGLE_TTS_API_KEY missing; bypassing cloud synthesis.",
    });
    return res.status(200).json({
      provider: 'internal',
      audioContent: null,
      voice: TTS_VOICE,
      mp3SizeBytes: 0,
      notice: 'No API key configured; returning empty audio.',
    });
  }

  try {
    const { text } = req.body as { text?: string };

    if (!text || typeof text !== 'string' || text.length === 0) {
      return res.status(400).json({ error: 'Text is required for synthesis.' });
    }

    const requestBody = buildTtsRequest(text);

    const response = await fetch(`${TTS_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorContext = await response.text();
      emitTelemetry({
        level: "error",
        message: `Google TTS API error [${response.status}]`,
        data: { snippet: errorContext.slice(0, 200) },
      });
      return res.status(502).json({
        error: 'External TTS synthesis failed.',
        provider: 'google-tts',
        code: `TTS_ERROR_${response.status}`,
      });
    }

    const data = await response.json();

    return res.status(200).json({
      provider: 'google-tts',
      voice: TTS_VOICE,
      audioContent: data.audioContent,
      mp3SizeBytes: data.audioContent ? Math.round((data.audioContent.length * 3) / 4) : 0,
    });
  } catch (err) {
    emitTelemetry({
      level: "error",
      message: "Isabella TTS: critical connection failure",
      data: { error: err instanceof Error ? err.message : 'unknown' },
    });
    return res.status(500).json({ error: 'TTS synthesis failed due to a connection error.' });
  }
}
