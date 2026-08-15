import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { ledgerSummary } from '@/lib/payments/engine';

/* ------------------------------------------------------------------ */
/* GET /api/payments/status — resumen del ledger (monitor/panel)       */
/* ------------------------------------------------------------------ */
/* Lectura pública con caché corta para bajar latencia del panel.      */
/* ------------------------------------------------------------------ */
export const GET = guardedRoute(
  {
    route: 'api:payments:status',
    methods: ['GET'],
    rateLimit: 60,
    json: false,
  },
  async () => NextResponse.json({ ok: true, ...ledgerSummary() }),
);
