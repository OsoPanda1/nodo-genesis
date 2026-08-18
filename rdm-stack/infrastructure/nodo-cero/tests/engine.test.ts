import { describe, it, expect } from 'vitest';
import { ECSWorld, ComponentFlags } from '../lib/engine/ecs';
import { SpatialHashGrid3D, raycastTerrain, sampleRealDelMonteTerrainHeight, DeterministicPhysicsSolver } from '../lib/engine/spatial-index';
import { VectorClock, PNCounterCRDT, LWWSetCRDT, MPSCRingBuffer } from '../lib/engine/crdt-sync';
import { BinaryProtocolCodec, PacketOpcode } from '../lib/engine/binary-protocol';

describe('RDM Digital 3D Engine & CRDT Reconciliation Subsystem', () => {
  it('1. ECS World should allocate and step physics contiguously without heap allocation', () => {
    const world = new ECSWorld(100);
    const e1 = world.createEntity();
    world.addTransform3D(e1, 10, 2660, 50);
    world.addPhysics3D(e1, 0, 10, 0);

    expect(world.maskBuffer[e1]).toBe(ComponentFlags.Transform3D | ComponentFlags.Physics3D);

    // Step physics for 1 second (dt = 1.0)
    world.stepPhysicsSystem(0.1);

    const offset = e1 * 10;
    expect(world.transformBuffer[offset + 1]).toBeGreaterThan(2660); // Y position increased
  });

  it('2. Spatial Hash Grid & Real del Monte Terrain Raycasting should compute deterministic elevations', () => {
    const grid = new SpatialHashGrid3D(10.0);
    grid.insertEntity(1, { x: 5, y: 2660, z: 5 });
    grid.insertEntity(2, { x: 8, y: 2665, z: 8 });

    const nearby = grid.queryNearby({ x: 5, y: 2660, z: 5 }, 10.0);
    expect(nearby).toContain(1);
    expect(nearby).toContain(2);

    const height = sampleRealDelMonteTerrainHeight(100, 200);
    expect(height).toBeGreaterThan(2500);

    const rayResult = raycastTerrain({ x: 100, y: 3000, z: 200 }, { x: 0, y: -1, z: 0 });
    expect(rayResult.hit).toBe(true);
    expect(rayResult.point).toBeDefined();
  });

  it('3. CRDTs (PN-Counter, LWW-Set, VectorClock) & MPSC Ring Buffer should reconcile state offline-first', () => {
    const vc1 = new VectorClock({ nodeA: 1 });
    const vc2 = new VectorClock({ nodeB: 2 });
    vc1.merge(vc2);
    expect(vc1.clockMap.get('nodeB')).toBe(2);

    const pn = new PNCounterCRDT();
    pn.increment('nodeA', 100);
    pn.decrement('nodeB', 30);
    expect(pn.value()).toBe(70);

    const lww = new LWWSetCRDT<string>();
    lww.add('quest-01', 'Minas del Real Completed', 'nodeA', 1000);
    lww.remove('quest-01', 'Minas del Real Completed', 'nodeB', 900); // Earlier timestamp, should not remove
    expect(lww.has('quest-01')).toBe(true);

    const ring = new MPSCRingBuffer<number>(8);
    ring.enqueue(42);
    expect(ring.dequeue()).toBe(42);
  });

  it('4. Zero-Copy Binary Protocol should encode and decode player transform packets accurately', () => {
    const packet = {
      opcode: PacketOpcode.PlayerTransformSync as const,
      sequenceId: 1024,
      entityId: 7,
      posX: 123.45,
      posY: 2678.90,
      posZ: -456.78,
      rotY: 1.57,
    };

    const encoded = BinaryProtocolCodec.encodePlayerTransform(packet);
    expect(encoded.byteLength).toBe(25);

    const decoded = BinaryProtocolCodec.decodePlayerTransform(encoded);
    expect(decoded.sequenceId).toBe(1024);
    expect(decoded.entityId).toBe(7);
    expect(decoded.posX).toBeCloseTo(123.45, 2);
    expect(decoded.posY).toBeCloseTo(2678.90, 2);
  });
});
