// src/components/ErrorBoundary.tsx

import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { logger } from "@/lib/logger";
import { captureException } from "@/integrations/observability/sentry";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(_error: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error("ErrorBoundary caught:", { error, errorInfo });

    captureException(error, { boundary: "ErrorBoundary", errorInfo });

    if (typeof window !== "undefined") {
      try {
        window.dispatchEvent(
          new CustomEvent("rdm-error", {
            detail: {
              error,
              errorInfo,
              timestamp: new Date().toISOString(),
              boundary: "ErrorBoundary",
            },
          }),
        );
      } catch (e) {
        logger.error("ErrorBoundary event dispatch failed:", { error: e });
      }
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex min-h-[400px] items-center justify-center p-8">
          <div className="max-w-md text-center">
            <div
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{
                background:
                  "linear-gradient(135deg, hsla(40,80%,55%,0.2), hsla(40,80%,55%,0.05))",
              }}
            >
              <AlertTriangle className="h-8 w-8 text-amber-500" />
            </div>
            <h2 className="mb-2 font-serif text-2xl font-bold text-foreground">
              Algo salió mal
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Ha ocurrido un error inesperado. Puedes intentar de nuevo o recargar la página.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={this.handleRetry}
                className="btn-hero-primary inline-flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reintentar
              </button>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 rounded-lg border border-amber-700/30 bg-amber-950/40 px-4 py-2 text-sm text-amber-200 hover:bg-amber-900/50"
              >
                Recargar página
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
