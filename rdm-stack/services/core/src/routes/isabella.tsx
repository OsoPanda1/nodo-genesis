import { createFileRoute } from "@tanstack/react-router";
import { SiteChrome, SectionHeading } from "@/components/tamv/SiteChrome";
import { IsabellaConsole } from "@/components/tamv/IsabellaConsole";
import { HYPERMODULES, KEC_INVARIANTS, PIPELINE } from "@/lib/tamv";

const TITLE = "Isabella Villaseñor AI™ · Kernel Ético y pipeline cognitivo";
const DESC =
  "Pipeline cognitivo de 6 etapas, Kernel Ético Central con 4 invariantes inmutables, hipermódulos y motor emocional VAD de la IA civilizacional del TAMV.";

export const Route = createFileRoute("/isabella")({
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
  component: IsabellaPage,
});

function IsabellaPage() {
  return (
    <SiteChrome>
      <section className="mx-auto max-w-7xl px-6 pt-20 pb-12">
        <SectionHeading
          eyebrow="Capa 4 · Entidad de inteligencia civilizacional"
          title="Isabella no responde: delibera, explica y se somete."
          lead="Cada intención atraviesa seis etapas antes de convertirse en acción. Ninguna etapa es opcional y todas dejan huella verificable en BookPI."
        />
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <IsabellaConsole />
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <SectionHeading eyebrow="Pipeline cognitivo" title="Las seis etapas obligatorias" />
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {PIPELINE.map((s) => (
            <div key={s.step} className="panel-veil p-6">
              <span className="font-mono text-xs tracking-[0.3em] text-primary">
                ETAPA 0{s.step}
              </span>
              <h3 className="mt-3 text-xl">{s.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Kernel Ético Central"
              title="Cuatro invariantes que ni la DAO puede tocar"
              lead="No son políticas de uso: son restricciones absolutas del motor de decisión moral computacional."
            />
            <ol className="mt-8 space-y-4">
              {KEC_INVARIANTS.map((inv, i) => (
                <li key={inv} className="flex gap-4 rounded-xl border border-border/60 p-5">
                  <span className="font-display text-3xl text-gold">{i + 1}</span>
                  <p className="text-sm leading-relaxed">{inv}</p>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <SectionHeading
              eyebrow="Motor emocional y sensorial"
              title="Vector VAD, voz KAOS 3D y avatar reactivo"
              lead="La emoción se modela para acompañar, nunca para persuadir."
            />
            <div className="mt-8 space-y-4">
              {[
                ["V · Valence", "Rango de positividad/negatividad [-1.0, 1.0]"],
                ["A · Arousal", "Nivel de activación o energía [0.0, 1.0]"],
                ["D · Dominance", "Nivel de control o solemnidad [0.0, 1.0]"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg border border-border/60 p-4">
                  <p className="font-mono text-xs tracking-wider text-accent">{k}</p>
                  <p className="mt-1.5 text-sm text-muted-foreground">{v}</p>
                </div>
              ))}
              <div className="panel-veil p-6">
                <p className="label-canon">Síntesis KAOS 3D</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Modulación binaural en WebAudio que adapta afinación y sonoridad según el estado
                  VAD y el contexto: ritual, educativo, técnico o de crisis. El avatar XR altera su
                  geometría fractal y su presencia volumétrica en WebGPU en consonancia con la
                  respuesta.
                </p>
              </div>
              <div className="panel-veil p-6">
                <p className="label-canon">Memoria multimodal</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  <span className="font-mono text-xs text-accent">isabella_conversations</span>{" "}
                  conserva sesión, DID y estado AST;{" "}
                  <span className="font-mono text-xs text-accent">isabella_messages</span> almacena
                  rol, contenido sanitizado, embeddings pgvector y etiqueta VAD.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <SectionHeading eyebrow="Hipermódulos" title="Cinco cargas de trabajo especializadas" />
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {HYPERMODULES.map((m) => (
            <div key={m.key} className="panel-veil p-5">
              <p className="font-mono text-sm text-primary">{m.key}</p>
              <p className="label-canon mt-2">{m.focus}</p>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{m.detail}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteChrome>
  );
}