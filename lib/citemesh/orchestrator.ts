/* ================================================================== */
/* ORCHESTRATOR CITEMESH — Registro de nodos y ruteo con failover     */
/* ================================================================== */
/* Espejo ejecutable del blueprint `tamv-nexus-core`: la malla         */
/* federada autopoiética (CITEMESH) gestiona sus propios nodos P2P     */
/* (soberanía de Nodo Cero) y enruta paquetes firmados entre celdas    */
/* (F1-F3).                                                             */
/*                                                                     */
/*   - registerNode  lanza CITEMESH_NODE_INVALID_CREDENTIALS si la     */
/*     credencial (derivada de la p2pPublicKey) no corresponde.        */
/*   - routePacket   busca la celda destino y degrada con failover:    */
/*     si la celda no tiene nodo operativo, cae a cualquier nodo       */
/*     activo de la malla (failover).                                  */
/*   - El registro vive en memoria del runtime (globalThis) con TTL    */
/*     de heartbeat; los integradores reales alimentan el estado desde */
/*     el Data Fabric YUN.                                             */
/* ================================================================== */

import { sha256, stableJson } from '@/lib/continuity/hash-chain';
import {
  CITEMESH_PROVIDER,
  citemeshNodeConfigSchema,
  citemeshRoutePacketSchema,
  type CitemeshNodeConfig,
  type CitemeshRoutePacket,
} from './contracts';
import { emitCitemeshAudit } from './audit';

export const CITEMESH_NODE_INVALID_CREDENTIALS = 'CITEMESH_NODE_INVALID_CREDENTIALS';
export const CITEMESH_SOURCE_UNKNOWN = 'CITEMESH_SOURCE_UNKNOWN';
export const CITEMESH_TARGET_UNREACHABLE = 'CITEMESH_TARGET_UNREACHABLE';
export const CITEMESH_NO_NODES = 'CITEMESH_NO_NODES';

export const NODE_HEARTBEAT_TTL_MS = 90_000;

export interface CitemeshNode extends CitemeshNodeConfig {
  registeredAt: string;
  lastHeartbeatAt: string;
}

export type CitemeshRouteOutcome =
  | { ok: true; delivered: true; hops: string[]; failoverUsed: boolean; deliveredAt: string }
  | { ok: false; delivered: false; failoverUsed: boolean; reason: string };

interface CitemeshStoreShape {
  nodes: Map<string, CitemeshNode>;
  ledger: CitemeshRoutePacket[];
}

/* Persistencia del registro a través de recargas de módulo (HMR). */
const g = globalThis as unknown as { __rdmCitemeshStore?: CitemeshStoreShape };

function getStore(): CitemeshStoreShape {
  if (!g.__rdmCitemeshStore) {
    g.__rdmCitemeshStore = { nodes: new Map(), ledger: [] };
  }
  return g.__rdmCitemeshStore;
}

/* Credencial determinística derivada de la identidad P2P del nodo. La
   malla exige probar conocimiento de la p2pPublicKey al registrarse. */
export function citemeshNodeSecret(
  config: Pick<CitemeshNodeConfig, 'nodeId' | 'p2pPublicKey'>,
): string {
  return sha256(
    stableJson({
      provider: CITEMESH_PROVIDER,
      nodeId: config.nodeId,
      p2pPublicKey: config.p2pPublicKey,
    }),
  );
}

/** Registra un nodo en la malla. Lanza si la credencial no corresponde. */
export function registerNode(
  config: CitemeshNodeConfig,
  credentials: { nodeSecret: string },
): CitemeshNode {
  const parsed = citemeshNodeConfigSchema.parse(config);
  if (citemeshNodeSecret(parsed) !== credentials.nodeSecret) {
    emitCitemeshAudit(
      'citemesh.node.register.denied',
      { nodeId: parsed.nodeId, cellTopology: parsed.cellTopology },
      { cell: parsed.cellTopology, severity: 'warning' },
    );
    throw new Error(CITEMESH_NODE_INVALID_CREDENTIALS);
  }

  const now = new Date().toISOString();
  const node: CitemeshNode = { ...parsed, registeredAt: now, lastHeartbeatAt: now };
  const store = getStore();
  store.nodes.set(parsed.nodeId, node);

  emitCitemeshAudit(
    'citemesh.node.registered',
    {
      nodeId: node.nodeId,
      cellTopology: node.cellTopology,
      governancePower: node.governancePower,
      hroQuality: node.hroQuality,
      failoverActive: node.failoverActive,
    },
    { cell: node.cellTopology },
  );
  return node;
}

function isAlive(node: CitemeshNode, now: number): boolean {
  return now - Date.parse(node.lastHeartbeatAt) <= NODE_HEARTBEAT_TTL_MS;
}

/** Registra un heartbeat: mantiene vivo al nodo y limpia expirados. */
export function heartbeat(nodeId: string): boolean {
  const store = getStore();
  const node = store.nodes.get(nodeId);
  if (!node) return false;
  node.lastHeartbeatAt = new Date().toISOString();
  emitCitemeshAudit('citemesh.node.heartbeat', { nodeId });
  return true;
}

/** Enruta un paquete firmado hacia una celda con degradación por failover. */
export function routePacket(packet: CitemeshRoutePacket): CitemeshRouteOutcome {
  const parsed = citemeshRoutePacketSchema.parse(packet);
  const store = getStore();
  const now = Date.now();

  const source = store.nodes.get(parsed.sourceNode);
  if (!source) {
    emitCitemeshAudit(
      'citemesh.packet.dropped',
      { traceId: parsed.traceId, reason: CITEMESH_SOURCE_UNKNOWN },
      { severity: 'warning' },
    );
    return { ok: false, delivered: false, failoverUsed: false, reason: CITEMESH_SOURCE_UNKNOWN };
  }

  const alive = [...store.nodes.values()].filter((node) => isAlive(node, now));
  if (alive.length === 0) {
    emitCitemeshAudit(
      'citemesh.packet.dropped',
      { traceId: parsed.traceId, reason: CITEMESH_NO_NODES },
      { severity: 'warning' },
    );
    return { ok: false, delivered: false, failoverUsed: false, reason: CITEMESH_NO_NODES };
  }

  /* Nodo destino preferente: mismo nombre de celda, distinto al origen. */
  const preferred = alive.find(
    (node) => node.cellTopology === parsed.targetCell && node.nodeId !== parsed.sourceNode,
  );
  const failoverCandidate = alive.find((node) => node.nodeId !== parsed.sourceNode);
  const target = preferred ?? failoverCandidate;

  if (!target) {
    emitCitemeshAudit(
      'citemesh.packet.dropped',
      { traceId: parsed.traceId, reason: CITEMESH_TARGET_UNREACHABLE },
      { severity: 'warning' },
    );
    return { ok: false, delivered: false, failoverUsed: true, reason: CITEMESH_TARGET_UNREACHABLE };
  }

  const failoverUsed = target.nodeId !== preferred?.nodeId;
  const deliveredAt = new Date().toISOString();
  store.ledger.push(parsed);
  if (store.ledger.length > 1_000) store.ledger.shift();

  emitCitemeshAudit(
    failoverUsed ? 'citemesh.packet.failover' : 'citemesh.packet.routed',
    {
      traceId: parsed.traceId,
      sourceNode: parsed.sourceNode,
      targetCell: parsed.targetCell,
      targetNode: target.nodeId,
      failoverUsed,
      hops: [source.nodeId, target.nodeId],
    },
    { cell: target.cellTopology },
  );

  return { ok: true, delivered: true, hops: [source.nodeId, target.nodeId], failoverUsed, deliveredAt };
}

export function getNode(nodeId: string): CitemeshNode | undefined {
  return getStore().nodes.get(nodeId);
}

export function listNodes(): CitemeshNode[] {
  return [...getStore().nodes.values()];
}

export function meshStatus(): {
  provider: string;
  nodes: number;
  alive: number;
  byCell: Record<string, number>;
  ledgerSize: number;
} {
  const store = getStore();
  const now = Date.now();
  const alive = [...store.nodes.values()].filter((node) => isAlive(node, now)).length;
  const byCell: Record<string, number> = {};
  for (const node of store.nodes.values()) {
    byCell[node.cellTopology] = (byCell[node.cellTopology] ?? 0) + 1;
  }
  return { provider: CITEMESH_PROVIDER, nodes: store.nodes.size, alive, byCell, ledgerSize: store.ledger.length };
}

export function resetCitemeshForTests(): void {
  g.__rdmCitemeshStore = { nodes: new Map(), ledger: [] };
}
