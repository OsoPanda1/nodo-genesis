import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, GitBranch, Layers3, Network, ShieldCheck, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOMeta from "@/components/SEOMeta";
import { PageTransition, TextReveal } from "@/components/VisualEffects";
import RoleGuard from "@/components/RoleGuard";
import LtosMap from "@/components/LtosMap";
import data from "@/data/ltos-platforms.json";
import { LTOS_COORDINATES } from "@/data/ltos-coordinates";

export default function LtosDetail() {
  const { slug } = useParams<{ slug: string }>();
  const platform = data.platforms.find((p) => p.slug === slug);
  const coord = slug ? LTOS_COORDINATES[slug] : undefined;

  if (!platform) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex flex-col">
          <Navbar />
          <main className="flex-1 pt-24 pb-20 container mx-auto px-6 text-center">
            <h1 className="font-display text-4xl">Plataforma no encontrada</h1>
            <Link to="/ltos" className="inline-flex items-center gap-2 mt-6 text-accent">
              <ArrowLeft className="w-4 h-4" /> Volver a LTOS
            </Link>
          </main>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <SEOMeta
        title={`${platform.name} · LTOS · RDM Digital`}
        description={`${platform.role} — federación ${platform.federation}. ${platform.pages} páginas, ${platform.edge} edge functions, ${platform.migrations} migraciones.`}
      />
      <RoleGuard allow={["admin", "comercio", "usuario"]}>
        <div className="min-h-screen bg-background flex flex-col">
          <Navbar />
          <main className="flex-1 pt-24 pb-20">
            <section className="container mx-auto px-6 max-w-6xl">
              <Link to="/ltos" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent mb-6">
                <ArrowLeft className="w-4 h-4" /> Volver a LTOS
              </Link>

              <TextReveal>
                <div className="mb-8">
                  <span className="text-[10px] px-2 py-1 rounded-full border border-accent/40 text-accent tracking-[0.2em] uppercase">
                    {platform.federation} · {coord?.anchor ?? "Real del Monte"}
                  </span>
                  <h1 className="font-display text-4xl md:text-6xl font-bold mt-3">{platform.name}</h1>
                  <p className="text-muted-foreground mt-3 max-w-3xl">{platform.role}</p>
                </div>
              </TextReveal>

              <div className="grid lg:grid-cols-[1fr_360px] gap-6 mb-10">
                <LtosMap highlightSlug={platform.slug} height={420} />
                <aside className="rounded-2xl border border-border/40 bg-card/40 p-6 space-y-4">
                  <h3 className="font-display text-lg flex items-center gap-2">
                    <Layers3 className="w-4 h-4 text-accent" /> Inventario
                  </h3>
                  <ul className="grid grid-cols-2 gap-3 text-sm">
                    <Stat label="Archivos" value={platform.files} />
                    <Stat label="src/" value={platform.src} />
                    <Stat label="Páginas" value={platform.pages} />
                    <Stat label="Edge Fns" value={platform.edge} />
                    <Stat label="Migraciones" value={platform.migrations} icon={<ShieldCheck className="w-3 h-3" />} />
                    <Stat label="Federación" value={platform.federation} />
                  </ul>
                  <a
                    href={`https://github.com/${data.owner}/${data.umbrella_repo}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-accent hover:underline"
                  >
                    <GitBranch className="w-4 h-4" /> Repo umbrella <ExternalLink className="w-3 h-3" />
                  </a>
                </aside>
              </div>

              <section className="mb-10">
                <h2 className="font-display text-2xl mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent" /> Highlights & módulos
                </h2>
                <div className="flex flex-wrap gap-2">
                  {platform.highlights.map((h) => (
                    <span key={h} className="text-xs px-3 py-1.5 rounded-full bg-muted/60 text-foreground font-mono">
                      {h}
                    </span>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-border/40 bg-card/30 p-6">
                <h2 className="font-display text-2xl mb-4 flex items-center gap-2">
                  <Network className="w-5 h-5 text-accent" /> Enlaces relacionados
                </h2>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <Link to="/federation" className="rounded-xl border border-border/40 p-4 hover:border-accent/60 transition">
                    Cadena viva de datos federada →
                  </Link>
                  <Link to="/nodo-cero" className="rounded-xl border border-border/40 p-4 hover:border-accent/60 transition">
                    Centro de mando Nodo Cero →
                  </Link>
                  <Link to="/atlas" className="rounded-xl border border-border/40 p-4 hover:border-accent/60 transition">
                    Atlas Soberano →
                  </Link>
                  <Link to="/repos" className="rounded-xl border border-border/40 p-4 hover:border-accent/60 transition">
                    Ecosistema completo de repos →
                  </Link>
                </div>
              </section>
            </section>
          </main>
          <Footer />
        </div>
      </RoleGuard>
    </PageTransition>
  );
}

function Stat({ label, value, icon }: { label: string; value: number | string; icon?: React.ReactNode }) {
  return (
    <li className="rounded-lg border border-border/40 bg-background/40 p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
        {icon} {label}
      </p>
      <p className="font-display text-lg text-foreground">{value}</p>
    </li>
  );
}
