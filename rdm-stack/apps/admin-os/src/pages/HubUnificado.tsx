import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { GitBranch, Globe2, Lock, ArrowRight, Rocket, Layers3, Search } from "lucide-react";
import { ModuleShell } from "@/components/ModuleShell";
import { ElegantPagination } from "@/components/ElegantPagination";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import hub from "@/data/unified-hub.json";

type HubNode = (typeof hub)["nodes"][number];
type RepoMeta = { stars: number; language: string | null; updated_at: string | null };

const PAGE_SIZE = 4;
const FILTERS = ["todos", "público", "privado"] as const;

export default function HubUnificado() {
  const [query, setQuery] = useState("");
  const [visibility, setVisibility] = useState<(typeof FILTERS)[number]>("todos");
  const [page, setPage] = useState(0);
  const [meta, setMeta] = useState<Record<string, RepoMeta>>({});

  useEffect(() => {
    let cancelled = false;
    const publicNodes = (hub.nodes as HubNode[]).filter((n) => n.visibility === "público");
    Promise.all(
      publicNodes.map(async (n) => {
        try {
          const res = await fetch(`https://api.github.com/repos/${hub.owner}/${n.slug}`);
          if (!res.ok) return null;
          const d = await res.json();
          return [n.slug, { stars: d.stargazers_count ?? 0, language: d.language, updated_at: d.updated_at }] as const;
        } catch {
          return null;
        }
      }),
    ).then((entries) => {
      if (cancelled) return;
      setMeta(Object.fromEntries(entries.filter(Boolean) as [string, RepoMeta][]));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (hub.nodes as HubNode[]).filter((n) => {
      const matchVis = visibility === "todos" || n.visibility === visibility;
      const text = `${n.name} ${n.role} ${n.slug} ${n.capabilities.join(" ")}`.toLowerCase();
      return matchVis && (!q || text.includes(q));
    });
  }, [query, visibility]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages - 1);
  const paged = filtered.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE);

  const stats = [
    { icon: GitBranch, label: "Repos fusionados", value: hub.totals.repos },
    { icon: Globe2, label: "Públicos", value: hub.totals.public },
    { icon: Lock, label: "Privados", value: hub.totals.private },
    { icon: Layers3, label: "Rutas unificadas", value: hub.totals.routes_unified },
  ];

  return (
    <ModuleShell
      eyebrow={`Fusión total · v${hub.version} · ${hub.fusion_date}`}
      title="Hub"
      highlight="Unificado"
      subtitle="Los nueve repositorios del ecosistema OsoPanda1 fusionados en un solo proyecto desplegable en Vercel: una sola base de código, un solo kernel, un solo territorio digital."
      seoTitle="Hub Unificado · Fusión de repositorios RDM Digital"
      seoDescription="Manifiesto de fusión de los repositorios unified-digital-hub, RDM-Digital-X, rdm-live-web, rdm-smart-city-os, LDTOCS y Turismo del Monte en un único despliegue productivo."
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border/60 bg-card/60 p-5 text-center">
            <s.icon className="w-5 h-5 mx-auto mb-2 text-accent" />
            <p className="font-display text-3xl font-bold">{s.value}</p>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
            placeholder="Buscar repositorio, capacidad o módulo…"
            className="pl-9"
            aria-label="Buscar repositorio"
          />
        </div>
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <Button
              key={f}
              variant={visibility === f ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setVisibility(f);
                setPage(0);
              }}
              className="capitalize"
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {paged.map((n, i) => (
          <motion.article
            key={n.slug}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-2xl border border-border/60 bg-card/60 p-6 flex flex-col"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <h2 className="font-display text-2xl font-bold">{n.name}</h2>
              <Badge variant={n.status === "core" ? "default" : "secondary"}>{n.status}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{n.role}</p>

            <div className="flex flex-wrap gap-1.5 mb-4">
              {n.capabilities.map((c) => (
                <span key={c} className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border border-accent/30 text-accent">
                  {c}
                </span>
              ))}
            </div>

            <div className="text-xs text-muted-foreground mb-4 space-y-1">
              <p>
                <span className="uppercase tracking-widest">Visibilidad:</span> {n.visibility}
                {meta[n.slug] ? ` · ${meta[n.slug].language ?? "N/A"} · ★ ${meta[n.slug].stars}` : ""}
              </p>
              {meta[n.slug]?.updated_at && (
                <p>Última sincronización: {new Date(meta[n.slug].updated_at as string).toLocaleDateString("es-MX")}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mt-auto pt-2">
              {n.absorbed_into.map((route) => (
                <Link
                  key={route}
                  to={route}
                  className="text-xs px-2.5 py-1 rounded-md bg-muted hover:bg-accent/15 transition-colors"
                >
                  {route}
                </Link>
              ))}
            </div>

            <a
              href={n.repo}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-4 inline-flex items-center gap-1.5 text-xs text-accent hover:underline"
            >
              Ver repositorio de origen <ArrowRight className="w-3 h-3" />
            </a>
          </motion.article>
        ))}
      </div>

      <div className="mt-10">
        <ElegantPagination page={current} totalPages={totalPages} onChange={setPage} />
      </div>

      <div className="mt-14 rounded-2xl border border-accent/30 bg-accent/5 p-8 text-center">
        <Rocket className="w-6 h-6 mx-auto mb-3 text-accent" />
        <h3 className="font-display text-2xl font-bold mb-2">Listo para desplegar en Vercel</h3>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          Build <code className="text-accent">vite build</code> · salida <code className="text-accent">dist</code> ·
          rewrites SPA configurados. Las variables de entorno requeridas están documentadas en{" "}
          <code className="text-accent">docs/DEPLOYMENT-VERCEL.md</code> y <code className="text-accent">.env.example</code>.
        </p>
      </div>
    </ModuleShell>
  );
}
