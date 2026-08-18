import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SiteChrome, SectionHeading } from "@/components/tamv/SiteChrome";
import { GUARDIAN_QUEUE } from "@/lib/tamv";

const TITLE = "Consola Guardián · Supervisión humana en el bucle (HITL)";
const DESC =
  "Cola de acciones marcadas requires_hitl por Isabella: recomendación, explicabilidad, banderas éticas y sellado en BookPI tras la resolución del custodio humano.";

export const Route = createFileRoute("/guardian")({
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
  component: GuardianPage,
});

type Status = "pending" | "approved" | "denied";

// Hash simbólico determinista para la vista previa del encadenamiento BookPI.
function pseudoHash(seed: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0").repeat(4).slice(0, 40);
}

const REC_TONE = {
  approve: "border-accent/50 text-accent",
  deny: "border-destructive/60 text-destructive",
  escalate: "border-primary/60 text-primary",
} as const;

function GuardianPage() {
  const [status, setStatus] = useState<Record<string, Status>>({});

  const resolve = (id: string, next: Status) =>
    setStatus((prev) => ({ ...prev, [id]: next }));

  const pending = GUARDIAN_QUEUE.filter((a) => (status[a.id] ?? "pending") === "pending").length;

  return (
    <SiteChrome>
      <section className="mx-auto max-w-7xl px-6 pt-20 pb-10">
        <SectionHeading
          eyebrow="Capa 6 · Dekateotl Governance"
          title="Ninguna decisión sensible se ejecuta sin un humano"
          lead="Isabella prepara el expediente, calcula la confianza y expone sus banderas éticas. La firma final pertenece siempre a un custodio."
        />
        <div className="mt-8 flex flex-wrap gap-4">
          <span className="rounded-full border border-primary/50 px-4 py-2 font-mono text-xs tracking-widest text-primary">
            {pending} ACCIONES PENDIENTES
          </span>
          <span className="rounded-full border border-border px-4 py-2 font-mono text-xs tracking-widest text-muted-foreground">
            SESIÓN ZERO-TRUST · DID CUSTODIO VERIFICADO
          </span>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="space-y-4">
          {GUARDIAN_QUEUE.map((a) => {
            const st = status[a.id] ?? "pending";
            return (
              <article key={a.id} className="panel-veil p-7">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="font-mono text-xs tracking-widest text-muted-foreground">
                    {a.id}
                  </span>
                  <h3 className="font-display text-2xl">{a.action_type}</h3>
                  <span
                    className={`rounded-full border px-3 py-1 font-mono text-[0.62rem] tracking-widest ${REC_TONE[a.recommendation]}`}
                  >
                    ISABELLA: {a.recommendation.toUpperCase()}
                  </span>
                  <span className="font-mono text-[0.62rem] tracking-widest text-muted-foreground">
                    CONFIANZA {(a.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="mt-3 font-mono text-xs text-accent">{a.target}</p>
                <p className="mt-4 max-w-4xl leading-relaxed">{a.explanation}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {a.flags.map((f) => (
                    <span
                      key={f}
                      className="rounded-full bg-secondary/70 px-3 py-1 font-mono text-[0.62rem] tracking-wider text-secondary-foreground"
                    >
                      {f}
                    </span>
                  ))}
                </div>

                {st === "pending" ? (
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => resolve(a.id, "approved")}
                      className="rounded-full border border-accent/60 bg-accent/10 px-6 py-2.5 text-sm text-accent transition hover:bg-accent/20"
                    >
                      Ratificar
                    </button>
                    <button
                      type="button"
                      onClick={() => resolve(a.id, "denied")}
                      className="rounded-full border border-destructive/60 px-6 py-2.5 text-sm text-destructive transition hover:bg-destructive/10"
                    >
                      Bloquear
                    </button>
                  </div>
                ) : (
                  <div className="animate-veil mt-6 rounded-xl border border-border/60 bg-background/50 p-5">
                    <p className="font-mono text-[0.62rem] tracking-widest text-primary">
                      {st === "approved" ? "RESUELTO · APROBADO" : "RESUELTO · BLOQUEADO"} · SELLADO
                      EN BOOKPI
                    </p>
                    <p className="mt-2 break-all font-mono text-xs text-muted-foreground">
                      hash: {pseudoHash(a.id + st)}
                    </p>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      prev_hash: {pseudoHash(a.id)}
                    </p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <SectionHeading
          eyebrow="Contrato técnico"
          title="IsabellaResponse — interfaz ejecutable"
          lead="Toda respuesta del núcleo viaja con explicación, confianza y banderas éticas: la explicabilidad es estructural, no opcional."
        />
        <pre className="mt-8 overflow-x-auto rounded-xl border border-border/60 bg-background/60 p-6 font-mono text-xs leading-relaxed text-accent">
{`export interface IsabellaResponse {
  decision: 'approve' | 'deny' | 'escalate';
  explanation: string;
  confidence: number;
  ethical_flags: string[];
  requires_hitl: boolean;
  action_payload?: Record<string, unknown>;
}`}
        </pre>
      </section>
    </SiteChrome>
  );
}