"use client";

import React from "react";
import { ArrowRight, MapPin } from "lucide-react";

/* ================================================================== */
/* Pasaporte RDM — bitácora minera contemporánea. Sellos inspirados    */
/* en monedas y placas, progreso como veta. Sin gamificación infantil. */
/* ================================================================== */

export interface PassportStampItem {
  id: string;
  label: string;
  active: boolean;
}

export default function DigitalPassport({
  onNavigate,
}: {
  onNavigate: (view: string) => void;
}) {
  const stamps: PassportStampItem[] = [
    { id: "acosta", label: "Mina de Acosta", active: true },
    { id: "panteon", label: "Panteón Inglés", active: true },
    { id: "paste", label: "Paste tradicional", active: true },
    { id: "penas", label: "Peñas Cargadas", active: true },
    { id: "museo", label: "Museo de Medicina Laboral", active: false },
  ];

  return (
    <div className="rdm-card overflow-hidden">
      <div className="grid gap-0 md:grid-cols-[1.2fr_1fr]">
        {/* Bitácora */}
        <div className="space-y-6 p-8 md:p-10">
          <div className="space-y-1">
            <p className="rdm-meta text-[#b76e3f]">Pasaporte RDM</p>
            <h2 className="rdm-display-md font-display text-[#10243d]">
              Tu visita tiene 4 memorias activas
            </h2>
            <p className="text-sm text-[#475569]">
              Sellos, fragmentos de mapa y audios que reúnes al recorrer el pueblo.
            </p>
          </div>

          <div className="flex flex-wrap gap-5">
            {stamps.map((s) => (
              <div key={s.id} className="flex flex-col items-center gap-2">
                <span
                  className={`rdm-stamp ${s.active ? "rdm-stamp--active" : ""}`}
                  aria-label={s.label}
                >
                  {s.active ? "·" : "·"}
                </span>
                <span className="max-w-24 text-center text-[10px] font-semibold leading-tight text-[#475569]">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Próxima veta */}
        <div className="flex flex-col justify-between gap-6 border-t border-[#e2e8f0] bg-[#f4f7fb]/70 p-8 md:border-l md:border-t-0 md:p-10">
          <div className="space-y-4">
            <p className="rdm-meta text-[#0b5f6c]">Próxima veta por descubrir</p>
            <div className="flex items-start gap-3">
              <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0b5f6c] text-white">
                <MapPin className="h-4 w-4" />
              </span>
              <div>
                <p className="font-display text-lg font-bold text-[#10243d]">
                  Museo de Medicina Laboral
                </p>
                <p className="text-xs text-[#475569]">a 11 min caminando</p>
              </div>
            </div>
          </div>
          <button onClick={() => onNavigate("pasaporte")} className="rdm-button-primary w-fit">
            Ver mi pasaporte <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}