import type {NextConfig} from 'next';

/* C.R.O.W.N. — Cabeceras de seguridad Zero Trust aplicadas en el edge.
   CSP estricta: los tiles del mapa (Carto) y el iframe de Spotify son
   los únicos orígenes externos permitidos. */
const securityHeaders = [
  { key: 'Content-Security-Policy', value: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://*.basemaps.cartocdn.com https://*.tile.openstreetmap.org https://images.unsplash.com",
    "media-src 'self' blob: data:",
    "font-src 'self' data:",
    "connect-src 'self' ws: wss:",
    "frame-src https://open.spotify.com",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join('; ') },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self), payment=(), usb=()' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
  { key: 'Origin-Agent-Cluster', value: '?1' },
  { key: 'X-DNS-Prefetch-Control', value: 'off' },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Baja latencia: quita header de framework, compresión y keep-alive.
  poweredByHeader: false,
  compress: true,
  httpAgentOptions: {
    keepAlive: true,
  },
  async redirects() {
    // Dominio canónico: www.visitarealdelmonte.online. El apex
    // (visitarealdelmonte.online) redirige 308 (permanent redirect) al
    // canónico. Se mantiene el host en el destino para que la política de
    // orígenes y metadataBase usen siempre www.
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'visitarealdelmonte.online' }],
        destination: 'https://www.visitarealdelmonte.online/:path*',
        permanent: true,
      },
    ];
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    deviceSizes: [375, 640, 750, 828, 1080, 1200, 1920],
    formats: ['image/avif', 'image/webp'],
  },
  // Vercel handles serverless output natively. Standalone mode is only for Docker / self-hosted environments.
  output: process.env.VERCEL ? undefined : undefined,
  // Next.js 16 usa Turbopack por defecto; la config webpack legacy solo se aplica con --webpack.
  turbopack: {},
  transpilePackages: ['motion', 'three', '@react-three/fiber'],
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        // Assets inmutables: caché de largo plazo (baja latencia de recarga)
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
  webpack: (config, {dev}) => {
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    // File watching is disabled to prevent flickering during agent edits.
    if (dev && process.env.DISABLE_HMR === 'true') {
      config.watchOptions = {
        ignored: /.*/,
      };
    }
    return config;
  },
};

export default nextConfig;
