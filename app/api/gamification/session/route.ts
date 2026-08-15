import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { signSessionToken, verifySessionToken } from '@/lib/security/auth-tokens';
import { sessionRequestSchema, type SessionRequest } from '@/lib/gamification/api-contracts';
import { createSession, endSession, getActiveSessionByDevice, getSession } from '@/lib/gamification/store';
import { uuid } from '@/lib/isabella/utils';

export const runtime = 'nodejs';

/* Ruta migrada al route-guard único y a contrato zod (sessionRequest
   con action start|end). La verificación de token se conserva porque
   es autorización, no formato. */

async function startSession(body: SessionRequest) {
  if (!body.deviceId) {
    return NextResponse.json({ ok: false, error: 'Campo requerido: deviceId' }, { status: 400 });
  }
  const deviceIdValue = body.deviceId.slice(0, 128);
  const name = body.name?.replace(/[<>]/g, '').trim().slice(0, 40);
  const actorId = body.actorId?.replace(/[<>]/g, '').slice(0, 64) ?? `guardian-${deviceIdValue.slice(0, 12)}`;

  const existing = getActiveSessionByDevice(deviceIdValue);
  if (existing) {
    const token = signSessionToken({ sessionId: existing.id, deviceId: deviceIdValue, actorId: existing.actorId });
    return NextResponse.json({
      ok: true,
      resumed: true,
      sessionId: existing.id,
      token: token.token,
      mode: token.mode,
      actorId: existing.actorId,
      totalPoints: existing.totalPoints,
      startedAt: existing.startedAt,
      serverTime: Date.now(),
    });
  }

  const sessionId = uuid();
  createSession({
    id: sessionId,
    actorId,
    deviceId: deviceIdValue,
    startedAt: Date.now(),
    totalPoints: 0,
    kills: 0,
    waves: 0,
    maxCombo: 0,
    missions: [],
    redeemed: [],
    flags: [],
    leaderboardName: name,
  });

  const token = signSessionToken({ sessionId, deviceId: deviceIdValue, actorId });
  return NextResponse.json({
    ok: true,
    resumed: false,
    sessionId,
    token: token.token,
    mode: token.mode,
    actorId,
    startedAt: Date.now(),
    serverTime: Date.now(),
  });
}

async function endSessionHandler(body: SessionRequest) {
  if (!body.sessionId) {
    return NextResponse.json({ ok: false, error: 'Campo requerido: sessionId' }, { status: 400 });
  }
  const sessionId = body.sessionId;
  const session = getSession(sessionId);
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Sesión no encontrada.' }, { status: 404 });
  }

  /* Autorización: finalizar una sesión exige el token firmado de ESA sesión y
     dispositivo (previene terminar sesiones ajenas / IDOR). */
  const tokenCheck = verifySessionToken(body.token ?? '', sessionId, session.deviceId);
  if (!tokenCheck.ok) {
    return NextResponse.json({ ok: false, error: `Token inválido: ${tokenCheck.reason}` }, { status: 401 });
  }

  const ended = endSession(sessionId);
  if (!ended) {
    return NextResponse.json({ ok: false, error: 'Sesión no encontrada.' }, { status: 404 });
  }
  return NextResponse.json({ ok: true, sessionId: ended.id, endedAt: ended.endedAt, totalPoints: ended.totalPoints });
}

export const POST = guardedRoute<SessionRequest>(
  {
    route: 'api:gamification:session',
    methods: ['POST'],
    rateLimit: 20,
    schema: sessionRequestSchema,
  },
  async ({ body }) => {
    if (body.action === 'start') return startSession(body);
    if (body.action === 'end') return endSessionHandler(body);
    return NextResponse.json({ ok: false, error: 'Acción no soportada (start | end).' }, { status: 400 });
  },
);
