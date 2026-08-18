import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { Sparkles, Layers3, GitBranch, Globe2, Cpu, Network, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PageTransition, TextReveal } from "@/components/VisualEffects";
import SEOMeta from "@/components/SEOMeta";
import { ElegantPagination } from "@/components/ElegantPagination";
import genesis from "@/data/genesis-sources.json";
import ltos from "@/data/ltos-platforms.json";

type Source = (typeof genesis)["sources"][number];

const PAGE_SIZE = 6;

export default function Genesis() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);

  const allSources = useMemo(() => {
    const fromGenesis: Source[] = genesis.sources as Source[];
    const fromLtos: Source[] = (ltos.platforms as any[]).map((p) => ({
      slug: p.slug,
      name: p.name,
      origin: `OsoPanda1/${p.slug}`,
      role: p.role,
      pages: [],
      modules: p.highlights ?? [],
      absorbed_into: [`/ltos/${p.slug}`],
      status: "fused",
    }));
    return [...fromGenesis, ...fromLtos];
  }, []);

  const filtered = useMemo(
    () =>
      allSources.filter((s) => {
        const text = `${s.name} ${s.role} ${s.origin}`.toLowerCase();
        return !query || text.includes(query.toLowerCase());
      }),
    [allSources, query],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const stats = [
    { icon: GitBranch, label: "Repos fusionados", value: allSources.length },
    { icon: Layers3, label: "Páginas absorbidas", value: genesis.totals.pages_absorbed + (ltos.platforms as any[]).reduce((a, p) => a + (p.pages ?? 0), 0) },
    { icon: Cpu, label: "Edge functions", value: genesis.totals.edge_functions_absorbed + (ltos.platforms as any[]).reduce((a, p) => a + (p.edge ?? 0), 0) },
    { icon: Network, label: "Federación viva", value: "ONLINE" },
  ];

  return (
    <PageTransition>
      <SEOMeta
        title="Génesis · Fusión Unificada RDM Digital · TAMV OS"
        description="Cadena viva de fusión: todos los repositorios, plataformas y módulos del ecosistema OsoPanda1 unificados en un solo Sistema Operativo Territorial."
      />
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24 pb-20">
          <section className="container mx-auto px-6">
            <TextReveal>
              <div className="max-w-3xl mx-auto text-center mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/40 bg-accent/5 mb-4">
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                  <span className="text-[10px] tracking-[0.3em] uppercase text-accent font-body">
                    Génesis · Fusión Total · v1.0
                  </span>
                </div>
                <h1 className="font-display text-5xl md:text-7xl font-bold mb-4">
                  <span className="text-gradient-gold">Génesis</span> Unificado
                </h1>
                <p
                  style={{ fontFamily: "'Dancing Script', cursive" }}
                  className="text-2xl text-accent mb-2"
                >
                  Una sola obra. Un solo territorio. Un solo kernel.
                </p>
                <p className="text-base text-muted-foreground font-body">
                  Manifiesto vivo de cada repositorio, plataforma y módulo del ecosistema
                  OsoPanda1 que ahora respira dentro de RDM Digital · TAMV OS.
                </p>
              </div>
            </TextReveal>

            <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
              {stats.map((s) => (
                <div key={s.label} className="rounded-2xl border border-border/40 bg-card/40 p-4 text-center">
                  <s.icon className="w-5 h-5 mx-auto mb-2 text-accent" />
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{s.label}</p>
                  <p className="font-display text-2xl font-semibold text-foreground">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="max-w-5xl mx-auto mb-8 grid gap-3 md:grid-cols-[1fr_140px]">
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(0);
                }}
                placeholder="Buscar repositorio, módulo o rol…"
                className="rounded-xl border border-border/50 bg-card/50 px-4 py-3 text-sm outline-none focus:border-accent/60"
              />
              <div className="rounded-xl border border-border/50 bg-card/50 px-4 py-3 text-center text-xs text-muted-foreground">
                {filtered.length} fuentes
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5 max-w-6xl mx-auto">
              {paged.map((src, i) => (
                <motion.article
                  key={src.slug}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: Math.min(i * 0.04, 0.4) }}
                  className="rounded-2xl border border-border/40 bg-card/40 p-6 hover:border-accent/40 transition-all"
                >
                  <div className="flex items-start justify-between mb-3 gap-3">
                    <div>
                      <h3 className="font-display text-xl font-semibold">{src.name}</h3>
                      <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-1">
                        {src.origin}
                      </p>
                    </div>
                    <Globe2 className="w-5 h-5 text-accent shrink-0" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{src.role}</p>

                  {src.modules?.length > 0 && (
                    <div className="mb-4">
                      <p className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground mb-2">Módulos</p>
                      <div className="flex flex-wrap gap-1">
                        {src.modules.slice(0, 8).map((m) => (
                          <span key={m} className="text-[10px] px-2 py-0.5 rounded-full border border-border/60 text-foreground/80">
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {src.absorbed_into?.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-3 border-t border-border/30">
                      {src.absorbed_into.slice(0, 4).map((route) => (
                        <Link
                          key={route}
                          to={route}
                          className="inline-flex items-center gap-1 text-[11px] text-accent hover:underline"
                        >
                          {route} <ArrowRight className="w-3 h-3" />
                        </Link>
                      ))}
                    </div>
                  )}
                </motion.article>
              ))}
            </div>

            <div className="max-w-5xl mx-auto">
              <ElegantPagination page={page} totalPages={totalPages} onChange={setPage} variant="numeric" />
            </div>

            <div className="max-w-3xl mx-auto text-center mt-16">
              <p
                style={{ fontFamily: "'Dancing Script', cursive" }}
                className="text-xl md:text-2xl text-foreground/80"
              >
                "Donde antes había repositorios dispersos, ahora respira un solo territorio."
              </p>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
}
