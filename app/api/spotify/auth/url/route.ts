import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { spotifyAuthUrlSchema, type SpotifyAuthUrlInput } from '@/lib/spotify/contracts';
import { createPkcePair, buildAuthorizeUrlWithPkce } from '@/lib/spotify/client';
import { isSpotifyConfigured } from '@/lib/spotify/token-store';

export const runtime = 'nodejs';

/* ------------------------------------------------------------------ */
/* POST /api/spotify/auth/url — genera la URL de conexión con Spotify  */
/* ------------------------------------------------------------------ */
/* Flujo Authorization Code + PKCE. El servidor crea el code_verifier  */
/* y lo guarda en memoria indexado por el `state` que el cliente       */
/* envió (CSRF). Spotify devolverá ese mismo state en el callback y el */
/* servidor lo usará para recuperar el verifier. En un despliegue      */
/* real el verifier se guardaría cifrado en la sesión del usuario.     */
/* ------------------------------------------------------------------ */

const VERIFIER_STORE: Record<string, string> = {};

export function storeVerifier(state: string, verifier: string): void {
  VERIFIER_STORE[state] = verifier;
}

export function consumeVerifier(state: string): string | null {
  const verifier = VERIFIER_STORE[state] ?? null;
  if (verifier) delete VERIFIER_STORE[state];
  return verifier;
}

export const POST = guardedRoute<SpotifyAuthUrlInput>(
  {
    route: 'api:spotify:auth:url',
    methods: ['POST'],
    rateLimit: 10,
    schema: spotifyAuthUrlSchema,
    cacheControl: 'no-store',
  },
  async ({ body }) => {
    if (!isSpotifyConfigured()) {
      return NextResponse.json({ ok: false, error: 'SPOTIFY_NOT_CONFIGURED' }, { status: 503 });
    }
    const { verifier } = createPkcePair();
    storeVerifier(body.state, verifier);
    const url = buildAuthorizeUrlWithPkce(body.state, verifier);
    return NextResponse.json({ ok: true, url });
  },
);
