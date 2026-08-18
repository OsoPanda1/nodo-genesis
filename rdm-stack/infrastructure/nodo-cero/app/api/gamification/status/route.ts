import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { getGamificationStatus } from '@/lib/gamification/status';
import { getGamificationTerritoryStatus } from '@/lib/gamification/territory';
import { getActiveSessionByDevice, getSession } from '@/lib/gamification/store';

export const runtime = 'nodejs';

/* ------------------------------------------------------------------ */
/* GET /api/gamification/status — estado global + sesión del visitante */
/* ------------------------------------------------------------------ */
/* Combina el estado del fabric (stats globales) con la sesión activa  */
/* del dispositivo consultante (deviceId por query) y el pulso real    */
/* del territorio (incidentes, gemelos, marketplace, pagos). Los retos */
/* se devuelven con progreso calculado desde datos reales, no estáticos. */
/* Solo lectura.                                                       */
/* ------------------------------------------------------------------ */
export const GET = guardedRoute(
  {
    route: 'api:gamification:status',
    methods: ['GET'],
    rateLimit: 60,
    json: false,
  },
  async ({ req }) => {
    const deviceId = req.nextUrl.searchParams.get('deviceId') ?? undefined;
    const globalStatus = getGamificationStatus();
    const { territory, challenges } = getGamificationTerritoryStatus();

    let session = null;
    if (deviceId) {
      const active = getActiveSessionByDevice(deviceId.slice(0, 128));
      session = active ? getSession(active.id) : null;
    }

    return NextResponse.json({
      ...globalStatus,
      session: session
        ? {
            sessionId: session.id,
            totalPoints: session.totalPoints,
            kills: session.kills,
            waves: session.waves,
            maxCombo: session.maxCombo,
            missions: session.missions,
            redeemed: session.redeemed,
          }
        : null,
      territory,
      challenges,
      serverTime: Date.now(),
    });
  },
);
