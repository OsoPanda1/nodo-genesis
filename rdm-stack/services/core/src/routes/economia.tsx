import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SiteChrome, SectionHeading } from "@/components/tamv/SiteChrome";
import { FRI, REVENUE, type RevenueSource } from "@/lib/tamv";

const TITLE = "Economía TAMV · FRI 20/30/50 y 22 fuentes de valor";
const DESC =
  "Plan económico del TAMV: reparto autoejecutable 20/30/50, Protocolo Fénix, Protocolo Hoyo Negro y las 22 fuentes de monetización ética con su retención.";

export const Route = createFileRoute("/economia")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EconomiaPage,
});

const FAMILIES = [
  "Todas",
  "Membresías",
  "Creación",
  "Educación",
  "Licencias",
  "Institucional",
] as const;

const currency = (n: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

function EconomiaPage() {
  const [family, setFamily] = useState<(typeof FAMILIES)[number]>("Todas");
  const [gross, setGross] = useState(120000);

  const rows: RevenueSource[] = useMemo(
    () => (family === "Todas" ? REVENUE : REVENUE.filter((r) => r.family === family)),
    [family],
  );

  return (
    <SiteChrome>
      <section className="mx-auto max-w-7xl px-6 pt-20 pb-12">
        <SectionHeading
          eyebrow="Sección V · Plan económico"
          title="Valor que circula, nunca valor que se concentra"
          lead="Ningún servicio se lanza con margen bruto inferior al 70%, y ningún proceso de cómputo intensivo se subsidia de forma ilimitada en planes baratos."
        />
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="panel-veil p-7 md:p-9">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="label-canon">Simulador FRI autoejecutable</p>
              <h3 className="mt-2 text-2xl">Utilidad bruta del ciclo</h3>
            </div>
            <p className="font-display text-5xl text-gold">{currency(gross)}</p>
          </div>
          <input
            type="range"
            min={5000}
            max={2000000}
            step={5000}
            value={gross}
            onChange={(e) => setGross(Number(e.target.value))}
            aria-label="Utilidad bruta del ciclo en dólares"
            className="mt-6 w-full accent-[var(--gold)]"
          />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {FRI.map((f) => (
              <div key={f.name} className="rounded-xl border border-border/60 bg-background/40 p-6">
                <div className="flex items-baseline justify-between">
                  <p className="font-mono text-xs tracking-[0.25em] text-primary">{f.share}%</p>
                  <p className="font-display text-3xl">{currency((gross * f.share) / 100)}</p>
                </div>
                <h4 className="mt-4 text-lg">{f.name}</h4>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.detail}</p>
                <div className="mt-4 h-1.5 rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-accent to-primary transition-all duration-700"
                    style={{ width: `${f.share}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="panel-veil p-7">
            <p className="label-canon">Protocolo Fénix</p>
            <h3 className="mt-3 text-2xl">Reparación antes que castigo</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Canaliza el 20% reservado para cerrar brechas económicas de los creadores y financiar
              el acceso educativo en la UTAMV. La reparación es una obligación del sistema, no una
              campaña de imagen.
            </p>
          </div>
          <div className="panel-veil p-7 border-destructive/30">
            <p className="label-canon text-destructive">Protocolo Hoyo Negro</p>
            <h3 className="mt-3 text-2xl">Contención financiera inmediata</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Ante fraude, lavado o abuso especulativo: congelación de activos, reetiquetado de los
              registros en la MSR y reasignación de los fondos capturados al Fondo Fénix.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <SectionHeading
          eyebrow="22 fuentes de monetización integral"
          title="Cada ingreso declara su retención"
          lead="La transparencia económica es parte de la constitución: el creador sabe siempre qué porcentaje sostiene la infraestructura."
        />
        <div className="mt-8 flex flex-wrap gap-2">
          {FAMILIES.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFamily(f)}
              className={`rounded-full border px-4 py-2 text-xs transition ${
                family === f
                  ? "border-primary/60 bg-primary/15 text-primary"
                  : "border-border/70 text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="mt-8 overflow-hidden rounded-xl border border-border/60">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/50">
              <tr className="font-mono text-[0.62rem] tracking-widest text-muted-foreground">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">FUENTE</th>
                <th className="hidden px-4 py-3 md:table-cell">MECÁNICA</th>
                <th className="px-4 py-3 text-right">RETENCIÓN TAMV</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.n} className="border-t border-border/50 transition hover:bg-secondary/30">
                  <td className="px-4 py-4 font-mono text-xs text-primary">
                    {String(r.n).padStart(2, "0")}
                  </td>
                  <td className="px-4 py-4">{r.name}</td>
                  <td className="hidden px-4 py-4 text-muted-foreground md:table-cell">{r.desc}</td>
                  <td className="px-4 py-4 text-right font-mono text-xs text-accent">{r.take}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </SiteChrome>
  );
}