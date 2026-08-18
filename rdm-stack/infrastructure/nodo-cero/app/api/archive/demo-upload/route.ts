import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { verifyDemoSignature } from '@/lib/archive/archive-storage';

export const runtime = 'nodejs';

/* ------------------------------------------------------------------ */
/* POST /api/archive/demo-upload — confirmación de carga en modo demo  */
/* ------------------------------------------------------------------ */
/* En modo demo la "carga" no sube bytes reales: se valida la firma y  */
/* se confirma. En producción el cliente sube el objeto directamente   */
/* a la URL firmada de Supabase Storage.                               */
export const POST = guardedRoute(
  {
    route: 'api:archive:demo-upload',
    methods: ['POST'],
    rateLimit: 20,
    cacheControl: 'no-store',
  },
  async ({ body }) => {
    const params =
      body && typeof body === 'object' && !Array.isArray(body)
        ? (body as Record<string, string | undefined>)
        : {};
    const verified = verifyDemoSignature({
      bucket: params.bucket,
      path: params.path,
      expires: params.expires,
      sig: params.sig,
    });
    if (!verified) {
      return NextResponse.json({ ok: false, error: 'FIRMA_INVALIDA' }, { status: 403 });
    }
    return NextResponse.json({ ok: true, accepted: true, demo: true, path: params.path });
  },
);
