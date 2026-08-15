import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { verifySessionToken } from '@/lib/security/auth-tokens';
import { applyEvent } from '@/lib/gamification/points-engine';
import { recordGameplayEvent } from '@/lib/gamification/events';
import { getSession } from '@/lib/gamification/store';
import { gameplayEventSchema, type GameplayEventInput } from '@/lib/core/contracts';
import type { GameplayEvent, SpawnZone, ZombieRarity } from '@/lib/gamification/contracts';

export const runtime = 'nodejs';

/* Ruta ejemplar migrada al route-guard único. La validación de tipo y
   sessionId ahora la ejerce el contrato gameplayEventSchema (zod). */

function clampNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function clampBool(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined;
}

function enumValue<T extends string>(value: unknown, allowed: readonly T[]): T | undefined {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : undefined;
}

const ZONES = ['mina', 'cultura', 'naturaleza', 'gastronomia', 'calles'] as const;
const RARITIES = ['comun', 'raro', 'epico'] as const;

function buildGameplayEvent(body: Record<string, unknown>): GameplayEvent | null {
  const type = String(body.type ?? '');
  const sessionId = String(body.sessionId ?? '');
  const timestamp = clampNumber(body.timestamp, Date.now());

  switch (type) {
    case 'kill-zombie':
      return {
        type,
        sessionId,
        timestamp,
        archetypeId: String(body.archetypeId ?? 'unknown'),
        archetypeName: typeof body.archetypeName === 'string' ? body.archetypeName : undefined,
        rarity: enumValue<ZombieRarity>(body.rarity, RARITIES),
        zone: enumValue<SpawnZone>(body.zone, ZONES),
        poiId: typeof body.poiId === 'string' ? body.poiId : undefined,
        basePoints: clampNumber(body.basePoints, 100),
        night: clampBool(body.night),
        fog: clampBool(body.fog),
        eventMonth: clampBool(body.eventMonth),
        comboCount: clampNumber(body.comboCount, 0),
      };
    case 'wave-completed':
      return {
        type,
        sessionId,
        timestamp,
        waveNumber: clampNumber(body.waveNumber, 1),
      };
    case 'combo':
      return {
        type,
        sessionId,
        timestamp,
        comboCount: clampNumber(body.comboCount, 1),
      };
    case 'mission-completed':
      return {
        type,
        sessionId,
        timestamp,
        missionId: String(body.missionId ?? 'unknown'),
        reward: clampNumber(body.reward, 0),
      };
    case 'prize-redeemed':
      return {
        type,
        sessionId,
        timestamp,
        prizeId: String(body.prizeId ?? 'unknown'),
        cost: clampNumber(body.cost, 0),
      };
    default:
      return null;
  }
}

export const POST = guardedRoute<GameplayEventInput>(
  {
    route: 'api:gamification:events',
    methods: ['POST'],
    rateLimit: 60,
    schema: gameplayEventSchema,
  },
  async ({ body }) => {
    const session = getSession(body.sessionId);
    if (!session) {
      return NextResponse.json({ ok: false, error: 'Sesión no encontrada. Inicia una sesión primero.' }, { status: 404 });
    }

    const tokenCheck = verifySessionToken(body.token ?? '', session.id, session.deviceId);
    if (!tokenCheck.ok) {
      return NextResponse.json({ ok: false, error: `Token inválido: ${tokenCheck.reason}` }, { status: 401 });
    }

    const event = buildGameplayEvent(body as unknown as Record<string, unknown>);
    if (!event) {
      return NextResponse.json({ ok: false, error: 'Evento malformado.' }, { status: 400 });
    }

    const result = applyEvent(event);

    if (result.accepted) {
      recordGameplayEvent({
        sessionId: session.id,
        actorId: session.actorId,
        eventType: body.type,
        payload: { ...event, pointsAwarded: result.pointsAwarded } as unknown as Record<string, unknown>,
      });
    }

    return NextResponse.json(result, { status: result.ok ? 200 : 500 });
  },
);
