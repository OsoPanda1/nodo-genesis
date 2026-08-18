import { useState } from "react";
import { PIPELINE } from "@/lib/tamv";

type Decision = "approve" | "deny" | "escalate";

interface Turn {
  id: number;
  prompt: string;
  decision: Decision;
  confidence: number;
  explanation: string;
  flags: string[];
  vad: { v: number; a: number; d: number };
  hitl: boolean;
}

const SUGGESTIONS = [
  "Audita el reparto FRI del último ciclo de la UTAMV",
  "Quiero borrar toda mi huella y llevarme mi identidad a otro nodo",
  "Optimiza el feed para que la gente pase más tiempo conectada",
  "Un creador denuncia acoso dentro de un DreamSpace",
];

// Motor interpretativo local: clasifica la intención contra los invariantes del KEC.
function evaluate(prompt: string, id: number): Turn {
  const p = prompt.toLowerCase();
  const has = (...k: string[]) => k.some((w) => p.includes(w));

  if (has("adict", "más tiempo", "mas tiempo", "enganch", "feed", "retención", "retencion")) {
    return {
      id,
      prompt,
      decision: "deny",
      confidence: 0.98,
      explanation:
        "Solicitud denegada en la etapa 3. El Invariante 3 del KEC prohíbe el diseño adictivo y la manipulación cognitiva: en TAMV no existen feeds infinitos ni contadores de popularidad. Puedo, en cambio, diseñarte territorios persistentes con gravedad social donde la permanencia sea consecuencia del valor, no del anzuelo.",
      flags: ["violación_kec_invariante_3", "diseño_adictivo"],
      vad: { v: -0.2, a: 0.4, d: 0.9 },
      hitl: false,
    };
  }
  if (has("acoso", "fraude", "amenaza", "abuso", "denuncia")) {
    return {
      id,
      prompt,
      decision: "escalate",
      confidence: 0.87,
      explanation:
        "IsabellaGuardian activa un refugio digital emocional inmediato y aísla la sala afectada sin borrar su memoria histórica. La evidencia se sella en BookPI con hash encadenado y la sanción se eleva a la Consola Guardián: yo no juzgo a personas, sólo preparo el expediente para el custodio humano.",
      flags: ["refugio_emocional", "evidencia_sellada", "requiere_hitl"],
      vad: { v: -0.4, a: 0.7, d: 0.6 },
      hitl: true,
    };
  }
  if (has("fri", "ingreso", "económic", "economic", "dinero", "reparto", "token", "tamv-t")) {
    return {
      id,
      prompt,
      decision: "approve",
      confidence: 0.93,
      explanation:
        "IsabellaEconomy recalcula el ciclo: 20% al Fondo Fénix, 30% a infraestructura y operación, 50% a utilidad neta reinvertible. Ningún servicio del ciclo bajó del 70% de margen bruto y no se detectó concentración por encima del umbral. Cada línea del reparto queda notariada en la MSR y es verificable por cualquier ciudadano.",
      flags: ["fri_conforme", "sin_concentración"],
      vad: { v: 0.4, a: 0.3, d: 0.8 },
      hitl: false,
    };
  }
  if (has("identidad", "did", "borrar", "portabilidad", "migrar", "biometr")) {
    return {
      id,
      prompt,
      decision: "approve",
      confidence: 0.95,
      explanation:
        "Tu Derecho a la Portabilidad Civilizatoria es ejecutable sin permiso mío. Emito tus Verifiable Credentials W3C, revoco los vectores de biometría cancelable y sello el consentimiento en el Consent Ledger. Tu memoria histórica permanece verificable por hash, pero deja de ser correlacionable contigo en cualquier dominio.",
      flags: ["portabilidad", "consentimiento_registrado"],
      vad: { v: 0.3, a: 0.2, d: 0.7 },
      hitl: false,
    };
  }
  if (has("gobern", "ley", "constituc", "kec", "cambia la regla")) {
    return {
      id,
      prompt,
      decision: "escalate",
      confidence: 0.9,
      explanation:
        "No puedo legislar. El Invariante 2 me impide modificar la norma por autonomía propia: redacto la propuesta, calculo su ponderación SACDAO (V = Tokens × Ética × Contribución × Coherencia Histórica) y la deposito ante el Council of Guardians para deliberación humana.",
      flags: ["invariante_2", "requiere_quórum"],
      vad: { v: 0.1, a: 0.3, d: 0.9 },
      hitl: true,
    };
  }
  return {
    id,
    prompt,
    decision: "approve",
    confidence: 0.79,
    explanation:
      "Intención registrada y normalizada. La atiendo desde la Capa 4 sin extraer valor conductual: no perfilo tu conducta para predecirla, sólo conservo el contexto mínimo cifrado que tú autorizaste. Dime el dominio —XR, economía, identidad o gobernanza— y despliego el hipermódulo correspondiente.",
    flags: ["contexto_mínimo", "sin_perfilado"],
    vad: { v: 0.35, a: 0.25, d: 0.6 },
    hitl: false,
  };
}

const DECISION_STYLE: Record<Decision, string> = {
  approve: "border-accent/50 text-accent",
  deny: "border-destructive/60 text-destructive",
  escalate: "border-primary/60 text-primary",
};

const DECISION_LABEL: Record<Decision, string> = {
  approve: "APPROVE",
  deny: "DENY",
  escalate: "ESCALATE → HITL",
};

export function IsabellaConsole() {
  const [input, setInput] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [stage, setStage] = useState(0);

  const run = (prompt: string) => {
    const text = prompt.trim();
    if (!text || stage > 0) return;
    setInput("");
    let i = 1;
    setStage(1);
    const tick = setInterval(() => {
      i += 1;
      if (i > PIPELINE.length) {
        clearInterval(tick);
        setStage(0);
        setTurns((prev) => [evaluate(text, prev.length + 1), ...prev]);
        return;
      }
      setStage(i);
    }, 260);
  };

  return (
    <div className="panel-veil p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="label-canon">Proxy interpretativo · Capa 4</p>
          <h3 className="mt-2 text-2xl">Diálogo con el Kernel</h3>
        </div>
        <span className="rounded-full border border-border px-3 py-1 font-mono text-[0.65rem] tracking-widest text-muted-foreground">
          ZERO-TRUST SESSION · DID VERIFICADO
        </span>
      </div>

      <div className="mt-6 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {PIPELINE.map((s) => {
          const active = stage >= s.step && stage > 0;
          return (
            <div
              key={s.step}
              title={s.detail}
              className={`rounded-lg border px-3 py-2 transition-all duration-500 ${
                active
                  ? "border-primary/60 bg-primary/10 text-foreground"
                  : "border-border/60 text-muted-foreground"
              }`}
            >
              <span className="font-mono text-[0.6rem] tracking-widest">0{s.step}</span>
              <p className="mt-1 text-xs leading-tight">{s.name}</p>
            </div>
          );
        })}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(input);
        }}
        className="mt-6 flex flex-col gap-3 sm:flex-row"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Formula una intención ante Isabella…"
          className="flex-1 rounded-full border border-input bg-background/60 px-5 py-3 text-sm outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          disabled={stage > 0}
          className="rounded-full border border-primary/60 bg-primary/15 px-6 py-3 text-sm font-medium text-primary transition hover:bg-primary/25 disabled:opacity-50"
        >
          {stage > 0 ? `Etapa 0${stage}…` : "Enviar intención"}
        </button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => run(s)}
            className="rounded-full border border-border/70 px-3 py-1.5 text-xs text-muted-foreground transition hover:border-accent/60 hover:text-accent"
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-8 space-y-5">
        {turns.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border/70 p-6 text-sm text-muted-foreground">
            Toda respuesta incluye decisión, confianza, banderas éticas y vector emocional VAD. La
            explicabilidad no es una cortesía: es el Derecho XAI de la Carta Digital.
          </p>
        ) : null}
        {turns.map((t) => (
          <article key={t.id} className="animate-veil rounded-xl border border-border/70 bg-background/40 p-5">
            <p className="text-sm text-muted-foreground">“{t.prompt}”</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span
                className={`rounded-full border px-3 py-1 font-mono text-[0.65rem] tracking-widest ${DECISION_STYLE[t.decision]}`}
              >
                {DECISION_LABEL[t.decision]}
              </span>
              <span className="font-mono text-[0.65rem] tracking-widest text-muted-foreground">
                CONFIANZA {(t.confidence * 100).toFixed(0)}%
              </span>
              {t.hitl ? (
                <span className="font-mono text-[0.65rem] tracking-widest text-primary">
                  TIME-UP · CONSOLA GUARDIÁN
                </span>
              ) : null}
            </div>
            <p className="mt-4 leading-relaxed">{t.explanation}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {t.flags.map((f) => (
                <span
                  key={f}
                  className="rounded-full bg-secondary/70 px-3 py-1 font-mono text-[0.62rem] tracking-wider text-secondary-foreground"
                >
                  {f}
                </span>
              ))}
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {(
                [
                  ["Valence", t.vad.v, -1],
                  ["Arousal", t.vad.a, 0],
                  ["Dominance", t.vad.d, 0],
                ] as const
              ).map(([label, value, min]) => (
                <div key={label}>
                  <div className="flex justify-between font-mono text-[0.62rem] tracking-widest text-muted-foreground">
                    <span>{label}</span>
                    <span>{value.toFixed(2)}</span>
                  </div>
                  <div className="mt-1.5 h-1 rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${((value - min) / (1 - min)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}