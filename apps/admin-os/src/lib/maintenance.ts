/**
 * Modo de mantenimiento configurable.
 * Prioridad: override local (?maintenance=on|off, guardado en localStorage) > variable de entorno.
 * En Vercel se activa con `VITE_MAINTENANCE_MODE=true` (Production/Preview) sin tocar código.
 */

const KEY = "rdm:maintenance:override";

export const MAINTENANCE_MESSAGE =
  (import.meta.env.VITE_MAINTENANCE_MESSAGE as string | undefined) ??
  "Estamos desplegando una nueva versión soberana del sistema. Volvemos en unos minutos.";

function envEnabled() {
  const raw = String(import.meta.env.VITE_MAINTENANCE_MODE ?? "").toLowerCase();
  return raw === "true" || raw === "1" || raw === "on";
}

export function readOverride(): "on" | "off" | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === "on" || v === "off" ? v : null;
  } catch {
    return null;
  }
}

export function setMaintenanceOverride(value: "on" | "off" | null) {
  try {
    if (value === null) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, value);
  } catch {
    /* noop */
  }
}

/** Lee `?maintenance=on|off|reset` de la URL y lo persiste. */
export function syncOverrideFromUrl() {
  if (typeof window === "undefined") return;
  const param = new URLSearchParams(window.location.search).get("maintenance");
  if (!param) return;
  if (param === "reset") setMaintenanceOverride(null);
  else if (param === "on" || param === "off") setMaintenanceOverride(param);
}

export function isMaintenanceMode(): boolean {
  const override = readOverride();
  if (override) return override === "on";
  return envEnabled();
}
