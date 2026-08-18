import type { LucideIcon } from "lucide-react";
import {
  Compass,
  UtensilsCrossed,
  Archive,
  Heart,
} from "lucide-react";

/* ================================================================== */
/* Grupos de navegación de la portada. Fuente única para la navbar     */
/* superior derecha (acordeón) y la barra lateral izquierda inteligente.*/
/* ================================================================== */

export interface NavSectionItem {
  id: string;
  label: string;
}

export interface NavGroup {
  id: string;
  label: string;
  icon: LucideIcon;
  sections: NavSectionItem[];
}

export const PORTADA_GROUPS: NavGroup[] = [
  {
    id: "descubre",
    label: "Descubre",
    icon: Compass,
    sections: [
      { id: "explora", label: "Explora según tu deseo" },
      { id: "mapa", label: "Mapa vivo del territorio" },
      { id: "rutas", label: "Rutas de memoria" },
    ],
  },
  {
    id: "vive",
    label: "Vive el lugar",
    icon: UtensilsCrossed,
    sections: [
      { id: "sabores", label: "Sabores y oficios" },
      { id: "agenda", label: "Agenda del destino" },
      { id: "media", label: "Música y podcast" },
    ],
  },
  {
    id: "memoria",
    label: "Memoria",
    icon: Archive,
    sections: [
      { id: "archivo", label: "Archivo vivo del Real" },
      { id: "pasaporte", label: "Pasaporte RDM" },
    ],
  },
  {
    id: "comunidad",
    label: "Comunidad",
    icon: Heart,
    sections: [{ id: "comunidad", label: "Comunidad del Real" }],
  },
];

export function groupForSection(id: string | null): NavGroup | null {
  if (!id) return null;
  return PORTADA_GROUPS.find((g) => g.sections.some((s) => s.id === id)) ?? null;
}

export const ALL_SECTION_IDS = PORTADA_GROUPS.flatMap((g) =>
  g.sections.map((s) => s.id)
);

export function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}