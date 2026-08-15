/* ================================================================== */
/* CONTRACTS — Perfil visual de zombie y comando de spawn             */
/* ================================================================== */
/* Contrato separado del gameplay: define SOLO apariencia (material,   */
/* transformación, semilla) y el comando de spawn que Unity consume.   */
/* El `archetype` es un enum cerrado, no una ruta de prefab: nadie     */
/* puede inducir a Unity a cargar assets arbitrarios.                  */
/* ================================================================== */

import { z } from 'zod';

const hexColorSchema = z.string().regex(
  /^#[0-9A-Fa-f]{6}$/,
  'El color debe usar formato #RRGGBB.',
);

export const zombieArchetypeSchema = z.enum([
  'walker',
  'runner',
  'brute',
  'miner',
  'spectral',
  'boss',
]);

export const zombieMaterialSchema = z.object({
  baseColor: hexColorSchema,
  emissionColor: hexColorSchema.optional(),
  emissionIntensity: z.number().finite().min(0).max(8).default(0),
  metallic: z.number().finite().min(0).max(1).default(0),
  smoothness: z.number().finite().min(0).max(1).default(0.5),
  hueShift: z.number().finite().min(-180).max(180).default(0),
}).strict();

export const zombieTransformSchema = z.object({
  scale: z.number().finite().min(0.5).max(3).default(1),
  rotationDegrees: z.object({
    x: z.number().finite().min(-180).max(180).default(0),
    y: z.number().finite().min(-180).max(180).default(0),
    z: z.number().finite().min(-180).max(180).default(0),
  }).strict(),
}).strict();

export const zombieVisualProfileSchema = z.object({
  version: z.literal('1.0'),
  profileId: z.string().min(8).max(128),
  archetype: zombieArchetypeSchema,
  seed: z.number().int().nonnegative().max(2_147_483_647),
  material: zombieMaterialSchema,
  transform: zombieTransformSchema,
  render: z.object({
    castShadows: z.boolean().default(true),
    receiveShadows: z.boolean().default(true),
    lodBias: z.number().finite().min(0.25).max(2).default(1),
  }).strict(),
  source: z.object({
    operation: z.enum(['compile-scene', 'color-map', 'project-to-3d']),
    digest: z.string().regex(/^sha256:[a-f0-9]{64}$/),
    traceId: z.string().uuid(),
  }).strict(),
}).strict();

export const zombieSpawnCommandSchema = z.object({
  version: z.literal('1.0'),
  commandId: z.string().uuid(),
  waveId: z.string().min(1).max(64),
  spawnId: z.string().uuid(),
  archetype: zombieArchetypeSchema,
  position: z.object({
    x: z.number().finite().min(-500).max(500),
    y: z.number().finite().min(-50).max(100),
    z: z.number().finite().min(-500).max(500),
  }).strict(),
  visualProfile: zombieVisualProfileSchema,
}).strict();

/* ------------------------------------------------------------------ */
/* SOLICITUD del endpoint de diseño visual (route-guard + zod)         */
/* ------------------------------------------------------------------ */

export const zombieRenderRequestSchema = z.object({
  archetype: zombieArchetypeSchema,
  seed: z.number().int().nonnegative().max(2_147_483_647),
  frequency: z.number().finite().min(20).max(20_000),
  colorScheme: z.enum(['spectrum', 'thermal', 'monochrome']).default('spectrum'),
  rotation: z.object({
    x: z.number().finite().min(-180).max(180),
    y: z.number().finite().min(-180).max(180),
    z: z.number().finite().min(-180).max(180),
  }).strict().optional(),
  renderDigest: z.string().regex(/^sha256:[a-f0-9]{64}$/),
  sourceOperation: z.enum(['compile-scene', 'color-map', 'project-to-3d']),
}).strict();

export type ZombieVisualProfile = z.infer<typeof zombieVisualProfileSchema>;
export type ZombieSpawnCommand = z.infer<typeof zombieSpawnCommandSchema>;
export type ZombieRenderRequest = z.infer<typeof zombieRenderRequestSchema>;
