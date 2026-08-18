"use client";

import React, { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  Radio,
} from "lucide-react";
import {
  PORTADA_GROUPS,
  ALL_SECTION_IDS,
  groupForSection,
  scrollToSection,
} from "@/lib/ui/nav-groups";

/* ================================================================== */
/* Barra lateral izquierda — retráctil, acordeón por grupos.          */
/* Inteligente: sigue el scroll del usuario (IntersectionObserver) y  */
/* solo mantiene expandido el grupo de la sección activa. Al colapsar */
/* queda un rail con iconos de grupo.                                 */
/* ================================================================== */

export default function TerritoryRail() {
  const [expanded, setExpanded] = useState(true);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  // undefined: nunca interactuado (sigue el scroll); null: colapsado por el usuario
  const [userOpen, setUserOpen] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: "-25% 0px -60% 0px", threshold: 0 }
    );

    for (const id of ALL_SECTION_IDS) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  const toggleGroup = (id: string) => {
    setUserOpen((v) => (v === id ? null : id));
  };

  const currentId = activeSection ?? ALL_SECTION_IDS[0];
  const currentGroup = groupForSection(currentId) ?? PORTADA_GROUPS[0];
  const shownGroup = userOpen === undefined ? currentGroup.id : userOpen;

  return (
    <>
      {/* Rail lateral izquierdo */}
      <aside
        aria-label="Índice del territorio"
        className={`fixed left-3 top-1/2 z-40 hidden -translate-y-1/2 transition-all duration-300 lg:block ${
          expanded ? "w-64" : "w-16"
        }`}
      >
        <div className="rdm-glass overflow-hidden rounded-2xl border-white/10">
          {/* Cabecera colapsable */}
          <div className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-3">
            {expanded ? (
              <span className="rdm-meta text-[#2e9cff]">Índice</span>
            ) : (
              <Radio className="mx-auto h-4 w-4 text-[#2e9cff]" />
            )}
            <button
              onClick={() => setExpanded((v) => !v)}
              aria-label={expanded ? "Colapsar índice" : "Expandir índice"}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[#93a5ad] transition-colors hover:bg-white/10 hover:text-white"
            >
              {expanded ? (
                <ChevronsLeft className="h-4 w-4" />
              ) : (
                <ChevronsRight className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Contenido */}
          {expanded ? (
            <nav className="space-y-2 p-3" aria-label="Secciones de la portada">
              {PORTADA_GROUPS.map((group) => {
                const Icon = group.icon;
                const isGroupActive = group.id === shownGroup;
                const isActiveInGroup = currentGroup.id === group.id;
                return (
                  <div key={group.id}>
                    <button
                      onClick={() => toggleGroup(group.id)}
                      aria-expanded={isGroupActive}
                      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-semibold transition-colors ${
                        isActiveInGroup
                          ? "bg-[#2e9cff]/15 text-[#2e9cff]"
                          : "text-[#c9d0d4] hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1">{group.label}</span>
                      <ChevronDown
                        className={`h-3.5 w-3.5 text-[#647a84] transition-transform ${
                          isGroupActive ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isGroupActive && (
                      <div className="mt-1 space-y-0.5 pl-4">
                        {group.sections.map((section) => {
                          const isActive = section.id === currentId;
                          return (
                            <button
                              key={section.id}
                              onClick={() => scrollToSection(section.id)}
                              className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-xs transition-colors ${
                                isActive
                                  ? "bg-white/10 font-semibold text-white"
                                  : "text-[#93a5ad] hover:bg-white/5 hover:text-[#c9d0d4]"
                              }`}
                            >
                              {isActive && (
                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#2e9cff]" />
                              )}
                              <span className="leading-snug">{section.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          ) : (
            <nav className="flex flex-col items-center gap-1 p-2" aria-label="Grupos de la portada">
              {PORTADA_GROUPS.map((group) => {
                const Icon = group.icon;
                const isActiveInGroup = currentGroup.id === group.id;
                return (
                  <button
                    key={group.id}
                    onClick={() => {
                      setExpanded(true);
                      setUserOpen(group.id);
                    }}
                    aria-label={group.label}
                    title={group.label}
                    className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                      isActiveInGroup
                        ? "bg-[#2e9cff]/15 text-[#2e9cff]"
                        : "text-[#93a5ad] hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                );
              })}
            </nav>
          )}
        </div>
      </aside>
    </>
  );
}