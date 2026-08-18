import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PageTransition } from "@/components/VisualEffects";
import { motion } from "framer-motion";
import {
  ScrollText,
  Network,
  GitBranch,
  Layers3,
  Cpu,
  ShieldCheck,
  Radio,
  Code2,
  Activity,
} from "lucide-react";
import { Link } from "react-router-dom";

type Pillar = {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  desc: string;
  tag?: string;
};

const TAMV_ACTIONS = [
  {
    label: "Estado Nodo Cero",
    path: "/tamv/status",
    icon: Radio,
    desc: "Telemetría MSR, BookPI y protocolos con fallback local.",
  },
  {
    label: "Explorar API",
    path: "/tamv/api",
    icon: Code2,
    desc: "Prueba contratos de identidad, gobernanza, economía e IA.",
  },
  {
    label: "Tesis Soberana",
    path: "/tamv/thesis",
    icon: ScrollText,
    desc: "Corpus maestro con anclajes, federaciones y RFCs.",
  },
  {
    label: "Operativo",
    path: "/operativo",
    icon: Activity,
    desc: "Madurez real por módulo, dominio y ruta ejecutable.",
  },
];

const PILLARS: Pillar[] = [
  {
    icon: ScrollText,
    title: "Tesis Soberana",
    desc: "Marco conceptual, legal y técnico del Sistema Operativo Territorial RDM.",
    tag: "Marco",
  },
  {
    icon: Network,
    title: "Federación Triple",
    desc: "Capas Conceptual · Legal · Técnica, interoperables con otros pueblos mágicos.",
    tag: "Federación",
  },
  {
    icon: Cpu,
    title: "Isabella AI Local",
    desc: "Asistente cultural en edge functions, con memoria anclada al territorio.",
    tag: "IA Territorial",
  },
  {
    icon: Layers3,
    title: "Economía Phoenix 20/30/50",
    desc: "Reparto soberano entre comunidad, operadores y reserva territorial del Nodo Cero.",
    tag: "Economía",
  },
  {
    icon: GitBranch,
    title: "RDM·X Fusion",
    desc: "Convergencia de los 9 nodos del ecosistema OsoPanda1 en un solo sistema operativo urbano.",
    tag: "Ecosistema",
  },
  {
    icon: ShieldCheck,
    title: "Memoria IPFS",
    desc: "Documentos, votos y registros anclados en almacenamiento distribuido verificable.",
    tag: "Memoria",
  },
];

export default function TamvHub() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24 pb-20" aria-labelledby="tamv-hub-title">
          <section className="container mx-auto px-6">
            <motion.header
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto text-center mb-16"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold/40 bg-gold/5 mb-4">
                <ScrollText className="w-3.5 h-3.5 text-gold" aria-hidden />
                <span className="text-[10px] tracking-[0.3em] uppercase text-gold font-body">
                  Tesis TAMV
                </span>
              </div>
              <h1
                id="tamv-hub-title"
                className="font-display text-4xl md:text-6xl text-foreground mb-4"
              >
                Sistema Operativo{" "}
                <span className="text-gradient-gold">Territorial Soberano</span>
              </h1>
              <p className="text-lg text-muted-foreground font-body">
                Real del Monte como Nodo Cero: el primer pueblo mágico que opera
                como infraestructura civilizatoria abierta, auditable y
                federada.
              </p>
            </motion.header>

            <section
              className="max-w-5xl mx-auto mb-12 grid gap-3 md:grid-cols-4"
              aria-label="Acciones ejecutables TAMV"
            >
              {TAMV_ACTIONS.map((action) => (
                <Link
                  key={action.path}
                  to={action.path}
                  className="group rounded-2xl border border-border bg-card/60 p-4 transition-all hover:border-gold/40 hover:bg-secondary/20"
                >
                  <action.icon
                    className="mb-3 h-5 w-5 text-gold transition-transform group-hover:scale-110"
                    aria-hidden
                  />
                  <h2 className="font-display text-sm text-foreground">
                    {action.label}
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {action.desc}
                  </p>
                </Link>
              ))}
            </section>

            <section
              aria-label="Pilares del Sistema Operativo Territorial RDM"
              className="max-w-6xl mx-auto"
            >
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {PILLARS.map((pillar, index) => {
                  const Icon = pillar.icon;
                  return (
                    <motion.article
                      key={pillar.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.25 }}
                      transition={{ delay: index * 0.07 }}
                      className="glass-card border border-border rounded-2xl p-6 hover:border-gold/40 transition-all group focus-within:border-gold/60"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-gold/20 to-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Icon className="w-5 h-5 text-gold" aria-hidden />
                        </div>
                        {pillar.tag && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full border border-border/60 text-muted-foreground tracking-[0.16em] uppercase">
                            {pillar.tag}
                          </span>
                        )}
                      </div>
                      <h2 className="font-display text-lg text-foreground mb-2">
                        {pillar.title}
                      </h2>
                      <p className="text-sm text-muted-foreground font-body leading-relaxed">
                        {pillar.desc}
                      </p>
                    </motion.article>
                  );
                })}
              </div>
            </section>
          </section>
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
}
