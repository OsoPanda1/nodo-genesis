import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { isSpotifyConfigured, getSpotifySession } from '@/lib/spotify/token-store';

export const runtime = 'nodejs';

/* ------------------------------------------------------------------ */
/* GET /api/spotify/status — estado de la integración con Spotify      */
/* ------------------------------------------------------------------ */
/* Informa si Spotify está configurado (credenciales) y si hay sesión  */
/* autorizada. El cliente lo usa para decidir entre el botón "Conectar"*/
/* y el panel de datos. Nunca expone tokens.                           */
/* ------------------------------------------------------------------ */

export const GET = guardedRoute<Record<string, never>>(
  {
    route: 'api:spotify:status',
    methods: ['GET'],
    rateLimit: 30,
    json: false,
    cacheControl: 'no-store',
  },
  async () => {
    const session = getSpotifySession();
    const connected = session !== null && session.expiresAt > Date.now();
    return NextResponse.json({
      ok: true,
      configured: isSpotifyConfigured(),
      connected,
      profileId: session?.profileId ?? null,
      profileName: session?.profileName ?? null,
    });
  },
);
