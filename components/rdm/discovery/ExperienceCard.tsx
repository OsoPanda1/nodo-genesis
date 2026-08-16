"use client";

import React, { useState } from "react";
import {
  Bookmark,
  ArrowRight,
  Clock,
  Accessibility,
  Volume2,
  Signal,
} from "lucide-react";

/* ================================================================== */
/* Tarjeta de experiencia — fragmento de lugar, no rectángulo genérico.*/
/* Muestra aforo, accesibilidad y audio con iconos (no solo color).   */
/* ================================================================== */

export interface ExperienceItem {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  time?: string;
  aforo?: string;
  accessibility?: string;
  audio?: string;
  tone: string; // color de la veta (category)
}

export default function ExperienceCard({
  item,
  onExplore,
}: {
  item: ExperienceItem;
  onExplore?: (item: ExperienceItem) => void;
}) {
  const [saved, setSaved] = useState(false);

  return (
    <article className="rdm-card group flex flex-col border-[#cbd5e1]/80">
      <div className="relative aspect-[4/5] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.image}
          alt={item.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071525]/85 via-transparent to-transparent" />
        <span
          className="absolute left-3 top-3 rdm-chip"
          style={{ background: item.tone, color: "#fff", border: "none" }}
        >
          {item.category}
        </span>
        {item.time && (
          <span className="absolute right-3 top-3 rdm-chip border-[#cbd5e1]/40 bg-[#10243d]/60 text-white backdrop-blur">
            <Clock className="h-3 w-3" /> {item.time}
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 p-4">
          <h3 className="font-display text-xl font-bold text-white drop-shadow">
            {item.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#e2e8f0]/85">
            {item.description}
          </p>
        </div>
      </div>

      {/* Datos vivos del lugar */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-3">
        {item.aforo && (
          <span className="rdm-signal rdm-signal--warn" title={item.aforo}>
            <Signal className="h-3.5 w-3.5" />
            {item.aforo}
          </span>
        )}
        {item.accessibility && (
          <span className="rdm-signal rdm-signal--ok" title={item.accessibility}>
            <Accessibility className="h-3.5 w-3.5" />
            {item.accessibility}
          </span>
        )}
        {item.audio && (
          <span className="rdm-signal rdm-signal--ok" title="Audio disponible">
            <Volume2 className="h-3.5 w-3.5" />
            Audio
          </span>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-[#e2e8f0] px-4 py-3">
        <button
          onClick={() => setSaved((v) => !v)}
          aria-pressed={saved}
          className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${
            saved ? "text-[#b76e3f]" : "text-[#475569] hover:text-[#0d4652]"
          }`}
        >
          <Bookmark className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
          {saved ? "Guardado" : "Guardar"}
        </button>
        <button
          onClick={() => onExplore?.(item)}
          className="flex items-center gap-1.5 text-xs font-bold text-[#0d4652] transition-colors hover:text-[#2e9cff]"
        >
          Explorar <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </article>
  );
}