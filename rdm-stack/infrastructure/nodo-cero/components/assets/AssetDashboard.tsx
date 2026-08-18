'use client';

import { useEffect, useState } from 'react';
import { Loader2, Wrench, AlertOctagon, ClipboardList } from 'lucide-react';
import type { Asset, AssetCondition, AssetStatus } from '@/lib/assets/asset-types';
import type { AssetHealth } from '@/lib/assets/asset-health-engine';
import type { ApmScoreResult } from '@/lib/assets/asset-apm-score';

export type AssetHealthGridProps = {
  assets: Array<{ asset: Asset; health: AssetHealth }>;
};

const STATUS_STYLES: Record<AssetStatus, string> = {
  operational: 'bg-emerald-500/10 text-emerald-400',
  degraded: 'bg-amber-500/10 text-amber-400',
  maintenance: 'bg-sky-500/10 text-sky-400',
  failure: 'bg-red-500/10 text-red-400',
  retired: 'bg-slate-500/10 text-slate-400',
};

const CONDITION_COLOR: Record<AssetCondition, string> = {
  excellent: 'text-emerald-400',
  good: 'text-sky-400',
  fair: 'text-amber-400',
  poor: 'text-orange-400',
  critical: 'text-red-400',
};

export function AssetHealthGrid({ assets }: AssetHealthGridProps) {
  return (
    <div className="space-y-2">
      {assets.length === 0 && <p className="py-6 text-center text-xs text-slate-500">Sin activos registrados.</p>}
      {assets.map(({ asset, health }) => (
        <div key={asset.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{asset.code}</span>
              <span className="rounded bg-slate-800/80 px-1.5 py-0.5 text-[10px] capitalize text-slate-400">{asset.category}</span>
              <span className="rounded bg-slate-800/80 px-1.5 py-0.5 text-[10px] uppercase text-slate-400">{asset.criticality}</span>
            </div>
            <p className="mt-1 truncate text-xs font-medium text-slate-200">{asset.name}</p>
            <p className="mt-0.5 text-[10px] text-slate-500">
              {asset.location.zone} · carga {asset.telemetry.loadPercent}%
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className={`hidden rounded px-1.5 py-0.5 text-[10px] font-medium sm:inline ${STATUS_STYLES[asset.status]}`}>
              {asset.status}
            </span>
            <span className={`hidden text-[10px] capitalize md:inline ${CONDITION_COLOR[health.condition]}`}>{health.condition}</span>
            <div className="w-10 text-right">
              <p className={`text-sm font-semibold ${health.score >= 80 ? 'text-emerald-400' : health.score >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                {health.score}
              </p>
              <div className="mt-1 h-1 overflow-hidden rounded-full bg-slate-800">
                <div
                  className={`h-full rounded-full ${health.score >= 80 ? 'bg-emerald-400' : health.score >= 60 ? 'bg-amber-400' : 'bg-red-400'}`}
                  style={{ width: `${health.score}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export type ApmScorePanelProps = {
  score: ApmScoreResult;
  workOrderStats: {
    total: number;
    open: number;
    inProgress: number;
    done: number;
    urgent: number;
    totalHours: number;
  };
};

const GRADE_STYLES: Record<ApmScoreResult['grade'], string> = {
  A: 'bg-emerald-500/10 text-emerald-400',
  B: 'bg-sky-500/10 text-sky-400',
  C: 'bg-amber-500/10 text-amber-400',
  D: 'bg-orange-500/10 text-orange-400',
  F: 'bg-red-500/10 text-red-400',
};

export function ApmScorePanel({ score, workOrderStats }: ApmScorePanelProps) {
  return (
    <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          <Wrench className="h-3.5 w-3.5 text-emerald-400" />
          Score APM
        </div>
        <span className={`rounded-full px-2.5 py-1 text-sm font-bold ${GRADE_STYLES[score.grade]}`}>{score.grade}</span>
      </div>
      <div className="flex items-end justify-between">
        <p className="text-3xl font-bold text-slate-100">{score.overall}</p>
        <div className="text-right text-[10px] text-slate-500">
          <p className="flex items-center justify-end gap-1"><ClipboardList className="h-3 w-3" />{workOrderStats.total} WOs</p>
          <p className="flex items-center justify-end gap-1 text-red-400"><AlertOctagon className="h-3 w-3" />{workOrderStats.urgent} urgentes</p>
        </div>
      </div>
      <div className="space-y-2">
        {Object.entries(score.pillars).map(([key, value]) => (
          <div key={key} className="flex items-center gap-2 text-[10px]">
            <span className="w-24 capitalize text-slate-500">{key}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
              <div
                className={`h-full rounded-full ${value >= 80 ? 'bg-emerald-400' : value >= 60 ? 'bg-amber-400' : 'bg-red-400'}`}
                style={{ width: `${value}%` }}
              />
            </div>
            <span className="w-8 text-right text-slate-300">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export type AssetFailureListProps = {
  risks: Array<{ assetId: string; probability: number; riskBand: string; meanTimeToFailureDays: number }>;
};

export function AssetFailureList({ risks }: AssetFailureListProps) {
  return (
    <div className="space-y-2">
      {risks.map((risk) => (
        <div key={risk.assetId} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2">
          <div>
            <p className="text-[10px] font-medium text-slate-300">{risk.assetId}</p>
            <p className="text-[9px] text-slate-500">MTTF ≈ {risk.meanTimeToFailureDays} días</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`rounded px-1.5 py-0.5 text-[9px] font-medium uppercase ${
              risk.riskBand === 'severe' ? 'bg-red-500/10 text-red-400' : risk.riskBand === 'high' ? 'bg-orange-500/10 text-orange-400' : risk.riskBand === 'medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
            }`}>
              {risk.riskBand}
            </span>
            <span className="w-8 text-right text-[10px] font-medium text-slate-300">{Math.round(risk.probability * 100)}%</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export type AssetWorkOrdersProps = {
  workOrders: Array<{
    id: string;
    assetName: string;
    title: string;
    priority: string;
    status: string;
    estimatedHours: number;
  }>;
};

const WO_PRIORITY: Record<string, string> = {
  urgent: 'bg-red-500/10 text-red-400',
  high: 'bg-orange-500/10 text-orange-400',
  medium: 'bg-amber-500/10 text-amber-400',
  low: 'bg-emerald-500/10 text-emerald-400',
};

export function AssetWorkOrders({ workOrders }: AssetWorkOrdersProps) {
  return (
    <div className="space-y-2">
      {workOrders.length === 0 && <p className="py-6 text-center text-xs text-slate-500">Sin órdenes de trabajo.</p>}
      {workOrders.map((wo) => (
        <div key={wo.id} className="rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-semibold text-slate-400">{wo.id}</span>
            <span className={`rounded px-1.5 py-0.5 text-[9px] font-medium uppercase ${WO_PRIORITY[wo.priority] ?? 'bg-slate-500/10 text-slate-400'}`}>
              {wo.priority}
            </span>
          </div>
          <p className="mt-1 text-xs font-medium text-slate-200">{wo.title}</p>
          <p className="mt-0.5 text-[10px] text-slate-500">{wo.assetName} · {wo.status} · {wo.estimatedHours} h</p>
        </div>
      ))}
    </div>
  );
}

const DEFAULT_SCORE: ApmScoreResult = { overall: 0, grade: 'F', pillars: { availability: 0, reliability: 0, maintainability: 0, compliance: 0 } };
const DEFAULT_STATS = { total: 0, open: 0, scheduled: 0, inProgress: 0, done: 0, urgent: 0, totalHours: 0 };

export type AssetDashboardProps = {
  assets?: Array<{ asset: Asset; health: AssetHealth }>;
  score?: ApmScoreResult;
  workOrders?: AssetWorkOrdersProps['workOrders'];
  workOrderStats?: ApmScorePanelProps['workOrderStats'];
  risks?: AssetFailureListProps['risks'];
};

export function AssetDashboard({ assets: initialAssets, score: initialScore, workOrders: initialWorkOrders, workOrderStats: initialStats, risks: initialRisks }: AssetDashboardProps) {
  const [data, setData] = useState<{
    assets: AssetDashboardProps['assets'];
    score: ApmScoreResult;
    workOrders: AssetWorkOrdersProps['workOrders'];
    workOrderStats: ApmScorePanelProps['workOrderStats'];
    risks: AssetFailureListProps['risks'];
  } | null>(initialAssets && initialScore && initialWorkOrders && initialStats && initialRisks
    ? { assets: initialAssets, score: initialScore, workOrders: initialWorkOrders, workOrderStats: initialStats, risks: initialRisks }
    : null);
  const [loading, setLoading] = useState(!data);

  useEffect(() => {
    if (data) return;
    Promise.all([
      fetch('/api/assets/register').then((r) => r.json()),
      fetch('/api/assets/score').then((r) => r.json()),
      fetch('/api/assets/failures').then((r) => r.json()),
    ])
      .then(([registerData, scoreData, failuresData]) => {
        setData({
          assets: registerData.assets ?? [],
          score: scoreData.score ?? DEFAULT_SCORE,
          workOrders: scoreData.workOrders ?? [],
          workOrderStats: scoreData.workOrderStats ?? DEFAULT_STATS,
          risks: failuresData.fleet?.risks ?? [],
        });
      })
      .catch(() => setData({ assets: [], score: DEFAULT_SCORE, workOrders: [], workOrderStats: DEFAULT_STATS, risks: [] }))
      .finally(() => setLoading(false));
  }, [data]);

  if (loading || !data) {
    return (
      <div className="flex items-center gap-2 py-16 text-xs text-slate-400">
        <Loader2 className="h-4 w-4 animate-spin" /> Cargando activos...
      </div>
    );
  }
  const { assets, score, workOrders, workOrderStats, risks } = data;
  const safeAssets = assets ?? [];
  const safeStats = workOrderStats ?? DEFAULT_STATS;
  const safeRisks = risks ?? [];
  return (
    <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-50">EAM / APM</h1>
        <p className="mt-1 text-sm text-slate-400">
          Gestión de activos físicos: salud, fallas predecibles, mantenimiento y órdenes de trabajo.
        </p>
      </header>
      <div className="grid gap-4 lg:grid-cols-3">
        <ApmScorePanel score={score} workOrderStats={safeStats} />
        <div className="lg:col-span-2">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            <ClipboardList className="h-3.5 w-3.5 text-emerald-400" /> Salud de activos
          </div>
          <AssetHealthGrid assets={safeAssets} />
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            <AlertOctagon className="h-3.5 w-3.5 text-amber-400" /> Riesgo de falla
          </div>
          <AssetFailureList risks={safeRisks} />
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            <Wrench className="h-3.5 w-3.5 text-sky-400" /> Órdenes de trabajo
          </div>
          <AssetWorkOrders workOrders={workOrders ?? []} />
        </div>
      </div>
    </div>
  );
}
