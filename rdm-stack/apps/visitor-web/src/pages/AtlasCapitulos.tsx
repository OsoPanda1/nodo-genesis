import { Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import SEOMeta from "@/components/SEOMeta";
import { AtlasPageHeader } from "@/components/atlas/AtlasPageHeader";
import { chapters, territoryStats } from "@/data/atlas-territory";
import hero from "@/assets/images/hero-realdelmonte.jpg";

const slugToRoute: Record<string, string> = {
  minas: "/capitulos/minas",
  pastes: "/capitulos/pastes",
  cementerio: "/capitulos/cementerio",
  calles: "/capitulos/calles",
};

export default function AtlasCapitulos() {
  return (
    <MainLayout>
      <SEOMeta
        title="Atlas territorial — Real del Monte"
        description="Cuatro capas para entender Real del Monte: subsuelo, memoria comestible, memoria silenciosa y superficie."
      />
      <AtlasPageHeader
        kicker="Atlas territorial"
        title="Cuatro capas, un solo pueblo."
        intro="Real del Monte se lee como un libro de capas. Cada una guarda una manera distinta de habitar la sierra."
        image={hero}
      />

      <section className="mx-auto max-w-6xl px-6 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {Object.entries(territoryStats).map(([k, v]) => (
            <div key={k} className="rounded-xl border border-border bg-card p-6">
              <div className="text-2xl font-bold text-primary">{v}</div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
                {k}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-8 md:grid-cols-2">
          {chapters.map((c) => (
            <Link
              key={c.id}
              to={slugToRoute[c.slug] ?? "#"}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-all hover:shadow-2xl hover:-translate-y-1"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={c.image}
                  alt={c.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
              </div>
              <div className="p-6">
                <div className="text-xs uppercase tracking-[0.3em] text-primary/80">{c.kicker}</div>
                <h2 className="mt-2 font-serif text-3xl font-bold">{c.title}</h2>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{c.blurb}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/capitulos/leyendas"
            className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-6 py-3 text-sm uppercase tracking-widest text-primary transition hover:bg-primary/20"
          >
            → Leyendas y memoria oral
          </Link>
        </div>
      </section>
    </MainLayout>
  );
}
