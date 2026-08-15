import type { GridAlert, GridLink, NodeStatus, PowerNode, WaterNode } from './grid-types';

export function nodeStatusFor(utilizationPercent: number, thresholdHigh = 85, thresholdCritical = 95): NodeStatus {
  if (utilizationPercent >= thresholdCritical) return 'critical';
  if (utilizationPercent >= thresholdHigh) return 'warning';
  if (utilizationPercent >= 70) return 'degraded';
  return 'operational';
}

export function buildGridAlerts(power: PowerNode[], water: WaterNode[], links: GridLink[]): GridAlert[] {
  const alerts: GridAlert[] = [];
  const push = (domain: 'power' | 'water', nodeId: string, message: string, level: GridAlert['level']) => {
    alerts.push({ id: `${domain}-${nodeId}-${Math.random().toString(36).slice(2, 6)}`, domain, nodeId, message, level, timestamp: new Date().toISOString() });
  };

  for (const node of power) {
    const util = node.capacityKw > 0 ? node.loadKw / node.capacityKw : 0;
    if (util >= 0.9) push('power', node.id, `Sobrecarga en ${node.name} (${Math.round(util * 100)}%)`, 'critical');
    else if (util >= 0.8) push('power', node.id, `Carga alta en ${node.name} (${Math.round(util * 100)}%)`, 'warning');
    if (node.voltagePu < 0.95) push('power', node.id, `Tensión baja en ${node.name} (${node.voltagePu.toFixed(2)} pu)`, 'critical');
    if (node.status === 'offline') push('power', node.id, `${node.name} fuera de línea`, 'critical');
  }

  for (const node of water) {
    if (node.levelPercent > 0 && node.levelPercent < 45) push('water', node.id, `Nivel bajo en ${node.name} (${node.levelPercent}%)`, 'warning');
    if (node.levelPercent > 0 && node.levelPercent < 25) push('water', node.id, `Nivel crítico en ${node.name} (${node.levelPercent}%)`, 'critical');
    if (node.pressureBar > 0 && node.pressureBar < 2.8) push('water', node.id, `Presión baja en ${node.name} (${node.pressureBar} bar)`, 'warning');
    if (node.qualityPpm > 50) push('water', node.id, `Calidad fuera de norma en ${node.name} (${node.qualityPpm} ppm)`, 'critical');
  }

  for (const link of links) {
    if (link.utilizationPercent >= 90) push(link.domain, link.from, `Enlace ${link.from}→${link.to} al ${link.utilizationPercent}%`, 'critical');
  }

  return alerts.sort((a, b) => (b.level === 'critical' ? 1 : 0) - (a.level === 'critical' ? 1 : 0));
}
