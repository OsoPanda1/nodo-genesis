import { ReactNode, useEffect, useState } from "react";
import { ShieldAlert, RefreshCw } from "lucide-react";
import { isMaintenanceMode, MAINTENANCE_MESSAGE, setMaintenanceOverride, syncOverrideFromUrl } from "@/lib/maintenance";
import DedicationBanner from "@/components/DedicationBanner";

/**
 * Envuelve la aplicación y muestra una pantalla soberana de mantenimiento
 * cuando `VITE_MAINTENANCE_MODE=true` o se fuerza con `?maintenance=on`.
 * Los administradores pueden salir con `?maintenance=off`.
 */
export default function MaintenanceGate({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    syncOverrideFromUrl();
    setActive(isMaintenanceMode());
  }, []);

  if (!active) return <>{children}</>;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-xl space-y-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border border-accent/40 bg-accent/5">
          <ShieldAlert className="w-6 h-6 text-accent" />
        </div>
        <h1 className="font-display text-3xl md:text-5xl font-bold">
          Mantenimiento <span className="text-gradient-gold">soberano</span>
        </h1>
        <p className="text-muted-foreground font-body">{MAINTENANCE_MESSAGE}</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-accent text-accent-foreground text-sm"
          >
            <RefreshCw className="w-4 h-4" /> Reintentar
          </button>
          <button
            onClick={() => {
              setMaintenanceOverride("off");
              window.location.href = "/";
            }}
            className="px-5 py-2 rounded-full border border-border text-sm text-muted-foreground"
          >
            Acceso de operación
          </button>
        </div>
        <DedicationBanner />
      </div>
    </div>
  );
}
