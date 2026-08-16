"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Cpu, Landmark, Search, Sparkles, Menu, X } from "lucide-react";

/* ================================================================== */
/* Navegación flotante por intención. Cristal oscuro sobre el hero,    */
/* perla sólida al desplazarse. Menú móvil accesible con pulgar.       */
/* ================================================================== */

export interface NavIntent {
  id: string;
  label: string;
  href: string;
}

const NAV_ITEMS: NavIntent[] = [
  { id: "explora", label: "Explora", href: "#explora" },
  { id: "rutas", label: "Rutas", href: "#rutas" },
  { id: "sabores", label: "Sabores", href: "#sabores" },
  { id: "agenda", label: "Agenda", href: "#agenda" },
  { id: "archivo", label: "Archivo", href: "#archivo" },
  { id: "pasaporte", label: "Pasaporte", href: "#pasaporte" },
];

export default function FloatingNav({
  onOpenIsabella,
  onSearch,
}: {
  onOpenIsabella: () => void;
  onSearch?: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`rdm-nav fixed inset-x-0 top-0 z-50 ${
        scrolled ? "rdm-nav--scrolled" : "rdm-nav--over-hero"
      }`}
    >
      <div className="rdm-shell flex items-center justify-between gap-4 px-6 py-3">
        <Link href="/" className="flex items-center gap-3" aria-label="Inicio — Real del Monte">
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-xl ${
              scrolled ? "bg-[#10243d] text-white" : "bg-white/15 text-white border border-white/20 backdrop-blur"
            }`}
          >
            <Landmark className="h-5 w-5" />
          </span>
          <span className="hidden sm:block">
            <span
              className={`block font-display text-base font-bold leading-tight transition-colors ${
                scrolled ? "text-[#10243d]" : "text-white"
              }`}
            >
              Real del Monte
            </span>
            <span
              className={`block text-[9px] uppercase tracking-[0.28em] transition-colors ${
                scrolled ? "text-[#475569]" : "text-[#cbd5e1]"
              }`}
            >
              Destino inteligente
            </span>
          </span>
        </Link>

        {/* Navegación por intención */}
        <nav className="hidden lg:flex items-center gap-5" aria-label="Navegación principal">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`text-xs font-semibold transition-colors ${
                scrolled ? "text-[#475569] hover:text-[#0b5f6c]" : "text-[#e2e8f0]/85 hover:text-white"
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {onSearch && (
            <button
              onClick={onSearch}
              aria-label="Buscar"
              className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                scrolled ? "text-[#0b5f6c] hover:bg-[#e2e8f0]" : "text-white/80 hover:bg-white/10"
              }`}
            >
              <Search className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={onOpenIsabella}
            className={`rdm-chip ${
              scrolled ? "" : "!bg-[#10243d]/55 !border-white/20 !text-white"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-[#f6b752]" />
            <span className="hidden sm:inline">Isabella</span>
          </button>
          <Link
            href="/nodo"
            className={`rdm-chip ${scrolled ? "" : "!bg-[#10243d]/55 !border-white/20 !text-white"}`}
          >
            <Cpu className="h-3.5 w-3.5 text-[#94a3b8]" />
            <span className="hidden sm:inline">Nodo</span>
          </Link>

          {/* Menú móvil */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
            className={`flex h-10 w-10 items-center justify-center rounded-full lg:hidden ${
              scrolled ? "text-[#10243d]" : "text-white"
            }`}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Panel móvil */}
      {mobileOpen && (
        <nav
          className="lg:hidden mx-4 mb-3 rounded-2xl border border-[#e2e8f0] bg-white/95 p-4 shadow-[var(--rdm-shadow-soft)] backdrop-blur-xl"
          aria-label="Menú móvil"
        >
          <div className="grid gap-1">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  setMobileOpen(false);
                  document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
                }}
                className="flex min-h-12 items-center rounded-xl px-4 text-sm font-semibold text-[#1e293b] transition-colors hover:bg-[#f4f7fb]"
              >
                {item.label}
              </a>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}