"use client";

/* ================================================================== */
/* MAPA — Barrera de errores de las visualizaciones                    */
/* ================================================================== */
/* Aísla los fallos de render de los mapas (WebGL, datos, SVG) para    */
/* que un error puntual jamás expulse al usuario de la plataforma.     */
/* ================================================================== */

import { Component, type ReactNode } from "react";

interface MapErrorBoundaryProps {
  children: ReactNode;
  label?: string;
}

interface MapErrorBoundaryState {
  hasError: boolean;
}

export class MapErrorBoundary extends Component<
  MapErrorBoundaryProps,
  MapErrorBoundaryState
> {
  state: MapErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): MapErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown): void {
    // Reintenta automáticamente al montar de nuevo; no propagamos al árbol.
    console.error("[MapErrorBoundary] fallo de visualización:", error);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[420px] w-full flex-col items-center justify-center gap-4 rounded-3xl border border-[rgba(200,163,86,0.25)] bg-[radial-gradient(circle_at_30%_20%,rgba(200,163,86,0.12),transparent_55%),linear-gradient(180deg,#0f1b28,#0a1320)] px-6 py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[rgba(200,163,86,0.4)] bg-[rgba(200,163,86,0.1)] text-[#c8a356]">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <div className="space-y-1">
            <h3 className="font-patrimonial text-xl font-bold text-[#eef2f7]">
              La visualización no pudo renderizarse
            </h3>
            <p className="mx-auto max-w-sm text-xs leading-relaxed text-slate-400">
              {this.props.label ?? "El gemelo digital encontró un error puntual. Tu sesión sigue activa."}
            </p>
          </div>
          <button
            type="button"
            onClick={this.handleRetry}
            className="rounded-full border border-[rgba(200,163,86,0.45)] px-5 py-2 text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-[#c8a356] transition-all hover:bg-[rgba(200,163,86,0.12)]"
          >
            Reintentar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
