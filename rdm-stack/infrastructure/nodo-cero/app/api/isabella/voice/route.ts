import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { enforceVoiceRateLimit } from '@/lib/isabella/voice/rate-limit';
import { synthesizeIsabellaVoice } from '@/lib/isabella/voice/service';
import { ISABELLA_VOICE_PROFILES } from '@/lib/isabella/voice/contracts';

export const runtime = 'nodejs';

const requestSchema = z.object({
  text: z.string().min(1).max(5000),
  profile: z.enum(ISABELLA_VOICE_PROFILES).optional(),
  priority: z.enum(['critical', 'normal', 'ambient']).optional(),
  federationId: z.string().max(80).optional(),
  allowCloud: z.boolean().default(true),
  userInitiated: z.literal(true),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Solicitud de voz inválida.',
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor?.split(',')[0]?.trim() ?? 'anonymous';

  const limit = await enforceVoiceRateLimit({
    subject: ip,
    authenticated: false,
  });

  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: 'Límite temporal de voz alcanzado.',
        fallback: 'local',
      },
      {
        status: 429,
        headers: {
          'x-ratelimit-remaining': String(limit.remaining),
        },
      },
    );
  }

  const result = await synthesizeIsabellaVoice({
    text: parsed.data.text,
    profile: parsed.data.profile,
    priority: parsed.data.priority,
    federationId: parsed.data.federationId,
    locale: 'es-MX',
    userInitiated: parsed.data.userInitiated,
    allowCloud: parsed.data.allowCloud,
  });

  return NextResponse.json(result, {
    status: result.status === 'error' ? 500 : 200,
    headers: {
      'cache-control': 'no-store',
      'x-ratelimit-remaining': String(limit.remaining),
    },
  });
}
