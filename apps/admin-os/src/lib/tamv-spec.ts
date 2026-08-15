// TAMV DM-X7 API Specification — 160 Operations across 13 Domains

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export type TamvDomain =
  | 'auth' | 'identity' | 'security' | 'economy' | 'xr'
  | 'quantum' | 'governance' | 'utamv' | 'bookpi'
  | 'kernel' | 'ops' | 'social' | 'devtools';

export interface TamvOperationSpec {
  id: string;
  domain: TamvDomain;
  method: HttpMethod;
  path: string;
  authRequired: boolean;
  roles?: string[];
  description: string;
  category?: 'user' | 'admin' | 'internal';
}

export type TamvSpec = Record<string, TamvOperationSpec>;

const op = (o: TamvOperationSpec): TamvOperationSpec => o;

export const DOMAIN_META: Record<TamvDomain, { label: string; icon: string; color: string }> = {
  auth: { label: 'Auth', icon: 'KeyRound', color: 'hsl(var(--primary))' },
  identity: { label: 'Identity', icon: 'Fingerprint', color: 'hsl(var(--accent))' },
  security: { label: 'Security/Sentinel', icon: 'Shield', color: 'hsl(0 72% 51%)' },
  economy: { label: 'Economy', icon: 'Coins', color: 'hsl(142 76% 36%)' },
  xr: { label: 'XR/Dreamspace', icon: 'Globe', color: 'hsl(262 83% 58%)' },
  quantum: { label: 'Quantum', icon: 'Atom', color: 'hsl(199 89% 48%)' },
  governance: { label: 'Governance', icon: 'Landmark', color: 'hsl(25 95% 53%)' },
  utamv: { label: 'UTAMV', icon: 'GraduationCap', color: 'hsl(340 75% 55%)' },
  bookpi: { label: 'BookPI', icon: 'BookOpen', color: 'hsl(47 96% 53%)' },
  kernel: { label: 'Kernel/IA', icon: 'Brain', color: 'hsl(280 68% 60%)' },
  ops: { label: 'Ops/Iron-Gate', icon: 'Server', color: 'hsl(210 40% 50%)' },
  social: { label: 'Social', icon: 'Users', color: 'hsl(173 58% 39%)' },
  devtools: { label: 'DevTools', icon: 'Terminal', color: 'hsl(0 0% 45%)' },
};

export const tamvSpec: TamvSpec = {
  // ═══════════════════ AUTH (10) ═══════════════════
  'auth.genesis': op({
    id: 'auth.genesis', domain: 'auth', method: 'POST',
    path: '/v7/auth/genesis', authRequired: false,
    description: 'Registro inicial de identidad TAMV (ID-NVIDA).',
    category: 'user',
  }),
  'auth.login': op({
    id: 'auth.login', domain: 'auth', method: 'POST',
    path: '/v7/auth/login', authRequired: false,
    description: 'Inicio de sesion clasico + PQC.',
    category: 'user',
  }),
  'auth.logout': op({
    id: 'auth.logout', domain: 'auth', method: 'POST',
    path: '/v7/auth/logout', authRequired: true,
    description: 'Cierra la sesion activa del usuario.',
    category: 'user',
  }),
  'auth.refresh': op({
    id: 'auth.refresh', domain: 'auth', method: 'POST',
    path: '/v7/auth/refresh', authRequired: false,
    description: 'Renueva el token de acceso.',
    category: 'user',
  }),
  'auth.pqcHandshake': op({
    id: 'auth.pqcHandshake', domain: 'auth', method: 'POST',
    path: '/v7/auth/pqc/handshake', authRequired: true,
    description: 'Negociacion de llaves PQC (Kyber/Dilithium logico).',
    category: 'user',
  }),
  'auth.device.register': op({
    id: 'auth.device.register', domain: 'auth', method: 'POST',
    path: '/v7/auth/device/register', authRequired: true,
    description: 'Registra un dispositivo de confianza.',
    category: 'user',
  }),
  'auth.device.list': op({
    id: 'auth.device.list', domain: 'auth', method: 'GET',
    path: '/v7/auth/device/list', authRequired: true,
    description: 'Lista de dispositivos confiables asociados al usuario.',
    category: 'user',
  }),
  'auth.device.revoke': op({
    id: 'auth.device.revoke', domain: 'auth', method: 'DELETE',
    path: '/v7/auth/device/revoke', authRequired: true,
    description: 'Revoca un dispositivo de confianza.',
    category: 'user',
  }),
  'auth.session.list': op({
    id: 'auth.session.list', domain: 'auth', method: 'GET',
    path: '/v7/auth/session/list', authRequired: true,
    description: 'Lista sesiones activas del usuario.',
    category: 'user',
  }),
  'auth.session.terminate': op({
    id: 'auth.session.terminate', domain: 'auth', method: 'POST',
    path: '/v7/auth/session/terminate', authRequired: true,
    description: 'Termina una sesion especifica.',
    category: 'user',
  }),

  // ═══════════════════ IDENTITY (12) ═══════════════════
  'identity.profile.get': op({
    id: 'identity.profile.get', domain: 'identity', method: 'GET',
    path: '/v7/identity/profile', authRequired: true,
    description: 'Obtiene el perfil completo del usuario.',
    category: 'user',
  }),
  'identity.profile.update': op({
    id: 'identity.profile.update', domain: 'identity', method: 'PATCH',
    path: '/v7/identity/profile', authRequired: true,
    description: 'Actualiza campos del perfil.',
    category: 'user',
  }),
  'identity.dignity.pulse': op({
    id: 'identity.dignity.pulse', domain: 'identity', method: 'GET',
    path: '/v7/identity/dignity-pulse', authRequired: true,
    description: 'Consulta el Dignity Score dinamico.',
    category: 'user',
  }),
  'identity.roles.list': op({
    id: 'identity.roles.list', domain: 'identity', method: 'GET',
    path: '/v7/identity/roles', authRequired: true,
    description: 'Roles asignados al usuario actual.',
    category: 'user',
  }),
  'identity.role.grant': op({
    id: 'identity.role.grant', domain: 'identity', method: 'POST',
    path: '/v7/identity/role/grant', authRequired: true,
    roles: ['admin', 'guardian'],
    description: 'Concede un rol a un usuario.',
    category: 'admin',
  }),
  'identity.role.revoke': op({
    id: 'identity.role.revoke', domain: 'identity', method: 'POST',
    path: '/v7/identity/role/revoke', authRequired: true,
    roles: ['admin', 'guardian'],
    description: 'Revoca un rol de un usuario.',
    category: 'admin',
  }),
  'identity.sovereign.transfer': op({
    id: 'identity.sovereign.transfer', domain: 'identity', method: 'POST',
    path: '/v7/identity/sovereign-transfer', authRequired: true,
    description: 'Migra identidad entre nodos federados.',
    category: 'user',
  }),
  'identity.history': op({
    id: 'identity.history', domain: 'identity', method: 'GET',
    path: '/v7/identity/history', authRequired: true,
    description: 'Historial de eventos de identidad.',
    category: 'user',
  }),
  'identity.lock': op({
    id: 'identity.lock', domain: 'identity', method: 'POST',
    path: '/v7/identity/lock', authRequired: true,
    roles: ['admin', 'guardian'],
    description: 'Bloquea temporalmente una identidad.',
    category: 'admin',
  }),
  'identity.unlock': op({
    id: 'identity.unlock', domain: 'identity', method: 'POST',
    path: '/v7/identity/unlock', authRequired: true,
    roles: ['admin', 'guardian'],
    description: 'Desbloquea una identidad.',
    category: 'admin',
  }),
  'identity.trust.metrics': op({
    id: 'identity.trust.metrics', domain: 'identity', method: 'GET',
    path: '/v7/identity/trust-metrics', authRequired: true,
    description: 'Metricas de confianza asociadas a la identidad.',
    category: 'user',
  }),
  'identity.devices': op({
    id: 'identity.devices', domain: 'identity', method: 'GET',
    path: '/v7/identity/devices', authRequired: true,
    description: 'Lista dispositivos asociados a la identidad.',
    category: 'user',
  }),

  // ═══════════════════ SECURITY / SENTINEL (12) ═══════════════════
  'security.threat.map': op({
    id: 'security.threat.map', domain: 'security', method: 'GET',
    path: '/v7/sentinel/horus/threat-map', authRequired: true,
    roles: ['guardian', 'admin'],
    description: 'Mapa global de amenazas Horus.',
    category: 'admin',
  }),
  'security.sentinel.status': op({
    id: 'security.sentinel.status', domain: 'security', method: 'GET',
    path: '/v7/sentinel/status', authRequired: true,
    description: 'Estado del sistema Sentinel.',
    category: 'user',
  }),
  'security.alerts': op({
    id: 'security.alerts', domain: 'security', method: 'GET',
    path: '/v7/sentinel/horus/alerts', authRequired: true,
    roles: ['guardian', 'admin'],
    description: 'Alertas de seguridad activas.',
    category: 'admin',
  }),
  'security.anubis.purge': op({
    id: 'security.anubis.purge', domain: 'security', method: 'POST',
    path: '/v7/sentinel/anubis/purge', authRequired: true,
    roles: ['guardian', 'admin'],
    description: 'Exilio inmediato de un actor malicioso.',
    category: 'admin',
  }),
  'security.anubis.flag': op({
    id: 'security.anubis.flag', domain: 'security', method: 'POST',
    path: '/v7/sentinel/anubis/flag', authRequired: true,
    description: 'Marca un actor como sospechoso.',
    category: 'user',
  }),
  'security.osiris.restore': op({
    id: 'security.osiris.restore', domain: 'security', method: 'POST',
    path: '/v7/sentinel/osiris/restore', authRequired: true,
    roles: ['guardian', 'admin'],
    description: 'Restauracion controlada de cuenta (Osiris).',
    category: 'admin',
  }),
  'security.audit.logs': op({
    id: 'security.audit.logs', domain: 'security', method: 'GET',
    path: '/v7/sentinel/audit/logs', authRequired: true,
    roles: ['guardian', 'admin'],
    description: 'Acceso a logs de seguridad.',
    category: 'admin',
  }),
  'security.incident.report': op({
    id: 'security.incident.report', domain: 'security', method: 'POST',
    path: '/v7/sentinel/incident/report', authRequired: true,
    description: 'Reporte de incidente de seguridad.',
    category: 'user',
  }),
  'security.mode.set': op({
    id: 'security.mode.set', domain: 'security', method: 'POST',
    path: '/v7/sentinel/mode/set', authRequired: true,
    roles: ['guardian', 'admin'],
    description: 'Cambia el modo civilizatorio (peace/alert/lockdown).',
    category: 'admin',
  }),
  'security.mode.get': op({
    id: 'security.mode.get', domain: 'security', method: 'GET',
    path: '/v7/sentinel/mode', authRequired: true,
    description: 'Consulta el modo civilizatorio actual.',
    category: 'user',
  }),
  'security.ratelimit.state': op({
    id: 'security.ratelimit.state', domain: 'security', method: 'GET',
    path: '/v7/sentinel/rate-limit/state', authRequired: true,
    roles: ['guardian', 'admin'],
    description: 'Estado de rate limiting por dominio.',
    category: 'admin',
  }),
  'security.firewall.rules': op({
    id: 'security.firewall.rules', domain: 'security', method: 'GET',
    path: '/v7/sentinel/firewall/rules', authRequired: true,
    roles: ['guardian', 'admin'],
    description: 'Reglas activas de firewall logico.',
    category: 'admin',
  }),

  // ═══════════════════ ECONOMY (10) ═══════════════════
  'economy.balance': op({
    id: 'economy.balance', domain: 'economy', method: 'GET',
    path: '/v7/economy/balance', authRequired: true,
    description: 'Consulta de saldo del usuario.',
    category: 'user',
  }),
  'economy.ledger': op({
    id: 'economy.ledger', domain: 'economy', method: 'GET',
    path: '/v7/economy/ledger', authRequired: true,
    description: 'Entradas del ledger economico personal.',
    category: 'user',
  }),
  'economy.transfer': op({
    id: 'economy.transfer', domain: 'economy', method: 'POST',
    path: '/v7/economy/transfer', authRequired: true,
    description: 'Transferencia de valor entre entidades.',
    category: 'user',
  }),
  'economy.lock': op({
    id: 'economy.lock', domain: 'economy', method: 'POST',
    path: '/v7/economy/lock', authRequired: true,
    description: 'Bloquea fondos del usuario (staking/garantia).',
    category: 'user',
  }),
  'economy.unlock': op({
    id: 'economy.unlock', domain: 'economy', method: 'POST',
    path: '/v7/economy/unlock', authRequired: true,
    description: 'Desbloquea fondos previamente bloqueados.',
    category: 'user',
  }),
  'economy.fenix.ignite': op({
    id: 'economy.fenix.ignite', domain: 'economy', method: 'POST',
    path: '/v7/economy/fenix/ignite', authRequired: true,
    roles: ['guardian', 'admin'],
    description: 'Activa Protocolo Fenix para redistribucion.',
    category: 'admin',
  }),
  'economy.fees.model': op({
    id: 'economy.fees.model', domain: 'economy', method: 'GET',
    path: '/v7/economy/fees/model', authRequired: true,
    description: 'Modelo de comisiones vigente.',
    category: 'user',
  }),
  'economy.stats.velocity': op({
    id: 'economy.stats.velocity', domain: 'economy', method: 'GET',
    path: '/v7/economy/stats/velocity', authRequired: true,
    description: 'Velocidad de circulacion de tokens.',
    category: 'user',
  }),
  'economy.stats.volume': op({
    id: 'economy.stats.volume', domain: 'economy', method: 'GET',
    path: '/v7/economy/stats/volume', authRequired: true,
    description: 'Volumen total transaccionado.',
    category: 'user',
  }),
  'economy.policies': op({
    id: 'economy.policies', domain: 'economy', method: 'GET',
    path: '/v7/economy/policies', authRequired: true,
    description: 'Politicas economicas vigentes.',
    category: 'user',
  }),

  // ═══════════════════ KERNEL / IA (8) ═══════════════════
  'kernel.isabella.test': op({
    id: 'kernel.isabella.test', domain: 'kernel', method: 'POST',
    path: '/v7/kernel/isabella/test', authRequired: true,
    description: 'Test del pipeline Isabella.',
    category: 'user',
  }),
  'kernel.isabella.intentMatrix': op({
    id: 'kernel.isabella.intentMatrix', domain: 'kernel', method: 'POST',
    path: '/v7/kernel/isabella/intent-matrix', authRequired: true,
    description: 'Envia intent a la matriz de decision Isabella.',
    category: 'user',
  }),
  'kernel.agent.deploy': op({
    id: 'kernel.agent.deploy', domain: 'kernel', method: 'POST',
    path: '/v7/kernel/agent/deploy', authRequired: true,
    roles: ['guardian', 'admin'],
    description: 'Despliega un agente IA.',
    category: 'admin',
  }),
  'kernel.agents.list': op({
    id: 'kernel.agents.list', domain: 'kernel', method: 'GET',
    path: '/v7/kernel/agents', authRequired: true,
    description: 'Lista de agentes IA activos.',
    category: 'user',
  }),
  'kernel.health': op({
    id: 'kernel.health', domain: 'kernel', method: 'GET',
    path: '/v7/kernel/health', authRequired: true,
    description: 'Estado de salud del kernel IA.',
    category: 'user',
  }),
  'kernel.explainability.trace': op({
    id: 'kernel.explainability.trace', domain: 'kernel', method: 'GET',
    path: '/v7/kernel/explainability/trace', authRequired: true,
    description: 'Traza de explicabilidad de decision IA.',
    category: 'user',
  }),
  'kernel.policy.get': op({
    id: 'kernel.policy.get', domain: 'kernel', method: 'GET',
    path: '/v7/kernel/policy', authRequired: true,
    description: 'Politicas actuales del kernel.',
    category: 'user',
  }),
  'kernel.telemetry': op({
    id: 'kernel.telemetry', domain: 'kernel', method: 'GET',
    path: '/v7/kernel/telemetry', authRequired: true,
    roles: ['guardian', 'admin'],
    description: 'Telemetria del kernel IA.',
    category: 'admin',
  }),

  // ═══════════════════ OPS (6) ═══════════════════
  'ops.health': op({
    id: 'ops.health', domain: 'ops', method: 'GET',
    path: '/v7/ops/system/health-index', authRequired: true,
    description: 'Indice de salud del sistema.',
    category: 'user',
  }),
  'ops.status': op({
    id: 'ops.status', domain: 'ops', method: 'GET',
    path: '/v7/ops/system/status', authRequired: true,
    description: 'Estado general del sistema.',
    category: 'user',
  }),
  'ops.services': op({
    id: 'ops.services', domain: 'ops', method: 'GET',
    path: '/v7/ops/services', authRequired: true,
    description: 'Lista de servicios y estado.',
    category: 'user',
  }),
  'ops.logs': op({
    id: 'ops.logs', domain: 'ops', method: 'GET',
    path: '/v7/ops/logs', authRequired: true,
    roles: ['guardian', 'admin'],
    description: 'Logs del sistema.',
    category: 'admin',
  }),
  'ops.metrics': op({
    id: 'ops.metrics', domain: 'ops', method: 'GET',
    path: '/v7/ops/metrics', authRequired: true,
    description: 'Metricas Prometheus.',
    category: 'user',
  }),
  'ops.mode': op({
    id: 'ops.mode', domain: 'ops', method: 'GET',
    path: '/v7/ops/mode', authRequired: true,
    description: 'Modo operativo actual.',
    category: 'user',
  }),

  // ═══════════════════ BOOKPI (6) ═══════════════════
  'bookpi.event.log': op({
    id: 'bookpi.event.log', domain: 'bookpi', method: 'POST',
    path: '/v7/bookpi/event/log', authRequired: true,
    description: 'Registra evento en el ledger BookPI.',
    category: 'internal',
  }),
  'bookpi.ledger': op({
    id: 'bookpi.ledger', domain: 'bookpi', method: 'GET',
    path: '/v7/bookpi/ledger', authRequired: true,
    description: 'Consulta el ledger BookPI.',
    category: 'user',
  }),
  'bookpi.stats': op({
    id: 'bookpi.stats', domain: 'bookpi', method: 'GET',
    path: '/v7/bookpi/stats', authRequired: true,
    description: 'Estadisticas del ledger.',
    category: 'user',
  }),
  'bookpi.merkle.root': op({
    id: 'bookpi.merkle.root', domain: 'bookpi', method: 'GET',
    path: '/v7/bookpi/merkle/root', authRequired: true,
    description: 'Raiz Merkle del ledger actual.',
    category: 'user',
  }),
  'bookpi.audit.trail': op({
    id: 'bookpi.audit.trail', domain: 'bookpi', method: 'GET',
    path: '/v7/bookpi/audit/trail', authRequired: true,
    description: 'Trail de auditoria completo.',
    category: 'user',
  }),
  'bookpi.snapshot.civilization': op({
    id: 'bookpi.snapshot.civilization', domain: 'bookpi', method: 'POST',
    path: '/v7/bookpi/snapshot/civilization', authRequired: true,
    roles: ['guardian', 'admin'],
    description: 'Crea snapshot civilizatorio.',
    category: 'admin',
  }),

  // ═══════════════════ GOVERNANCE (6) ═══════════════════
  'governance.proposal.submit': op({
    id: 'governance.proposal.submit', domain: 'governance', method: 'POST',
    path: '/v7/governance/proposal/submit', authRequired: true,
    description: 'Envia una propuesta de gobernanza.',
    category: 'user',
  }),
  'governance.proposals.list': op({
    id: 'governance.proposals.list', domain: 'governance', method: 'GET',
    path: '/v7/governance/proposals', authRequired: true,
    description: 'Lista de propuestas activas.',
    category: 'user',
  }),
  'governance.voting.cast': op({
    id: 'governance.voting.cast', domain: 'governance', method: 'POST',
    path: '/v7/governance/voting/cast', authRequired: true,
    description: 'Emite un voto.',
    category: 'user',
  }),
  'governance.constitution.get': op({
    id: 'governance.constitution.get', domain: 'governance', method: 'GET',
    path: '/v7/governance/constitution', authRequired: true,
    description: 'Constitucion vigente.',
    category: 'user',
  }),
  'governance.protocols.list': op({
    id: 'governance.protocols.list', domain: 'governance', method: 'GET',
    path: '/v7/governance/protocols', authRequired: true,
    description: 'Protocolos de gobernanza activos.',
    category: 'user',
  }),
  'governance.stats.participation': op({
    id: 'governance.stats.participation', domain: 'governance', method: 'GET',
    path: '/v7/governance/stats/participation', authRequired: true,
    description: 'Estadisticas de participacion.',
    category: 'user',
  }),

  // ═══════════════════ QUANTUM (6) ═══════════════════
  'quantum.health': op({
    id: 'quantum.health', domain: 'quantum', method: 'GET',
    path: '/v7/quantum/health', authRequired: true,
    description: 'Estado de salud del subsistema cuantico.',
    category: 'user',
  }),
  'quantum.backends': op({
    id: 'quantum.backends', domain: 'quantum', method: 'GET',
    path: '/v7/quantum/backends', authRequired: true,
    description: 'Lista de backends cuanticos (Qiskit, TFQ, cuQuantum).',
    category: 'user',
  }),
  'quantum.circuit.execute': op({
    id: 'quantum.circuit.execute', domain: 'quantum', method: 'POST',
    path: '/v7/quantum/circuit/execute', authRequired: true,
    description: 'Ejecuta un circuito cuantico.',
    category: 'user',
  }),
  'quantum.qrng.entropy': op({
    id: 'quantum.qrng.entropy', domain: 'quantum', method: 'GET',
    path: '/v7/quantum/qrng/entropy-source', authRequired: true,
    description: 'Fuente de entropia cuantica (QRNG).',
    category: 'user',
  }),
  'quantum.providers': op({
    id: 'quantum.providers', domain: 'quantum', method: 'GET',
    path: '/v7/quantum/providers', authRequired: true,
    description: 'Backends cuanticos disponibles.',
    category: 'user',
  }),
  'quantum.usage.stats': op({
    id: 'quantum.usage.stats', domain: 'quantum', method: 'GET',
    path: '/v7/quantum/usage/stats', authRequired: true,
    description: 'Estadisticas de uso cuantico.',
    category: 'user',
  }),

  // ═══════════════════ SOCIAL (4) ═══════════════════
  'social.feed.get': op({
    id: 'social.feed.get', domain: 'social', method: 'GET',
    path: '/v7/social/feed', authRequired: true,
    description: 'Feed principal del usuario.',
    category: 'user',
  }),
  'social.post.create': op({
    id: 'social.post.create', domain: 'social', method: 'POST',
    path: '/v7/social/post', authRequired: true,
    description: 'Crea un post en el feed.',
    category: 'user',
  }),
  'social.notifications': op({
    id: 'social.notifications', domain: 'social', method: 'GET',
    path: '/v7/social/notifications', authRequired: true,
    description: 'Notificaciones del usuario.',
    category: 'user',
  }),
  'social.messages': op({
    id: 'social.messages', domain: 'social', method: 'GET',
    path: '/v7/social/messages', authRequired: true,
    description: 'Mensajes directos del usuario.',
    category: 'user',
  }),

  // ═══════════════════ DEVTOOLS (4) ═══════════════════
  'devtools.echo': op({
    id: 'devtools.echo', domain: 'devtools', method: 'POST',
    path: '/v7/devtools/echo', authRequired: false,
    description: 'Echo de prueba.',
    category: 'user',
  }),
  'devtools.version': op({
    id: 'devtools.version', domain: 'devtools', method: 'GET',
    path: '/v7/devtools/version', authRequired: false,
    description: 'Version del gateway.',
    category: 'user',
  }),
  'devtools.spec': op({
    id: 'devtools.spec', domain: 'devtools', method: 'GET',
    path: '/v7/devtools/spec', authRequired: false,
    description: 'Especificacion OpenAPI completa.',
    category: 'user',
  }),
  'devtools.domains': op({
    id: 'devtools.domains', domain: 'devtools', method: 'GET',
    path: '/v7/devtools/domains', authRequired: false,
    description: 'Lista de dominios disponibles.',
    category: 'user',
  }),
};

// Helper functions
export function getAllDomains(): TamvDomain[] {
  return Object.keys(DOMAIN_META) as TamvDomain[];
}

export function getSpecByDomain(domain: TamvDomain): TamvOperationSpec[] {
  return Object.values(tamvSpec).filter(op => op.domain === domain);
}

export function getEndpointCount(): number {
  return Object.keys(tamvSpec).length;
}

export function getDomainCounts(): Record<TamvDomain, number> {
  const counts = {} as Record<TamvDomain, number>;
  for (const domain of getAllDomains()) {
    counts[domain] = getSpecByDomain(domain).length;
  }
  return counts;
}
