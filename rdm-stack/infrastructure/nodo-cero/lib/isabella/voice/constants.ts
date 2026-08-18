export const ISABELLA_VOICE_VERSION =
  process.env.ISABELLA_VOICE_VERSION ?? 'isabella-voice-1.0.0';

export const ISABELLA_VOICE_BUCKET =
  process.env.ISABELLA_VOICE_BUCKET ?? 'isabella-voice-cache';

export const ISABELLA_VOICE_MAX_CHARS = Number(
  process.env.ISABELLA_VOICE_MAX_CHARS ?? 1800,
);

export const ISABELLA_SIGNED_URL_TTL_SECONDS = Number(
  process.env.ISABELLA_VOICE_SIGNED_URL_TTL_SECONDS ?? 900,
);
