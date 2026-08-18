import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { listPublishedBusinesses } from '@/lib/identity/store';

export const runtime = 'nodejs';

/* ------------------------------------------------------------------ */
/* GET /api/businesses — comercios publicados (suscripción pagada)     */
/* ------------------------------------------------------------------ */
/* Sólo devuelve comercios con `published: true`, es decir, aquellos   */
/* cuya suscripción fue pagada y verificada. Alimenta el catálogo, el   */
/* mapa interactivo, los banners y las recomendaciones de Isabella.     */
/* Nunca expone emails ni datos personales sensibles del propietario.   */
/* ------------------------------------------------------------------ */
export const GET = guardedRoute(
  {
    route: 'api:businesses:list',
    methods: ['GET'],
    rateLimit: 60,
    json: false,
  },
  async () => {
    const businesses = listPublishedBusinesses();
    return NextResponse.json({ ok: true, count: businesses.length, businesses });
  },
);
