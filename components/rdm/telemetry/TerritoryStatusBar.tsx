"use client";

import React from "react";
import { Thermometer, Users, Car, Accessibility, Radio } from "lucide-react";

/* ================================================================== */
/* Barra de telemetría territorial — 'AHORA EN REAL DEL MONTE'.        */
/* Sin datos inventados: las señales se anuncian en integración y se   */
/* alimentarán con instrumentación real del territorio.                */
/* ================================================================== */

interface PendingSignal {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const PENDING: PendingSignal[] = [
  { id: "clima", label: "Clima", icon: <Thermometer className="h-4 w-4" /> },
  { id: "aforo", label: "Aforo", icon: <Users className="h-4 w-4" /> },
  { id: "movilidad", label: "Movilidad", icon: <Car className="h-4 w-4" /> },
  { id: "accesibilidad", label: "Accesibilidad", icon: <Accessibility className="h-4 w-4" /> },
];

export default function TerritoryStatusBar() {
  return (
    <div
      className="rdm-telemetry rdm-glass border-white/10"
      role="region"
      aria-label="Ahora en Real del Monte"
    >
      <div className="flex items-center gap-2">
        <span className="rdm-meta text-[#2e9cff]">Ahora en Real del Monte</span>
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        {PENDING.map((s) => (
          <div key={s.id} className="flex items-center gap-2.5">
            <span
              className="rdm-signal rdm-signal--pending"
              aria-label={`${s.label}: sin datos aún`}
            >
              {s.icon}
              <span className="font-normal normal-case tracking-normal text-[#93a5ad]">
                <span className="font-semibold text-[#c9d0d4]">{s.label}:</span> —
              </span>
            </span>
            <span className="hidden text-[11px] text-[#647a84] xl:inline">· en integración</span>
          </div>
        ))}
      </div>
      <div className="ml-auto flex items-center gap-2 text-[#c9d0d4]">
        <Radio className="h-4 w-4 text-[#2e9cff]" />
        <span className="text-xs font-semibold">Instrumentación real en curso</span>
      </div>
    </div>
  );
}