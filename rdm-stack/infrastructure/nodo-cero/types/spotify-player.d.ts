/* Tipos globales del Web Playback SDK de Spotify (cargado dinámicamente
   desde https://sdk.scdn.co/spotify-player.js). */

interface SpotifyPlayerOptions {
  name: string;
  getOAuthToken: (cb: (token: string) => void) => void;
  volume?: number;
}

interface SpotifyPlayerInstance {
  connect: () => Promise<boolean>;
  addListener: (event: 'ready' | 'player_state_changed' | 'not_ready', cb: (data: unknown) => void) => void;
  activateElement: () => Promise<unknown>;
  getCurrentState: () => Promise<unknown>;
}

interface SpotifySdkWindow {
  Player: new (options: SpotifyPlayerOptions) => SpotifyPlayerInstance;
}

interface Window {
  Spotify?: SpotifySdkWindow;
}
