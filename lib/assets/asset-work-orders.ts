import type { Asset } from './asset-types';
import { computeAssetHealth } from './asset-health-engine';
import { failureProbability } from './asset-failure-model';

export type WorkOrderStatus = 'open' | 'scheduled' | 'in-progress' | 'done' | 'cancelled';

export type WorkOrder = {
  id: string;
  assetId: string;
  assetName: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: WorkOrderStatus;
  assignee?: string;
  estimatedHours: number;
  createdAt: string;
  dueAt: string;
  completedAt?: string;
  origin: 'manual' | 'sensor' | 'predictive' | 'scheduled';
};

export function workOrderFromAsset(asset: Asset, index: number): WorkOrder {
  const health = computeAssetHealth(asset);
  const risk = failureProbability(asset);
  const now = Date.now();

  const priority: WorkOrder['priority'] =
    risk.riskBand === 'severe' || health.status === 'failure'
      ? 'urgent'
      : risk.riskBand === 'high' || health.status === 'maintenance'
        ? 'high'
        : health.status === 'degraded'
          ? 'medium'
          : 'low';

  const hours = priority === 'urgent' ? 6 : priority === 'high' ? 4 : priority === 'medium' ? 3 : 2;
  const dueDays = priority === 'urgent' ? 1 : priority === 'high' ? 3 : priority === 'medium' ? 7 : 14;

  return {
    id: `wo-${String(index + 1).padStart(4, '0')}`,
    assetId: asset.id,
    assetName: asset.name,
    title: `${asset.code} — intervención ${priority === 'urgent' ? 'correctiva urgente' : priority === 'high' ? 'prioritaria' : 'planificada'}`,
    description: reasonFromAsset(asset, risk.riskBand),
    priority,
    status: 'open',
    estimatedHours: hours,
    createdAt: new Date(now).toISOString(),
    dueAt: new Date(now + dueDays * 86_400_000).toISOString(),
    origin: priority === 'urgent' ? 'sensor' : 'predictive',
  };
}

function reasonFromAsset(asset: Asset, riskBand: string): string {
  const health = computeAssetHealth(asset);
  return `Salud ${health.score}/100, condición ${health.condition}, banda de riesgo ${riskBand}.`;
}

export function generateWorkOrders(assets: Asset[]): WorkOrder[] {
  return assets.map((asset, index) => workOrderFromAsset(asset, index));
}

export function workOrderStats(orders: WorkOrder[]) {
  return {
    total: orders.length,
    open: orders.filter((o) => o.status === 'open').length,
    scheduled: orders.filter((o) => o.status === 'scheduled').length,
    inProgress: orders.filter((o) => o.status === 'in-progress').length,
    done: orders.filter((o) => o.status === 'done').length,
    urgent: orders.filter((o) => o.priority === 'urgent').length,
    totalHours: orders.reduce((s, o) => s + o.estimatedHours, 0),
  };
}
