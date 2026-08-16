"use client";

import React from "react";
import {
  History,
  Footprints,
  UtensilsCrossed,
  Wind,
  Music,
  ArrowRight,
} from "lucide-react";

/* ================================================================== */
/* Explora según tu deseo — entrada por intención, no mega-menú.       */
/* ================================================================== */

export interface DesireOption {
  id: string;
  label: string;
  hint: string;
  icon: React.ReactNode;
  view: string;
}

const DESIRES: DesireOption[] = [
  { id: "historia", label: "Quiero historia", hint: "Minas, museos y memoria", icon: <History className="h-5 w-5" />, view: "heritage" },
  { id: "caminar", label: "Quiero caminar", hint: "Rutas y senderos", icon: <Footprints className="h-5 w-5" />, view: "tourism" },
  { id: "comer", label: "Quiero comer", hint: "Pastes, mixiotes y café", icon: <UtensilsCrossed className="h-5 w-5" />, view: "gastronomy" },
  { id: "respirar", label: "Quiero respirar", hint: "Naturaleza y miradores", icon: <Wind className="h-5 w-5" />, view: "map" },
  { id: "escuchar", label: "Quiero escuchar", hint: "Leyendas y canciones", icon: <Music className="h-5 w-5" />, view: "media" },
];

export default function IntentMenu({
  onNavigate,
}: {
  onNavigate: (view: string) => void;
}) {
  return (
    <div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {DESIRES.map((d) => (
          <button
            key={d.id}
            onClick={() => onNavigate(d.view)}
            className="rdm-card group flex flex-col items-start gap-3 p-5 text-left"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0d4652]/10 text-[#0d4652] transition-colors group-hover:bg-[#0d4652] group-hover:text-white">
              {d.icon}
            </span>
            <span>
              <span className="block font-display text-base font-bold text-[#10243d]">
                {d.label}
              </span>
              <span className="mt-0.5 block text-xs text-[#475569]">{d.hint}</span>
            </span>
            <ArrowRight className="mt-auto h-4 w-4 text-[#94a3b8] transition-transform group-hover:translate-x-1 group-hover:text-[#2e9cff]" />
          </button>
        ))}
      </div>
    </div>
  );
}