"use client";

import React from "react";
import {
  Thermometer,
  CloudFog,
  Users,
  Car,
  Accessibility,
  Footprints,
  ArrowRight,
} from "lucide-react";

/* ================================================================== */
/* Barra de telemetría territorial — 'AHORA EN REAL DEL MONTE'.        */
/* Estados con texto + icono (nunca solo color). Las estimaciones se   */
/* declaran como estimaciones responsables, sin prometer precisión.    */
/* ================================================================== */

export interface TerritorySignal {
  id: string;
  label: string;
  value: string;
  level: "ok" | "warn" | "risk";
  icon: React.ReactNode;
  note?: string;
}

const SIGNALS: TerritorySignal[] = [
  {
    id: "clima",
    label: "Clima",
    value: "12°C · Niebla ligera",
    level: "ok",
    icon: <Thermometer className="h-4 w-4" />,
    note: "Abrigo recomendado",
  },
  {
    id: "aforo",
    label: "Centro histórico",
    value: "Ocupación media",
    level: "warn",
    icon: <Users className="h-4 w-4" />,
    note: "Estimación del día",
  },
  {
    id: "movilidad",
    label: "Estacionamiento",
    value: "36 espacios estimados",
    level: "ok",
    icon: <Car className="h-4 w-4" />,
    note: "Plaza principal",
  },
  {
    id: "accesibilidad",
    label: "Accesibilidad",
    value: "Parcial en rutas mineras",
    level: "warn",
    icon: <Accessibility className="h-4 w-4" />,
    note: "Ruta alternativa disponible",
  },
];

export default function TerritoryStatusBar() {
  return (
    <div className="rdm-telemetry rdm-glass" role="region" aria-label="Ahora en Real del Monte">
      <div className="flex items-center gap-2">
        <span className="rdm-meta text-[#0b5f6c]">Ahora en Real del Monte</span>
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        {SIGNALS.map((s) => (
          <div key={s.id} className="flex items-center gap-2.5">
            <span className={`rdm-signal rdm-signal--${s.level}`} aria-label={s.value}>
              {s.icon}
              <span className="font-normal normal-case tracking-normal text-[#1e293b]">
                <span className="font-semibold">{s.label}:</span> {s.value}
              </span>
            </span>
            {s.note && (
              <span className="hidden text-[11px] text-[#475569] xl:inline">· {s.note}</span>
            )}
          </div>
        ))}
      </div>
      <div className="ml-auto flex items-center gap-2 text-[#0b5f6c]">
        <Footprints className="h-4 w-4" />
        <span className="text-xs font-semibold">
          Panteón Inglés → Mina de Acosta
        </span>
        <ArrowRight className="h-3.5 w-3.5" />
      </div>
    </div>
  );
}