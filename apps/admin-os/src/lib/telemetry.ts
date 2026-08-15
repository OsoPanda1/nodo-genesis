/**
 * Telemetría básica de producción (Vercel):
 * - Captura errores globales y promesas rechazadas.
 * - Métricas de navegación (ruta, duración de sesión por ruta, tiempo de carga).
 * - Buffer en memoria + `localStorage` para diagnóstico y envío opcional al backend.
 */

export type TelemetryEvent = {
  type: "error" | "navigation" | "vital" | "info";
  name: string;
  detail?: Record<string, unknown>;
  route: string;
  ts: string;
};

const STORAGE_KEY = "rdm:telemetry:buffer";
const MAX_EVENTS = 100;

let buffer: TelemetryEvent[] = [];
let started = false;

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(buffer.slice(-MAX_EVENTS)));
  } catch {
    /* almacenamiento no disponible */
  }
}

export function getTelemetryBuffer(): TelemetryEvent[] {
  if (buffer.length === 0) {
    try {
      buffer = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as TelemetryEvent[];
    } catch {
      buffer = [];
    }
  }
  return buffer;
}

export function clearTelemetry() {
  buffer = [];
  persist();
}

export function track(
  type: TelemetryEvent["type"],
  name: string,
  detail?: Record<string, unknown>,
) {
  const event: TelemetryEvent = {
    type,
    name,
    detail,
    route: typeof window !== "undefined" ? window.location.pathname : "-",
    ts: new Date().toISOString(),
  };
  buffer = [...getTelemetryBuffer(), event].slice(-MAX_EVENTS);
  persist();

  if (import.meta.env.DEV || type === "error") {
    const label = `[telemetry:${type}] ${name}`;
    if (type === "error") console.error(label, detail);
    else console.info(label, detail);
  }
}

export function trackNavigation(route: string, previous?: string, dwellMs?: number) {
  track("navigation", route, { previous, dwellMs });
}

/** Instala los listeners globales una sola vez. */
export function startTelemetry() {
  if (started || typeof window === "undefined") return;
  started = true;

  window.addEventListener("error", (e) => {
    track("error", e.message || "window.error", {
      source: e.filename,
      line: e.lineno,
      col: e.colno,
      stack: e.error instanceof Error ? e.error.stack?.slice(0, 800) : undefined,
    });
  });

  window.addEventListener("unhandledrejection", (e) => {
    const reason = e.reason;
    track("error", "unhandledrejection", {
      message: reason instanceof Error ? reason.message : String(reason),
      stack: reason instanceof Error ? reason.stack?.slice(0, 800) : undefined,
    });
  });

  // Métrica de carga inicial (Navigation Timing v2)
  window.addEventListener("load", () => {
    const nav = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;
    if (nav) {
      track("vital", "page-load", {
        ttfbMs: Math.round(nav.responseStart),
        domContentLoadedMs: Math.round(nav.domContentLoadedEventEnd),
        loadMs: Math.round(nav.loadEventEnd),
        env: import.meta.env.MODE,
      });
    }
  });
}
