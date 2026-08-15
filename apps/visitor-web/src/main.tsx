import React from "react";
import { createRoot } from "react-dom/client";
import { logger } from "@/lib/logger";
import "./styles.css";

const container = document.getElementById("root");
if (!container) {
  throw new Error("No se encontr\u00f3 el elemento #root en el DOM.");
}

const root = createRoot(container);

const BootstrapFallback = ({ error }: { error?: unknown }) => (
  <div className="min-h-screen w-full flex items-center justify-center bg-background p-6 text-foreground">
    <div className="max-w-lg rounded-2xl border border-destructive/30 bg-card p-6 text-center shadow-xl">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-destructive">
        Error de arranque
      </p>
      <h1 className="mt-3 font-serif text-2xl font-bold">No pudimos cargar la aplicaci\u00f3n</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        El paquete principal no se inicializ\u00f3 correctamente. Recarga la p\u00e1gina para intentar de
        nuevo.
      </p>
      {error instanceof Error && (
        <pre className="mt-4 max-h-40 overflow-auto rounded-lg bg-muted p-3 text-left text-xs text-muted-foreground">
          {error.message}
        </pre>
      )}
      <button
        onClick={() => window.location.reload()}
        className="btn-hero-primary mt-6 inline-flex items-center justify-center"
      >
        Recargar aplicaci\u00f3n
      </button>
    </div>
  </div>
);

async function bootstrap() {
  try {
    const [{ default: App }, { initSentry }] = await Promise.all([
      import("./App"),
      import("@/integrations/observability/sentry"),
    ]);
    void initSentry();
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
  } catch (error) {
    logger.error("[bootstrap] Failed to initialize application", { error });
    root.render(
      <React.StrictMode>
        <BootstrapFallback error={error} />
      </React.StrictMode>,
    );
  }
}

void bootstrap();
