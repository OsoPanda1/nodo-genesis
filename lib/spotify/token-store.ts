/* ================================================================== */
/* SPOTIFY — Almacén del token en el runtime (server-only)            */
/* ================================================================== */
/* Mismo patrón que lib/identity/store.ts: globalThis para sobrevivir */
/* a HMR. Solo se autoriza UN usuario (modo development de Spotify,   */
/* hasta 5 usuarios permitidos por Spotify). El access token se       */
/* refresca con el refresh token cuando caduca.                       */
/* ================================================================== */

import 'server-only';
import { getEnv } from '@/lib/core/env';
import { publishEvent } from '@/lib/core/events';
import type { SpotifyToken } from './contracts';

export interface SpotifySession {
  profileId: string;
  profileName: string | null;
  accessToken: string;
  refreshToken: string | null;
  scope: string;
  expiresAt: number;
  updatedAt: number;
}

interface SpotifyStoreShape {
  session: SpotifySession | null;
}

const STORE_KEY = '__rdmSpotifyStore';

const g = globalThis as unknown as { [STORE_KEY]?: SpotifyStoreShape };

function getStore(): SpotifyStoreShape {
  if (!g[STORE_KEY]) {
    g[STORE_KEY] = { session: null };
  }
  return g[STORE_KEY] as SpotifyStoreShape;
}

export function isSpotifyConfigured(): boolean {
  const env = getEnv();
  return Boolean(env.SPOTIFY_CLIENT_ID && env.SPOTIFY_CLIENT_SECRET && env.SPOTIFY_REDIRECT_URI);
}

/** Devuelve la sesión activa o null si nadie se ha autenticado. */
export function getSpotifySession(): SpotifySession | null {
  return getStore().session;
}

export function isSpotifyConnected(): boolean {
  const session = getStore().session;
  if (!session) return false;
  return session.expiresAt > Date.now();
}

/** Guarda (o reemplaza) la sesión tras el canje o el refresco. */
export function setSpotifySession(session: SpotifySession): void {
  getStore().session = session;
  publishEvent({
    type: 'spotify.session.updated',
    source: 'rdm-spotify',
    domain: 'media',
    severity: 'info',
    data: { profileId: session.profileId, expiresAt: session.expiresAt },
    meta: { entityId: session.profileId },
  });
}

export function clearSpotifySession(): void {
  const store = getStore();
  if (store.session) {
    publishEvent({
      type: 'spotify.session.revoked',
      source: 'rdm-spotify',
      domain: 'media',
      severity: 'info',
      data: { profileId: store.session.profileId },
    });
  }
  store.session = null;
}

/** Sesión de ejemplo cuando Spotify no está configurado (modo demo). */
export function demoSpotifySession(): SpotifySession {
  const now = Date.now();
  return {
    profileId: 'rdm-demo',
    profileName: 'Visitante del Real',
    accessToken: 'demo-token',
    refreshToken: null,
    scope: '',
    expiresAt: now + 60 * 60 * 1000,
    updatedAt: now,
  };
}

export function tokenFromResponse(t: SpotifyToken, profileId: string, profileName: string | null): SpotifySession {
  const now = Date.now();
  return {
    profileId,
    profileName,
    accessToken: t.access_token,
    refreshToken: t.refresh_token ?? null,
    scope: t.scope ?? '',
    expiresAt: now + t.expires_in * 1000,
    updatedAt: now,
  };
}
