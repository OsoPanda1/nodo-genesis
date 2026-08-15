import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Apoya from "./pages/Apoya.tsx";
import Arte from "./pages/Arte.tsx";
import Auth from "./pages/Auth.tsx";
import Catalogo from "./pages/Catalogo.tsx";
import Comunidad from "./pages/Comunidad.tsx";
import Cultura from "./pages/Cultura.tsx";
import Dichos from "./pages/Dichos.tsx";
import Directorio from "./pages/Directorio.tsx";
import Ecoturismo from "./pages/Ecoturismo.tsx";
import Eventos from "./pages/Eventos.tsx";
import Gastronomia from "./pages/Gastronomia.tsx";
import Historia from "./pages/Historia.tsx";
import Lugares from "./pages/Lugares.tsx";
import Mapa from "./pages/Mapa.tsx";
import NegociosPortal from "./pages/NegociosPortal.tsx";
import Reglamento from "./pages/Reglamento.tsx";
import Relatos from "./pages/Relatos.tsx";
import Rutas from "./pages/Rutas.tsx";
import Comercios from "./pages/Comercios.tsx";
import Paquetes from "./pages/Paquetes.tsx";
import ComunidadPage from "./pages/ComunidadPage.tsx";
import TransporteLocal from "./pages/TransporteLocal.tsx";
import ShuttleCDMX from "./pages/ShuttleCDMX.tsx";
import Atlas from "./pages/Atlas.tsx";
import Guardian from "./pages/Guardian.tsx";
import DevHub from "./pages/DevHub.tsx";
import Federation from "./pages/Federation.tsx";
import About from "./pages/About.tsx";
import Repos from "./pages/Repos.tsx";
import NodoCero from "./pages/NodoCero.tsx";
import Mitos from "./pages/Mitos.tsx";
import Transporte from "./pages/Transporte.tsx";
import TamvHub from "./pages/TamvHub.tsx";
import RealitoAI from "./pages/RealitoAI.tsx";
import Ltos from "./pages/Ltos.tsx";
import LtosDetail from "./pages/LtosDetail.tsx";
import Genesis from "./pages/Genesis.tsx";
import Playlist from "./pages/Playlist.tsx";
import Noticias from "./pages/Noticias.tsx";
import GeoExplorer from "./pages/GeoExplorer.tsx";
import TradeNode from "./pages/TradeNode.tsx";
import Servicios from "./pages/Servicios.tsx";
import Membresias from "./pages/Membresias.tsx";
import Foro from "./pages/Foro.tsx";
import Kernel from "./pages/Kernel.tsx";
import Media from "./pages/Media.tsx";
import Manual from "./pages/Manual.tsx";
import HubUnificado from "./pages/HubUnificado.tsx";
import ProgramaOperativo from "./pages/ProgramaOperativo.tsx";
import RouteSEO from "@/components/RouteSEO";
import MaintenanceGate from "@/components/MaintenanceGate";
import { startTelemetry } from "@/lib/telemetry";
import { enforceIvoryBackground } from "@/lib/design-guardrails";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    enforceIvoryBackground();
    startTelemetry();
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <MaintenanceGate>
        <BrowserRouter>
          <RouteSEO />
          <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/apoya" element={<Apoya />} />
          <Route path="/arte" element={<Arte />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/comunidad" element={<ComunidadPage />} />
          <Route path="/cultura" element={<Cultura />} />
          <Route path="/dichos" element={<Dichos />} />
          <Route path="/directorio" element={<Directorio />} />
          <Route path="/ecoturismo" element={<Ecoturismo />} />
          <Route path="/eventos" element={<Eventos />} />
          <Route path="/gastronomia" element={<Gastronomia />} />
          <Route path="/historia" element={<Historia />} />
          <Route path="/lugares" element={<Lugares />} />
          <Route path="/mapa" element={<Mapa />} />
          <Route path="/explorar" element={<Mapa />} />
          <Route path="/experiencias" element={<Rutas />} />
          <Route path="/patrimonio" element={<Cultura />} />
          <Route path="/sabores" element={<Gastronomia />} />
          <Route path="/economia" element={<NegociosPortal />} />
          <Route path="/planificador" element={<Rutas />} />
          <Route path="/realito" element={<RealitoAI />} />
          <Route path="/negocios-portal" element={<NegociosPortal />} />
          <Route path="/comercios" element={<Comercios />} />
          <Route path="/paquetes" element={<Paquetes />} />
          <Route path="/transporte-local" element={<TransporteLocal />} />
          <Route path="/shuttle-cdmx-rdm" element={<ShuttleCDMX />} />
          <Route path="/reglamento" element={<Reglamento />} />
          <Route path="/relatos" element={<Relatos />} />
          <Route path="/rutas" element={<Rutas />} />
          {/* TAMV Civilizational Core Routes */}
          <Route path="/atlas" element={<Atlas />} />
          <Route path="/guardian" element={<Guardian />} />
           <Route path="/devhub" element={<DevHub />} />
           <Route path="/federation" element={<Federation />} />
           <Route path="/about" element={<About />} />
           <Route path="/acerca" element={<About />} />
           <Route path="/repos" element={<Repos />} />
           <Route path="/ecosistema" element={<Repos />} />
           <Route path="/nodo-cero" element={<NodoCero />} />
           <Route path="/centro-mando" element={<NodoCero />} />
           <Route path="/mitos" element={<Mitos />} />
           <Route path="/transporte" element={<Transporte />} />
           <Route path="/tamv-hub" element={<TamvHub />} />
           <Route path="/tamv" element={<TamvHub />} />
           <Route path="/realito-ai" element={<RealitoAI />} />
           <Route path="/ltos" element={<Ltos />} />
           <Route path="/ltos/:slug" element={<LtosDetail />} />
           <Route path="/plataforma-ltos" element={<Ltos />} />
           <Route path="/plataforma-ltos/:slug" element={<LtosDetail />} />
           <Route path="/fusion" element={<Ltos />} />
           <Route path="/genesis" element={<Genesis />} />
           <Route path="/unificacion" element={<Genesis />} />
           <Route path="/playlist" element={<Playlist />} />
           <Route path="/musica" element={<Playlist />} />
           <Route path="/noticias" element={<Noticias />} />
           <Route path="/infomesh" element={<Noticias />} />
           <Route path="/geoexplorer" element={<GeoExplorer />} />
           <Route path="/tradenode" element={<TradeNode />} />
           <Route path="/tienda" element={<TradeNode />} />
           <Route path="/servicios" element={<Servicios />} />
           <Route path="/membresias" element={<Membresias />} />
           <Route path="/gamificacion" element={<Membresias />} />
           <Route path="/foro" element={<Foro />} />
           <Route path="/kernel" element={<Kernel />} />
           <Route path="/telemetria" element={<Kernel />} />
           <Route path="/media" element={<Media />} />
           <Route path="/podcast" element={<Media />} />
           <Route path="/manual" element={<Manual />} />
           {/* Fusión unificada de los 9 repositorios */}
           <Route path="/hub-unificado" element={<HubUnificado />} />
           <Route path="/hub" element={<HubUnificado />} />
           <Route path="/fusion-total" element={<HubUnificado />} />
           {/* Alias heredados de los repos absorbidos */}
           <Route path="/login" element={<Auth />} />
           <Route path="/register" element={<Auth />} />
           <Route path="/perfil" element={<Dashboard />} />
           <Route path="/control-center" element={<NodoCero />} />
           <Route path="/telemetry" element={<Kernel />} />
           <Route path="/mapa-vivo" element={<Mapa />} />
           <Route path="/feed" element={<ComunidadPage />} />
           <Route path="/red-social" element={<ComunidadPage />} />
           <Route path="/b2b" element={<NegociosPortal />} />
           <Route path="/isabella" element={<RealitoAI />} />
           <Route path="/wiki" element={<Manual />} />
           <Route path="/juegos" element={<Membresias />} />
           <Route path="/leaderboard" element={<Membresias />} />
           <Route path="/donar" element={<Apoya />} />
           <Route path="/quienes-somos" element={<About />} />
           <Route path="/timeline" element={<Historia />} />
           <Route path="/estacionamientos" element={<Servicios />} />
           <Route path="/turismo" element={<Rutas />} />
           {/* Programa general y operativo fusionado (nodo-cero / visitarealdelmonte / ldtocs) */}
           <Route path="/programa-operativo" element={<ProgramaOperativo />} />
           <Route path="/programa" element={<ProgramaOperativo />} />
           <Route path="/operacion" element={<ProgramaOperativo />} />
          <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </MaintenanceGate>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
  );
};

export default App;
