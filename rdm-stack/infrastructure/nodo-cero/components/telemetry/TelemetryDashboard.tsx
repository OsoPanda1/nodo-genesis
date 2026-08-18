'use client';

import { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BatteryCharging,
  Car,
  CheckCircle2,
  CloudFog,
  Database,
  Gauge,
  MapPin,
  Radio,
  RefreshCw,
  Shield,
  ShoppingBag,
  Thermometer,
  Ticket,
  TrendingUp,
  Users,
  WifiOff,
  Wind,
  Zap,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type MetricKey = 'visitors' | 'traffic' | 'humidity';

type TelemetryPoint = {
  time: string;
  visitors: number;
  traffic: number;
  humidity: number;
};

type FederationStatus = 'online' | 'degraded' | 'offline';

type Federation = {
  id: string;
  name: string;
  scope: string;
  status: FederationStatus;
  latency: number;
  detail: string;
};

type PlannedSensor = {
  id: string;
  name: string;
  domain: string;
  description: string;
  icon: typeof Thermometer;
};

const REFERENCE_SERIES: TelemetryPoint[] = [
  { time: '08:00', visitors: 1200, traffic: 320, humidity: 92 },
  { time: '10:00', visitors: 3400, traffic: 680, humidity: 88 },
  { time: '12:00', visitors: 7800, traffic: 1240, humidity: 82 },
  { time: '14:00', visitors: 9200, traffic: 1450, humidity: 79 },
  { time: '16:00', visitors: 6500, traffic: 1100, humidity: 85 },
  { time: '18:00', visitors: 4100, traffic: 890, humidity: 90 },
  { time: '20:00', visitors: 2100, traffic: 450, humidity: 94 },
];

const FEDERATIONS: Federation[] = [
  {
    id: 'fed-1',
    name: 'Real del Monte',
    scope: 'Nodo Cero · núcleo territorial',
    status: 'online',
    latency: 32,
    detail: 'Canal de coordinación disponible',
  },
  {
    id: 'fed-2',
    name: 'Pachuca',
    scope: 'Federación metropolitana',
    status: 'online',
    latency: 48,
    detail: 'Intercambio federado habilitado',
  },
  {
    id: 'fed-3',
    name: 'Mineral del Chico',
    scope: 'Federación serrana',
    status: 'degraded',
    latency: 184,
    detail: 'Latencia elevada; sin pérdida crítica',
  },
  {
    id: 'fed-4',
    name: 'Huasca de Ocampo',
    scope: 'Federación patrimonial',
    status: 'offline',
    latency: 0,
    detail: 'Sin heartbeat operativo registrado',
  },
];

const PLANNED_SENSORS: PlannedSensor[] = [
  {
    id: 'temperature',
    name: 'Temperatura ambiental',
    domain: 'Microclima territorial',
    description:
      'Estaciones locales y dispositivos IoT para lecturas ambientales.',
    icon: Thermometer,
  },
  {
    id: 'air-quality',
    name: 'Calidad del aire',
    domain: 'Sostenibilidad',
    description:
      'Partículas y variables de calidad ambiental para análisis territorial.',
    icon: Wind,
  },
  {
    id: 'humidity',
    name: 'Humedad relativa',
    domain: 'Microclima territorial',
    description:
      'Correlación climática con actividad turística y condiciones locales.',
    icon: CloudFog,
  },
  {
    id: 'vehicle-flow',
    name: 'Flujo vehicular',
    domain: 'Movilidad',
    description:
      'Conteo y patrones de movilidad mediante sensores o fuentes autorizadas.',
    icon: Car,
  },
  {
    id: 'pedestrian-flow',
    name: 'Aforo peatonal',
    domain: 'Turismo y espacio público',
    description:
      'Estimación agregada y no identificable de afluencia por zona.',
    icon: Users,
  },
  {
    id: 'energy',
    name: 'Consumo energético',
    domain: 'Infraestructura',
    description:
      'Monitoreo piloto de consumo en espacios y servicios participantes.',
    icon: Zap,
  },
  {
    id: 'battery',
    name: 'Energía de nodos',
    domain: 'Edge / IoT',
    description:
      'Autonomía, continuidad y estado energético de nodos físicos.',
    icon: BatteryCharging,
  },
  {
    id: 'network',
    name: 'Calidad de red',
    domain: 'Conectividad',
    description:
      'Disponibilidad, latencia y estabilidad de enlaces territoriales.',
    icon: Gauge,
  },
];

const METRICS: Record<
  MetricKey,
  {
    label: string;
    unit: string;
    stroke: string;
    gradient: string;
    selectedClass: string;
  }
> = {
  visitors: {
    label: 'Aforo turístico',
    unit: 'personas',
    stroke: '#22d3ee',
    gradient: 'visitors-gradient',
    selectedClass: 'bg-cyan-400 text-slate-950',
  },
  traffic: {
    label: 'Tráfico',
    unit: 'vehículos/h',
    stroke: '#c084fc',
    gradient: 'traffic-gradient',
    selectedClass: 'bg-purple-400 text-slate-950',
  },
  humidity: {
    label: 'Humedad',
    unit: '%',
    stroke: '#fbbf24',
    gradient: 'humidity-gradient',
    selectedClass: 'bg-amber-400 text-slate-950',
  },
};

const STATUS_STYLE: Record<
  FederationStatus,
  {
    label: string;
    dot: string;
    badge: string;
    Icon: typeof CheckCircle2;
  }
> = {
  online: {
    label: 'Operativa',
    dot: 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.72)]',
    badge:
      'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    Icon: CheckCircle2,
  },
  degraded: {
    label: 'Degradada',
    dot: 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.65)]',
    badge: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    Icon: AlertTriangle,
  },
  offline: {
    label: 'Sin conexión',
    dot: 'bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.65)]',
    badge: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
    Icon: WifiOff,
  },
};

function formatNumber(value: number) {
  return new Intl.NumberFormat('es-MX').format(value);
}

function MiniBadge({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-mono font-medium uppercase tracking-wide ${className}`}
    >
      {children}
    </span>
  );
}

function Panel({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`overflow-hidden rounded-2xl border border-white/10 bg-slate-950/45 shadow-xl backdrop-blur-sm ${className}`}
    >
      {children}
    </section>
  );
}

function OverviewCard({
  label,
  value,
  detail,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof Activity;
  color: string;
}) {
  return (
    <article className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/45 p-5 shadow-lg backdrop-blur-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            className={`text-[10px] font-mono uppercase tracking-[0.14em] ${color}`}
          >
            {label}
          </p>
          <p className="mt-1 text-2xl font-black tracking-tight text-white">
            {value}
          </p>
          <p className="mt-1 text-xs text-slate-400">{detail}</p>
        </div>

        <div
          className={`rounded-2xl border border-current/20 bg-slate-900/70 p-3 ${color}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div
        className={`absolute inset-x-0 bottom-0 h-px bg-current opacity-50 ${color}`}
      />
    </article>
  );
}

export default function TelemetryDashboard() {
  const [activeMetric, setActiveMetric] = useState<MetricKey>('visitors');
  const [updatedAt, setUpdatedAt] = useState(() => new Date());

  const metric = METRICS[activeMetric];

  const federationSummary = useMemo(() => {
    const online = FEDERATIONS.filter(
      (federation) => federation.status === 'online',
    ).length;

    const degraded = FEDERATIONS.filter(
      (federation) => federation.status === 'degraded',
    ).length;

    const offline = FEDERATIONS.filter(
      (federation) => federation.status === 'offline',
    ).length;

    return {
      online,
      degraded,
      offline,
      total: FEDERATIONS.length,
    };
  }, []);

  const handleRefresh = () => {
    setUpdatedAt(new Date());
  };

  return (
    <main
      className="space-y-6 text-slate-100"
      aria-label="Panel de telemetría territorial"
    >
      <header className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-cyan-400">
            <Radio className="h-3.5 w-3.5" />
            Nodo Cero · Observabilidad territorial
          </div>

          <h1 className="flex items-center gap-3 text-2xl font-semibold tracking-tight text-white md:text-3xl">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/10">
              <Activity className="h-5 w-5 text-amber-300" />
            </span>
            Telemetría territorial
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400">
            Visión de capacidades operativas, federación territorial e
            instrumentación proyectada para el ecosistema Nodo Cero.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-slate-900/60 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-cyan-400/40 hover:bg-slate-800/80"
        >
          <RefreshCw className="h-4 w-4" />
          Actualizar vista
        </button>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-cyan-400/15 bg-cyan-400/5 px-4 py-3">
        <p className="flex items-center gap-2 text-xs text-cyan-100/80">
          <Database className="h-4 w-4 text-cyan-400" />
          Panel de demostración institucional: las señales de Etapa 2 no son
          lecturas en tiempo real.
        </p>

        <span className="text-[10px] font-mono text-slate-400">
          Vista actualizada:{' '}
          {new Intl.DateTimeFormat('es-MX', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          }).format(updatedAt)}
        </span>
      </div>

      <section
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Resumen territorial"
      >
        <OverviewCard
          label="Federaciones activas"
          value={`${federationSummary.online}/${federationSummary.total}`}
          detail={`${federationSummary.degraded} degradada(s) · ${federationSummary.offline} sin conexión`}
          icon={Radio}
          color="text-emerald-400"
        />

        <OverviewCard
          label="Cobertura propuesta"
          value="8 fuentes"
          detail="Instrumentación prevista para Etapa 2"
          icon={Gauge}
          color="text-cyan-400"
        />

        <OverviewCard
          label="Arquitectura"
          value="YUN"
          detail="Heptafederación territorial soberana"
          icon={Shield}
          color="text-purple-400"
        />

        <OverviewCard
          label="Estado del roadmap"
          value="Etapa 2"
          detail="Infraestructura pendiente de despliegue"
          icon={TrendingUp}
          color="text-amber-400"
        />
      </section>

      <Panel>
        <div className="flex flex-col gap-4 border-b border-white/10 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-base font-semibold text-white">
              <TrendingUp className="h-4 w-4 text-cyan-400" />
              Señales territoriales proyectadas
            </h2>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-400">
              Serie visual de referencia para explicar el modelo de
              instrumentación. No corresponde a telemetría en producción y no
              interviene en alertas, decisiones o KPIs operativos.
            </p>
          </div>

          <div
            className="flex w-full gap-1 rounded-xl border border-white/10 bg-slate-900/70 p-1 lg:w-auto"
            role="tablist"
            aria-label="Seleccionar señal territorial"
          >
            {(Object.keys(METRICS) as MetricKey[]).map((key) => {
              const item = METRICS[key];
              const selected = activeMetric === key;

              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActiveMetric(key)}
                  className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-mono transition-colors lg:flex-none ${
                    selected
                      ? item.selectedClass
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-slate-400">
              Serie de referencia · Instrumentación prevista para Etapa 2
            </p>

            <MiniBadge className="border-slate-500/40 bg-slate-500/10 text-slate-300">
              <WifiOff className="h-3 w-3" />
              No operativo
            </MiniBadge>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={REFERENCE_SERIES}
                margin={{ top: 12, right: 12, left: -16, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="visitors-gradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.52} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>

                  <linearGradient
                    id="traffic-gradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#c084fc" stopOpacity={0.52} />
                    <stop offset="95%" stopColor="#c084fc" stopOpacity={0} />
                  </linearGradient>

                  <linearGradient
                    id="humidity-gradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.52} />
                    <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(148, 163, 184, 0.18)"
                />

                <XAxis
                  dataKey="time"
                  stroke="#94a3b8"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  stroke="#94a3b8"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={42}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: '#020617',
                    borderColor: 'rgba(148,163,184,0.25)',
                    borderRadius: '12px',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                  formatter={(value) => [
                    formatNumber(Number(value)),
                    `${metric.label} (${metric.unit})`,
                  ]}
                />

                <Area
                  type="monotone"
                  dataKey={activeMetric}
                  stroke={metric.stroke}
                  strokeWidth={3}
                  fill={`url(#${metric.gradient})`}
                  activeDot={{
                    r: 4,
                    strokeWidth: 2,
                    stroke: '#020617',
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Panel>

      <section
        aria-labelledby="planned-sensors-title"
        className="rounded-2xl border border-dashed border-amber-400/30 bg-amber-400/[0.035] p-5"
      >
        <div className="flex flex-col gap-3 border-b border-amber-400/15 pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-amber-300">
              <Radio className="h-3.5 w-3.5" />
              Hoja de ruta de instrumentación
            </div>

            <h2
              id="planned-sensors-title"
              className="text-base font-semibold text-white"
            >
              Sensores e infraestructura proyectada
            </h2>

            <p className="mt-1 max-w-3xl text-xs leading-relaxed text-slate-400">
              Capacidades previstas para la Etapa 2. No cuentan todavía con
              fuente de datos operativa y no afectan indicadores, alertas,
              decisiones de Isabella ni procesos de gobernanza.
            </p>
          </div>

          <MiniBadge className="w-fit border-amber-400/35 bg-amber-400/10 text-amber-200">
            Etapa 2 · Planeado
          </MiniBadge>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {PLANNED_SENSORS.map((sensor) => {
            const Icon = sensor.icon;

            return (
              <article
                key={sensor.id}
                className="group relative overflow-hidden rounded-xl border border-white/10 bg-slate-950/40 p-4 opacity-85 transition-all hover:border-amber-400/35 hover:bg-slate-900/70 hover:opacity-100"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="rounded-xl border border-white/10 bg-slate-900/70 p-2.5 text-slate-400 transition-colors group-hover:text-amber-300">
                    <Icon className="h-5 w-5" />
                  </div>

                  <MiniBadge className="border-slate-500/35 bg-slate-500/10 text-slate-300">
                    <WifiOff className="h-3 w-3" />
                    Sin señal
                  </MiniBadge>
                </div>

                <h3 className="mt-4 text-sm font-medium text-white">
                  {sensor.name}
                </h3>

                <p className="mt-1 text-[10px] font-mono uppercase tracking-[0.1em] text-amber-300/85">
                  {sensor.domain}
                </p>

                <p className="mt-3 min-h-10 text-xs leading-relaxed text-slate-400">
                  {sensor.description}
                </p>

                <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-3 text-[10px] font-mono uppercase tracking-wider text-slate-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                  Etapa 2 · No implementado
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Panel>
          <div className="flex items-start justify-between border-b border-white/10 p-5">
            <div>
              <h2 className="flex items-center gap-2 text-base font-semibold text-white">
                <Radio className="h-4 w-4 text-emerald-400" />
                Salud federada
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Vista demostrativa de disponibilidad en la red territorial YUN.
              </p>
            </div>

            <MiniBadge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
              {federationSummary.online}/{federationSummary.total} online
            </MiniBadge>
          </div>

          <div className="space-y-3 p-5">
            {FEDERATIONS.map((federation) => {
              const style = STATUS_STYLE[federation.status];
              const StatusIcon = style.Icon;

              return (
                <article
                  key={federation.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-950/35 p-3 transition-colors hover:border-white/20 hover:bg-slate-900/50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ${style.dot}`}
                    />

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">
                        {federation.name}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-slate-400">
                        {federation.scope}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <MiniBadge className={style.badge}>
                      <StatusIcon className="h-3 w-3" />
                      {federation.status === 'offline'
                        ? style.label
                        : `${federation.latency} ms`}
                    </MiniBadge>

                    <p className="mt-1 max-w-44 truncate text-[10px] text-slate-500">
                      {federation.detail}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </Panel>

        <Panel>
          <div className="border-b border-white/10 p-5">
            <h2 className="flex items-center gap-2 text-base font-semibold text-white">
              <Database className="h-4 w-4 text-purple-400" />
              Alcance del tablero
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Separación explícita entre datos verificables, vistas demostrativas
              y capacidades de siguiente etapa.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2">
            {[
              {
                icon: CheckCircle2,
                title: 'Operativo',
                description:
                  'Estados de federación presentados como vista institucional.',
                color: 'text-emerald-400',
              },
              {
                icon: AlertTriangle,
                title: 'En observación',
                description:
                  'Estados degradados o sin conexión deben validarse con APIs reales.',
                color: 'text-amber-400',
              },
              {
                icon: WifiOff,
                title: 'No implementado',
                description:
                  'Sensores de Etapa 2 visibles sin atribuirles señal activa.',
                color: 'text-slate-400',
              },
              {
                icon: MapPin,
                title: 'Valor territorial',
                description:
                  'Modelo preparado para turismo, academia, empresas y gobernanza.',
                color: 'text-cyan-400',
              },
              {
                icon: ShoppingBag,
                title: 'Ecosistema',
                description:
                  'Preparado para sumar comercio, eventos y servicios participantes.',
                color: 'text-purple-400',
              },
              {
                icon: Ticket,
                title: 'Integración futura',
                description:
                  'Los datos reales deberán conectarse mediante una API versionada.',
                color: 'text-amber-300',
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="rounded-xl border border-white/10 bg-slate-950/35 p-4"
                >
                  <Icon className={`h-4 w-4 ${item.color}`} />
                  <h3 className="mt-3 text-sm font-medium text-white">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </Panel>
      </section>
    </main>
  );
}
