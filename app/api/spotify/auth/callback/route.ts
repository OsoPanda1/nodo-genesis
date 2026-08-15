import { NextRequest, NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { spotifyCallbackSchema, spotifyProfileSchema } from '@/lib/spotify/contracts';
import { exchangeCodeForToken } from '@/lib/spotify/client';
import { tokenFromResponse, setSpotifySession, clearSpotifySession } from '@/lib/spotify/token-store';
import { consumeVerifier } from '../url/route';

export const runtime = 'nodejs';

/* ------------------------------------------------------------------ */
/* GET /api/spotify/auth/callback — redirección desde Spotify          */
/* ------------------------------------------------------------------ */
/* Spotify devuelve `code` + `state` tras el consentimiento del        */
/* usuario. El servidor recupera el code_verifier por `state`, canjea  */
/* el token y guarda la sesión. En producción, la URI de redirección   */
/* registrada es https://www.visitarealdelmonte.online/api/spotify/auth/ */
/* callback (originRequired=false: es una navegación del navegador,    */
/* no una llamada API con origen canónico).                            */
/* ------------------------------------------------------------------ */

export const GET = guardedRoute<Record<string, never>>(
  {
    route: 'api:spotify:auth:callback',
    methods: ['GET'],
    rateLimit: 10,
    originRequired: false,
    json: false,
    cacheControl: 'no-store',
    hardenHeaders: false,
  },
  async ({ req }) => {
    const search = req.nextUrl.searchParams;
    const parsed = spotifyCallbackSchema.safeParse({
      code: search.get('code') ?? '',
      state: search.get('state') ?? '',
    });
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: 'INVALID_CALLBACK' }, { status: 400 });
    }

    const verifier = consumeVerifier(parsed.data.state);
    if (!verifier) {
      clearSpotifySession();
      return NextResponse.json({ ok: false, error: 'UNKNOWN_STATE' }, { status: 403 });
    }

    const exchanged = await exchangeCodeForToken(parsed.data.code, verifier);
    if (!exchanged.ok) {
      clearSpotifySession();
      return NextResponse.json({ ok: false, error: exchanged.error }, { status: 502 });
    }

    const profile = await fetchProfileWith(exchanged.token.access_token);
    if (!profile.ok) {
      return NextResponse.json({ ok: false, error: profile.error }, { status: 502 });
    }

    const session = tokenFromResponse(exchanged.token, profile.data.id, profile.data.display_name ?? null);
    setSpotifySession(session);

    return NextResponse.json({
      ok: true,
      profile: {
        id: profile.data.id,
        display_name: profile.data.display_name,
        email: profile.data.email,
      },
    });
  },
);

async function fetchProfileWith(accessToken: string) {
  const res = await fetch('https://api.spotify.com/v1/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return { ok: false as const, error: `PROFILE_HTTP_${res.status}` };
  const data = await res.json();
  const parsed = spotifyProfileSchema.safeParse(data);
  if (!parsed.success) return { ok: false as const, error: 'PROFILE_INVALID_RESPONSE' };
  return { ok: true as const, data: parsed.data };
}
