"use client";

import React, { useEffect, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { RDM_BUSINESSES } from "@/lib/data/rdm-tourism";

/* ================================================================== */
/* Banners publicitarios de los negocios del Real.                     */
/* Fuente: GET /api/businesses (comercios con suscripción publicada).  */
/* En modo demo (sin comercios publicados) usa el catálogo estático    */
/* RDM_BUSINESSES para que la vitrina siempre tenga contenido.         */
/* ================================================================== */

interface BannerItem {
  id: string;
  name: string;
  category: string;
  area: string;
  description: string;
  rating: number;
  tone: string;
}

const CATEGORY_TONE: Record<string, string> = {
  paste: "linear-gradient(120deg, rgba(217,120,50,0.55), rgba(169,72,30,0.28))",
  plateria: "linear-gradient(120deg, rgba(201,208,212,0.4), rgba(100,122,132,0.25))",
  cafe: "linear-gradient(120deg, rgba(13,70,82,0.7), rgba(11,95,108,0.3))",
  artesania: "linear-gradient(120deg, rgba(46,156,255,0.5), rgba(13,70,82,0.3))",
  restaurante: "linear-gradient(120deg, rgba(217,120,50,0.6), rgba(102,42,16,0.3))",
  hotel: "linear-gradient(120deg, rgba(11,95,108,0.6), rgba(7,21,37,0.45))",
  panaderia: "linear-gradient(120deg, rgba(217,120,50,0.5), rgba(122,62,20,0.3))",
  heladeria: "linear-gradient(120deg, rgba(46,156,255,0.45), rgba(13,70,82,0.35))",
};

function fromStatic(b: (typeof RDM_BUSINESSES)[number]): BannerItem {
  return {
    id: b.id,
    name: b.name,
    category: b.category,
    area: b.area,
    description: b.description,
    rating: b.rating,
    tone: CATEGORY_TONE[b.category] ?? "linear-gradient(120deg, rgba(46,156,255,0.45), rgba(13,70,82,0.3))",
  };
}

function fromApi(b: {
  id: string;
  businessName: string;
  category?: string;
  profile?: { description?: string; area?: string; offers?: string[] };
  plan?: string;
}): BannerItem {
  const category = b.category ?? "artesania";
  return {
    id: b.id,
    name: b.businessName,
    category,
    area: b.profile?.area ?? "Real del Monte",
    description:
      b.profile?.offers?.join(" · ") ??
      b.profile?.description ??
      "Comercio del Real del Monte con sello local.",
    rating: 4.8,
    tone: CATEGORY_TONE[category] ?? CATEGORY_TONE.artesania,
  };
}

export default function BusinessBanner({
  onExplore,
  max = 5,
}: {
  onExplore?: (name: string) => void;
  max?: number;
}) {
  const [items, setItems] = useState<BannerItem[]>(() =>
    RDM_BUSINESSES.slice(0, max).map(fromStatic)
  );
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let active = true;
    fetch("/api/businesses")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("no ok"))))
      .then((data) => {
        const list = Array.isArray(data?.businesses) ? data.businesses : [];
        if (active && list.length > 0) setItems(list.slice(0, max).map(fromApi));
      })
      .catch(() => {
        /* demo: se mantiene el catálogo estático */
      });
    return () => {
      active = false;
    };
  }, [max]);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % Math.max(items.length, 1)), 6500);
    return () => clearInterval(t);
  }, [items.length]);

  if (items.length === 0) return null;

  const current = items[index % items.length];
  const prev = () => setIndex((i) => (i - 1 + items.length) % items.length);
  const next = () => setIndex((i) => (i + 1) % items.length);

  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center justify-between">
        <span className="rdm-meta text-[#d97832]">Banners de comercios del Real</span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={prev}
            aria-label="Banner anterior"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#93a5ad] transition-colors hover:bg-white/10 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={next}
            aria-label="Banner siguiente"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#93a5ad] transition-colors hover:bg-white/10 hover:text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-white/10">
        <div
          className="flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {items.map((item, i) => (
            <div
              key={item.id}
              className="w-full shrink-0"
              style={{ opacity: i === index ? 1 : 0.3, transition: "opacity 300ms ease" }}
            >
              <div
                className="relative flex min-h-40 flex-col justify-between gap-4 p-6 md:flex-row md:items-center md:p-8"
                style={{ background: item.tone }}
              >
                <div className="absolute inset-0 bg-[#081119]/35" />
                <div className="relative z-10 max-w-xl space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-white/25 bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                      {item.category}
                    </span>
                    <span className="text-[11px] text-[#c9d0d4]">{item.area}</span>
                  </div>
                  <h3 className="font-display text-2xl font-bold text-white drop-shadow">
                    {item.name}
                  </h3>
                  <p className="line-clamp-2 text-sm text-[#e2e8f0]/90">{item.description}</p>
                </div>
                <div className="relative z-10 flex shrink-0 flex-col items-start gap-3 md:items-end">
                  <span className="flex items-center gap-1 text-xs font-semibold text-[#2e9cff]">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    {item.rating.toFixed(1)}
                  </span>
                  <button
                    onClick={() => onExplore?.(item.name)}
                    className="rdm-button-primary !min-h-11 !px-5 !py-2.5"
                  >
                    Conocer comercio <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Indicadores */}
        <div className="absolute bottom-3 left-6 z-10 flex items-center gap-1.5">
          {items.map((item, i) => (
            <button
              key={item.id}
              onClick={() => setIndex(i)}
              aria-label={`Banner ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-[#d97832]" : "w-1.5 bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}