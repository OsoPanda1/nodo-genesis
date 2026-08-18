import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

const NAV = [
  { to: "/", label: "Umbral" },
  { to: "/isabella", label: "Isabella" },
  { to: "/arquitectura", label: "Arquitectura" },
  { to: "/economia", label: "Economía" },
  { to: "/guardian", label: "Guardián" },
] as const;

export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
          <Link to="/" className="group flex items-center gap-3">
            <span className="relative grid size-9 place-items-center rounded-full border border-primary/40">
              <span className="absolute inset-0 animate-breathe rounded-full bg-primary/20 blur-md" />
              <span className="relative size-2 rounded-full bg-primary" />
            </span>
            <span className="leading-tight">
              <span className="block font-display text-lg text-gold">Isabella Villaseñor AI</span>
              <span className="label-canon">TAMV Online · MD-X4</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground data-[status=active]:bg-secondary data-[status=active]:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="h-px w-full rule-gold" />
      </header>

      <main>{children}</main>

      <footer className="mt-24 border-t border-border/60">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-14 md:grid-cols-3">
          <div>
            <p className="label-canon">Autoridad registral</p>
            <p className="mt-3 font-display text-2xl">Edwin Oswaldo Castillo Trejo</p>
            <p className="text-sm text-muted-foreground">Anubis Villaseñor · ORCID 0009-0008-5050-1539</p>
          </div>
          <div>
            <p className="label-canon">Sello criptográfico</p>
            <p className="mt-3 font-mono text-xs leading-relaxed text-muted-foreground">
              VERSION_GENESIS_1.3_BLINDAJE_JURIDICO_INTERNACIONAL_TOTAL
            </p>
            <p className="mt-2 text-sm text-muted-foreground">Sellado canónico: 13 de agosto de 2026</p>
          </div>
          <div>
            <p className="label-canon">Estado</p>
            <p className="mt-3 text-sm text-muted-foreground">
              Ejecutable · Federado · Auditable · Inmutable
            </p>
            <nav className="mt-4 flex flex-wrap gap-3 text-sm">
              {NAV.map((item) => (
                <Link key={item.to} to={item.to} className="text-muted-foreground hover:text-primary">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
        <p className="border-t border-border/50 px-6 py-6 text-center font-display text-sm text-muted-foreground">
          Que la ley sea anterior al código. Que la memoria no sea privilegio corporativo, sino
          patrimonio distribuido.
        </p>
      </footer>
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="label-canon">{eyebrow}</p>
      <h2 className="mt-4 text-4xl leading-tight md:text-5xl">{title}</h2>
      {lead ? <p className="mt-4 text-base leading-relaxed text-muted-foreground">{lead}</p> : null}
    </div>
  );
}