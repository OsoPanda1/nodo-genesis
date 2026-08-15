import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { getPlace } from '@/lib/tourism';

/* Detalle de un atractivo del catálogo turístico (GET público). */

export const GET = guardedRoute(
  {
    route: 'api:turismo:places:detail',
    methods: ['GET'],
    rateLimit: 60,
    json: false,
  },
  async ({ req }) => {
    const id = req.nextUrl.pathname.split('/').filter(Boolean).at(-1) ?? '';
    const place = getPlace(id);
    if (!place) return NextResponse.json({ ok: false, error: 'Atractivo no encontrado.' }, { status: 404 });
    return NextResponse.json({ ok: true, place });
  },
);
