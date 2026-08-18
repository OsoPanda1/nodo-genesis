import { redis } from '@/lib/cache/redis';

export async function enforceVoiceRateLimit(input: {
  subject: string;
  authenticated: boolean;
}): Promise<{ allowed: boolean; remaining: number }> {
  const max = Number(
    input.authenticated
      ? process.env.ISABELLA_VOICE_RATE_LIMIT_AUTH ?? 30
      : process.env.ISABELLA_VOICE_RATE_LIMIT_ANON ?? 10,
  );

  const windowSeconds = 60;
  const key = `isabella:voice:rate:${input.subject}:${Math.floor(Date.now() / 60_000)}`;

  const attempts = await redis.increment(key, windowSeconds);

  return {
    allowed: attempts <= max,
    remaining: Math.max(0, max - attempts),
  };
}
