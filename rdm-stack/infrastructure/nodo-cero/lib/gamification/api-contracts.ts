/* ------------------------------------------------------------------ */
/* GAMIFICATION YUN — Contratos de API (zod)                           */
/* ------------------------------------------------------------------ */
/* Cuerpos de las rutas /api/gamification/*. Eliminan la validación    */
/* manual dispersa y son la fuente de verdad de la forma de entrada.   */
/* ------------------------------------------------------------------ */

import { z } from 'zod';

export const sessionActionSchema = z.enum(['start', 'end']);

/** Inicio/fin de sesión de gamificación. */
export const sessionRequestSchema = z.object({
  action: sessionActionSchema.default('start'),
  deviceId: z.string().trim().min(1).max(128).optional(),
  sessionId: z.string().trim().min(1).max(128).optional(),
  name: z.string().trim().min(1).max(40).optional(),
  actorId: z.string().trim().min(1).max(64).optional(),
  token: z.string().trim().min(1).max(512).optional(),
});

export type SessionRequest = z.infer<typeof sessionRequestSchema>;

/** Evento de juego validado por contrato (server-authoritative). */
export const gameplayEventSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('kill-zombie'),
    sessionId: z.string().min(1).max(128),
    timestamp: z.number().int().min(0),
    archetypeId: z.string().min(1).max(64),
    archetypeName: z.string().max(64).optional(),
    rarity: z.enum(['comun', 'raro', 'epico']).optional(),
    zone: z.enum(['mina', 'cultura', 'naturaleza', 'gastronomia', 'calles']).optional(),
    poiId: z.string().max(64).optional(),
    basePoints: z.number().int().min(1).max(10000),
    night: z.boolean().optional(),
    fog: z.boolean().optional(),
    eventMonth: z.boolean().optional(),
    comboCount: z.number().int().min(0).max(1000).optional(),
    latencyMs: z.number().int().min(0).max(60000).optional(),
  }),
  z.object({
    type: z.literal('wave-completed'),
    sessionId: z.string().min(1).max(128),
    timestamp: z.number().int().min(0),
    waveNumber: z.number().int().min(1).max(1000),
  }),
  z.object({
    type: z.literal('combo'),
    sessionId: z.string().min(1).max(128),
    timestamp: z.number().int().min(0),
    comboCount: z.number().int().min(1).max(1000),
  }),
  z.object({
    type: z.literal('mission-completed'),
    sessionId: z.string().min(1).max(128),
    timestamp: z.number().int().min(0),
    missionId: z.string().min(1).max(64),
    reward: z.number().int().min(0).max(10000).optional(),
  }),
  z.object({
    type: z.literal('prize-redeemed'),
    sessionId: z.string().min(1).max(128),
    timestamp: z.number().int().min(0),
    prizeId: z.string().min(1).max(64),
    cost: z.number().int().min(0).max(1000000),
  }),
]);

export type GameplayEventInput = z.infer<typeof gameplayEventSchema>;
