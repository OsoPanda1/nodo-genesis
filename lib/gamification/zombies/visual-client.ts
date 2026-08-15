/* ================================================================== */
/* ZOMBIES — Cliente del diseñador visual (navegador)                  */
/* ================================================================== */
/* Pide un perfil visual al endpoint de gamificación y prepara el      */
/* digest de la escena que ata cada perfil a un manifiesto canónico.   */
/* El resultado es cosmético: el bridge sigue reportando kill, wave,   */
/* combo y premios hacia el motor validado del servidor.               */
/* ================================================================== */

import type { ZombieVisualProfile } from '@/lib/core/contracts/zombie-render';

const ARENA_MANIFEST = {
  scene: 'RDMArena',
  version: '1.0.0',
  navMesh: 'RDMArena-NavMesh',
  animator: 'ZombieAnimator',
  prefabs: ['walker', 'runner', 'brute', 'miner', 'spectral', 'boss'],
} as const;

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

/** Digest canónico del manifiesto de la arena (escena + allowlist). */
export async function computeArenaSceneDigest(): Promise<string> {
  const canonical = JSON.stringify(ARENA_MANIFEST, Object.keys(ARENA_MANIFEST).sort());
  return `sha256:${await sha256Hex(canonical)}`;
}

export type VisualProfileSample = {
  archetype: ZombieVisualProfile['archetype'];
  seed: number;
  frequency: number;
  colorScheme: 'spectrum' | 'thermal' | 'monochrome';
  rotation?: { x: number; y: number; z: number };
  sourceOperation: 'compile-scene' | 'color-map' | 'project-to-3d';
};

/** Solicita un perfil visual validado; devuelve null si el backend lo rechaza. */
export async function requestZombieVisualProfile(
  sample: VisualProfileSample,
): Promise<ZombieVisualProfile | null> {
  const renderDigest = await computeArenaSceneDigest();

  const response = await fetch('/api/gamification/zombies/render-profile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-trace-id': crypto.randomUUID(),
    },
    body: JSON.stringify({ ...sample, renderDigest }),
  });

  if (!response.ok) return null;

  const payload = (await response.json()) as {
    success?: boolean;
    data?: ZombieVisualProfile;
  };

  return payload.success && payload.data ? payload.data : null;
}
