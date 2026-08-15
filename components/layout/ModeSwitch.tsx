"use client";

import React from 'react';
import { Compass, Network, ArrowLeftRight } from 'lucide-react';
import { useMode } from '@/lib/ui';

/* ================================================================== */
/* ModeSwitch — Conmutador Turístico / Territorio                      */
/* ================================================================== */
/* Interruptor de píldora que alterna el modo global del Nodo Cero.    */
/* En modo turístico predominan las historias y las tarjetas visuales;  */
/* en modo territorio, la infraestructura, los nodos y la analítica.    */
/* ================================================================== */

export default function ModeSwitch() {
  const { mode, toggleMode } = useMode();
  const touristActive = mode === 'tourist';

  return (
    <div className="flex items-center gap-1 p-1 rounded-full border border-slate-700 bg-slate-900/70" role="group" aria-label="Modo de interfaz">
      <button
        onClick={() => touristActive || toggleMode()}
        aria-pressed={touristActive}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${
          touristActive ? 'bg-gradient-to-r from-[#C5A059] to-[#b08a3f] text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Compass className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Turístico</span>
      </button>

      <ArrowLeftRight className="w-3 h-3 text-slate-600 rotate-90" aria-hidden />

      <button
        onClick={() => !touristActive || toggleMode()}
        aria-pressed={!touristActive}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${
          !touristActive ? 'bg-slate-700 text-[#E2E8F0] shadow-md' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Network className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Territorio</span>
      </button>
    </div>
  );
}
