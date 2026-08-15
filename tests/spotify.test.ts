import { describe, it, expect, beforeEach } from 'vitest';
import { spotifyAuthUrlSchema, spotifyCallbackSchema, spotifyTokenSchema, spotifyHistoryResponseSchema, spotifyPlaylistSchema } from '@/lib/spotify/contracts';
import { createPkcePair, buildAuthorizeUrlWithPkce, base64UrlEncode, sha256Challenge } from '@/lib/spotify/client';
import { getSpotifySession, setSpotifySession, clearSpotifySession, isSpotifyConnected, tokenFromResponse } from '@/lib/spotify/token-store';

/* ------------------------------------------------------------------ */
/* SPOTIFY — contratos, PKCE y almacén de sesión                       */
/* ------------------------------------------------------------------ */

describe('spotify · contratos zod', () => {
  it('valida el cuerpo de POST /auth/url (state)', () => {
    const r = spotifyAuthUrlSchema.safeParse({ state: '0123456789abcdef' });
    expect(r.success).toBe(true);
  });

  it('rechaza un state demasiado corto', () => {
    const r = spotifyAuthUrlSchema.safeParse({ state: 'corto' });
    expect(r.success).toBe(false);
  });

  it('valida el cuerpo del callback (code + state)', () => {
    const r = spotifyCallbackSchema.safeParse({ code: 'AQC0000000000000', state: '0123456789abcdef' });
    expect(r.success).toBe(true);
  });

  it('valida la respuesta del token', () => {
    const r = spotifyTokenSchema.safeParse({
      access_token: 'BQClaveDeAcceso',
      token_type: 'Bearer',
      expires_in: 3600,
      refresh_token: 'AQRefresh',
      scope: 'user-read-recently-played',
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.expires_in).toBe(3600);
  });

  it('rechaza un token sin access_token', () => {
    const r = spotifyTokenSchema.safeParse({ expires_in: 3600 });
    expect(r.success).toBe(false);
  });

  it('parsea el historial reciente con tracks anidados', () => {
    const payload = {
      items: [
        {
          track: { id: 't1', name: 'Corrido del Mineral', artists: [{ id: 'a1', name: 'Banda RDM' }] },
          played_at: '2026-08-10T01:00:00Z',
        },
      ],
    };
    const r = spotifyHistoryResponseSchema.safeParse(payload);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.items[0].track.name).toBe('Corrido del Mineral');
  });

  it('normaliza listas sin imágenes', () => {
    const r = spotifyPlaylistSchema.safeParse({ id: 'pl1', name: 'Fiestas del Real' });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.images).toEqual([]);
  });
});

describe('spotify · PKCE', () => {
  it('genera un par verifier/challenge S256 válido', () => {
    const { verifier, challenge } = createPkcePair();
    expect(verifier.length).toBeGreaterThanOrEqual(43);
    expect(verifier.length).toBeLessThanOrEqual(128);
    expect(verifier).toMatch(/^[A-Za-z0-9\-_]+$/);
    expect(challenge).toMatch(/^[A-Za-z0-9\-_]+$/);
    expect(challenge).toBe(sha256Challenge(verifier));
  });

  it('base64UrlEncode produce una cadena sin caracteres no seguros', () => {
    const encoded = base64UrlEncode(Buffer.from('abc123'));
    expect(encoded).toMatch(/^[A-Za-z0-9\-_]+$/);
  });

  it('construye una URL de autorización con los parámetros clave', () => {
    const url = buildAuthorizeUrlWithPkce('estado-prueba', 'verifier-de-prueba');
    expect(url).toContain('accounts.spotify.com/authorize');
    expect(url).toContain('response_type=code');
    expect(url).toContain('code_challenge_method=S256');
    expect(url).toContain('state=estado-prueba');
    expect(url).toContain('code_challenge=');
  });
});

describe('spotify · almacén de sesión', () => {
  beforeEach(() => {
    clearSpotifySession();
  });

  it('empieza sin sesión', () => {
    expect(getSpotifySession()).toBeNull();
    expect(isSpotifyConnected()).toBe(false);
  });

  it('guarda y recupera una sesión', () => {
    const session = tokenFromResponse(
      { access_token: 'BQAcceso', token_type: 'Bearer', expires_in: 3600, refresh_token: 'AQRefresh', scope: 'streaming' },
      'anubis-rdm',
      'Edwin',
    );
    setSpotifySession(session);
    expect(getSpotifySession()?.profileId).toBe('anubis-rdm');
    expect(getSpotifySession()?.accessToken).toBe('BQAcceso');
    expect(getSpotifySession()?.expiresAt).toBeGreaterThan(Date.now());
    expect(isSpotifyConnected()).toBe(true);
  });

  it('limpiar elimina la sesión', () => {
    const session = tokenFromResponse({ access_token: 'BQAcceso', token_type: 'Bearer', expires_in: 3600 }, 'anubis-rdm', null);
    setSpotifySession(session);
    clearSpotifySession();
    expect(getSpotifySession()).toBeNull();
  });

  it('una sesión caducada no cuenta como conectada', () => {
    const session = tokenFromResponse({ access_token: 'BQAcceso', token_type: 'Bearer', expires_in: 3600 }, 'anubis-rdm', null);
    setSpotifySession({ ...session, expiresAt: Date.now() - 1000 });
    expect(isSpotifyConnected()).toBe(false);
  });
});
