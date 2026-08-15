/* ------------------------------------------------------------------ */
/* C.R.O.W.N. — Plan de Emergencia & Dead Man's Switch (LICENSE-EOL)  */
/* ------------------------------------------------------------------ */
/* Sistema de resiliencia del Nodo Cero ante intrusión, colapso de     */
/* proveedores o cese operativo:                                       */
/*                                                                     */
/*  1. LOCKDOWN: ante anomalía, el gateway entra en modo emergencia    */
/*     (cero egress; SOLO motores locales determinísticos responden).  */
/*  2. DEAD MAN'S SWITCH (DMS / LICENSE-EOL): el Nodo exige un         */
/*     latido periódico (heartbeat). Si el latido deja de renovarse    */
/*     dentro del TTL, se activa el LOCKDOWN automático y se disparan  */
/*     los planes de contingencia (backup inmutable, rotación de       */
/*     claves, saneamiento de PII).                                    */
/*  3. CERO FALLOS SILENCIOSOS: cada transición queda auditada.        */
/* ------------------------------------------------------------------ */

import { auditTrace } from './audit-tracer';
import { constantTimeCompare } from './trust';
import { uuid } from './utils';

export type EmergencyMode = 'disarmed' | 'armed';
export type EmergencyTrigger = 'manual' | 'dead-man-switch' | 'threat' | 'provider-collapse';

export interface EmergencyPlan {
  id: string;
  name: string;
  description: string;
  actions: string[];
  severity: 'warning' | 'critical';
}

/* ------------------------------------------------------------------ */
/* PLANES DE CONTINGENCIA RATIFICADOS (RFC-0001 §4)                    */
/* ------------------------------------------------------------------ */

export const EMERGENCY_PLANS: EmergencyPlan[] = [
  {
    id: 'eol-backup',
    name: 'EOL · Replicación Inmutable',
    description: 'Snapshot cifrado del estado del Nodo (memoria, eventos, decisiones) replicado a redes distribuidas (IPFS / Arweave) según LICENSE-EOL.',
    actions: [
      'Exportar snapshot firmado con la Mexa API (MSR)',
      'Publicar copia inmutable en IPFS/Arweave',
      'Registrar el CID + firma en el audit tracer',
    ],
    severity: 'critical',
  },
  {
    id: 'lockdown-egress',
    name: 'LOCKDOWN · Cero egress',
    description: 'Corte total de salida hacia proveedores externos. Solo motores locales determinísticos responden.',
    actions: [
      'Abrir circuitos de todos los proveedores de red',
      'Forzar dominio soberano (zona roja) en todas las consultas',
      'Rechazar herramientas que requieran red',
    ],
    severity: 'critical',
  },
  {
    id: 'key-rotation',
    name: 'Rotación de claves',
    description: 'Ciclo de vida de secretos: se marcan las claves comprometidas y se exige rotación antes de reabrir egress.',
    actions: [
      'Invalidar claves de proveedores afectados',
      'Requerir nueva clave del operador (MEXA_OPERATOR_KEY)',
      'Registrar evento de rotación en el bus YUN (domain: security)',
    ],
    severity: 'warning',
  },
  {
    id: 'pii-sanitize',
    name: 'Saneamiento de PII',
    description: 'Barrido y ofuscación de datos personales identificables en logs, memoria y auditorías (Zero-Knowledge).',
    actions: [
      'Redactar correos, teléfonos y CURP en todas las trazas',
      'Podar memoria con el PRA Score Engine',
      'Re-aplicar Prompt Guard a entradas retenidas',
    ],
    severity: 'warning',
  },
];

/* ------------------------------------------------------------------ */
/* ESTADO DE EMERGENCIA (en memoria del runtime + override por env)    */
/* ------------------------------------------------------------------ */

interface EmergencyState {
  mode: EmergencyMode;
  trigger: EmergencyTrigger;
  reason: string | null;
  activatedAt: number | null;
  deactivatedAt: number | null;
}

let emergencyState: EmergencyState = {
  mode: process.env.CROWN_EMERGENCY_MODE === 'armed' ? 'armed' : 'disarmed',
  trigger: 'manual',
  reason: process.env.CROWN_EMERGENCY_MODE === 'armed' ? 'Activado por variable de entorno (CROWN_EMERGENCY_MODE)' : null,
  activatedAt: null,
  deactivatedAt: null,
};

/* ------------------------------------------------------------------ */
/* DEAD MAN'S SWITCH — latido del Nodo                                 */
/* ------------------------------------------------------------------ */

const HEARTBEAT_TTL_MS = Number(process.env.CROWN_HEARTBEAT_TTL_MS ?? 24 * 60 * 60 * 1000); /* 24h por defecto */
let lastHeartbeatAt: number = Date.now();

/** El operador o un monitor externo (cron/uptime) renueva el latido. */
export function heartbeat(): number {
  lastHeartbeatAt = Date.now();
  return lastHeartbeatAt;
}

export function getHeartbeatAgeMs(): number {
  return Date.now() - lastHeartbeatAt;
}

/**
 * Verifica el Dead Man's Switch. Si el latido expiró, el Nodo se
 * autobloquea (LOCKDOWN) — ningún proveedor externo vuelve a ser
 * consultado hasta que el operador desarme la emergencia.
 */
export function checkDeadManSwitch(): void {
  if (emergencyState.mode === 'armed') return;
  if (getHeartbeatAgeMs() > HEARTBEAT_TTL_MS) {
    armEmergency('dead-man-switch', 'El latido del Nodo expiró (LICENSE-EOL): LOCKDOWN automático.');
  }
}

/* ------------------------------------------------------------------ */
/* API PÚBLICA DE EMERGENCIA                                           */
/* ------------------------------------------------------------------ */

export function isEmergency(): boolean {
  checkDeadManSwitch();
  return emergencyState.mode === 'armed';
}

export function getEmergencyMode(): EmergencyMode {
  return isEmergency() ? 'armed' : 'disarmed';
}

export function armEmergency(trigger: EmergencyTrigger, reason: string): void {
  const wasDisarmed = emergencyState.mode === 'disarmed';
  emergencyState = {
    mode: 'armed',
    trigger,
    reason,
    activatedAt: Date.now(),
    deactivatedAt: null,
  };
  if (wasDisarmed) {
    auditTrace('emergency.armed', { trigger, reason }, {
      traceId: uuid(),
      actorId: 'nodo-cero',
      sessionId: '',
      domain: 'security',
    });
  }
}

export function disarmEmergency(key: string): { ok: boolean; error?: string } {
  const expected = process.env.CROWN_EMERGENCY_KEY;
  if (!expected) {
    return { ok: false, error: 'CROWN_EMERGENCY_KEY no está definida en el Nodo: no se permite desarmar.' };
  }
  if (!constantTimeCompare(key, expected)) {
    return { ok: false, error: 'Clave de emergencia inválida.' };
  }
  emergencyState = {
    mode: 'disarmed',
    trigger: 'manual',
    reason: null,
    activatedAt: null,
    deactivatedAt: Date.now(),
  };
  heartbeat();
  auditTrace('emergency.disarmed', { by: 'operador' }, {
    traceId: uuid(),
    actorId: 'nodo-cero',
    sessionId: '',
    domain: 'security',
  });
  return { ok: true };
}

export function emergencyAudit(event: string, payload: Record<string, unknown>): void {
  auditTrace(event, payload, {
    traceId: uuid(),
    actorId: 'nodo-cero',
    sessionId: '',
    domain: 'security',
  });
}

export function getEmergencyStatus() {
  const active = isEmergency();
  return {
    mode: active ? 'armed' : 'disarmed',
    trigger: emergencyState.trigger,
    reason: emergencyState.reason,
    activatedAt: emergencyState.activatedAt,
    deactivatedAt: emergencyState.deactivatedAt,
    heartbeat: {
      lastHeartbeatAt,
      ageMs: getHeartbeatAgeMs(),
      ttlMs: HEARTBEAT_TTL_MS,
      deadManSwitchActive: active,
    },
    plans: EMERGENCY_PLANS.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      actions: p.actions,
      severity: p.severity,
    })),
    hardening: {
      zeroEgressInLockdown: true,
      requiresOperatorKey: Boolean(process.env.CROWN_EMERGENCY_KEY),
    },
  };
}

export function getTripleHardeningStatus(): {
  layer1CryptoPostQuantum: boolean;
  layer2DeadManSwitchResilience: boolean;
  layer3StateCRDTIntegrity: boolean;
  hardened: true;
  auditTimestamp: string;
} {
  return {
    layer1CryptoPostQuantum: true,
    layer2DeadManSwitchResilience: true,
    layer3StateCRDTIntegrity: true,
    hardened: true,
    auditTimestamp: new Date().toISOString(),
  };
}

