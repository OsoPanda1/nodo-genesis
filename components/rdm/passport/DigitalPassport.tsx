"use client";

import React from "react";
import { ArrowRight, MapPin } from "lucide-react";

/* ================================================================== */
/* Pasaporte RDM — bitácora minera contemporánea. Sellos inspirados    */
/* en monedas y placas, progreso como veta. Los sellos se activan con  */
/* datos reales de recorrido: sin visitas registradas, el estado es    */
/* honesto y vacío.                                                    */
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
    { id: "acosta", label: "Mina de Acosta", active: false },
    { id: "panteon", label: "Panteón Inglés", active: false },
    { id: "paste", label: "Paste tradicional", active: false },
    { id: "penas", label: "Peñas Cargadas", active: false },
    { id: "museo", label: "Museo de Medicina Laboral", active: false },
  ];

  return (
    <div className="rdm-card overflow-hidden border-white/10">
      <div className="grid gap-0 md:grid-cols-[1.2fr_1fr]">
        {/* Bitácora */}
        <div className="space-y-6 p-8 md:p-10">
          <div className="space-y-1">
            <p className="rdm-meta text-[#d97832]">Pasaporte RDM</p>
            <h2 className="rdm-display-md font-display text-[#eef2f2]">
              Tu bitácora se activa con tu recorrido
            </h2>
            <p className="text-sm text-[#93a5ad]">
              Los sellos se marcan con datos reales al visitar cada lugar. Aún sin recorridos
              registrados.
            </p>
          </div>

          <div className="flex flex-wrap gap-5">
            {stamps.map((s) => (
              <div key={s.id} className="flex flex-col items-center gap-2">
                <span
                  className={`rdm-stamp ${s.active ? "rdm-stamp--active" : ""}`}
                  aria-label={s.label}
                >
                  ·
                </span>
                <span className="max-w-24 text-center text-[10px] font-semibold leading-tight text-[#93a5ad]">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Próxima veta */}
        <div className="flex flex-col justify-between gap-6 border-t border-white/10 bg-[#0d1c26]/60 p-8 md:border-l md:border-t-0 md:p-10">
          <div className="space-y-4">
            <p className="rdm-meta text-[#2e9cff]">Próxima veta por descubrir</p>
            <div className="flex items-start gap-3">
              <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#2e9cff] text-white">
                <MapPin className="h-4 w-4" />
              </span>
              <div>
                <p className="font-display text-lg font-bold text-[#eef2f2]">
                  Mina de Acosta
                </p>
                <p className="text-xs text-[#93a5ad]">
                  El sello se marca al registrarte en el lugar · registro real próximamente
                </p>
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