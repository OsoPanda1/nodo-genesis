import { describe, expect, it } from 'vitest';
import {
  zombieVisualProfileSchema,
  zombieSpawnCommandSchema,
  zombieRenderRequestSchema,
} from '@/lib/core/contracts/zombie-render';
import {
  designZombieVisual,
  createSpawnCommand,
} from '@/lib/gamification/zombies/zombie-visual-designer';
import { stableDigest } from '@/lib/render/engine/stable-digest';

const TRACE_ID = '550e8400-e29b-41d4-a716-446655440000';
const DIGEST = `sha256:${'a'.repeat(64)}`;

function validProfileInput() {
  return {
    version: '1.0',
    profileId: 'a'.repeat(64),
    archetype: 'walker',
    seed: 1,
    material: { baseColor: '#ffffff' },
    transform: { scale: 1, rotationDegrees: { x: 0, y: 0, z: 0 } },
    render: { castShadows: true, receiveShadows: true, lodBias: 1 },
    source: {
      operation: 'compile-scene',
      digest: DIGEST,
      traceId: TRACE_ID,
    },
  };
}

describe('contrato de perfil visual zombie', () => {
  it('rechaza archetypes no permitidos (evita carga de assets arbitrarios)', () => {
    const result = zombieVisualProfileSchema.safeParse({
      ...validProfileInput(),
      archetype: '../../arbitrary-prefab',
    });

    expect(result.success).toBe(false);
  });

  it('acepta un perfil visual válido', () => {
    const result = zombieVisualProfileSchema.safeParse(validProfileInput());

    expect(result.success).toBe(true);
  });

  it('rechaza colores que no usan formato #RRGGBB', () => {
    const result = zombieVisualProfileSchema.safeParse({
      ...validProfileInput(),
      material: { baseColor: 'white' },
    });

    expect(result.success).toBe(false);
  });

  it('rechaza digests de escena que no son sha256 canónicos', () => {
    const result = zombieVisualProfileSchema.safeParse({
      ...validProfileInput(),
      source: { operation: 'compile-scene', digest: 'not-a-digest', traceId: TRACE_ID },
    });

    expect(result.success).toBe(false);
  });

  it('rechaza escalas fuera del rango permitido', () => {
    const result = zombieVisualProfileSchema.safeParse({
      ...validProfileInput(),
      transform: { scale: 9, rotationDegrees: { x: 0, y: 0, z: 0 } },
    });

    expect(result.success).toBe(false);
  });
});

describe('diseñador visual de zombie', () => {
  it('asigna escala por archetype (brute 1.45, boss 2.2, runner 0.82)', async () => {
    const brute = await designZombieVisual({
      archetype: 'brute', seed: 7, frequency: 200, colorScheme: 'spectrum',
      traceId: TRACE_ID, renderDigest: DIGEST, sourceOperation: 'compile-scene',
    });
    const boss = await designZombieVisual({
      archetype: 'boss', seed: 8, frequency: 300, colorScheme: 'thermal',
      traceId: TRACE_ID, renderDigest: DIGEST, sourceOperation: 'color-map',
    });
    const runner = await designZombieVisual({
      archetype: 'runner', seed: 9, frequency: 900, colorScheme: 'monochrome',
      traceId: TRACE_ID, renderDigest: DIGEST, sourceOperation: 'project-to-3d',
    });

    expect(brute.transform.scale).toBe(1.45);
    expect(boss.transform.scale).toBe(2.2);
    expect(runner.transform.scale).toBe(0.82);
  });

  it('spectral emite sin sombras y con alta suavidad', async () => {
    const profile = await designZombieVisual({
      archetype: 'spectral', seed: 42, frequency: 1320, colorScheme: 'spectrum',
      traceId: TRACE_ID, renderDigest: DIGEST, sourceOperation: 'project-to-3d',
    });

    expect(profile.material.emissionIntensity).toBe(2.2);
    expect(profile.material.smoothness).toBe(0.85);
    expect(profile.render.castShadows).toBe(false);
    expect(profile.render.receiveShadows).toBe(false);
  });

  it('miner usa material metálico', async () => {
    const profile = await designZombieVisual({
      archetype: 'miner', seed: 11, frequency: 440, colorScheme: 'thermal',
      traceId: TRACE_ID, renderDigest: DIGEST, sourceOperation: 'compile-scene',
    });

    expect(profile.material.metallic).toBe(0.65);
  });

  it('el profileId es un digest determinista de 64 hex y el perfil pasa el contrato', async () => {
    const input = {
      archetype: 'walker', seed: 5, frequency: 220, colorScheme: 'monochrome',
      traceId: TRACE_ID, renderDigest: DIGEST, sourceOperation: 'compile-scene',
    } as const;
    const first = await designZombieVisual(input);
    const second = await designZombieVisual(input);

    expect(first.profileId).toMatch(/^[a-f0-9]{64}$/);
    expect(first.profileId).toBe(second.profileId);
    expect(zombieVisualProfileSchema.safeParse(first).success).toBe(true);
  });

  it('la rotación 4D proyectada se conserva en el perfil', async () => {
    const profile = await designZombieVisual({
      archetype: 'miner', seed: 918273, frequency: 440, colorScheme: 'thermal',
      rotation: { x: 0, y: 35, z: 0 },
      traceId: TRACE_ID, renderDigest: DIGEST, sourceOperation: 'compile-scene',
    });

    expect(profile.transform.rotationDegrees).toEqual({ x: 0, y: 35, z: 0 });
  });
});

describe('comando de spawn', () => {
  it('construye un comando válido y lo aprueba el contrato', async () => {
    const profile = await designZombieVisual({
      archetype: 'walker', seed: 5, frequency: 220, colorScheme: 'monochrome',
      traceId: TRACE_ID, renderDigest: DIGEST, sourceOperation: 'compile-scene',
    });

    const command = createSpawnCommand({
      commandId: '550e8400-e29b-41d4-a716-446655440001',
      waveId: 'wave-01',
      spawnId: '550e8400-e29b-41d4-a716-446655440002',
      archetype: 'walker',
      position: { x: 4, y: 0, z: -3 },
      visualProfile: profile,
    });

    expect(command.version).toBe('1.0');
    expect(command.archetype).toBe('walker');
    expect(zombieSpawnCommandSchema.safeParse(command).success).toBe(true);
  });
});

describe('digest estable de escena', () => {
  it('devuelve el prefijo sha256: con 64 hex', async () => {
    const digest = await stableDigest({ scene: 'RDMArena', version: '1.0.0' });

    expect(digest).toMatch(/^sha256:[a-f0-9]{64}$/);
  });

  it('es estable sin importar el orden de las claves', async () => {
    const a = await stableDigest({ b: 1, a: 2 });
    const b = await stableDigest({ a: 2, b: 1 });

    expect(a).toBe(b);
  });
});

describe('schema de solicitud del endpoint', () => {
  it('rechaza archetypes no permitidos y digests inválidos', () => {
    const badArchetype = zombieRenderRequestSchema.safeParse({
      archetype: 'ghost', seed: 1, frequency: 440, renderDigest: DIGEST, sourceOperation: 'compile-scene',
    });
    const badDigest = zombieRenderRequestSchema.safeParse({
      archetype: 'walker', seed: 1, frequency: 440, renderDigest: 'nope', sourceOperation: 'compile-scene',
    });

    expect(badArchetype.success).toBe(false);
    expect(badDigest.success).toBe(false);
  });

  it('aplica el esquema de color por defecto', () => {
    const result = zombieRenderRequestSchema.safeParse({
      archetype: 'walker', seed: 1, frequency: 440, renderDigest: DIGEST, sourceOperation: 'color-map',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.colorScheme).toBe('spectrum');
    }
  });
});
