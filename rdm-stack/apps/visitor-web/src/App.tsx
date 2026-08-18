// src/App.tsx

import {
  useState,
  useEffect,
  lazy,
  Suspense,
  Component,
  type ErrorInfo,
  type ReactNode,
} from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ErrorBoundary from "@/components/ErrorBoundary";
import { AudioPlayerProvider } from "@/contexts/AudioPlayerContext";
import { RDMAuthProvider, useRDMAuth } from "@/contexts/RDMAuthContext";
import { NotificationProvider } from "@/components/NotificationSystem";
import { logger } from "@/lib/logger";
import { captureException } from "@/integrations/observability/sentry";
import { LoadingFallback } from "@/components/LoadingFallback";

// Componentes pesados: lazy loading para reducir bundle inicial
const AppUIProviders = lazy(() => import("@/components/AppUIProviders"));
const AnimatedRoutes = lazy(() => import("@/components/AnimatedRoutes"));
const MicroPageIntro = lazy(() => import("@/components/MicroPageIntro"));
const RealitoChatLauncher = lazy(() => import("./components/RealitoChatLauncher"));
const AmbientLayer = lazy(() => import("@/components/AmbientLayer"));
const LiveTelemetryBadge = lazy(() => import("@/components/LiveTelemetryBadge"));
const SearchOverlay = lazy(() => import("@/components/SearchOverlay"));
const SmartSidebar = lazy(() => import("@/components/SmartSidebar"));
const GlobalPlayerBar = lazy(() => import("@/components/GlobalPlayerBar"));
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 5 minutos: suficiente para datos de turismo/directorio que no cambian cada segundo
      staleTime: 5 * 60 * 1000,
      // Mantener en caché 30 minutos tras quedar sin suscriptores
      gcTime: 30 * 60 * 1000,
      retry: 1,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      // Evitar refetch en mount si los datos aún son frescos
      refetchOnMount: true,
    },
    mutations: {
      retry: 0,
    },
  },
});

// Banner global de estado de auth / Supabase
const AuthStatusBanner = () => {
  const { isSupabaseReady, error } = useRDMAuth();

  if (isSupabaseReady && !error) return null;

  return (
    <div className="w-full bg-amber-900 text-amber-100 text-xs sm:text-sm px-4 py-2 z-50 shadow-md">
      {!isSupabaseReady && (
        <p>
          Autenticación temporalmente deshabilitada: Supabase no está disponible en este entorno.
          Puedes seguir explorando mapas, rutas, economía y narrativas sin iniciar sesión.
        </p>
      )}
      {error && (
        <p className="mt-1">
          Detalle técnico: <span className="font-mono break-all">{error}</span>
        </p>
      )}
    </div>
  );
};

const AppCrashFallback = () => (
  <div className="min-h-screen w-full flex items-center justify-center bg-background p-6">
    <div className="max-w-lg rounded-2xl border border-destructive/30 bg-card p-6 text-center shadow-xl">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-destructive">
        Error crítico
      </p>
      <h1 className="mt-3 font-serif text-2xl font-bold text-foreground">
        No pudimos iniciar la experiencia
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Se detectó un fallo durante el arranque de la aplicación. Recarga la página o vuelve a
        intentar en unos segundos.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="btn-hero-primary mt-6 inline-flex items-center justify-center"
      >
        Recargar aplicación
      </button>
    </div>
  </div>
);

class AppCrashBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error("AppCrashBoundary caught a bootstrap error:", { error, errorInfo });

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("rdm-error", {
          detail: {
            error,
            errorInfo,
            timestamp: new Date().toISOString(),
            boundary: "AppCrashBoundary",
          },
        }),
      );
    }
  }

  render() {
    if (this.state.hasError) return <AppCrashFallback />;
    return this.props.children;
  }
}


const AppInner = () => {
  const [analyticsReady, setAnalyticsReady] = useState(false);
  useEffect(() => {
    const schedule = (fn: () => void) => {
      if ("requestIdleCallback" in window) {
        requestIdleCallback(fn, { timeout: 5000 });
      } else {
        setTimeout(fn, 3000);
      }
    };

    schedule(() => setAnalyticsReady(true));

    schedule(async () => {
      try {
        const { initEventBusBridge } = await import("@/core/yun/event-bus-bridge");
        initEventBusBridge();

        const { unifiedSDK } = await import("@/core/unified/UnifiedSDK");
        unifiedSDK.init();
        await unifiedSDK.startFusionEngine();

        const { federationManager } = await import("@/core/yun/federation-coordinator");
        federationManager.heartbeatAll();
        setInterval(() => federationManager.heartbeatAll(), 30_000);

        await unifiedSDK.triggerAwakening();

        logger.info("[BOOT] Ecosistema YUN + Isabella + UnifiedSDK activo");
      } catch (err) {
        logger.error("[BOOT]", { error: err });
        captureException(err, { module: "SystemBoot" });
      }
    });
  }, []);

  return (
    <ErrorBoundary>
      <AppUIProviders analyticsReady={analyticsReady}>
        <Suspense fallback={<LoadingFallback />}>
          <AmbientLayer />
        </Suspense>
        <AuthStatusBanner />
        <AudioPlayerProvider>
          <Suspense fallback={<LoadingFallback />}>
            <MicroPageIntro />
          </Suspense>
          <AnimatedRoutes />
          <Suspense fallback={<LoadingFallback />}>
            <GlobalPlayerBar />
          </Suspense>
          <Suspense fallback={<LoadingFallback />}>
            <SearchOverlay />
          </Suspense>
          <Suspense fallback={<LoadingFallback />}>
            <SmartSidebar />
          </Suspense>
        </AudioPlayerProvider>
        <Suspense fallback={<LoadingFallback />}>
          <LiveTelemetryBadge />
        </Suspense>
        <Suspense
          fallback={
            <div className="fixed bottom-6 left-6 z-40">
              <div className="flex h-[120px] w-[120px] items-center justify-center">
                <span className="flex h-4 w-4">
                  <span className="absolute inline-flex h-4 w-4 animate-ping rounded-full bg-cyan-400/75" />
                  <span className="relative inline-flex h-4 w-4 rounded-full bg-cyan-400" />
                </span>
              </div>
            </div>
          }
        >
          <RealitoChatLauncher />
        </Suspense>
      </AppUIProviders>
    </ErrorBoundary>
  );
};

const App = () => {
  return (
    <AppCrashBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <RDMAuthProvider>
            <NotificationProvider>
              <AppInner />
            </NotificationProvider>
          </RDMAuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </AppCrashBoundary>
  );
};

export default App;
