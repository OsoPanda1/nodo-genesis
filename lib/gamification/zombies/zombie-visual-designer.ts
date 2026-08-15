/* ================================================================== */
/* ZOMBIES — Diseñador de perfiles visuales (cosmético)               */
/* ================================================================== */
/* Genera un ZombieVisualProfile validado: paleta, emisión, material,  */
/* escala, rotación 4D proyectada y semilla determinista. NO toca       */
/* salud, daño, puntuación, drop rate ni validación de kills: eso       */
/* pertenece al motor server-authoritative de gamificación.             */
/* ================================================================== */

import type {
  ZombieVisualProfile,
  ZombieSpawnCommand,
} from '@/lib/core/contracts/zombie-render';
import { stableDigest } from '@/lib/render/engine/stable-digest';

type DesignZombieInput = {
  archetype: ZombieVisualProfile['archetype'];
  seed: number;
  frequency: number;
  colorScheme: 'spectrum' | 'thermal' | 'monochrome';
  rotation?: {
    x: number;
    y: number;
    z: number;
  };
  traceId: string;
  renderDigest: string;
  sourceOperation: 'compile-scene' | 'color-map' | 'project-to-3d';
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function toHex(channel: number): string {
  return Math.round(clamp(channel, 0, 255))
    .toString(16)
    .padStart(2, '0');
}

function frequencyColor(
  frequency: number,
  scheme: DesignZombieInput['colorScheme'],
): string {
  const t = clamp((frequency - 20) / 19_980, 0, 1);

  switch (scheme) {
    case 'thermal':
      return `#${toHex(255 * Math.min(1, t * 1.3))}${toHex(
        255 * Math.max(0, (t - 0.2) * 1.25),
      )}${toHex(255 * Math.max(0, (t - 0.8) * 5))}`;

    case 'monochrome': {
      const channel = 55 + 180 * t;
      return `#${toHex(channel)}${toHex(channel)}${toHex(channel)}`;
    }

    case 'spectrum':
      return `#${toHex(255 * t)}${toHex(
        255 * (1 - Math.abs(2 * t - 1)),
      )}${toHex(255 * (1 - t))}`;
  }
}

function archetypeScale(
  archetype: ZombieVisualProfile['archetype'],
): number {
  switch (archetype) {
    case 'runner':
      return 0.82;
    case 'brute':
      return 1.45;
    case 'boss':
      return 2.2;
    case 'spectral':
      return 1.05;
    case 'miner':
      return 1.1;
    case 'walker':
      return 1;
  }
}

function emissionFor(
  archetype: ZombieVisualProfile['archetype'],
): number {
  switch (archetype) {
    case 'spectral':
      return 2.2;
    case 'boss':
      return 1.5;
    case 'runner':
      return 0.75;
    default:
      return 0.25;
  }
}

export async function designZombieVisual(
  input: DesignZombieInput,
): Promise<ZombieVisualProfile> {
  const baseColor = frequencyColor(input.frequency, input.colorScheme);
  const emissionIntensity = emissionFor(input.archetype);

  const material = {
    baseColor,
    emissionColor: emissionIntensity > 0 ? baseColor : undefined,
    emissionIntensity,
    metallic: input.archetype === 'miner' ? 0.65 : 0.12,
    smoothness: input.archetype === 'spectral' ? 0.85 : 0.42,
    hueShift: 0,
  };

  const transform = {
    scale: archetypeScale(input.archetype),
    rotationDegrees: input.rotation ?? { x: 0, y: 0, z: 0 },
  };

  const draft = {
    version: '1.0' as const,
    archetype: input.archetype,
    seed: input.seed,
    material,
    transform,
    render: {
      castShadows: input.archetype !== 'spectral',
      receiveShadows: input.archetype !== 'spectral',
      lodBias: input.archetype === 'boss' ? 1.5 : 1,
    },
    source: {
      operation: input.sourceOperation,
      digest: input.renderDigest,
      traceId: input.traceId,
    },
  };

  const profileDigest = await stableDigest(draft);

  return {
    ...draft,
    profileId: profileDigest.slice('sha256:'.length),
  };
}

export function createSpawnCommand(input: {
  commandId: string;
  waveId: string;
  spawnId: string;
  archetype: ZombieVisualProfile['archetype'];
  position: { x: number; y: number; z: number };
  visualProfile: ZombieVisualProfile;
}): ZombieSpawnCommand {
  return {
    version: '1.0',
    commandId: input.commandId,
    waveId: input.waveId,
    spawnId: input.spawnId,
    archetype: input.archetype,
    position: input.position,
    visualProfile: input.visualProfile,
  };
}
