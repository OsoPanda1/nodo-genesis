"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Cpu, Landmark, Search, Sparkles, Menu, X, ChevronDown } from "lucide-react";
import { PORTADA_GROUPS, scrollToSection } from "@/lib/ui/nav-groups";

/* ================================================================== */
/* Navegación flotante por intención. Cristal oscuro sobre el hero y   */
/* sobre el manto petrolero al desplazarse. Menú superior derecho      */
/* retráctil en acordeón por secciones (grupos). Menú móvil accesible. */
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
  const [indexOpen, setIndexOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<string[]>(["descubre"]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const go = (id: string) => {
    setMobileOpen(false);
    setIndexOpen(false);
    scrollToSection(id);
  };

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
              scrolled
                ? "bg-[#0d4652] text-white shadow-[0_6px_18px_rgba(13,70,82,0.3)]"
                : "border border-white/25 bg-white/15 text-white backdrop-blur"
            }`}
          >
            <Landmark className="h-5 w-5" />
          </span>
          <span className="hidden sm:block">
            <span
              className={`block font-display text-base font-bold leading-tight transition-colors ${
                scrolled ? "text-[#eef2f2]" : "text-white"
              }`}
            >
              Real del Monte
            </span>
            <span
              className={`block text-[9px] uppercase tracking-[0.28em] transition-colors ${
                scrolled ? "text-[#c9d0d4]" : "text-[#cbd5e1]"
              }`}
            >
              Destino inteligente
            </span>
          </span>
        </Link>

        {/* Navegación por intención (desktop) */}
        <nav className="hidden lg:flex items-center gap-5" aria-label="Navegación principal">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                go(item.id);
              }}
              className={`text-xs font-semibold transition-colors ${
                scrolled ? "text-[#c9d0d4] hover:text-white" : "text-[#e2e8f0]/85 hover:text-white"
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
                scrolled ? "text-[#c9d0d4] hover:bg-white/10" : "text-white/80 hover:bg-white/10"
              }`}
            >
              <Search className="h-4 w-4" />
            </button>
          )}

          {/* Índice retráctil en acordeón (esquina superior derecha) */}
          <div className="relative">
            <button
              onClick={() => setIndexOpen((v) => !v)}
              aria-expanded={indexOpen}
              aria-label={indexOpen ? "Cerrar índice" : "Abrir índice"}
              className={`rdm-chip ${indexOpen ? "border-[#2e9cff]/50 !text-white" : ""} ${
                scrolled ? "border-[#2e9cff]/30" : "!bg-[#10243d]/55 !border-white/20 !text-white"
              }`}
            >
              <Menu className="h-3.5 w-3.5 text-[#2e9cff]" />
              <span className="hidden sm:inline">Índice</span>
              <ChevronDown
                className={`h-3 w-3 transition-transform ${indexOpen ? "rotate-180" : ""}`}
              />
            </button>

            {indexOpen && (
              <div className="absolute right-0 top-12 w-72 overflow-hidden rounded-2xl border border-white/10 bg-[#0d1c26]/95 shadow-[var(--rdm-shadow-deep)] backdrop-blur-xl">
                <div className="max-h-[70vh] overflow-y-auto p-3">
                  {PORTADA_GROUPS.map((group) => {
                    const Icon = group.icon;
                    const isOpen = openGroups.includes(group.id);
                    return (
                      <div key={group.id} className="mb-1">
                        <button
                          onClick={() => toggleGroup(group.id)}
                          aria-expanded={isOpen}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-[#c9d0d4] transition-colors hover:bg-white/5 hover:text-white"
                        >
                          <Icon className="h-4 w-4 shrink-0 text-[#2e9cff]" />
                          <span className="flex-1">{group.label}</span>
                          <ChevronDown
                            className={`h-3.5 w-3.5 text-[#647a84] transition-transform ${
                              isOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {isOpen && (
                          <div className="mt-0.5 space-y-0.5 pb-1 pl-9">
                            {group.sections.map((section) => (
                              <button
                                key={section.id}
                                onClick={() => go(section.id)}
                                className="block w-full rounded-lg px-3 py-1.5 text-left text-xs text-[#93a5ad] transition-colors hover:bg-white/5 hover:text-white"
                              >
                                {section.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="border-t border-white/10 p-3">
                  <Link
                    href="/nodo"
                    onClick={() => setIndexOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#0d4652] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#0b5f6c]"
                  >
                    <Cpu className="h-3.5 w-3.5 text-[#2e9cff]" />
                    Núcleo tecnológico del Nodo
                  </Link>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onOpenIsabella}
            className={`rdm-chip ${
              scrolled ? "border-[#2e9cff]/30" : "!bg-[#10243d]/55 !border-white/20 !text-white"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-[#d97832]" />
            <span className="hidden sm:inline">Isabella</span>
          </button>
          <Link
            href="/nodo"
            className={`hidden md:inline-flex rdm-chip ${
              scrolled ? "" : "!bg-[#10243d]/55 !border-white/20 !text-white"
            }`}
          >
            <Cpu className="h-3.5 w-3.5 text-[#2e9cff]" />
            <span className="hidden sm:inline">Nodo</span>
          </Link>

          {/* Menú móvil */}
          <button
            onClick={() => {
              setMobileOpen((v) => !v);
              setIndexOpen(false);
            }}
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
            className={`flex h-10 w-10 items-center justify-center rounded-full lg:hidden ${
              scrolled ? "text-[#eef2f2]" : "text-white"
            }`}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Panel móvil — acordeón por grupos */}
      {mobileOpen && (
        <nav
          className="lg:hidden mx-4 mb-3 rounded-2xl border border-white/10 bg-[#0d1c26]/95 p-4 shadow-[var(--rdm-shadow-soft)] backdrop-blur-xl"
          aria-label="Menú móvil"
        >
          <div className="space-y-1">
            {PORTADA_GROUPS.map((group) => {
              const Icon = group.icon;
              const isOpen = openGroups.includes(group.id);
              return (
                <div key={group.id}>
                  <button
                    onClick={() => toggleGroup(group.id)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#c9d0d4] transition-colors hover:bg-white/5"
                  >
                    <Icon className="h-4 w-4 text-[#2e9cff]" />
                    <span className="flex-1 text-left">{group.label}</span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-[#647a84] transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="mt-0.5 space-y-0.5 pb-1 pl-9">
                      {group.sections.map((section) => (
                        <button
                          key={section.id}
                          onClick={() => go(section.id)}
                          className="block w-full rounded-lg px-3 py-2 text-left text-xs text-[#93a5ad] transition-colors hover:bg-white/5 hover:text-white"
                        >
                          {section.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            <Link
              href="/nodo"
              onClick={() => setMobileOpen(false)}
              className="mt-2 flex min-h-11 items-center gap-2 rounded-xl bg-[#0d4652] px-3 py-2 text-sm font-semibold text-white"
            >
              <Cpu className="h-4 w-4 text-[#2e9cff]" />
              Núcleo tecnológico del Nodo
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}