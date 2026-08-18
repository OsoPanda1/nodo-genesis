/** Metadatos SEO dinámicos por ruta unificada (usados por <RouteSEO/> y el sitemap). */

export interface RouteSEO {
  path: string;
  title: string;
  description: string;
  /** Prioridad para el sitemap.xml */
  priority?: number;
  changefreq?: "daily" | "weekly" | "monthly";
  /** Excluir de sitemap / marcar noindex (rutas privadas) */
  noindex?: boolean;
}

export const SITE_URL =
  (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, "") ||
  "https://rdmdigital.mx";

export const SITE_NAME = "RDM Digital OS · Nodo Cero";

export const ROUTE_SEO: RouteSEO[] = [
  { path: "/", title: "RDM Digital OS — Real del Monte · Sistema Territorial Soberano", description: "Sistema operativo territorial soberano de Real del Monte, Hidalgo: mapa interactivo, rutas, cultura minera, gastronomía y economía local en una sola plataforma.", priority: 1, changefreq: "daily" },
  { path: "/nodo-cero", title: "Nodo Cero — Centro de mando territorial de Real del Monte", description: "Centro de mando del ecosistema RDM Digital: módulos, pulso de la federación, geolocalización verificada y estado operativo en tiempo real.", priority: 0.9, changefreq: "daily" },
  { path: "/programa-operativo", title: "Programa General y Operativo — Nodo Cero RDM Digital", description: "Programa general y operativo del Nodo Cero: 7 núcleos YUN, 35 nodos operativos, dominios, runbooks y datos territoriales verificados de Real del Monte.", priority: 0.9, changefreq: "weekly" },
  { path: "/hub-unificado", title: "Hub Unificado — Fusión de repositorios RDM Digital", description: "Manifiesto vivo de los repositorios fusionados del ecosistema RDM Digital, LTOS y TAMV Online en un solo proyecto desplegable.", priority: 0.7, changefreq: "weekly" },
  { path: "/federation", title: "Cadena Viva — Federación de datos RDM Digital", description: "Cadena viva de datos entre los repositorios federados con hashes de integridad, latencia y pulso de sincronización.", priority: 0.7, changefreq: "daily" },
  { path: "/ltos", title: "Plataforma Territorial LTOS — Real del Monte", description: "Directorio de las plataformas LTOS del territorio: kernels, Smart City OS, gemelos digitales y módulos federados.", priority: 0.7, changefreq: "weekly" },
  { path: "/genesis", title: "Génesis Unificado — Manifiesto del ecosistema", description: "Manifiesto Génesis con todos los repositorios, páginas y componentes absorbidos por el sistema unificado.", priority: 0.6, changefreq: "monthly" },
  { path: "/mapa", title: "Mapa interactivo de Real del Monte — Geolocalización verificada", description: "Mapa interactivo 2D/3D con minas, panteón inglés, miradores, comercios y rutas con coordenadas verificadas de Real del Monte.", priority: 0.9, changefreq: "weekly" },
  { path: "/geoexplorer", title: "GeoExplorer — Puntos de interés y rutas autoguiadas", description: "Explora puntos de interés, audioguías y rutas autoguiadas por el Pueblo Mágico de Real del Monte, Hidalgo.", priority: 0.8, changefreq: "weekly" },
  { path: "/rutas", title: "Rutas y experiencias en Real del Monte", description: "Rutas turísticas por dificultad, duración y temática: minas, bosque, callejones y patrimonio cornish.", priority: 0.8, changefreq: "weekly" },
  { path: "/gastronomia", title: "Gastronomía de Real del Monte — Pastes y cocina tradicional", description: "Los pastes, cafés, panaderías y cocinas tradicionales del Real: historia cornish y sabores del territorio.", priority: 0.8, changefreq: "weekly" },
  { path: "/historia", title: "Historia minera de Real del Monte", description: "Del real de minas de 1727 a la primera huelga de América (1766) y la llegada de los mineros de Cornualles en 1824.", priority: 0.7, changefreq: "monthly" },
  { path: "/cultura", title: "Cultura y patrimonio de Real del Monte", description: "Patrimonio, tradiciones, arquitectura cornish y vida cultural del Pueblo Mágico de Real del Monte.", priority: 0.7, changefreq: "monthly" },
  { path: "/dichos", title: "Callejón del Dicho Virtual — Archivo de expresiones locales", description: "Archivo digital soberano de los dichos y expresiones de Real del Monte, con su significado y origen.", priority: 0.7, changefreq: "weekly" },
  { path: "/mitos", title: "Mitos y leyendas de Real del Monte", description: "Leyendas mineras, apariciones y tradición oral del Real recopiladas en el archivo territorial.", priority: 0.6, changefreq: "monthly" },
  { path: "/eventos", title: "Eventos y festivales de Real del Monte", description: "Feria Internacional del Paste, fiestas patronales, semana cornish y calendario festivo del territorio.", priority: 0.8, changefreq: "weekly" },
  { path: "/comercios", title: "Comercios y economía local de Real del Monte", description: "Padrón de comercios verificados: pastelerías, platerías, hoteles, restaurantes y artesanos del Real.", priority: 0.8, changefreq: "weekly" },
  { path: "/tradenode", title: "TradeNode — Tienda soberana y padrón artesanal", description: "Tienda soberana con productos artesanales, logística y fondo patrimonial del territorio.", priority: 0.7, changefreq: "weekly" },
  { path: "/servicios", title: "Servicios verificados — Guías, estacionamientos y tours", description: "Guías certificados, ocupación de estacionamientos en tiempo real, tours y cocinas verificadas.", priority: 0.7, changefreq: "weekly" },
  { path: "/transporte", title: "Movilidad y transporte en Real del Monte", description: "Transporte local, shuttle CDMX–Real del Monte y movilidad territorial inteligente.", priority: 0.7, changefreq: "weekly" },
  { path: "/playlist", title: "Playlist Soberana — Música del territorio", description: "Playlist soberana de música local; escúchala y apoya con donativos transparentes al fondo del territorio.", priority: 0.6, changefreq: "weekly" },
  { path: "/media", title: "Media — Podcast, galería y tradición oral", description: "Podcast civil, galería del territorio, ecoturismo y tradición oral de Real del Monte.", priority: 0.6, changefreq: "weekly" },
  { path: "/noticias", title: "InfoMesh — Noticias verificables de Real del Monte", description: "Noticias verificables y archivo histórico digitalizado del territorio.", priority: 0.7, changefreq: "daily" },
  { path: "/membresias", title: "Membresías y gamificación territorial", description: "Planes de membresía para usuarios y comercios, misiones territoriales e insignias de gamificación.", priority: 0.7, changefreq: "monthly" },
  { path: "/foro", title: "Foro civil — Deliberación urbana de Real del Monte", description: "Plataforma de deliberación civil para propuestas urbanas y acuerdos comunitarios.", priority: 0.6, changefreq: "weekly" },
  { path: "/apoya", title: "Apoya el proyecto — Donativos transparentes", description: "Apoya el desarrollo del sistema territorial soberano con donativos transparentes.", priority: 0.6, changefreq: "monthly" },
  { path: "/kernel", title: "TAMV Kernel — Telemetría y preparación operativa", description: "Capas del kernel TAMV, indicadores de preparación operativa y telemetría territorial.", priority: 0.6, changefreq: "weekly" },
  { path: "/manual", title: "Manual soberano — Sistema de diseño RDM Digital", description: "Documentación del sistema de diseño soberano: tokens, tipografía y componentes.", priority: 0.5, changefreq: "monthly" },
  { path: "/about", title: "Acerca de RDM Digital — TAMV Online y Nodo Cero", description: "Misión, visión y arquitectura del proyecto RDM Digital y la red TAMV Online.", priority: 0.6, changefreq: "monthly" },
  { path: "/repos", title: "Ecosistema de repositorios OsoPanda1", description: "Galería del ecosistema de repositorios que sostienen el sistema territorial soberano.", priority: 0.5, changefreq: "weekly" },
  { path: "/realito-ai", title: "Realito AI — Oráculo territorial conversacional", description: "Asistente conversacional territorial que responde con datos verificados de Real del Monte.", priority: 0.7, changefreq: "weekly" },
  { path: "/auth", title: "Acceso — RDM Digital OS", description: "Inicia sesión o crea tu cuenta para acceder a membresías, misiones y módulos del sistema.", noindex: true },
  { path: "/dashboard", title: "Panel de control — RDM Digital OS", description: "Panel privado de usuario y administración del sistema territorial.", noindex: true },
];

const seoIndex = new Map(ROUTE_SEO.map((r) => [r.path, r]));

export function getRouteSEO(pathname: string): RouteSEO {
  const clean = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
  const exact = seoIndex.get(clean);
  if (exact) return exact;

  // Rutas dinámicas: usar el prefijo padre (/ltos/:slug → /ltos)
  const parent = seoIndex.get("/" + clean.split("/").filter(Boolean)[0]);
  if (parent) return { ...parent, path: clean };

  return {
    path: clean,
    title: `${SITE_NAME} — Real del Monte, Hidalgo`,
    description:
      "Sistema operativo territorial soberano de Real del Monte: turismo inteligente, economía local, cultura minera y datos verificados.",
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "Sistema operativo territorial soberano de Real del Monte, Hidalgo, desarrollado por TAMV Online México.",
    areaServed: "Mineral del Monte, Hidalgo, México",
    founder: { "@type": "Person", name: "Edwin Oswaldo Castillo Trejo" },
  };
}
