import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { fetchProfile, fetchRecentlyPlayed, fetchPlaylists, fetchPlayback } from '@/lib/spotify/client';

export const runtime = 'nodejs';

/* ------------------------------------------------------------------ */
/* GET /api/spotify/overview — datos agregados del usuario             */
/* ------------------------------------------------------------------ */
/* Perfil, historial reciente, listas y estado de reproducción en una  */
/* sola llamada para el panel multimedia del Nodo. Cada fetch refresca */
/* el access token si hace falta (fail-closed ante sesión vencida).    */
/* ------------------------------------------------------------------ */

export const GET = guardedRoute<Record<string, never>>(
  {
    route: 'api:spotify:overview',
    methods: ['GET'],
    rateLimit: 20,
    json: false,
    cacheControl: 'no-store',
  },
  async () => {
    const [profile, history, playlists, playback] = await Promise.all([
      fetchProfile(),
      fetchRecentlyPlayed(20),
      fetchPlaylists(20),
      fetchPlayback(),
    ]);

    if (!profile.ok) {
      return NextResponse.json({ ok: false, error: profile.error }, { status: profile.status ?? 502 });
    }

    return NextResponse.json({
      ok: true,
      profile: profile.ok ? profile.data : null,
      history: history.ok ? history.data.items : [],
      playlists: playlists.ok ? playlists.data.items : [],
      playback: playback.ok ? playback.data : null,
      warnings: [
        ...(history.ok ? [] : [{ domain: 'history', error: history.error }]),
        ...(playlists.ok ? [] : [{ domain: 'playlists', error: playlists.error }]),
        ...(playback.ok ? [] : [{ domain: 'playback', error: playback.error }]),
      ],
    });
  },
);
