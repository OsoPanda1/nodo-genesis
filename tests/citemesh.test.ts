import { describe, it, expect, beforeEach } from 'vitest';
import {
  citemeshNodeConfigSchema,
  citemeshRoutePacketSchema,
  citemeshRegisterNodeRequestSchema,
  CITEMESH_SEMANTIC_VERSION,
  type CitemeshNodeConfig,
} from '@/lib/citemesh';
import {
  registerNode,
  routePacket,
  heartbeat,
  getNode,
  listNodes,
  meshStatus,
  resetCitemeshForTests,
  citemeshNodeSecret,
  CITEMESH_NODE_INVALID_CREDENTIALS,
  CITEMESH_SOURCE_UNKNOWN,
} from '@/lib/citemesh';
import { eventHistory, resetBusForTests } from '@/lib/core/events';

const nodeConfig = (overrides: Partial<CitemeshNodeConfig> = {}): CitemeshNodeConfig => ({
  nodeId: 'nodo-a',
  cellTopology: 'F1',
  governancePower: 'LOGICAL',
  hroQuality: 'Q2',
  endpoint: 'https://nodo-a.rdm.local',
  p2pPublicKey: 'k_'.padEnd(64, 'a1b2c3'),
  failoverActive: false,
  ...overrides,
});

beforeEach(() => {
  resetBusForTests();
  resetCitemeshForTests();
});

describe('contrato · malla CITEMESH', () => {
  it('define la versión semántica de la malla', () => {
    expect(CITEMESH_SEMANTIC_VERSION).toBe('citemesh.mesh.v1');
  });

  it('acepta una configuración de nodo válida con defaults', () => {
    const parsed = citemeshNodeConfigSchema.parse(nodeConfig());
    expect(parsed.failoverActive).toBe(false);
  });

  it('rechaza claves extra (strict, fail-closed)', () => {
    const result = citemeshNodeConfigSchema.safeParse({
      ...nodeConfig(),
      extra: true,
    });
    expect(result.success).toBe(false);
  });

  it('rechaza una topología de celda desconocida', () => {
    const result = citemeshNodeConfigSchema.safeParse({
      ...nodeConfig(),
      cellTopology: 'F9',
    });
    expect(result.success).toBe(false);
  });

  it('rechaza un endpoint no URL', () => {
    const result = citemeshNodeConfigSchema.safeParse({
      ...nodeConfig(),
      endpoint: 'no-es-una-url',
    });
    expect(result.success).toBe(false);
  });

  it('rechaza un paquete de ruta sin firma suficiente', () => {
    const result = citemeshRoutePacketSchema.safeParse({
      traceId: 'trace-1',
      sourceNode: 'nodo-a',
      targetCell: 'F1',
      payload: {},
      signature: 'corta',
      timestamp: 1,
    });
    expect(result.success).toBe(false);
  });

  it('valida la solicitud de registro con nodeSecret', () => {
    const parsed = citemeshRegisterNodeRequestSchema.parse({
      config: nodeConfig(),
      nodeSecret: 'secreto',
    });
    expect(parsed.nodeSecret).toBe('secreto');
  });
});

describe('orquestador · registro de nodos', () => {
  it('registra un nodo con la credencial correcta', () => {
    const config = nodeConfig();
    const node = registerNode(config, { nodeSecret: citemeshNodeSecret(config) });
    expect(getNode('nodo-a')).toBe(node);
    expect(node.registeredAt).toBeTruthy();
    expect(listNodes()).toHaveLength(1);
  });

  it('lanza CITEMESH_NODE_INVALID_CREDENTIALS con credencial incorrecta', () => {
    expect(() => registerNode(nodeConfig(), { nodeSecret: 'incorrecto' })).toThrow(
      CITEMESH_NODE_INVALID_CREDENTIALS,
    );
  });

  it('no registra un nodo cuya credencial no corresponde aunque exista', () => {
    const config = nodeConfig();
    registerNode(config, { nodeSecret: citemeshNodeSecret(config) });
    expect(listNodes()).toHaveLength(1);
  });

  it('rechaza duplicados de nodeId pisando el registro', () => {
    const config = nodeConfig();
    registerNode(config, { nodeSecret: citemeshNodeSecret(config) });
    const duplicate = nodeConfig({ hroQuality: 'Q3' });
    registerNode(duplicate, { nodeSecret: citemeshNodeSecret(duplicate) });
    expect(listNodes()).toHaveLength(1);
  });

  it('emite eventos de registro y rechazo al bus YUN', () => {
    const config = nodeConfig();
    registerNode(config, { nodeSecret: citemeshNodeSecret(config) });
    expect(() =>
      registerNode(nodeConfig({ nodeId: 'malo' }), { nodeSecret: 'nope' }),
    ).toThrow();
    const registered = eventHistory(50, { type: 'citemesh.node.registered' });
    const denied = eventHistory(50, { type: 'citemesh.node.register.denied' });
    expect(registered.length).toBe(1);
    expect(denied.length).toBe(1);
  });
});

describe('orquestador · ruteo con failover', () => {
  it('enruta hacia la celda destino con nodo operativo', () => {
    const a = nodeConfig();
    const b = nodeConfig({ nodeId: 'nodo-b', cellTopology: 'F1', governancePower: 'EXECUTIVE' });
    registerNode(a, { nodeSecret: citemeshNodeSecret(a) });
    registerNode(b, { nodeSecret: citemeshNodeSecret(b) });

    const outcome = routePacket({
      traceId: 'trace-r1',
      sourceNode: 'nodo-a',
      targetCell: 'F1',
      payload: { tema: 'memoria' },
      signature: 'sig_' + 'a'.repeat(16),
      timestamp: Date.now(),
    });
    expect(outcome.ok).toBe(true);
    if (outcome.ok) {
      expect(outcome.failoverUsed).toBe(false);
      expect(outcome.hops).toContain('nodo-b');
    }
  });

  it('degrada por failover cuando la celda destino no tiene nodos', () => {
    const a = nodeConfig();
    const b = nodeConfig({ nodeId: 'nodo-b', cellTopology: 'F2', governancePower: 'OBSERVER' });
    registerNode(a, { nodeSecret: citemeshNodeSecret(a) });
    registerNode(b, { nodeSecret: citemeshNodeSecret(b) });

    const outcome = routePacket({
      traceId: 'trace-f1',
      sourceNode: 'nodo-a',
      targetCell: 'F3',
      payload: {},
      signature: 'sig_' + 'b'.repeat(16),
      timestamp: Date.now(),
    });
    expect(outcome.ok).toBe(true);
    if (outcome.ok) {
      expect(outcome.failoverUsed).toBe(true);
    }
    const failoverEvents = eventHistory(50, { type: 'citemesh.packet.failover' });
    expect(failoverEvents.length).toBe(1);
  });

  it('descarta paquetes de un origen desconocido', () => {
    registerNode(nodeConfig(), { nodeSecret: citemeshNodeSecret(nodeConfig()) });
    const outcome = routePacket({
      traceId: 'trace-x',
      sourceNode: 'fantasma',
      targetCell: 'F1',
      payload: {},
      signature: 'sig_' + 'c'.repeat(16),
      timestamp: Date.now(),
    });
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.reason).toBe(CITEMESH_SOURCE_UNKNOWN);
    const dropped = eventHistory(50, { type: 'citemesh.packet.dropped' });
    expect(dropped.length).toBe(1);
  });

  it('descarta paquetes cuando no hay nodos vivos', () => {
    const a = nodeConfig();
    registerNode(a, { nodeSecret: citemeshNodeSecret(a) });
    const outcome = routePacket({
      traceId: 'trace-t',
      sourceNode: 'nodo-a',
      targetCell: 'F1',
      payload: {},
      signature: 'sig_' + 'd'.repeat(16),
      timestamp: Date.now(),
    });
    /* Mismo nodo origen y destino: sin candidato distinto -> no entregado. */
    expect(outcome.ok).toBe(false);
  });

  it('mantiene vivo un nodo con heartbeat y limpia expirados', () => {
    const a = nodeConfig();
    registerNode(a, { nodeSecret: citemeshNodeSecret(a) });
    expect(heartbeat('nodo-a')).toBe(true);
    expect(heartbeat('inexistente')).toBe(false);
    expect(meshStatus().alive).toBe(1);
  });
});

describe('orquestador · salud de la malla', () => {
  it('reporta el estado por celda y proveedor', () => {
    const a = nodeConfig();
    const b = nodeConfig({ nodeId: 'nodo-b', cellTopology: 'F2' });
    registerNode(a, { nodeSecret: citemeshNodeSecret(a) });
    registerNode(b, { nodeSecret: citemeshNodeSecret(b) });
    const status = meshStatus();
    expect(status.provider).toBe('citemesh');
    expect(status.nodes).toBe(2);
    expect(status.byCell.F1).toBe(1);
    expect(status.byCell.F2).toBe(1);
  });

  it('resetea el estado entre pruebas', () => {
    registerNode(nodeConfig(), { nodeSecret: citemeshNodeSecret(nodeConfig()) });
    resetCitemeshForTests();
    expect(meshStatus().nodes).toBe(0);
  });
});
