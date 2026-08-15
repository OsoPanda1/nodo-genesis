import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { publicPlaybackToken, transferPlayback } from '@/lib/spotify/client';
import { z } from 'zod';

export const runtime = 'nodejs';

const transferSchema = z.object({
  deviceId: z.string().trim().min(8).max(128),
});

/* ------------------------------------------------------------------ */
/* GET /api/spotify/player/token — token para el Web Playback SDK      */
/* ------------------------------------------------------------------ */
/* Devuelve SOLO el access token vigente con scope `streaming`. El     */
/* cliente lo usa para instanciar el SDK (Web Playback SDK de Spotify  */
/* requiere el token del lado del navegador). Nunca devuelve el        */
/* refresh token ni el secreto.                                        */
/* ------------------------------------------------------------------ */

export const GET = guardedRoute<Record<string, never>>(
  {
    route: 'api:spotify:player:token',
    methods: ['GET'],
    rateLimit: 15,
    json: false,
    cacheControl: 'no-store',
  },
  async () => {
    const token = publicPlaybackToken();
    if (!token.ok) {
      return NextResponse.json({ ok: false, error: token.error }, { status: 403 });
    }
    return NextResponse.json({ ok: true, token: token.token });
  },
);

/* ------------------------------------------------------------------ */
/* POST /api/spotify/player/transfer — activa el dispositivo del SDK   */
/* ------------------------------------------------------------------ */

export const POST = guardedRoute<z.infer<typeof transferSchema>>(
  {
    route: 'api:spotify:player:transfer',
    methods: ['POST'],
    rateLimit: 15,
    schema: transferSchema,
    cacheControl: 'no-store',
  },
  async ({ body }) => {
    const result = await transferPlayback(body.deviceId);
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  },
);
