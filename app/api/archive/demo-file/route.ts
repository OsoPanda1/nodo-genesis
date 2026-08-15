import { readFile } from 'node:fs/promises';
import { join, normalize, relative, resolve } from 'node:path';
import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { verifyDemoSignature } from '@/lib/archive/archive-storage';

export const runtime = 'nodejs';

const PUBLIC_ROOT = join(process.cwd(), 'public');

const MIME_BY_EXT: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.txt': 'text/plain; charset=utf-8',
};

function mimeFor(path: string): string {
  const ext = path.slice(path.lastIndexOf('.')).toLowerCase();
  return MIME_BY_EXT[ext] ?? 'application/octet-stream';
}

/** Resuelve un objectPath hacia public/ sin permitir salida del directorio. */
function resolvePublicFile(rawPath: string): string | null {
  if (!rawPath) return null;
  const clean = normalize(rawPath).replace(/^([\\/])+/, '');
  const candidate = resolve(PUBLIC_ROOT, clean);
  const rel = relative(PUBLIC_ROOT, candidate);
  if (rel.startsWith('..')) return null;
  return candidate;
}

/* ------------------------------------------------------------------ */
/* GET /api/archive/demo-file — entrega firmada en modo demo           */
/* ------------------------------------------------------------------ */
/* En modo demo resuelve el objectPath contra public/: si existe un    */
/* archivo real lo entrega con su Content-Type; si no, cae al marcador */
/* de posición. En producción el tráfico va a Supabase Storage.        */
export const GET = guardedRoute(
  {
    route: 'api:archive:demo-file',
    methods: ['GET'],
    rateLimit: 30,
    json: false,
    cacheControl: 'no-store',
    hardenHeaders: false,
  },
  async ({ req }) => {
    const params = Object.fromEntries(req.nextUrl.searchParams.entries());
    if (!verifyDemoSignature(params)) {
      return NextResponse.json({ ok: false, error: 'FIRMA_INVALIDA' }, { status: 403 });
    }

    const objectPath = params.path ?? '';
    const name = params.name ?? objectPath.split('/').pop() ?? 'archivo-rdm';

    const candidate = resolvePublicFile(objectPath);
    if (candidate) {
      try {
        const buffer = await readFile(candidate);
        return new NextResponse(new Uint8Array(buffer), {
          status: 200,
          headers: {
            'Content-Type': mimeFor(candidate),
            'Content-Disposition': `inline; filename="${name.replace(/"/g, '')}"`,
            'Cache-Control': 'public, max-age=3600',
            'X-Content-Type-Options': 'nosniff',
          },
        });
      } catch {
        // archivo ausente: se entrega el marcador de posición
      }
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#082f3b"/><stop offset="1" stop-color="#0d4652"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#g)"/>
      <circle cx="1000" cy="140" r="180" fill="#f2cc76" opacity="0.25"/>
      <text x="600" y="360" text-anchor="middle" font-family="Georgia,serif" font-size="44" fill="#f2cc76">ARCHIVO RDM DIGITAL</text>
      <text x="600" y="430" text-anchor="middle" font-family="monospace" font-size="22" fill="#eef1ec">ARCHIVO HISTÓRICO RDM DIGITAL · MODO DEMO</text>
      <text x="600" y="520" text-anchor="middle" font-family="monospace" font-size="18" fill="#9fc3cc">${name.replace(/"/g, '')}</text>
      <text x="600" y="580" text-anchor="middle" font-family="monospace" font-size="14" fill="#6f9aa5">En producción este enlace entrega el derivado autorizado desde Supabase Storage.</text>
    </svg>`;

    return new NextResponse(svg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Content-Disposition': `inline; filename="${name.replace(/"/g, '')}.svg"`,
        'Cache-Control': 'no-store',
      },
    });
  },
);
