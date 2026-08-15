/* ================================================================== */
/* GAMIFICATION YUN — World Runtime · Catálogo de prefabs aprobado    */
/* ================================================================== */
/* El catálogo es la allowlist de prefabs resolvibles por el cliente  */
/* Unity. Ningún manifiesto puede referenciar un prefab fuera de aquí */
/* (fail-closed). La semilla cubre los tipos canónicos de RDM.        */
/* ================================================================== */

import type { PrefabCatalogEntry, WorldEntityKind } from './contracts';

export const PREFAB_CATALOG: PrefabCatalogEntry[] = [
  {
    prefabKey: 'rdm/nodo-cero/core',
    supportedKinds: ['nodo-cero-core'],
    version: '1.0.0',
    estimatedTriangles: 24000,
    estimatedTextureMemoryMb: 64,
    estimatedDrawCalls: 8,
    allowedComponents: ['transform', 'collider', 'interactable', 'audio-source'],
    forbiddenComponents: ['network-transform', 'rigidbody', 'physics-simulation'],
    deprecated: false,
    provenance: 'seed:rdm-assets',
    licenseRef: 'rdm-assets/v1',
  },
  {
    prefabKey: 'rdm/heritage/totem',
    supportedKinds: ['heritage-totem'],
    version: '1.0.0',
    estimatedTriangles: 18000,
    estimatedTextureMemoryMb: 48,
    estimatedDrawCalls: 6,
    allowedComponents: ['transform', 'interactable', 'audio-source', 'particle-emitter'],
    forbiddenComponents: ['rigidbody', 'physics-simulation'],
    deprecated: false,
    provenance: 'seed:rdm-assets',
    licenseRef: 'rdm-assets/v1',
  },
  {
    prefabKey: 'rdm/route/marker',
    supportedKinds: ['tourist-route-marker'],
    version: '1.0.0',
    estimatedTriangles: 4000,
    estimatedTextureMemoryMb: 12,
    estimatedDrawCalls: 2,
    allowedComponents: ['transform', 'interactable'],
    forbiddenComponents: ['particle-emitter', 'physics-simulation'],
    deprecated: false,
    provenance: 'seed:rdm-assets',
    licenseRef: 'rdm-assets/v1',
  },
  {
    prefabKey: 'rdm/mission/terminal',
    supportedKinds: ['mission-terminal'],
    version: '1.0.0',
    estimatedTriangles: 12000,
    estimatedTextureMemoryMb: 32,
    estimatedDrawCalls: 4,
    allowedComponents: ['transform', 'collider', 'interactable', 'ui-canvas'],
    forbiddenComponents: ['physics-simulation'],
    deprecated: false,
    provenance: 'seed:rdm-assets',
    licenseRef: 'rdm-assets/v1',
  },
  {
    prefabKey: 'rdm/portal/territorial',
    supportedKinds: ['territorial-portal'],
    version: '1.0.0',
    estimatedTriangles: 30000,
    estimatedTextureMemoryMb: 96,
    estimatedDrawCalls: 10,
    allowedComponents: ['transform', 'collider', 'interactable', 'particle-emitter', 'audio-source'],
    forbiddenComponents: ['rigidbody', 'network-transform'],
    deprecated: false,
    provenance: 'seed:rdm-assets',
    licenseRef: 'rdm-assets/v1',
  },
  {
    prefabKey: 'rdm/collectible/badge',
    supportedKinds: ['collectible'],
    version: '1.0.0',
    estimatedTriangles: 1200,
    estimatedTextureMemoryMb: 4,
    estimatedDrawCalls: 1,
    allowedComponents: ['transform', 'collider', 'interactable', 'particle-emitter'],
    forbiddenComponents: ['physics-simulation'],
    deprecated: false,
    provenance: 'seed:rdm-assets',
    licenseRef: 'rdm-assets/v1',
  },
  {
    prefabKey: 'rdm/arena/gate',
    supportedKinds: ['arena-gate'],
    version: '1.0.0',
    estimatedTriangles: 10000,
    estimatedTextureMemoryMb: 24,
    estimatedDrawCalls: 3,
    allowedComponents: ['transform', 'collider', 'interactable'],
    forbiddenComponents: ['physics-simulation', 'network-transform'],
    deprecated: false,
    provenance: 'seed:rdm-assets',
    licenseRef: 'rdm-assets/v1',
  },
  {
    prefabKey: 'rdm/stage/event',
    supportedKinds: ['event-stage'],
    version: '1.0.0',
    estimatedTriangles: 45000,
    estimatedTextureMemoryMb: 128,
    estimatedDrawCalls: 14,
    allowedComponents: ['transform', 'collider', 'interactable', 'audio-source', 'ui-canvas'],
    forbiddenComponents: ['physics-simulation'],
    deprecated: false,
    provenance: 'seed:rdm-assets',
    licenseRef: 'rdm-assets/v1',
  },
  {
    prefabKey: 'rdm/prop/environment',
    supportedKinds: ['environment-prop'],
    version: '1.0.0',
    estimatedTriangles: 6000,
    estimatedTextureMemoryMb: 16,
    estimatedDrawCalls: 2,
    allowedComponents: ['transform', 'collider'],
    forbiddenComponents: ['interactable', 'physics-simulation'],
    deprecated: false,
    provenance: 'seed:rdm-assets',
    licenseRef: 'rdm-assets/v1',
  },
  {
    prefabKey: 'rdm/monument/community',
    supportedKinds: ['community-monument'],
    version: '1.0.0',
    estimatedTriangles: 36000,
    estimatedTextureMemoryMb: 96,
    estimatedDrawCalls: 9,
    allowedComponents: ['transform', 'collider', 'interactable', 'audio-source'],
    forbiddenComponents: ['rigidbody', 'network-transform'],
    deprecated: false,
    provenance: 'seed:rdm-assets',
    licenseRef: 'rdm-assets/v1',
  },
];

const catalogByKey = new Map<string, PrefabCatalogEntry>(
  PREFAB_CATALOG.map((entry) => [entry.prefabKey, entry]),
);

/** Devuelve la entrada del catálogo para un prefabKey dado. */
export function getPrefabEntry(prefabKey: string): PrefabCatalogEntry | undefined {
  return catalogByKey.get(prefabKey);
}

/** Valida que el prefab exista y soporte el kind solicitado. */
export function validatePrefabUsage(
  prefabKey: string,
  kind: WorldEntityKind,
): { ok: true } | { ok: false; reason: string } {
  const entry = catalogByKey.get(prefabKey);
  if (!entry) {
    return { ok: false, reason: `prefab no aprobado en el catálogo: ${prefabKey}` };
  }
  if (entry.deprecated) {
    return { ok: false, reason: `prefab marcado como deprecado: ${prefabKey}` };
  }
  if (!entry.supportedKinds.includes(kind)) {
    return {
      ok: false,
      reason: `el prefab ${prefabKey} no soporta el kind ${kind}`,
    };
  }
  return { ok: true };
}
