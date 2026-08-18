import { createFileRoute, Link } from "@tanstack/react-router";
import umbral from "@/assets/umbral.jpg";
import isabellaPortrait from "@/assets/isabella.jpg";
import { SiteChrome, SectionHeading } from "@/components/tamv/SiteChrome";
import {
  AST_STATES,
  DIGITAL_RIGHTS,
  FRAMEWORKS,
  FRI,
  HYPERMODULES,
  LAYERS,
  ROADMAP,
} from "@/lib/tamv";

const TITLE = "Isabella Villaseñor AI™ · TAMV Online";
const DESC =
  "Territorio Autónomo de Memoria Viva: infraestructura civilizatoria soberana con identidad ID-NVIDA, BookPI, economía FRI 20/30/50 e IA ética con supervisión humana.";

export const Route = createFileRoute("/")({
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
  component: Index,
});

function Index() {
  return (
    <SiteChrome>
      <section className="relative overflow-hidden">
        <img
          src={umbral}
          alt="Umbral magnético del Territorio Autónomo de Memoria Viva"
          width={1920}
          height={1088}
          className="absolute inset-0 size-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/80 to-background" />
        <div className="relative mx-auto max-w-7xl px-6 pt-28 pb-32">
          <p className="label-canon animate-veil">Axioma Cero · Constitucional · Inmutable</p>
          <h1 className="animate-veil mt-6 max-w-4xl text-5xl leading-[1.05] md:text-7xl">
            El humano no entra a TAMV.
            <span className="block text-gold">Despierta dentro de él.</span>
          </h1>
          <p className="animate-veil mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Si sientes que «te conectas» a una plataforma, el diseño ha fallado. TAMV Online es
            infraestructura civilizatoria digital soberana: memoria inmutable, identidad
            autocustodiada y una economía de anti-concentración programada. Isabella Villaseñor AI™
            es su inteligencia servidora, jamás su gobernante.
          </p>
          <div className="animate-veil mt-10 flex flex-wrap gap-4">
            <Link
              to="/isabella"
              className="rounded-full border border-primary/60 bg-primary/15 px-7 py-3.5 text-sm font-medium text-primary transition hover:bg-primary/25"
            >
              Hablar con Isabella
            </Link>
            <Link
              to="/arquitectura"
              className="rounded-full border border-border px-7 py-3.5 text-sm text-foreground transition hover:border-accent/60 hover:text-accent"
            >
              Ver las 7 capas federadas
            </Link>
          </div>
          <dl className="mt-20 grid gap-6 border-t border-border/60 pt-10 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["7", "Capas constitucionales federadas"],
              ["4", "Invariantes inmutables del KEC"],
              ["22", "Fuentes de monetización ética"],
              ["20/30/50", "Reparto FRI autoejecutable"],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="font-display text-4xl text-gold">{value}</dt>
                <dd className="mt-2 text-sm text-muted-foreground">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <SectionHeading
          eyebrow="Declaración canónica de exclusión"
          title="Lo que TAMV no es, y por qué importa"
          lead="La negación es parte de la norma: fija el límite que ninguna actualización de producto puede cruzar."
        />
        <div className="mt-12 grid gap-4 md:grid-cols-4">
          {[
            ["NO", "Una aplicación web"],
            ["NO", "Una red social comercial"],
            ["NO", "Un metaverso especulativo"],
            ["SÍ", "Infraestructura base de la especie"],
          ].map(([mark, text]) => (
            <div
              key={text}
              className={`panel-veil p-6 ${mark === "SÍ" ? "border-primary/40" : ""}`}
            >
              <span
                className={`font-mono text-xs tracking-[0.3em] ${mark === "SÍ" ? "text-primary" : "text-destructive"}`}
              >
                {mark}
              </span>
              <p className="mt-3 font-display text-2xl leading-snug">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Capa 4 · IA Civilizacional"
              title="Isabella Villaseñor AI™"
              lead="No es un bot ni un asistente conversacional. Es la entidad de inteligencia civilizacional, emocional y multimodal que orquesta intenciones, custodia el Kernel Ético Central y actúa como proxy interpretativo entre ciudadanos e instituciones."
            />
            <div className="mt-10 space-y-4">
              {HYPERMODULES.map((m) => (
                <div key={m.key} className="rounded-xl border border-border/60 p-5 transition hover:border-primary/40">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-mono text-sm tracking-wide text-primary">{m.key}</h3>
                    <span className="label-canon">{m.focus}</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{m.detail}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 animate-breathe rounded-full bg-primary/10 blur-3xl" />
            <img
              src={isabellaPortrait}
              alt="Avatar sensorial reactivo de Isabella Villaseñor AI"
              width={1024}
              height={1280}
              loading="lazy"
              className="relative rounded-2xl border border-border/60 object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <SectionHeading
          eyebrow="Arquitectura multicapa"
          title="Siete capas federadas, una sola constitución"
          lead="Del hardware soberano al archivo histórico perpetuo. Cada capa puede sobrevivir al fallo de las demás."
        />
        <div className="mt-12 space-y-3">
          {LAYERS.map((layer) => (
            <Link
              key={layer.id}
              to="/arquitectura"
              hash={`capa-${layer.id}`}
              className="group flex flex-col gap-2 rounded-xl border border-border/60 px-6 py-5 transition hover:border-primary/50 hover:bg-secondary/30 md:flex-row md:items-center md:gap-8"
            >
              <span className="font-mono text-xs tracking-[0.3em] text-primary md:w-24">
                {layer.code}
              </span>
              <span className="font-display text-xl md:flex-1">{layer.name}</span>
              <span className="text-sm text-muted-foreground md:w-2/5">{layer.purpose}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Capa 1 · ID-NVIDA™"
              title="Carta de Derechos Digitales incorporada"
              lead="La biometría cruda nunca toca la red: se transforma en vectores cancelables con pruebas de conocimiento cero que el titular puede revocar cuando quiera."
            />
            <ul className="mt-8 space-y-3">
              {DIGITAL_RIGHTS.map((r) => (
                <li key={r} className="flex items-start gap-3 border-b border-border/50 pb-3">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                  <span className="text-sm leading-relaxed">Derecho a la {r}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SectionHeading
              eyebrow="Blindaje normativo internacional"
              title="Entorno normativo autoejecutable"
              lead="TAMV no pide permiso a los marcos internacionales: los ejecuta como código."
            />
            <div className="mt-8 grid gap-3">
              {FRAMEWORKS.map((f) => (
                <div key={f.code} className="rounded-lg border border-border/60 p-4">
                  <p className="font-mono text-xs tracking-wider text-accent">{f.code}</p>
                  <p className="mt-1.5 text-sm text-muted-foreground">{f.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <SectionHeading
          eyebrow="Motor de Supervivencia Autónoma (AST)"
          title="Antifragilidad como estado natural"
          lead="Cinco estados autoejecutables. Ninguno requiere una decisión humana centralizada para activarse."
        />
        <div className="mt-12 grid gap-4 md:grid-cols-5">
          {AST_STATES.map((s) => (
            <div key={s.state} className="panel-veil p-5">
              <p className="font-mono text-xs tracking-[0.25em] text-primary">{s.state}</p>
              <p className="mt-3 font-display text-lg leading-snug">{s.title}</p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{s.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <SectionHeading
          eyebrow="Capa 5 · Economía ética"
          title="Fondo de Reserva de Integridad 20/30/50"
          lead="Toda utilidad bruta se reparte por regla fija, inalterable y autoejecutable."
        />
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {FRI.map((f) => (
            <div key={f.name} className="panel-veil p-7">
              <p className="font-display text-6xl text-gold">{f.share}%</p>
              <h3 className="mt-4 text-xl">{f.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.detail}</p>
            </div>
          ))}
        </div>
        <Link
          to="/economia"
          className="mt-8 inline-block rounded-full border border-border px-6 py-3 text-sm transition hover:border-primary/60 hover:text-primary"
        >
          Ver las 22 fuentes de monetización
        </Link>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <SectionHeading eyebrow="Roadmap civilizatorio" title="Ocho fases, una sola dirección" />
        <ol className="mt-12 space-y-px overflow-hidden rounded-xl border border-border/60">
          {ROADMAP.map((r) => (
            <li
              key={r.phase}
              className="flex flex-col gap-2 border-b border-border/50 bg-background/30 px-6 py-5 last:border-0 md:flex-row md:items-center md:gap-8"
            >
              <span className="font-mono text-xs tracking-[0.25em] text-primary md:w-20">
                {r.phase}
              </span>
              <span className="font-display text-lg md:w-64">{r.name}</span>
              <span className="flex-1 text-sm text-muted-foreground">{r.detail}</span>
              <span
                className={`w-fit rounded-full border px-3 py-1 font-mono text-[0.6rem] tracking-widest ${
                  r.state === "Completado"
                    ? "border-accent/50 text-accent"
                    : r.state === "En ejecución"
                      ? "border-primary/60 text-primary"
                      : "border-border text-muted-foreground"
                }`}
              >
                {r.state.toUpperCase()}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <p className="label-canon">Dedicatoria fundacional canónica</p>
        <blockquote className="mt-8 font-display text-2xl leading-relaxed md:text-3xl">
          «A ti que me educaste con el ejemplo y jamás con palabras vacías. A ti que dejaste de
          vivir tu vida para darle alas a la mía. A ti que durante años fuiste escudo recibiendo
          golpes dirigidos hacia mí.»
        </blockquote>
        <p className="mt-8 text-sm text-muted-foreground">
          Para Reina Trejo Serrano. Este logro es el fruto de la lucha en solitario de tu Oveja
          Negra.
        </p>
      </section>
    </SiteChrome>
  );
}
