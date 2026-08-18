import { createFileRoute } from "@tanstack/react-router";
import { SiteChrome, SectionHeading } from "@/components/tamv/SiteChrome";
import { AST_STATES, LAYERS, NODES, ORCHESTRATION } from "@/lib/tamv";

const TITLE = "Arquitectura TAMV · 7 capas federadas y motor AST";
const DESC =
  "Jerarquía L0–L3, las siete capas constitucionales federadas, BookPI, MSR, Anubis Sentinel y los cinco estados del Motor de Supervivencia Autónoma.";

export const Route = createFileRoute("/arquitectura")({
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
  component: ArquitecturaPage,
});

const STATE_TONE: Record<string, string> = {
  NORMAL: "text-accent border-accent/50",
  OBLIVION: "text-muted-foreground border-border",
  BUNKER: "text-destructive border-destructive/50",
  ORPHAN: "text-muted-foreground border-border",
  PHOENIX: "text-primary border-primary/50",
};

function ArquitecturaPage() {
  return (
    <SiteChrome>
      <section className="mx-auto max-w-7xl px-6 pt-20 pb-12">
        <SectionHeading
          eyebrow="Sección II · Arquitectura multicapa"
          title="Doble mapeo: orquestación L0–L3 y siete capas constitucionales"
          lead="La arquitectura no describe un producto; describe una jurisdicción técnica capaz de sobrevivir a sus propios operadores."
        />
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-4 md:grid-cols-4">
          {ORCHESTRATION.map((o) => (
            <div key={o.level} className="panel-veil p-6">
              <p className="font-display text-4xl text-gold">{o.level}</p>
              <h3 className="mt-3 text-lg">{o.title}</h3>
              <p className="mt-2 font-mono text-xs leading-relaxed text-muted-foreground">
                {o.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <SectionHeading eyebrow="Las 7 capas federadas" title="Especificación estructural" />
        <div className="mt-12 space-y-4">
          {LAYERS.map((layer) => (
            <article
              key={layer.id}
              id={`capa-${layer.id}`}
              className="panel-veil scroll-mt-24 p-7"
            >
              <div className="flex flex-wrap items-baseline gap-4">
                <span className="font-mono text-xs tracking-[0.3em] text-primary">
                  {layer.code}
                </span>
                <h3 className="text-2xl">{layer.name}</h3>
              </div>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                {layer.purpose}
              </p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {layer.components.map((c) => (
                  <li
                    key={c}
                    className="rounded-full border border-border/70 px-3 py-1.5 text-xs text-muted-foreground"
                  >
                    {c}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Capa 3 · Registrabilidad probatoria"
              title="BookPI™ + MSR Ledger"
              lead="Toda acción institucional, transacción o cambio de política genera un bloque inmutable."
            />
            <pre className="mt-8 overflow-x-auto rounded-xl border border-border/60 bg-background/60 p-5 font-mono text-xs leading-relaxed text-accent">
{`Hash(n) = SHA256(
  Hash(n-1) + EventType + Metadata + Timestamp
)`}
            </pre>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Los bloques se sincronizan con el MSR Ledger para obtener admisibilidad
              interjurisdiccional bajo eIDAS e ISO/IEC 27037. Anubis Sentinel™ vigila el flujo:
              ante estado corrupto fuerza al nodo a SAFE_MODE y emite un evento de integridad.
            </p>
          </div>
          <div>
            <SectionHeading
              eyebrow="Capa 6 · Ponderación constitucional"
              title="SACDAO y visibilidad no algorítmica"
              lead="Ni el voto ni la visibilidad se compran: se ganan con ética, contribución y coherencia histórica."
            />
            <div className="mt-8 space-y-4">
              <pre className="overflow-x-auto rounded-xl border border-border/60 bg-background/60 p-5 font-mono text-xs text-primary">
{`V = Tokens × Ética × Contribución × Coherencia_Histórica`}
              </pre>
              <pre className="overflow-x-auto rounded-xl border border-border/60 bg-background/60 p-5 font-mono text-xs text-primary">
{`Visibilidad = Ética × Contribución × Diversidad × Coherencia_Histórica`}
              </pre>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Regla inmutable de UI/UX: prohibición absoluta de feeds infinitos, timelines
                manipulativos, rankings opacos y contadores de popularidad. Existen territorios
                persistentes con gravedad social y envejecimiento 4D.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <SectionHeading
          eyebrow="Motor AST"
          title="Estados de resistencia autoejecutables"
          lead="Del funcionamiento pleno al renacimiento por rehidratación desde BookPI y MSR."
        />
        <div className="mt-10 space-y-3">
          {AST_STATES.map((s) => (
            <div
              key={s.state}
              className="flex flex-col gap-2 rounded-xl border border-border/60 px-6 py-5 md:flex-row md:items-center md:gap-8"
            >
              <span
                className={`w-fit rounded-full border px-3 py-1 font-mono text-[0.65rem] tracking-widest ${STATE_TONE[s.state]}`}
              >
                {s.state}
              </span>
              <span className="font-display text-lg md:w-72">{s.title}</span>
              <span className="flex-1 text-sm text-muted-foreground">{s.detail}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <SectionHeading
          eyebrow="Atlas civilizatorio"
          title="Nodos federados y su estado AST"
          lead="El volumen representa carga operativa; el color, el estado de resistencia del nodo."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {NODES.map((n) => (
            <div key={n.name} className="panel-veil p-6">
              <div className="flex items-center justify-between">
                <p className="font-display text-xl">{n.name}</p>
                <span
                  className={`rounded-full border px-2.5 py-1 font-mono text-[0.6rem] tracking-widest ${STATE_TONE[n.state]}`}
                >
                  {n.state}
                </span>
              </div>
              <p className="label-canon mt-2">{n.type}</p>
              <div className="mt-5 h-1.5 rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent to-primary"
                  style={{ width: `${n.load * 100}%` }}
                />
              </div>
              <p className="mt-2 font-mono text-[0.65rem] text-muted-foreground">
                CARGA {(n.load * 100).toFixed(0)}%
              </p>
            </div>
          ))}
        </div>
      </section>
    </SiteChrome>
  );
}