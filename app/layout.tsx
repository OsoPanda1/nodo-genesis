import type { Metadata, Viewport } from 'next';
import { Fraunces, Plus_Jakarta_Sans } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { ModeProvider } from '@/lib/ui';
import './globals.css';

/* Tipografía de lujo editorial: serif expresiva (display) + sans de
   precisión (UI). Fallbacks locales en globals.css para builds offline. */
const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const ui = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-ui',
  display: 'swap',
});

/* Dominio canónico del despliegue: https://www.visitarealdelmonte.online.
   visitarealdelmonte.online (apex) responde 308 (permanent redirect) al
   canónico en el edge, así que nunca se renderiza; aún así www es la única
   URL canónica para metadataBase y Open Graph. APP_URL del entorno puede
   sobreescribirlo (usado también por la política de orígenes). */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.APP_URL || 'https://www.visitarealdelmonte.online';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Real del Monte — Destino Turístico Inteligente | Pueblo Mágico, Hidalgo',
    template: '%s | Real del Monte — Destino Turístico Inteligente',
  },
  description:
    'Portal oficial del destino turístico inteligente de Real del Monte, Hidalgo, México: rutas mineras, gastronomía del paste, platería .925, asistente IA Isabella, mapa interactivo, patrimonio y economía local.',
  keywords: [
    'Real del Monte',
    'Pueblo Mágico',
    'Hidalgo',
    'México',
    'Comarca Minera',
    'gemelo digital',
    'Isabella AI',
    'arquitectura heptafederada',
    'turismo territorial',
    'economía phygital',
    'plata .925',
    'pastes tradicionales',
    'RDM Digital Hub',
  ],
  authors: [{ name: 'TAMV Online Network / OsoPanda1' }],
  creator: 'TAMV Online Network',
  publisher: 'TAMV Online Network',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    url: '/',
    siteName: 'Real del Monte — Destino Turístico Inteligente',
    title: 'Real del Monte — Destino Turístico Inteligente | Pueblo Mágico, Hidalgo',
    description:
      'Sistema de Inteligencia Territorial soberano para Real del Monte: gemelo digital 2D/3D, rutas turísticas, Festival del Paste, Isabella AI y economía phygital de la plata y el paste.',
    images: [
      {
        url: '/images/hidalgo-hero1.png',
        width: 1200,
        height: 630,
        alt: 'RDM Digital Hub — Nodo Cero, Real del Monte',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Real del Monte — Destino Turístico Inteligente | Pueblo Mágico',
    description:
      'Portal del destino turístico inteligente de Real del Monte, Hidalgo: rutas, minas, pastes, plata y asistencia cognitiva de Isabella AI.',
    images: ['/images/hidalgo-hero1.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'technology',
  icons: {
    icon: '/images/hidalgo-hero1.png',
    apple: '/images/hidalgo-hero1.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f4f6f2',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning className={`bg-[#f4f6f2] ${display.variable} ${ui.variable}`}>
      <body
        className="min-h-screen bg-[#f4f6f2] text-[#283038] font-ui"
      >
        <ModeProvider>
          {children}
          <Analytics />
        </ModeProvider>
      </body>
    </html>
  );
}
