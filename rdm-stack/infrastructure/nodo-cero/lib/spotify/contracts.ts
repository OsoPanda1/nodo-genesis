/* ================================================================== */
/* SPOTIFY — Contratos del dominio (validación con zod)               */
/* ================================================================== */
/* Tipos y esquemas del panel multimedia RDM. Contratos para el flujo  */
/* Authorization Code + PKCE, la respuesta del token y las entidades   */
/* públicas (perfil, listas, historial y reproductor). Nunca se valida */
/* manualmente el cuerpo: solo contrato.                                */
/* ================================================================== */

import { z } from 'zod';

/* ------------------------------------------------------------------ */
/* Flujo de autorización                                               */
/* ------------------------------------------------------------------ */

/** Cuerpo de POST /api/spotify/auth/url — genera la URL de conexión. */
export const spotifyAuthUrlSchema = z.object({
  state: z.string().trim().min(8).max(128),
});

export type SpotifyAuthUrlInput = z.infer<typeof spotifyAuthUrlSchema>;

/** Cuerpo de GET /api/spotify/auth/callback — canje del code (PKCE). */
export const spotifyCallbackSchema = z.object({
  code: z.string().trim().min(8).max(512),
  state: z.string().trim().min(8).max(128),
});

export type SpotifyCallbackInput = z.infer<typeof spotifyCallbackSchema>;

/** Respuesta del token de Spotify (parcial pero suficiente). */
export const spotifyTokenSchema = z.object({
  access_token: z.string(),
  token_type: z.string().default('Bearer'),
  expires_in: z.number().int().positive(),
  refresh_token: z.string().optional(),
  scope: z.string().optional(),
});

export type SpotifyToken = z.infer<typeof spotifyTokenSchema>;

/* ------------------------------------------------------------------ */
/* Entidades públicas de Spotify                                       */
/* ------------------------------------------------------------------ */

const spotifyImageSchema = z.object({
  url: z.string(),
  height: z.number().nullable().optional(),
  width: z.number().nullable().optional(),
});

const spotifyArtistSchema = z.object({
  id: z.string(),
  name: z.string(),
  external_urls: z.object({ spotify: z.string().optional() }).optional(),
});

/** Canción / episodio del historial y las listas. */
export const spotifyTrackSchema = z.object({
  id: z.string(),
  name: z.string(),
  uri: z.string().optional(),
  artists: z.array(spotifyArtistSchema).default([]),
  album: z
    .object({
      id: z.string().optional(),
      name: z.string().optional(),
      images: z.array(spotifyImageSchema).default([]),
    })
    .optional(),
  duration_ms: z.number().int().nonnegative().optional(),
  external_urls: z.object({ spotify: z.string().optional() }).optional(),
});

export type SpotifyTrack = z.infer<typeof spotifyTrackSchema>;

/** Elemento del historial de reproducción reciente. */
export const spotifyHistoryItemSchema = z.object({
  track: spotifyTrackSchema,
  played_at: z.string(),
  context: z.unknown().optional(),
});

export type SpotifyHistoryItem = z.infer<typeof spotifyHistoryItemSchema>;

/** Elemento de una lista de reproducción. */
export const spotifyPlaylistSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  owner: z.object({ display_name: z.string().nullable().optional() }).optional(),
  images: z.array(spotifyImageSchema).default([]),
  tracks: z
    .object({ total: z.number().int().nonnegative().optional() })
    .optional(),
  public: z.boolean().optional(),
  collaborative: z.boolean().optional(),
  external_urls: z.object({ spotify: z.string().optional() }).optional(),
});

export type SpotifyPlaylist = z.infer<typeof spotifyPlaylistSchema>;

/** Dispositivo activo para el Web Playback SDK. */
export const spotifyDeviceSchema = z.object({
  id: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
  name: z.string().optional(),
  type: z.string().optional(),
  volume_percent: z.number().nullable().optional(),
});

export type SpotifyDevice = z.infer<typeof spotifyDeviceSchema>;

/** Estado de reproducción actual del usuario. */
export const spotifyPlaybackSchema = z.object({
  is_playing: z.boolean().optional(),
  item: spotifyTrackSchema.nullable().optional(),
  progress_ms: z.number().int().nonnegative().nullable().optional(),
  device: spotifyDeviceSchema.optional(),
});

export type SpotifyPlayback = z.infer<typeof spotifyPlaybackSchema>;

/** Perfil público del usuario autenticado. */
export const spotifyProfileSchema = z.object({
  id: z.string(),
  display_name: z.string().nullable().optional(),
  email: z.string().email().optional(),
  country: z.string().optional(),
  images: z.array(spotifyImageSchema).default([]),
  external_urls: z.object({ spotify: z.string().optional() }).optional(),
});

export type SpotifyProfile = z.infer<typeof spotifyProfileSchema>;

/** Respuesta de lista de playlists. */
export const spotifyPlaylistsResponseSchema = z.object({
  items: z.array(spotifyPlaylistSchema).default([]),
  total: z.number().int().nonnegative().optional(),
  next: z.string().nullable().optional(),
});

export type SpotifyPlaylistsResponse = z.infer<typeof spotifyPlaylistsResponseSchema>;

/** Respuesta de historial de reproducción reciente. */
export const spotifyHistoryResponseSchema = z.object({
  items: z.array(spotifyHistoryItemSchema).default([]),
});

export type SpotifyHistoryResponse = z.infer<typeof spotifyHistoryResponseSchema>;
