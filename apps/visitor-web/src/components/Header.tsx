import React from "react";
import Navigation from "@/modules/constelacionInteractiva/Navigation";

/**
 * Header de TAMV Online Network.
 * La Constelación Interactiva se renderiza sobre el campo TAMVTRIX 3.0,
 * usando fondo translúcido y blur para dejar visible la capa T A M V O N L I N E.
 */
const Header: React.FC = () => {
  return (
    <header className="relative z-20 w-full flex items-center justify-center px-4 pt-4 pb-2 pointer-events-none">
      <div className="max-w-6xl w-full pointer-events-auto">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/60 backdrop-blur-2xl shadow-[0_18px_60px_rgba(15,23,42,0.95),0_0_55px_rgba(56,189,248,0.28)]">
          {/* Capa de luz suave que se mezcla con TAMVTRIX */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(56,189,248,0.22),transparent_55%),radial-gradient(circle_at_100%_0%,rgba(192,132,252,0.2),transparent_60%)] mix-blend-soft-light opacity-80" />

          {/* Ruido sutil para textura física */}
          <div className="pointer-events-none absolute inset-0 opacity-40 mix-blend-soft-light bg-[url('data:image/svg+xml,%3Csvg%20viewBox=%220%200%20160%20160%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter%20id=%22n%22%3E%3CfeTurbulence%20type=%22fractalNoise%22%20baseFrequency=%221.6%22%20numOctaves=%223%22%20stitchTiles=%22noStitch%22/%3E%3C/filter%3E%3Crect%20width=%22100%25%22%20height=%22100%25%22%20filter=%22url(%23n)%22%20opacity=%220.32%22/%3E%3C/svg%3E')]" />

          {/* Borde interno iridiscente */}
          <div className="pointer-events-none absolute inset-[1px] rounded-[1.4rem] border border-transparent bg-[conic-gradient(from_140deg,rgba(59,245,255,0.4),rgba(192,132,252,0.35),rgba(59,245,255,0.4))] opacity-45 mix-blend-soft-light" />

          {/* Contenido real del header: Constelación Interactiva */}
          <div className="relative z-10 px-3 py-2 md:px-5 md:py-3">
            <Navigation />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
