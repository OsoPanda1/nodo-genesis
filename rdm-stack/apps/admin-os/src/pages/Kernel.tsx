import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Layers3, Activity, Gauge } from "lucide-react";
import { ModuleShell, SectionTitle, ElegantCard, Chip } from "@/components/ModuleShell";
import { TAMV_LAYERS, READINESS_AREAS } from "@/data/rdm/realDelMonteData";
import {
  VISITOR_FLOW_DATA,
  ROUTE_ELEVATION_DATA,
  HOURLY_HEATMAP_DATA,
  HERITAGE_DISTRIBUTION_DATA,
} from "@/data/rdm/chartData";

export default function Kernel() {
  const routeKeys = useMemo(() => Object.keys(ROUTE_ELEVATION_DATA), []);
  const [route, setRoute] = useState(routeKeys[0]);

  return (
    <ModuleShell
      eyebrow="TAMV Kernel · Telemetría"
      title="Capas y"
      highlight="Preparación"
      subtitle="Arquitectura soberana por capas, indicadores de preparación operativa y telemetría territorial verificable."
      seoTitle="TAMV Kernel · Telemetría y preparación operativa de RDM Digital"
      seoDescription="Arquitectura por capas del sistema operativo territorial TAMV, indicadores de preparación operativa y telemetría de flujo de visitantes en Real del Monte."
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
        {TAMV_LAYERS.map((layer, i) => (
          <ElegantCard key={layer.layerNumber} index={i}>
            <div className="flex items-start justify-between mb-3">
              <Layers3 className="w-5 h-5 text-accent" />
              <Chip>{layer.status}</Chip>
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
              Capa {layer.layerNumber}
            </p>
            <h3 className="font-display text-base font-semibold mb-2">{layer.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">{layer.description}</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {layer.techStack.map((tech) => (
                <Chip key={tech}>{tech}</Chip>
              ))}
            </div>
            <dl className="text-[11px] text-muted-foreground border-t border-border/40 pt-3 space-y-1">
              {Object.entries(layer.metrics).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <dt>{k}</dt>
                  <dd className="text-foreground/85 font-mono">{v}</dd>
                </div>
              ))}
            </dl>
          </ElegantCard>
        ))}
      </div>

      <SectionTitle hint="Gobernanza operativa">Preparación por Área</SectionTitle>
      <div className="grid gap-4 md:grid-cols-2 max-w-6xl mx-auto">
        {READINESS_AREAS.map((area, i) => (
          <ElegantCard key={area.name} index={i}>
            <div className="flex items-start justify-between mb-3">
              <Gauge className="w-5 h-5 text-gold" />
              <Chip>{area.status}</Chip>
            </div>
            <h3 className="font-display text-base font-semibold mb-2">{area.name}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">{area.description}</p>
            <div className="h-1.5 rounded-full bg-border/50 overflow-hidden mb-2">
              <div className="h-full bg-accent" style={{ width: `${area.percentage}%` }} />
            </div>
            <p className="text-[11px] text-muted-foreground mb-3">{area.percentage}% completado</p>
            <ul className="space-y-1">
              {area.keyActions.map((action) => (
                <li key={action} className="text-[11px] text-muted-foreground flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-accent mt-1.5 shrink-0" /> {action}
                </li>
              ))}
            </ul>
          </ElegantCard>
        ))}
      </div>

      <SectionTitle hint="Serie anual">Flujo de Visitantes y Fondo Patrimonial</SectionTitle>
      <div className="max-w-6xl mx-auto rounded-2xl border border-border/40 bg-card/40 p-5 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={VISITOR_FLOW_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 12,
                fontSize: 12,
              }}
            />
            <Area type="monotone" dataKey="turistas" stroke="hsl(var(--accent))" fill="hsl(var(--accent) / 0.2)" />
            <Area type="monotone" dataKey="ciudadanos" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.15)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid gap-4 md:grid-cols-2 max-w-6xl mx-auto mt-6">
        <div className="rounded-2xl border border-border/40 bg-card/40 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-base font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4 text-accent" /> Perfil de elevación
            </h3>
            <select
              value={route}
              onChange={(e) => setRoute(e.target.value)}
              className="rounded-lg border border-border/50 bg-card/60 px-3 py-1.5 text-xs outline-none focus:border-accent/60"
            >
              {routeKeys.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ROUTE_ELEVATION_DATA[route]}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="km" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis domain={["auto", "auto"]} stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Line type="monotone" dataKey="altitudeMsnm" stroke="hsl(var(--accent))" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border/40 bg-card/40 p-5">
          <h3 className="font-display text-base font-semibold mb-4">Afluencia por hora</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={HOURLY_HEATMAP_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="peatonesCentro" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
                <Bar dataKey="peatonesMinas" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <SectionTitle hint="Distribución del fondo">Fondo de Patrimonio por Categoría</SectionTitle>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
        {HERITAGE_DISTRIBUTION_DATA.map((item, i) => (
          <ElegantCard key={item.category} index={i}>
            <h3 className="font-display text-base font-semibold mb-2">{item.category}</h3>
            <p className="font-display text-2xl text-gold mb-1">
              ${item.monto.toLocaleString("es-MX")}
              <span className="text-xs text-muted-foreground"> MXN</span>
            </p>
            <p className="text-[11px] text-muted-foreground">{item.porcentaje}% del fondo</p>
          </ElegantCard>
        ))}
      </div>
    </ModuleShell>
  );
}
