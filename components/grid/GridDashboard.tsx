'use client';

import { useEffect, useState } from 'react';
import { Droplets, Loader2, TriangleAlert, Zap } from 'lucide-react';
import type { GridAlert, GridLink, PowerNode, WaterNode } from '@/lib/grid/grid-types';
import type { PowerBalance, WaterBalance } from '@/lib/grid/grid-balance';

const NODE_STATUS: Record<string, string> = {
  operational: 'bg-emerald-500/10 text-emerald-400',
  degraded: 'bg-sky-500/10 text-sky-400',
  warning: 'bg-amber-500/10 text-amber-400',
  critical: 'bg-red-500/10 text-red-400',
  offline: 'bg-slate-500/10 text-slate-400',
};

const ALERT_LEVEL: Record<string, string> = {
  critical: 'border-red-900/50 bg-red-950/20 text-red-400',
  warning: 'border-amber-900/50 bg-amber-950/20 text-amber-400',
  info: 'border-slate-800 bg-slate-950/70 text-slate-400',
};

export type GridNetworkViewProps = {
  power: PowerNode[];
  water: WaterNode[];
  links: GridLink[];
};

export function GridNetworkView({ power, water, links }: GridNetworkViewProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
        <Zap className="h-3.5 w-3.5 text-emerald-400" /> Red eléctrica
      </div>
      {power.map((node) => (
        <div key={node.id} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2">
          <div>
            <p className="text-[10px] font-medium text-slate-300">{node.name}</p>
            <p className="text-[9px] text-slate-500">{node.type} · {node.zone}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-[9px] text-slate-500 sm:inline">
              {Math.round((node.capacityKw > 0 ? node.loadKw / node.capacityKw : 0) * 100)}%
            </span>
            <span className="hidden text-[9px] text-slate-500 md:inline">{node.voltagePu.toFixed(2)} pu</span>
            <span className={`rounded px-1.5 py-0.5 text-[9px] font-medium uppercase ${NODE_STATUS[node.status]}`}>{node.status}</span>
          </div>
        </div>
      ))}

      <div className="mt-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
        <Droplets className="h-3.5 w-3.5 text-sky-400" /> Red de agua
      </div>
      {water.map((node) => (
        <div key={node.id} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2">
          <div>
            <p className="text-[10px] font-medium text-slate-300">{node.name}</p>
            <p className="text-[9px] text-slate-500">{node.type} · {node.zone}</p>
          </div>
          <div className="flex items-center gap-3">
            {node.levelPercent > 0 && <span className="hidden text-[9px] text-slate-500 sm:inline">{node.levelPercent}% nivel</span>}
            {node.pressureBar > 0 && <span className="hidden text-[9px] text-slate-500 md:inline">{node.pressureBar} bar</span>}
            <span className={`rounded px-1.5 py-0.5 text-[9px] font-medium uppercase ${NODE_STATUS[node.status]}`}>{node.status}</span>
          </div>
        </div>
      ))}

      <div className="mt-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
        Topología ({links.length} enlaces)
      </div>
      <div className="flex flex-wrap gap-1.5">
        {links.map((link) => (
          <span key={`${link.from}-${link.to}`} className="rounded border border-slate-800 bg-slate-900/60 px-2 py-1 text-[9px] text-slate-400">
            {link.from} → {link.to}
            <span className={`ml-1 ${link.utilizationPercent >= 90 ? 'text-red-400' : link.utilizationPercent >= 80 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {link.utilizationPercent}%
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

export type GridBalanceCardsProps = {
  power: PowerBalance;
  water: WaterBalance;
};

export function GridBalanceCards({ power, water }: GridBalanceCardsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          <Zap className="h-3.5 w-3.5 text-emerald-400" /> Balance eléctrico
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-center">
          <div className="rounded-lg bg-slate-900/60 p-2">
            <p className="text-sm font-semibold text-slate-100">{power.loadKw} kW</p>
            <p className="text-[9px] text-slate-500">Carga</p>
          </div>
          <div className="rounded-lg bg-slate-900/60 p-2">
            <p className="text-sm font-semibold text-emerald-400">{power.reserveKw} kW</p>
            <p className="text-[9px] text-slate-500">Reserva ({power.reservePercent}%)</p>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
          <span>Frecuencia {power.frequencyHz} Hz</span>
          <span className={power.voltageStatus === 'stable' ? 'text-emerald-400' : power.voltageStatus === 'warning' ? 'text-amber-400' : 'text-red-400'}>
            Tensión {power.voltageStatus}
          </span>
        </div>
        {power.worstNode && power.worstNode.voltagePu < 0.98 && (
          <p className="mt-2 text-[9px] text-amber-400">Punto crítico: {power.worstNode.name} ({power.worstNode.voltagePu.toFixed(2)} pu)</p>
        )}
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          <Droplets className="h-3.5 w-3.5 text-sky-400" /> Balance hídrico
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-center">
          <div className="rounded-lg bg-slate-900/60 p-2">
            <p className="text-sm font-semibold text-slate-100">{water.productionM3h} m³/h</p>
            <p className="text-[9px] text-slate-500">Producción</p>
          </div>
          <div className="rounded-lg bg-slate-900/60 p-2">
            <p className="text-sm font-semibold text-slate-100">{water.demandM3h} m³/h</p>
            <p className="text-[9px] text-slate-500">Demanda</p>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
          <span>Almacenamiento {water.storageLevelPercent}%</span>
          <span className={water.pressureStatus === 'stable' ? 'text-emerald-400' : water.pressureStatus === 'warning' ? 'text-amber-400' : 'text-red-400'}>
            Presión {water.pressureStatus}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
          <span>Calidad {water.avgQualityPpm} ppm</span>
          <span>Superávit {water.surplusM3h} m³/h</span>
        </div>
      </div>
    </div>
  );
}

export type GridAlertListProps = {
  alerts: GridAlert[];
};

export function GridAlertList({ alerts }: GridAlertListProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
        <TriangleAlert className="h-3.5 w-3.5 text-amber-400" /> Alertas de red
      </div>
      {alerts.length === 0 && <p className="py-4 text-center text-xs text-slate-500">Sin alertas.</p>}
      <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
        {alerts.map((alert) => (
          <div key={alert.id} className={`rounded-lg border px-3 py-2 ${ALERT_LEVEL[alert.level]}`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium capitalize">{alert.level}</span>
              <span className="text-[9px] text-slate-500">{alert.domain}</span>
            </div>
            <p className="mt-0.5 text-[10px]">{alert.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export type GridDashboardProps = {
  power?: PowerNode[];
  water?: WaterNode[];
  links?: GridLink[];
  powerBalance?: PowerBalance;
  waterBalance?: WaterBalance;
  alerts?: GridAlert[];
};

const DEFAULT_POWER: PowerBalance = { generationKw: 0, loadKw: 0, reserveKw: 0, reservePercent: 0, voltageStatus: 'stable', frequencyHz: 60 };
const DEFAULT_WATER: WaterBalance = { productionM3h: 0, demandM3h: 0, surplusM3h: 0, storageLevelPercent: 0, avgPressureBar: 0, avgQualityPpm: 0, pressureStatus: 'stable' };

export function GridDashboard({ power: initialPower, water: initialWater, links: initialLinks, powerBalance: initialPowerBalance, waterBalance: initialWaterBalance, alerts: initialAlerts }: GridDashboardProps) {
  const [data, setData] = useState<GridDashboardProps | null>(
    initialPower && initialWater && initialLinks && initialPowerBalance && initialWaterBalance && initialAlerts
      ? { power: initialPower, water: initialWater, links: initialLinks, powerBalance: initialPowerBalance, waterBalance: initialWaterBalance, alerts: initialAlerts }
      : null,
  );
  const [loading, setLoading] = useState(!data);

  useEffect(() => {
    if (data) return;
    Promise.all([
      fetch('/api/grid/power').then((r) => r.json()),
      fetch('/api/grid/water').then((r) => r.json()),
      fetch('/api/grid/topology').then((r) => r.json()),
      fetch('/api/grid/alerts').then((r) => r.json()),
    ])
      .then(([powerData, waterData, topologyData, alertsData]) => {
        setData({
          power: powerData.nodes ?? [],
          water: waterData.nodes ?? [],
          links: topologyData.links ?? [],
          powerBalance: powerData.balance ?? DEFAULT_POWER,
          waterBalance: waterData.balance ?? DEFAULT_WATER,
          alerts: alertsData.alerts ?? [],
        });
      })
      .catch(() => setData({ power: [], water: [], links: [], powerBalance: DEFAULT_POWER, waterBalance: DEFAULT_WATER, alerts: [] }))
      .finally(() => setLoading(false));
  }, [data]);

  if (loading || !data) {
    return (
      <div className="flex items-center gap-2 py-16 text-xs text-slate-400">
        <Loader2 className="h-4 w-4 animate-spin" /> Cargando red...
      </div>
    );
  }
  const { power, water, links, powerBalance, waterBalance, alerts } = data;
  const safePower = power ?? [];
  const safeWater = water ?? [];
  const safeLinks = links ?? [];
  const safeAlerts = alerts ?? [];
  return (
    <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-50">Smart Grid / Agua</h1>
        <p className="mt-1 text-sm text-slate-400">
          Balance energético, red de agua, topología e infraestructura crítica del territorio.
        </p>
      </header>
      <GridBalanceCards power={powerBalance ?? DEFAULT_POWER} water={waterBalance ?? DEFAULT_WATER} />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <GridNetworkView power={safePower} water={safeWater} links={safeLinks} />
        </div>
        <GridAlertList alerts={safeAlerts} />
      </div>
    </div>
  );
}
