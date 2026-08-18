import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
  Radio, ScrollText, Network, Cpu, ShieldCheck, GitBranch, Layers3,
  MapPin, Bot, BookOpen, Ghost, Bus, Store, Users, Sparkles, Activity,
  Crown, Compass, Music2, Heart, Code2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PageTransition, TextReveal } from "@/components/VisualEffects";
import SEOMeta from "@/components/SEOMeta";
import { ElegantPagination } from "@/components/ElegantPagination";
import LtosMap from "@/components/LtosMap";
import { supabase } from "@/integrations/supabase/client";

type Module = { to: string; icon: any; title: string; desc: string; tag: string };

const MODULES: Module[] = [
  { to: "/programa-operativo", icon: Activity, title: "Programa Operativo", desc: "7 núcleos YUN, 35 nodos y datos territoriales verificados.", tag: "Operación" },
  { to: "/genesis", icon: Sparkles, title: "Génesis Unificado", desc: "Manifiesto vivo: todos los repos del ecosistema fusionados.", tag: "Fusión" },
  { to: "/hub-unificado", icon: Sparkles, title: "Hub Unificado", desc: "Los 9 repositorios finales fusionados y listos para desplegar.", tag: "Fusión" },
  { to: "/tamv-hub", icon: ScrollText, title: "TAMV Hub", desc: "Tesis soberana del Sistema Operativo Territorial.", tag: "Marco" },
  { to: "/ltos", icon: Layers3, title: "Plataforma LTOS", desc: "Fusión unificada de 12 sub-plataformas territoriales.", tag: "Fusión" },
  { to: "/federation", icon: Network, title: "Federación Viva", desc: "11 repos sincronizados en cadena de datos.", tag: "Federación" },
  { to: "/repos", icon: GitBranch, title: "Ecosistema OsoPanda", desc: "104 repositorios federados del ecosistema.", tag: "Código" },
  { to: "/realito", icon: Bot, title: "Realito AI", desc: "Oráculo cognitivo territorial con streaming.", tag: "IA" },
  { to: "/atlas", icon: Layers3, title: "Atlas Soberano", desc: "Capas territoriales y telemetría viva.", tag: "Atlas" },
  { to: "/guardian", icon: ShieldCheck, title: "Guardian Board", desc: "Gobernanza y supervisión HITL.", tag: "Gobernanza" },
  { to: "/mapa", icon: MapPin, title: "Mapa Interactivo", desc: "POIs, rutas y zonas del territorio.", tag: "Territorio" },
  { to: "/dichos", icon: BookOpen, title: "Callejón del Dicho", desc: "Archivo vivo de expresiones locales.", tag: "Memoria" },
  { to: "/mitos", icon: Ghost, title: "Mitos y Leyendas", desc: "Historias que la montaña no deja morir.", tag: "Cultura" },
  { to: "/comercios", icon: Store, title: "Comercios RDM", desc: "Directorio verificado de negocios locales.", tag: "Economía" },
  { to: "/comunidad", icon: Users, title: "Comunidad", desc: "Voces, reseñas y participación ciudadana.", tag: "Social" },
  { to: "/transporte", icon: Bus, title: "Transporte", desc: "Shuttles CDMX y movilidad local.", tag: "Movilidad" },
  { to: "/paquetes", icon: Crown, title: "Paquetes", desc: "Experiencias premium curadas.", tag: "Turismo" },
  { to: "/rutas", icon: Compass, title: "Rutas y Recorridos", desc: "Senderos, minas y patrimonio.", tag: "Experiencias" },
  { to: "/noticias", icon: BookOpen, title: "RDM InfoMesh", desc: "Noticias verificadas y archivo histórico digitalizado.", tag: "Información" },
  { to: "/geoexplorer", icon: MapPin, title: "GeoExplorer", desc: "POIs con altitud, audioguía y rutas autoguiadas.", tag: "Territorio" },
  { to: "/tradenode", icon: Store, title: "RDM TradeNode", desc: "Padrón comercial y tienda nativa con fondo patrimonial.", tag: "Economía" },
  { to: "/servicios", icon: Compass, title: "Servicios Prácticos", desc: "Guías, oficios, estacionamientos y recorridos.", tag: "Servicios" },
  { to: "/membresias", icon: Crown, title: "Membresías & Misiones", desc: "Planes cívicos, gamificación e insignias.", tag: "Ciudadanía" },
  { to: "/foro", icon: Users, title: "Foro Cívico", desc: "Deliberación vecinal y propuestas urbanas.", tag: "Social" },
  { to: "/kernel", icon: Activity, title: "TAMV Kernel", desc: "Capas soberanas, preparación y telemetría.", tag: "Kernel" },
  { to: "/media", icon: Music2, title: "Media & Podcast", desc: "Podcast del cronista, galería y ecoturismo.", tag: "Memoria" },
  { to: "/manual", icon: BookOpen, title: "Manual de Diseño", desc: "Tokens, componentes y patrones del sistema.", tag: "Devs" },
  { to: "/about", icon: Sparkles, title: "Manifiesto", desc: "Visión y arquitectura de 4 capas.", tag: "Acerca" },
  { to: "/devhub", icon: Code2, title: "Dev Hub", desc: "API explorer y contratos federados.", tag: "Devs" },
];

const PILLARS = [
  { icon: Radio, label: "Nodo Cero", value: "ONLINE", color: "text-emerald-400" },
  { icon: Activity, label: "Heptafederación", value: "7 capas", color: "text-accent" },
  { icon: Network, label: "Repos vivos", value: "11 / 104", color: "text-gold" },
  { icon: ShieldCheck, label: "PQC + RLS", value: "Activo", color: "text-electric" },
];

const PAGE_SIZE = 8;

export default function NodoCero() {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("Todos");
  const [page, setPage] = useState(0);
  const [pulse, setPulse] = useState<any[]>([]);

  useEffect(() => {
    const loadPulse = async () => {
      const { data } = await supabase.functions.invoke("federation-pulse", { body: {} });
      if (data?.modules) setPulse(data.modules);
    };
    void loadPulse();
    const interval = window.setInterval(loadPulse, 30000);
    return () => window.clearInterval(interval);
  }, []);

  const tags = useMemo(() => ["Todos", ...Array.from(new Set(MODULES.map((module) => module.tag)))], []);
  const filteredModules = useMemo(() => MODULES.filter((module) => {
    const text = `${module.title} ${module.desc} ${module.tag}`.toLowerCase();
    return (tag === "Todos" || module.tag === tag) && (!query || text.includes(query.toLowerCase()));
  }), [query, tag]);
  const totalPages = Math.max(1, Math.ceil(filteredModules.length / PAGE_SIZE));
  const pagedModules = filteredModules.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <PageTransition>
      <SEOMeta
        title="Nodo Cero · RDM Digital · TAMV Online"
        description="Centro de mando soberano de Real del Monte. Sistema Operativo Territorial federado, abierto y auditable."
      />
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24 pb-20">
          <section className="container mx-auto px-6">
            <TextReveal>
              <div className="max-w-3xl mx-auto text-center mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/40 bg-accent/5 mb-4">
                  <Radio className="w-3.5 h-3.5 text-accent animate-pulse" />
                  <span className="text-[10px] tracking-[0.3em] uppercase text-accent font-body">
                    Centro de Mando · RDM Digital v4.1
                  </span>
                </div>
                <h1 className="font-display text-5xl md:text-7xl font-bold mb-4">
                  Nodo <span className="text-gradient-gold">Cero</span>
                </h1>
                <p className="text-lg text-muted-foreground font-body">
                  Real del Monte como infraestructura civilizatoria abierta. Toda la
                  federación viva en una sola pantalla.
                </p>
              </div>
            </TextReveal>

            {/* Pulse pillars */}
            <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
              {PILLARS.map((p) => (
                <motion.div
                  key={p.label}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="rounded-2xl border border-border/40 bg-card/40 p-4 text-center"
                >
                  <p.icon className={`w-5 h-5 mx-auto mb-2 ${p.color}`} />
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{p.label}</p>
                  <p className={`font-display text-lg font-semibold ${p.color}`}>{p.label === "Repos vivos" && pulse.length ? `${pulse.filter((m) => m.pulse === "live").length} / ${pulse.length}` : p.value}</p>
                </motion.div>
              ))}
            </div>

            <div className="max-w-6xl mx-auto mb-10">
              <h2 className="font-display text-xl mb-3 text-center">Geolocalización viva de plataformas LTOS</h2>
              <LtosMap height={340} />
              <p className="text-[10px] text-muted-foreground mt-2 text-center tracking-wide">
                12 sub-plataformas ancladas a puntos verificados de Real del Monte · Click un pin para abrir su detalle.
              </p>
            </div>


            <div className="max-w-5xl mx-auto mb-8 grid gap-3 md:grid-cols-[1fr_220px_120px]">
              <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(0); }} placeholder="Buscar módulos, comercios o repos…" className="rounded-xl border border-border/50 bg-card/50 px-4 py-3 text-sm outline-none focus:border-accent/60" />
              <select value={tag} onChange={(event) => { setTag(event.target.value); setPage(0); }} className="rounded-xl border border-border/50 bg-card/50 px-4 py-3 text-sm outline-none focus:border-accent/60">
                {tags.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              <div className="rounded-xl border border-border/50 bg-card/50 px-4 py-3 text-center text-xs text-muted-foreground">{filteredModules.length} nodos</div>
            </div>

            {/* Modules grid */}
            <section aria-label="Módulos federados">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-7xl mx-auto">
                {pagedModules.map((m, i) => (
                  <motion.div
                    key={m.to}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ delay: Math.min(i * 0.03, 0.4) }}
                  >
                    <Link
                      to={m.to}
                      className="group block h-full p-5 rounded-2xl border border-border/40 bg-card/40 hover:border-accent/40 hover:bg-card/80 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-gold/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <m.icon className="w-5 h-5 text-accent" />
                        </div>
                        <span className="text-[9px] px-2 py-0.5 rounded-full border border-border/60 text-muted-foreground tracking-[0.16em] uppercase">
                          {m.tag}
                        </span>
                      </div>
                      <h3 className="font-display text-base font-semibold text-foreground mb-1 group-hover:text-accent transition-colors">
                        {m.title}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{m.desc}</p>
                    </Link>
                  </motion.div>
                ))}
              </div>
              <div className="max-w-5xl mx-auto"><ElegantPagination page={page} totalPages={totalPages} onChange={setPage} variant="numeric" /></div>
            </section>
          </section>
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
}
