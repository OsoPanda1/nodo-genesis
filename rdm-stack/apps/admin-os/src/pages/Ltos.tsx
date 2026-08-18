import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { GitBranch, Layers3, Network, ShieldCheck, Sparkles, ExternalLink, Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PageTransition, TextReveal } from "@/components/VisualEffects";
import SEOMeta from "@/components/SEOMeta";
import { ElegantPagination } from "@/components/ElegantPagination";
import RoleGuard from "@/components/RoleGuard";
import LtosMap from "@/components/LtosMap";
import data from "@/data/ltos-platforms.json";

const PAGE_SIZE = 6;

export default function Ltos() {
  const [query, setQuery] = useState("");
  const [fed, setFed] = useState("Todas");
  const [page, setPage] = useState(0);

  const feds = useMemo(
    () => ["Todas", ...Array.from(new Set(data.platforms.map((p) => p.federation)))],
    [],
  );

  const filtered = useMemo(() => data.platforms.filter((p) => {
    const text = `${p.name} ${p.role} ${p.slug} ${p.highlights.join(" ")}`.toLowerCase();
    return (fed === "Todas" || p.federation === fed) && (!query || text.includes(query.toLowerCase()));
  }), [query, fed]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const totals = data.platforms.reduce(
    (acc, p) => ({
      files: acc.files + p.files,
      src: acc.src + p.src,
      pages: acc.pages + p.pages,
      edge: acc.edge + p.edge,
      migrations: acc.migrations + p.migrations,
    }),
    { files: 0, src: 0, pages: 0, edge: 0, migrations: 0 },
  );

  return (
    <PageTransition>
      <SEOMeta
        title="Plataforma LTOS · Fusión Territorial · RDM Digital"
        description="Fusión de 12 sub-plataformas del ecosistema LTOS Real del Monte: kernels, Smart City OS, Digital Twin, Atlas, Civilizational Core y más."
      />
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24 pb-20">
          <RoleGuard allow={["admin", "comercio", "usuario"]}>
          <section className="container mx-auto px-6">
            <TextReveal>
              <div className="max-w-3xl mx-auto text-center mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/40 bg-accent/5 mb-4">
                  <Network className="w-3.5 h-3.5 text-accent" />
                  <span className="text-[10px] tracking-[0.3em] uppercase text-accent font-body">
                    Plataforma Territorial LTOS · Fusión Unificada
                  </span>
                </div>
                <h1 className="font-display text-5xl md:text-7xl font-bold mb-4">
                  LTOS <span className="text-gradient-gold">Real del Monte</span>
                </h1>
                <p className="text-lg text-muted-foreground font-body mb-2">
                  12 sub-plataformas absorbidas en un único Sistema Operativo Territorial,
                  arquitecturado por <strong>{data.architect}</strong>.
                </p>
                <p className="text-xs text-muted-foreground tracking-wider">
                  ORCID {data.credentials.orcid} · DOI {data.credentials.doi}
                </p>
              </div>
            </TextReveal>

            {/* Totals */}
            <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-3 mb-10">
              {[
                { label: "Plataformas", value: data.platforms.length, icon: Layers3 },
                { label: "Archivos", value: totals.files, icon: GitBranch },
                { label: "Páginas", value: totals.pages, icon: Sparkles },
                { label: "Edge Fns", value: totals.edge, icon: Network },
                { label: "Migraciones", value: totals.migrations, icon: ShieldCheck },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-border/40 bg-card/40 p-4 text-center">
                  <stat.icon className="w-5 h-5 mx-auto mb-2 text-accent" />
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</p>
                  <p className="font-display text-2xl font-semibold text-foreground">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="max-w-5xl mx-auto mb-6 grid gap-3 md:grid-cols-[1fr_220px_140px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setPage(0); }}
                  placeholder="Buscar plataformas, federaciones, edge functions…"
                  className="w-full rounded-xl border border-border/50 bg-card/50 pl-10 pr-4 py-3 text-sm outline-none focus:border-accent/60"
                />
              </div>
              <select
                value={fed}
                onChange={(e) => { setFed(e.target.value); setPage(0); }}
                className="rounded-xl border border-border/50 bg-card/50 px-4 py-3 text-sm outline-none focus:border-accent/60"
              >
                {feds.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
              <div className="rounded-xl border border-border/50 bg-card/50 px-4 py-3 text-center text-xs text-muted-foreground">
                {filtered.length} plataformas
              </div>
            </div>

            <div className="max-w-6xl mx-auto mb-8">
              <LtosMap height={320} />
              <p className="text-[10px] text-muted-foreground mt-2 text-center tracking-wide">
                Geolocalización verificada · Real del Monte, Hidalgo · Click un pin para abrir el detalle.
              </p>
            </div>

            {/* Platforms grid */}
            <div className="grid md:grid-cols-2 gap-4 max-w-6xl mx-auto">
              {paged.map((p, i) => (
                <motion.article
                  key={p.slug}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: Math.min(i * 0.04, 0.4) }}
                  className="p-6 rounded-2xl border border-border/40 bg-card/40 hover:border-accent/40 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-[9px] px-2 py-0.5 rounded-full border border-accent/40 text-accent tracking-[0.16em] uppercase">
                        {p.federation}
                      </span>
                      <h3 className="font-display text-xl font-semibold text-foreground mt-2">{p.name}</h3>
                      <p className="text-xs text-muted-foreground">{p.role}</p>
                    </div>
                    <a
                      href={`https://github.com/${data.owner}/${data.umbrella_repo}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-muted-foreground hover:text-accent transition-colors"
                      aria-label="Ver repositorio"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  <div className="grid grid-cols-5 gap-2 mb-4 text-center">
                    {[
                      { label: "files", value: p.files },
                      { label: "src", value: p.src },
                      { label: "pages", value: p.pages },
                      { label: "edge", value: p.edge },
                      { label: "migs", value: p.migrations },
                    ].map((stat) => (
                      <div key={stat.label} className="rounded-lg border border-border/40 bg-background/40 py-2">
                        <p className="text-sm font-semibold text-foreground">{stat.value}</p>
                        <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {p.highlights.slice(0, 8).map((h) => (
                      <span key={h} className="text-[10px] px-2 py-0.5 rounded-md bg-muted/50 text-muted-foreground font-mono">
                        {h}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Link
                      to={`/ltos/${p.slug}`}
                      className="text-xs px-3 py-1.5 rounded-full border border-accent/40 text-accent hover:bg-accent/10 transition"
                    >
                      Ver detalle →
                    </Link>
                  </div>
                </motion.article>
              ))}
            </div>

            <div className="max-w-5xl mx-auto mt-8">
              <ElegantPagination page={page} totalPages={totalPages} onChange={setPage} variant="numeric" />
            </div>

            <div className="max-w-3xl mx-auto mt-12 text-center">
              <Link
                to="/federation"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-accent/40 bg-accent/5 text-sm text-accent hover:bg-accent/10 transition"
              >
                <Network className="w-4 h-4" />
                Ver cadena viva de datos federada
              </Link>
            </div>
          </section>
          </RoleGuard>
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
}
