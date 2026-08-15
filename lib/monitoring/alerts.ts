/* ================================================================== */
/* OBSERVABILIDAD — Motor de alertas (reglas sobre métricas)          */
/* ================================================================== */

import { MetricsRegistry } from '@/lib/monitoring/metrics';

export type AlertOperator = 'gt' | 'gte' | 'lt' | 'lte' | 'eq';
export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface AlertRule {
  id: string;
  name: string;
  metric: string;
  op: AlertOperator;
  threshold: number;
  severity: AlertSeverity;
  message: string;
  tags?: Record<string, string | number | boolean>;
}

export interface ActiveAlert {
  ruleId: string;
  name: string;
  metric: string;
  severity: AlertSeverity;
  value: number;
  threshold: number;
  message: string;
  triggeredAt: number;
}

function compare(op: AlertOperator, value: number, threshold: number): boolean {
  switch (op) {
    case 'gt':
      return value > threshold;
    case 'gte':
      return value >= threshold;
    case 'lt':
      return value < threshold;
    case 'lte':
      return value <= threshold;
    case 'eq':
      return value === threshold;
  }
}

export class AlertEngine {
  private rules: AlertRule[] = [];
  private active = new Map<string, ActiveAlert>();

  constructor(private metrics: MetricsRegistry) {}

  addRule(rule: Omit<AlertRule, 'id'> & { id?: string }): AlertRule {
    const full: AlertRule = {
      ...rule,
      id: rule.id ?? `rule-${this.rules.length + 1}`,
    };
    this.rules.push(full);
    return full;
  }

  removeRule(id: string): void {
    this.rules = this.rules.filter(r => r.id !== id);
    this.active.delete(id);
  }

  rulesList(): AlertRule[] {
    return [...this.rules];
  }

  /** Evalúa todas las reglas y devuelve las alertas activas. */
  evaluate(): ActiveAlert[] {
    const now = Date.now();
    for (const rule of this.rules) {
      const value = this.metrics.gauge(rule.metric, rule.tags ?? {});
      if (value === null) continue;
      if (compare(rule.op, value, rule.threshold)) {
        const existing = this.active.get(rule.id);
        if (!existing) {
          this.active.set(rule.id, {
            ruleId: rule.id,
            name: rule.name,
            metric: rule.metric,
            severity: rule.severity,
            value,
            threshold: rule.threshold,
            message: rule.message,
            triggeredAt: now,
          });
        } else {
          existing.value = value;
        }
      } else {
        this.active.delete(rule.id);
      }
    }
    return [...this.active.values()];
  }

  activeAlerts(): ActiveAlert[] {
    return [...this.active.values()];
  }

  clear(): void {
    this.active.clear();
  }
}
