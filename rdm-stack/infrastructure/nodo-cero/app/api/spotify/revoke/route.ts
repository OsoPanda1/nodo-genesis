import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { clearSpotifySession } from '@/lib/spotify/token-store';

export const runtime = 'nodejs';

/* ------------------------------------------------------------------ */
/* POST /api/spotify/revoke — cierra la sesión de Spotify del Nodo     */
/* ------------------------------------------------------------------ */

export const POST = guardedRoute<Record<string, never>>(
  {
    route: 'api:spotify:revoke',
    methods: ['POST'],
    rateLimit: 10,
    cacheControl: 'no-store',
  },
  async () => {
    clearSpotifySession();
    return NextResponse.json({ ok: true });
  },
);
