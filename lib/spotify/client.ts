/* ================================================================== */
/* SPOTIFY — Cliente de la API (server-only)                          */
/* ================================================================== */
/* Autorización Authorization Code + PKCE, canje de code, refresco de  */
/* token y llamadas a la Web API. Las URLs y el intercambio solo se    */
/* hacen desde el servidor: el secreto del cliente jamás viaja al      */
/* navegador. La sesión se guarda en lib/spotify/token-store.ts.       */
/* ================================================================== */

import 'server-only';
import { createHash, randomBytes } from 'crypto';
import { getEnv } from '@/lib/core/env';
import type { ZodType } from 'zod';
import {
  spotifyTokenSchema,
  spotifyProfileSchema,
  spotifyPlaylistsResponseSchema,
  spotifyHistoryResponseSchema,
  spotifyPlaybackSchema,
  type SpotifyToken,
  type SpotifyProfile,
  type SpotifyHistoryResponse,
  type SpotifyPlaylistsResponse,
  type SpotifyPlayback,
} from './contracts';
import {
  getSpotifySession,
  isSpotifyConfigured,
  tokenFromResponse,
  setSpotifySession,
  clearSpotifySession,
} from './token-store';
export const SPOTIFY_ACCOUNTS_BASE = 'https://accounts.spotify.com';
export const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

/** Ámbitos por defecto si SPOTIFY_SCOPES no está configurado. */
const DEFAULT_SCOPES =
  'user-read-recently-played playlist-read-private playlist-read-collaborative user-library-read user-read-playback-state user-modify-playback-state streaming user-read-email user-read-private';

export function spotifyClientId(): string {
  return getEnv().SPOTIFY_CLIENT_ID ?? '';
}

export function spotifyRedirectUri(): string {
  return getEnv().SPOTIFY_REDIRECT_URI ?? '';
}

export function spotifyScopes(): string {
  return getEnv().SPOTIFY_SCOPES ?? DEFAULT_SCOPES;
}

/** Crea la URL de autorización con code_verifier (PKCE). El verifier se
 *  guarda en memoria junto a la sesión en curso (en un despliegue real se
 *  guardaría cifrado en el store del usuario). */
export function buildAuthorizeUrl(state: string): string {
  return buildAuthorizeUrlWithPkce(state, createPkcePair().verifier);
}

export function base64UrlEncode(input: Buffer): string {
  return input.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function sha256Challenge(verifier: string): string {
  const hash = createHash('sha256').update(verifier).digest('base64');
  return hash.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Genera un code_verifier (43-128 chars) y su code_challenge S256. */
export function createPkcePair(): { verifier: string; challenge: string } {
  const verifier = base64UrlEncode(randomBytes(32)).slice(0, 128);
  return { verifier, challenge: sha256Challenge(verifier) };
}

/** URL de autorización completa con PKCE real. */
export function buildAuthorizeUrlWithPkce(state: string, verifier: string): string {
  const params = new URLSearchParams({
    client_id: spotifyClientId(),
    response_type: 'code',
    redirect_uri: spotifyRedirectUri(),
    scope: spotifyScopes(),
    state,
    code_challenge_method: 'S256',
    code_challenge: sha256Challenge(verifier),
  });
  return `${SPOTIFY_ACCOUNTS_BASE}/authorize?${params.toString()}`;
}

type TokenExchangeResult =
  | { ok: true; token: SpotifyToken }
  | { ok: false; error: string };

/** Canjea el `code` de autorización por un token (PKCE sin client secret
 *  a mano del navegador; el servidor lo reenvía igualmente para apps
 *  privadas). */
export async function exchangeCodeForToken(code: string, verifier: string): Promise<TokenExchangeResult> {
  if (!isSpotifyConfigured()) return { ok: false, error: 'SPOTIFY_NOT_CONFIGURED' };
  const env = getEnv();
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: spotifyRedirectUri(),
    client_id: spotifyClientId(),
    code_verifier: verifier,
  });
  if (env.SPOTIFY_CLIENT_SECRET) {
    body.set('client_secret', env.SPOTIFY_CLIENT_SECRET);
  }

  const res = await fetch(`${SPOTIFY_ACCOUNTS_BASE}/api/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  if (!res.ok) return { ok: false, error: `TOKEN_EXCHANGE_HTTP_${res.status}` };
  const parsed = spotifyTokenSchema.safeParse(await res.json());
  if (!parsed.success) return { ok: false, error: 'TOKEN_EXCHANGE_INVALID_RESPONSE' };
  return { ok: true, token: parsed.data };
}

/** Refresca el access token con el refresh token. Devuelve la sesión nueva. */
export async function refreshAccessToken(refreshToken: string): Promise<TokenExchangeResult> {
  if (!isSpotifyConfigured()) return { ok: false, error: 'SPOTIFY_NOT_CONFIGURED' };
  const env = getEnv();
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: spotifyClientId(),
  });
  if (env.SPOTIFY_CLIENT_SECRET) {
    body.set('client_secret', env.SPOTIFY_CLIENT_SECRET);
  }

  const res = await fetch(`${SPOTIFY_ACCOUNTS_BASE}/api/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  if (!res.ok) return { ok: false, error: `REFRESH_HTTP_${res.status}` };
  const parsed = spotifyTokenSchema.safeParse(await res.json());
  if (!parsed.success) return { ok: false, error: 'REFRESH_INVALID_RESPONSE' };
  return { ok: true, token: parsed.data };
}

type ApiCallResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status?: number };

/** Llamada autenticada a la Web API con refresco automático. */
async function api<T>(path: string, schema: ZodType<T>): Promise<ApiCallResult<T>> {
  const session = getSpotifySession();
  if (!session) return { ok: false, error: 'NOT_CONNECTED' };

  let token = session.accessToken;
  if (session.expiresAt <= Date.now()) {
    if (!session.refreshToken) {
      clearSpotifySession();
      return { ok: false, error: 'TOKEN_EXPIRED' };
    }
    const refreshed = await refreshAccessToken(session.refreshToken);
    if (!refreshed.ok) {
      clearSpotifySession();
      return { ok: false, error: refreshed.error };
    }
    const updated = tokenFromResponse(refreshed.token, session.profileId, session.profileName);
    setSpotifySession(updated);
    token = updated.accessToken;
  }

  const res = await fetch(`${SPOTIFY_API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) {
    clearSpotifySession();
    return { ok: false, error: 'UNAUTHORIZED', status: 401 };
  }
  if (!res.ok) return { ok: false, error: `SPOTIFY_HTTP_${res.status}`, status: res.status };

  const parsed = schema.safeParse(await res.json());
  if (!parsed.success) return { ok: false, error: 'SPOTIFY_INVALID_RESPONSE' };
  return { ok: true, data: parsed.data };
}

/** Perfil del usuario autenticado. */
export function fetchProfile(): Promise<ApiCallResult<SpotifyProfile>> {
  return api('/me', spotifyProfileSchema);
}

/** Historial de reproducción reciente (hasta 50). */
export function fetchRecentlyPlayed(limit = 20): Promise<ApiCallResult<SpotifyHistoryResponse>> {
  return api(`/me/player/recently-played?limit=${Math.max(1, Math.min(50, limit))}`, spotifyHistoryResponseSchema);
}

/** Listas de reproducción del usuario. */
export function fetchPlaylists(limit = 20): Promise<ApiCallResult<SpotifyPlaylistsResponse>> {
  return api(`/me/playlists?limit=${Math.max(1, Math.min(50, limit))}`, spotifyPlaylistsResponseSchema);
}

/** Estado de reproducción actual (dispositivo, canción, progreso). */
export function fetchPlayback(): Promise<ApiCallResult<SpotifyPlayback>> {
  return api('/me/player', spotifyPlaybackSchema);
}

/** Transfiere la reproducción al dispositivo del Web Playback SDK. */
export async function transferPlayback(deviceId: string): Promise<{ ok: boolean; error?: string }> {
  const session = getSpotifySession();
  if (!session) return { ok: false, error: 'NOT_CONNECTED' };
  const res = await fetch(`${SPOTIFY_API_BASE}/me/player`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${session.accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ device_ids: [deviceId], play: true }),
  });
  if (!res.ok && res.status !== 204) {
    return { ok: false, error: `TRANSFER_HTTP_${res.status}` };
  }
  return { ok: true };
}

/** Devuelve el access token vigente para el Web Playback SDK del cliente
 *  (solo cuando hay sesión y scopes de streaming). */
export function publicPlaybackToken(): { ok: true; token: string } | { ok: false; error: string } {
  const session = getSpotifySession();
  if (!session) return { ok: false, error: 'NOT_CONNECTED' };
  if (session.expiresAt <= Date.now()) return { ok: false, error: 'TOKEN_EXPIRED' };
  if (!session.scope.includes('streaming')) return { ok: false, error: 'STREAMING_SCOPE_REQUIRED' };
  return { ok: true, token: session.accessToken };
}
