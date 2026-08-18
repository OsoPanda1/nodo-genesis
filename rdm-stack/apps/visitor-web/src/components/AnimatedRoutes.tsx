import { Suspense, lazy, type ComponentType, type LazyExoticComponent } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { RouteErrorBoundary } from "@/components/RouteErrorBoundary";

type TechRouteDef = { path: string; Component: LazyExoticComponent<ComponentType> };

const Index = lazy(() => import("@/pages/Index"));
const Lugares = lazy(() => import("@/pages/Lugares"));
const Directorio = lazy(() => import("@/pages/Directorio"));
const Eventos = lazy(() => import("@/pages/Eventos"));
const Comunidad = lazy(() => import("@/pages/Comunidad"));
const Mapa = lazy(() => import("@/pages/Mapa"));
const Historia = lazy(() => import("@/pages/Historia"));
const Cultura = lazy(() => import("@/pages/Cultura"));
const Relatos = lazy(() => import("@/pages/Relatos"));
const Ecoturismo = lazy(() => import("@/pages/Ecoturismo"));
const Gastronomia = lazy(() => import("@/pages/Gastronomia"));
const Arte = lazy(() => import("@/pages/Arte"));
const Rutas = lazy(() => import("@/pages/Rutas"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const Auth = lazy(() => import("@/pages/Auth"));
const Apoya = lazy(() => import("@/pages/Apoya"));
const Reglamento = lazy(() => import("@/pages/Reglamento"));
const AdminDashboard = lazy(() => import("@/pages/admin/Dashboard"));
const AdminMusica = lazy(() => import("@/pages/admin/Musica"));
const Musica = lazy(() => import("@/pages/Musica"));
const Dichos = lazy(() => import("@/pages/Dichos"));
const Catalogo = lazy(() => import("@/pages/Catalogo"));
const NegociosPortal = lazy(() => import("@/pages/NegociosPortal"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Comercios = lazy(() => import("@/pages/Comercios"));
const Paquetes = lazy(() => import("@/pages/Paquetes"));
const TransporteLocal = lazy(() => import("@/pages/TransporteLocal"));
const ShuttleCDMX = lazy(() => import("@/pages/ShuttleCDMX"));
const QuienesSomos = lazy(() => import("@/pages/QuienesSomos"));
const Donar = lazy(() => import("@/pages/Donar"));
const GraciasDonativo = lazy(() => import("@/pages/GraciasDonativo"));
const ComerciosPanel = lazy(() => import("@/pages/ComerciosPanel"));
const RegistroComercio = lazy(() => import("@/pages/RegistroComercio"));
const Introduccion = lazy(() => import("@/pages/Introduccion"));
const Arquitectura = lazy(() => import("@/pages/Arquitectura"));
const Estrategia = lazy(() => import("@/pages/Estrategia"));
const Filosofia = lazy(() => import("@/pages/Filosofia"));
const DevHub = lazy(() => import("@/pages/DevHub"));
const Documentacion = lazy(() => import("@/pages/Documentacion"));
const Gobernanza = lazy(() => import("@/pages/Gobernanza"));
const Heptafederation = lazy(() => import("@/pages/Heptafederation"));
const ImpactoCivilizatorio = lazy(() => import("@/pages/ImpactoCivilizatorio"));
const IAAgentes = lazy(() => import("@/pages/IAAgentes"));
const IsabellaAI = lazy(() => import("@/pages/IsabellaAI"));
const KitAPIs = lazy(() => import("@/pages/KitAPIs"));
const MetaverseHome = lazy(() => import("@/pages/MetaverseHome"));
const PatrimonioCultural = lazy(() => import("@/pages/PatrimonioCultural"));
const QuantumComputing = lazy(() => import("@/pages/QuantumComputing"));
const RedSocial = lazy(() => import("@/pages/RedSocial"));
const SistemasAvanzados = lazy(() => import("@/pages/SistemasAvanzados"));
const TerritorialDataCollector = lazy(() => import("@/pages/TerritorialDataCollector"));
const XRTecnologia = lazy(() => import("@/pages/XRTecnologia"));
const BiografiaCEO = lazy(() => import("@/pages/BiografiaCEO"));
const Despliegue = lazy(() => import("@/pages/Despliegue"));
const EconomiaFederada = lazy(() => import("@/pages/EconomiaFederada"));
const Manuales = lazy(() => import("@/pages/Manuales"));
const BlockchainMSR = lazy(() => import("@/pages/BlockchainMSR"));
const SeguridadTenochtitlan = lazy(() => import("@/pages/SeguridadTenochtitlan"));
const Estacionamientos = lazy(() => import("@/pages/Estacionamientos"));
const SecurityDashboard = lazy(() => import("@/pages/SecurityDashboard"));
const SecurityDashboardAntifragil = lazy(() => import("@/pages/SecurityDashboardAntifragil"));
const SecurityLogs = lazy(() => import("@/pages/SecurityLogs"));
const FusionRepos = lazy(() => import("@/pages/FusionRepos"));
const Register = lazy(() => import("@/pages/Register"));
const Login = lazy(() => import("@/pages/Login"));
const AuthCallback = lazy(() => import("@/pages/AuthCallback"));
const CasosDeUso = lazy(() => import("@/pages/CasosDeUso"));
const Admin = lazy(() => import("@/pages/Admin"));
const VisualEffects = lazy(() => import("@/pages/VisualEffects"));
const DomainPage = lazy(() => import("@/pages/DomainPage"));
const Timeline = lazy(() => import("@/pages/Timeline"));
const SearchOverlayPage = lazy(() => import("@/pages/SearchOverlay"));
const Feed = lazy(() => import("@/pages/Feed"));
const RDMPageShell = lazy(() => import("@/pages/RDMPageShell"));
const AtlasPastes = lazy(() => import("@/pages/AtlasPastes"));
const AtlasCementerio = lazy(() => import("@/pages/AtlasCementerio"));
const AtlasCalles = lazy(() => import("@/pages/AtlasCalles"));
const AtlasLeyendas = lazy(() => import("@/pages/AtlasLeyendas"));
const AtlasMaximus = lazy(() => import("@/pages/AtlasMaximus"));
const EcosistemaLTOS = lazy(() => import("@/pages/EcosistemaLTOS"));
const Perfil = lazy(() => import("@/pages/Perfil"));
const Leaderboard = lazy(() => import("@/pages/Leaderboard"));
const TerritorialDashboard = lazy(() => import("@/pages/TerritorialDashboard"));
const Wiki = lazy(() => import("@/pages/Wiki"));
const ControlCenter = lazy(() => import("@/pages/ControlCenter"));
const B2BPortal = lazy(() => import("@/pages/B2BPortal"));
const GamePortal = lazy(() => import("@/pages/GamePortal"));
const GameHub = lazy(() => import("@/pages/GameHub"));
const Juegos = lazy(() => import("@/pages/Juegos"));
const LTOS = lazy(() => import("@/pages/LTOS"));
const Mitos = lazy(() => import("@/pages/Mitos"));
const MusicDetail = lazy(() => import("@/pages/MusicDetail"));
const Recorridos = lazy(() => import("@/pages/Recorridos"));
const RutaDelPaste = lazy(() => import("@/pages/RutaDelPaste"));
const DemoChecklist = lazy(() => import("@/pages/DemoChecklist"));
const RealitoAIPage = lazy(() => import("@/pages/RealitoAI"));
const ArchivoSonoro = lazy(() => import("@/pages/ArchivoSonoro"));
const ComerciosCheckout = lazy(() => import("@/pages/ComerciosCheckout"));
const ComerciosRegistroPage = lazy(() => import("@/pages/ComerciosRegistro"));
const Evolucion = lazy(() => import("@/pages/Evolucion"));
const FAQPage = lazy(() => import("@/pages/FAQ"));
const FusionEcosystem = lazy(() => import("@/pages/FusionEcosystem"));
const Membresias = lazy(() => import("@/pages/Membresias"));
const PremiumPlans = lazy(() => import("@/pages/PremiumPlans"));
const Mina = lazy(() => import("@/pages/Mina"));
const Operativo = lazy(() => import("@/pages/Operativo"));
const TAMVApiExplorer = lazy(() => import("@/pages/TAMVApiExplorer"));
const TAMVHub = lazy(() => import("@/pages/TAMVHub"));
const TAMVStatus = lazy(() => import("@/pages/TAMVStatus"));
const TAMVThesis = lazy(() => import("@/pages/TAMVThesis"));
const RFCList = lazy(() => import("@/pages/RFCList"));
const RFCDetail = lazy(() => import("@/pages/RFCDetail"));
const TelemetryDashboardPage = lazy(() => import("@/pages/TelemetryDashboard"));
const Tenochtitlan = lazy(() => import("@/pages/Tenochtitlan"));

// Páginas tech/visión fuera del routing público por defecto.
// Para habilitarlas: VITE_ENABLE_TECH_PAGES=true
const TECH_ROUTES: TechRouteDef[] = [
  { path: "/arquitectura", Component: Arquitectura },
  { path: "/estrategia", Component: Estrategia },
  { path: "/filosofia", Component: Filosofia },
  { path: "/devhub", Component: DevHub },
  { path: "/documentacion", Component: Documentacion },
  { path: "/gobernanza", Component: Gobernanza },
  { path: "/heptafederation", Component: Heptafederation },
  { path: "/impacto-civilizatorio", Component: ImpactoCivilizatorio },
  { path: "/ia-agentes", Component: IAAgentes },
  { path: "/isabella-ai", Component: IsabellaAI },
  { path: "/kit-apis", Component: KitAPIs },
  { path: "/metaverso", Component: MetaverseHome },
  { path: "/quantum-computing", Component: QuantumComputing },
  { path: "/sistemas-avanzados", Component: SistemasAvanzados },
  { path: "/territorial-data", Component: TerritorialDataCollector },
  { path: "/xr-tecnologia", Component: XRTecnologia },
  { path: "/biografia-ceo", Component: BiografiaCEO },
  { path: "/despliegue", Component: Despliegue },
  { path: "/economia-federada", Component: EconomiaFederada },
  { path: "/manuales", Component: Manuales },
  { path: "/blockchain-msr", Component: BlockchainMSR },
  { path: "/seguridad-tenochtitlan", Component: SeguridadTenochtitlan },
  { path: "/security-dashboard", Component: SecurityDashboard },
  { path: "/security-antifragil", Component: SecurityDashboardAntifragil },
  { path: "/security-logs", Component: SecurityLogs },
  { path: "/fusion-repos", Component: FusionRepos },
  { path: "/casos-de-uso", Component: CasosDeUso },
  { path: "/visual-effects", Component: VisualEffects },
  { path: "/timeline", Component: Timeline },
  { path: "/feed", Component: Feed },
  { path: "/rdm-page", Component: RDMPageShell },
  { path: "/ecosistema-ltos", Component: EcosistemaLTOS },
  { path: "/control-center", Component: ControlCenter },
  { path: "/b2b", Component: B2BPortal },
  { path: "/game-portal", Component: GamePortal },
  { path: "/game-hub", Component: GameHub },
  { path: "/juegos", Component: Juegos },
  { path: "/ltos", Component: LTOS },
  { path: "/demo-checklist", Component: DemoChecklist },
  { path: "/api-explorer", Component: TAMVApiExplorer },
  { path: "/tamv-hub", Component: TAMVHub },
  { path: "/tamv-status", Component: TAMVStatus },
  { path: "/tamv-thesis", Component: TAMVThesis },
  { path: "/rfc", Component: RFCList },
  { path: "/rfc/:slug", Component: RFCDetail },
  { path: "/telemetry", Component: TelemetryDashboardPage },
  { path: "/tenochtitlan", Component: Tenochtitlan },
  { path: "/operativo", Component: Operativo },
  { path: "/wiki/:slug", Component: Wiki },
  { path: "/evolucion", Component: Evolucion },
  { path: "/fusion-ecosystem", Component: FusionEcosystem },
  { path: "/domain/:domainName", Component: DomainPage },
];

const TECH_ENABLED = import.meta.env.VITE_ENABLE_TECH_PAGES === "true";

const RouteFallback = () => (
  <div className="min-h-screen w-full flex items-center justify-center bg-background" aria-label="Cargando contenido">
    <div className="animate-pulse text-muted-foreground">Cargando experiencia territorial…</div>
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <Suspense fallback={<RouteFallback />}>
          <Routes location={location}>
            <Route path="/" element={<RouteErrorBoundary route="/"><Index /></RouteErrorBoundary>} />
            <Route path="/mapa" element={<RouteErrorBoundary route="/mapa"><Mapa /></RouteErrorBoundary>} />
            <Route path="/explorar" element={<Navigate to="/mapa" replace />} />
            <Route path="/lugares" element={<RouteErrorBoundary route="/lugares"><Lugares /></RouteErrorBoundary>} />
            <Route path="/directorio" element={<RouteErrorBoundary route="/directorio"><Directorio /></RouteErrorBoundary>} />
            <Route path="/eventos" element={<RouteErrorBoundary route="/eventos"><Eventos /></RouteErrorBoundary>} />
            <Route path="/comunidad" element={<RouteErrorBoundary route="/comunidad"><Comunidad /></RouteErrorBoundary>} />
            <Route path="/historia" element={<RouteErrorBoundary route="/historia"><Historia /></RouteErrorBoundary>} />
            <Route path="/cultura" element={<RouteErrorBoundary route="/cultura"><Cultura /></RouteErrorBoundary>} />
            <Route path="/relatos" element={<RouteErrorBoundary route="/relatos"><Relatos /></RouteErrorBoundary>} />
            <Route path="/ecoturismo" element={<RouteErrorBoundary route="/ecoturismo"><Ecoturismo /></RouteErrorBoundary>} />
            <Route path="/gastronomia" element={<RouteErrorBoundary route="/gastronomia"><Gastronomia /></RouteErrorBoundary>} />
            <Route path="/arte" element={<RouteErrorBoundary route="/arte"><Arte /></RouteErrorBoundary>} />
            <Route path="/rutas" element={<RouteErrorBoundary route="/rutas"><Rutas /></RouteErrorBoundary>} />
            <Route path="/auth" element={<RouteErrorBoundary route="/auth"><Auth /></RouteErrorBoundary>} />
            <Route path="/apoya" element={<RouteErrorBoundary route="/apoya"><Apoya /></RouteErrorBoundary>} />
            <Route path="/reglamento" element={<RouteErrorBoundary route="/reglamento"><Reglamento /></RouteErrorBoundary>} />
            <Route path="/dashboard" element={<RouteErrorBoundary route="/dashboard"><Dashboard /></RouteErrorBoundary>} />
            <Route path="/comercios" element={<RouteErrorBoundary route="/comercios"><Comercios /></RouteErrorBoundary>} />
            <Route path="/paquetes" element={<RouteErrorBoundary route="/paquetes"><Paquetes /></RouteErrorBoundary>} />
            <Route path="/transporte-local" element={<RouteErrorBoundary route="/transporte-local"><TransporteLocal /></RouteErrorBoundary>} />
            <Route path="/shuttle-cdmx" element={<RouteErrorBoundary route="/shuttle-cdmx"><ShuttleCDMX /></RouteErrorBoundary>} />
            <Route path="/quienes-somos" element={<RouteErrorBoundary route="/quienes-somos"><QuienesSomos /></RouteErrorBoundary>} />
            <Route path="/donar" element={<RouteErrorBoundary route="/donar"><Donar /></RouteErrorBoundary>} />
            <Route path="/gracias-donativo" element={<RouteErrorBoundary route="/gracias-donativo"><GraciasDonativo /></RouteErrorBoundary>} />
            <Route path="/comercios-panel" element={<RouteErrorBoundary route="/comercios-panel"><ComerciosPanel /></RouteErrorBoundary>} />
            <Route path="/registro-comercio" element={<RouteErrorBoundary route="/registro-comercio"><RegistroComercio /></RouteErrorBoundary>} />
            <Route path="/musica" element={<RouteErrorBoundary route="/musica"><Musica /></RouteErrorBoundary>} />
            <Route path="/musica/:slug" element={<RouteErrorBoundary route="/musica/:slug"><MusicDetail /></RouteErrorBoundary>} />
            <Route path="/dichos" element={<RouteErrorBoundary route="/dichos"><Dichos /></RouteErrorBoundary>} />
            <Route path="/catalogo" element={<RouteErrorBoundary route="/catalogo"><Catalogo /></RouteErrorBoundary>} />
            <Route path="/negocios" element={<RouteErrorBoundary route="/negocios"><NegociosPortal /></RouteErrorBoundary>} />
            <Route path="/introduccion" element={<RouteErrorBoundary route="/introduccion"><Introduccion /></RouteErrorBoundary>} />
            <Route path="/register" element={<RouteErrorBoundary route="/register"><Register /></RouteErrorBoundary>} />
            <Route path="/login" element={<RouteErrorBoundary route="/login"><Login /></RouteErrorBoundary>} />
            <Route path="/auth/callback" element={<RouteErrorBoundary route="/auth/callback"><AuthCallback /></RouteErrorBoundary>} />
            <Route path="/admin" element={<RouteErrorBoundary route="/admin"><Admin /></RouteErrorBoundary>} />
            <Route path="/admin/musica" element={<RouteErrorBoundary route="/admin/musica"><AdminMusica /></RouteErrorBoundary>} />
            <Route path="/admin/dashboard" element={<RouteErrorBoundary route="/admin/dashboard"><AdminDashboard /></RouteErrorBoundary>} />
            <Route path="/search" element={<RouteErrorBoundary route="/search"><SearchOverlayPage /></RouteErrorBoundary>} />
            <Route path="/atlas/pastes" element={<RouteErrorBoundary route="/atlas/pastes"><AtlasPastes /></RouteErrorBoundary>} />
            <Route path="/atlas/cementerio" element={<RouteErrorBoundary route="/atlas/cementerio"><AtlasCementerio /></RouteErrorBoundary>} />
            <Route path="/atlas/calles" element={<RouteErrorBoundary route="/atlas/calles"><AtlasCalles /></RouteErrorBoundary>} />
            <Route path="/atlas/leyendas" element={<RouteErrorBoundary route="/atlas/leyendas"><AtlasLeyendas /></RouteErrorBoundary>} />
            <Route path="/atlas" element={<RouteErrorBoundary route="/atlas"><AtlasMaximus /></RouteErrorBoundary>} />
            <Route path="/perfil" element={<RouteErrorBoundary route="/perfil"><Perfil /></RouteErrorBoundary>} />
            <Route path="/leaderboard" element={<RouteErrorBoundary route="/leaderboard"><Leaderboard /></RouteErrorBoundary>} />
            <Route path="/territorial-dashboard" element={<RouteErrorBoundary route="/territorial-dashboard"><TerritorialDashboard /></RouteErrorBoundary>} />
            <Route path="/mitos" element={<RouteErrorBoundary route="/mitos"><Mitos /></RouteErrorBoundary>} />
            <Route path="/recorridos" element={<RouteErrorBoundary route="/recorridos"><Recorridos /></RouteErrorBoundary>} />
            <Route path="/ruta-del-paste" element={<RouteErrorBoundary route="/ruta-del-paste"><RutaDelPaste /></RouteErrorBoundary>} />
            <Route path="/admin-panel" element={<RouteErrorBoundary route="/admin-panel"><Admin /></RouteErrorBoundary>} />
            <Route path="/realito-ai" element={<RouteErrorBoundary route="/realito-ai"><RealitoAIPage /></RouteErrorBoundary>} />
            <Route path="/archivo-sonoro" element={<RouteErrorBoundary route="/archivo-sonoro"><ArchivoSonoro /></RouteErrorBoundary>} />
            <Route path="/comercios-checkout" element={<RouteErrorBoundary route="/comercios-checkout"><ComerciosCheckout /></RouteErrorBoundary>} />
            <Route path="/comercios-registro" element={<RouteErrorBoundary route="/comercios-registro"><ComerciosRegistroPage /></RouteErrorBoundary>} />
            <Route path="/faq" element={<RouteErrorBoundary route="/faq"><FAQPage /></RouteErrorBoundary>} />
            <Route path="/membresias" element={<RouteErrorBoundary route="/membresias"><Membresias /></RouteErrorBoundary>} />
            <Route path="/premium" element={<RouteErrorBoundary route="/premium"><PremiumPlans /></RouteErrorBoundary>} />
            <Route path="/mina" element={<RouteErrorBoundary route="/mina"><Mina /></RouteErrorBoundary>} />
            <Route path="/registrar-comercio" element={<RouteErrorBoundary route="/registrar-comercio"><RegistroComercio /></RouteErrorBoundary>} />
            {TECH_ENABLED &&
              TECH_ROUTES.map(({ path, Component }) => (
                <Route
                  key={path}
                  path={path}
                  element={
                    <RouteErrorBoundary route={path}>
                      <Component />
                    </RouteErrorBoundary>
                  }
                />
              ))}
            <Route path="*" element={<RouteErrorBoundary route="*"><NotFound /></RouteErrorBoundary>} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;
