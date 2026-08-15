import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { verifySessionToken } from '@/lib/security/auth-tokens';
import { requiredString } from '@/lib/security/request-validator';
import { snapshotLeaderboard, submitToLeaderboard } from '@/lib/gamification/leaderboard';
import { getSession, getActiveSessionByDevice } from '@/lib/gamification/store';

export const runtime = 'nodejs';

/* Ruta migrada al route-guard único (antes duplicaba enforceTrust
   con assertServerOnly + verifyOrigin + rateLimit). La validación de
   sessionId y token se conserva dentro de cada handler. */

export const GET = guardedRoute(
  {
    route: 'api:gamification:leaderboard',
    methods: ['GET'],
    rateLimit: 40,
    json: false,
  },
  async ({ req }) => {
    const deviceId = req.nextUrl.searchParams.get('deviceId') ?? undefined;
    const limitRaw = Number(req.nextUrl.searchParams.get('limit') ?? 50);
    const limit = Number.isFinite(limitRaw) ? Math.min(100, Math.max(1, Math.floor(limitRaw))) : 50;

    return NextResponse.json(snapshotLeaderboard(deviceId, limit));
  },
);

export const POST = guardedRoute(
  {
    route: 'api:gamification:leaderboard',
    methods: ['POST'],
    rateLimit: 40,
  },
  async ({ body }) => {
    const missing = requiredString(body, 'sessionId');
    if (missing) {
      return NextResponse.json({ ok: false, error: `Campo requerido: ${missing}` }, { status: 400 });
    }
    const sessionId = String(body.sessionId);

    const session = getSession(sessionId);
    if (!session) {
      return NextResponse.json({ ok: false, error: 'Sesión no encontrada.' }, { status: 404 });
    }

    const tokenCheck = verifySessionToken(String(body.token ?? ''), session.id);
    if (!tokenCheck.ok) {
      return NextResponse.json({ ok: false, error: `Token inválido: ${tokenCheck.reason}` }, { status: 401 });
    }

    const name = typeof body.name === 'string' && body.name.trim() ? body.name : 'Guardián Anónimo';
    const entry = submitToLeaderboard(session, name);

    return NextResponse.json({ ok: true, entry });
  },
);

export const HEAD = guardedRoute(
  {
    route: 'api:gamification:leaderboard',
    methods: ['HEAD'],
    rateLimit: 40,
    json: false,
  },
  async ({ req }) => {
    const byDevice = req.nextUrl.searchParams.get('deviceId');
    if (byDevice) {
      const session = getActiveSessionByDevice(byDevice);
      if (session) {
        return NextResponse.json({ ok: true, sessionId: session.id });
      }
    }
    return NextResponse.json({ ok: true, sessionId: null });
  },
);
