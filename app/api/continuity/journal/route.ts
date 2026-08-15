import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { journalSnapshot, journalIntegrity } from '@/lib/continuity';
import { hasInternalKey, getInternalKey } from '@/lib/security/keys';

/* ------------------------------------------------------------------ */
/* GET /api/continuity/journal — journal inmutable del bastión         */
/* Devuelve las entradas del journal con su hash-chain y el resultado  */
/* de la verificación de integridad. Solo lectura.                     */
/* ------------------------------------------------------------------ */
export const dynamic = 'force-dynamic';

export const GET = guardedRoute(
  {
    route: 'api:continuity:journal',
    methods: ['GET'],
    rateLimit: 60,
    json: false,
    cacheControl: 'no-store',
    zeroTrustApiKeys:
      hasInternalKey('CROWN_API_KEY') && getInternalKey('CROWN_API_KEY')
        ? [getInternalKey('CROWN_API_KEY') as string]
        : undefined,
  },
  async () => {
    const snapshot = journalSnapshot();
    const integrity = journalIntegrity();
    return NextResponse.json({
      ok: true,
      count: snapshot.count,
      integrity,
      entries: snapshot.entries,
    });
  },
);
