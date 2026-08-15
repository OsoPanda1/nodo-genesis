/* ================================================================== */
/* GOBERNANZA — Versionado de contratos y ciclo de vida de APIs       */
/* ================================================================== */
/* Registro único de contratos de API del Nodo Cero con:               */
/*   · semver estricto por contrato                                   */
/*   · estados de ciclo de vida (deprecated → sunset)                 */
/*   · estrategia de compatibilidad (additive / breaking)             */
/*   · política de despliegue (canary / stable)                       */
/* ================================================================== */

export type ContractLifecycle = 'stable' | 'deprecated' | 'sunset' | 'preview';
export type Compatibility = 'additive' | 'breaking';
export type DeployPolicy = 'canary' | 'stable' | 'blue-green';

export interface ApiContract {
  id: string;
  path: string;
  methods: string[];
  version: string;
  lifecycle: ContractLifecycle;
  compatibility: Compatibility;
  owner: string;
  sunsetAt?: string;
  changelog: string[];
}

export interface CompatibilityDecision {
  compatible: boolean;
  contractId: string;
  from: string;
  to: string;
  reason: string;
}

const CONTRACTS: ApiContract[] = [
  {
    id: 'api.isabella.chat',
    path: '/api/isabella',
    methods: ['POST', 'GET'],
    version: '4.0.0',
    lifecycle: 'stable',
    compatibility: 'additive',
    owner: 'nucleo-cognitivo',
    changelog: ['v4: pipeline C.R.O.W.N. + ISA core soberano', 'v4: respuestas firmadas MEXA (opcional)'],
  },
  {
    id: 'api.isabella.reason',
    path: '/api/isabella/isa/reason',
    methods: ['POST'],
    version: '4.0.0',
    lifecycle: 'stable',
    compatibility: 'additive',
    owner: 'nucleo-cognitivo',
    changelog: ['v4: Answer + Sources + Trace', 'v4: núcleo soberano sin dependencia externa'],
  },
  {
    id: 'api.isabella.gateway',
    path: '/api/isabella/gateway',
    methods: ['POST', 'GET'],
    version: '1.0.0',
    lifecycle: 'stable',
    compatibility: 'additive',
    owner: 'crown',
    changelog: ['v1: flota federada multi-proveedor + fallback ISA'],
  },
  {
    id: 'api.isabella.crypto',
    path: '/api/isabella/crypto/{sign,verify}',
    methods: ['POST'],
    version: '2.0.0',
    lifecycle: 'stable',
    compatibility: 'additive',
    owner: 'trazabilidad',
    changelog: ['v2: esquema MSR-P256', 'v2: objetivo post-cuántico CRYSTALS-Dilithium-5'],
  },
  {
    id: 'api.monitor.state',
    path: '/api/monitor/state',
    methods: ['GET'],
    version: '1.0.0',
    lifecycle: 'stable',
    compatibility: 'additive',
    owner: 'observabilidad',
    changelog: ['v1: snapshot completo de métricas, trazas, eventos y alertas'],
  },
  {
    id: 'api.monitor.health',
    path: '/api/monitor/health',
    methods: ['GET'],
    version: '1.0.0',
    lifecycle: 'stable',
    compatibility: 'additive',
    owner: 'observabilidad',
    changelog: ['v1: health checks por dominio'],
  },
  {
    id: 'api.monitor.events',
    path: '/api/monitor/events',
    methods: ['GET'],
    version: '1.0.0',
    lifecycle: 'stable',
    compatibility: 'additive',
    owner: 'observabilidad',
    changelog: ['v1: consulta de eventos correlacionados'],
  },
  {
    id: 'api.twins',
    path: '/api/twins/{models,instances,graph,simulate,query}',
    methods: ['GET', 'POST'],
    version: '1.0.0',
    lifecycle: 'stable',
    compatibility: 'additive',
    owner: 'experiencia',
    changelog: ['v1: gemelo digital DTDL + NGSI-LD'],
  },
  {
    id: 'api.city',
    path: '/api/city/{ioc,incidents,mobility,response,scorecard}',
    methods: ['GET', 'POST'],
    version: '1.0.0',
    lifecycle: 'stable',
    compatibility: 'additive',
    owner: 'operacion',
    changelog: ['v1: IOC urbano con triage y playbooks'],
  },
  {
    id: 'api.gamification',
    path: '/api/gamification/{events,session}',
    methods: ['POST', 'GET'],
    version: '1.0.0',
    lifecycle: 'stable',
    compatibility: 'additive',
    owner: 'experiencia',
    changelog: ['v1: puntos server-authoritative con HMAC'],
  },
];

/** Regresa el catálogo completo de contratos. */
export function apiCatalog(): ApiContract[] {
  return [...CONTRACTS];
}

export function getContract(id: string): ApiContract | undefined {
  return CONTRACTS.find(c => c.id === id);
}

/** Evalúa compatibilidad entre versiones de un contrato. */
export function checkCompatibility(
  contractId: string,
  from: string,
  to: string,
): CompatibilityDecision {
  const contract = getContract(contractId);
  if (!contract) {
    return {
      compatible: false,
      contractId,
      from,
      to,
      reason: `Contrato desconocido: ${contractId}`,
    };
  }
  const fromMajor = Number(from.split('.')[0]);
  const toMajor = Number(to.split('.')[0]);
  if (toMajor > fromMajor) {
    return {
      compatible: false,
      contractId,
      from,
      to,
      reason: `Bump mayor (${from} → ${to}) es un cambio breaking. Requiere migración coordinada.`,
    };
  }
  if (contract.compatibility === 'breaking' && from !== to) {
    return {
      compatible: false,
      contractId,
      from,
      to,
      reason: `Cambio breaking declarado en el contrato (${from} → ${to}). Requiere migración coordinada.`,
    };
  }
  return {
    compatible: true,
    contractId,
    from,
    to,
    reason: `Cambio aditivo permitido (${from} → ${to}).`,
  };
}

/** Aplica la política de despliegue recomendada para un contrato. */
export function deployPolicy(contract: ApiContract): DeployPolicy {
  if (contract.lifecycle === 'preview') return 'canary';
  if (contract.lifecycle === 'sunset') return 'blue-green';
  return 'stable';
}

/** Contratos que requieren atención (deprecados o por retirar). */
export function contractsNeedingAttention(): ApiContract[] {
  return CONTRACTS.filter(c => c.lifecycle === 'deprecated' || c.lifecycle === 'sunset');
}
