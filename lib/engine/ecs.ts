/* ============================================================================
 * RDM DIGITAL — NODO CERO 3D ENGINE
 * Data-Oriented Design (DOD) Entity Component System (ECS)
 * Zero-Allocation Memory Arena & Archetype Contiguous Array Storage
 * ============================================================================ */

export const MAX_ENTITIES = 10000;

// Component Types bitmask flags
export enum ComponentFlags {
  None = 0,
  Transform3D = 1 << 0,
  Physics3D = 1 << 1,
  Renderable = 2 << 2,
  QuestState = 3 << 3,
  TelemetryNode = 4 << 4,
}

// Memory Layout for Transform3D (Position XYZ, Rotation Quaternion XYZW, Scale XYZ) -> 10 floats per entity
export const TRANSFORM_STRIDE = 10;
// Memory Layout for Physics3D (Velocity XYZ, Acceleration XYZ, Mass, Drag) -> 8 floats per entity
export const PHYSICS_STRIDE = 8;

export class ECSWorld {
  private nextEntityId: number = 0;
  private freeEntities: number[] = [];
  
  // Dense component storage backing buffers (Contiguous TypedArrays for max CPU L1/L2 cache locality)
  public readonly maskBuffer: Uint32Array;
  public readonly transformBuffer: Float32Array;
  public readonly physicsBuffer: Float32Array;

  // Sparse sets for fast O(1) lookup: EntityId -> Component Index
  public readonly sparseTransformMap: Int32Array;
  public readonly sparsePhysicsMap: Int32Array;

  constructor(maxEntities: number = MAX_ENTITIES) {
    this.maskBuffer = new Uint32Array(maxEntities);
    this.transformBuffer = new Float32Array(maxEntities * TRANSFORM_STRIDE);
    this.physicsBuffer = new Float32Array(maxEntities * PHYSICS_STRIDE);

    this.sparseTransformMap = new Int32Array(maxEntities).fill(-1);
    this.sparsePhysicsMap = new Int32Array(maxEntities).fill(-1);
  }

  /**
   * Spawn entity reusing free slots (Zero-allocation)
   */
  public createEntity(): number {
    let id: number;
    if (this.freeEntities.length > 0) {
      id = this.freeEntities.pop()!;
    } else {
      id = this.nextEntityId++;
      if (id >= MAX_ENTITIES) {
        throw new Error(`[ECS] Exceeded maximum entity capacity (${MAX_ENTITIES})`);
      }
    }
    this.maskBuffer[id] = ComponentFlags.None;
    return id;
  }

  /**
   * Destroy entity and recycle ID slot
   */
  public destroyEntity(id: number): void {
    this.maskBuffer[id] = ComponentFlags.None;
    this.sparseTransformMap[id] = -1;
    this.sparsePhysicsMap[id] = -1;
    this.freeEntities.push(id);
  }

  /**
   * Attach Transform3D component
   */
  public addTransform3D(
    id: number,
    posX: number, posY: number, posZ: number,
    rotX: number = 0, rotY: number = 0, rotZ: number = 0, rotW: number = 1,
    scaleX: number = 1, scaleY: number = 1, scaleZ: number = 1
  ): void {
    this.maskBuffer[id] |= ComponentFlags.Transform3D;
    const offset = id * TRANSFORM_STRIDE;
    this.sparseTransformMap[id] = offset;

    this.transformBuffer[offset + 0] = posX;
    this.transformBuffer[offset + 1] = posY;
    this.transformBuffer[offset + 2] = posZ;
    this.transformBuffer[offset + 3] = rotX;
    this.transformBuffer[offset + 4] = rotY;
    this.transformBuffer[offset + 5] = rotZ;
    this.transformBuffer[offset + 6] = rotW;
    this.transformBuffer[offset + 7] = scaleX;
    this.transformBuffer[offset + 8] = scaleY;
    this.transformBuffer[offset + 9] = scaleZ;
  }

  /**
   * Attach Physics3D component
   */
  public addPhysics3D(
    id: number,
    vx: number = 0, vy: number = 0, vz: number = 0,
    ax: number = 0, ay: number = -9.81, az: number = 0,
    mass: number = 1.0, drag: number = 0.05
  ): void {
    this.maskBuffer[id] |= ComponentFlags.Physics3D;
    const offset = id * PHYSICS_STRIDE;
    this.sparsePhysicsMap[id] = offset;

    this.physicsBuffer[offset + 0] = vx;
    this.physicsBuffer[offset + 1] = vy;
    this.physicsBuffer[offset + 2] = vz;
    this.physicsBuffer[offset + 3] = ax;
    this.physicsBuffer[offset + 4] = ay;
    this.physicsBuffer[offset + 5] = az;
    this.physicsBuffer[offset + 6] = mass;
    this.physicsBuffer[offset + 7] = drag;
  }

  /**
   * Fast cache-friendly System execution loop over all entities with Transform & Physics
   */
  public stepPhysicsSystem(dt: number): void {
    const requiredMask = ComponentFlags.Transform3D | ComponentFlags.Physics3D;
    const count = this.nextEntityId;

    for (let id = 0; id < count; id++) {
      if ((this.maskBuffer[id] & requiredMask) === requiredMask) {
        const tOff = id * TRANSFORM_STRIDE;
        const pOff = id * PHYSICS_STRIDE;

        // Apply acceleration & drag to velocity
        this.physicsBuffer[pOff + 0] += this.physicsBuffer[pOff + 3] * dt;
        this.physicsBuffer[pOff + 1] += this.physicsBuffer[pOff + 4] * dt;
        this.physicsBuffer[pOff + 2] += this.physicsBuffer[pOff + 5] * dt;

        const dragFactor = 1.0 - this.physicsBuffer[pOff + 7] * dt;
        this.physicsBuffer[pOff + 0] *= dragFactor;
        this.physicsBuffer[pOff + 1] *= dragFactor;
        this.physicsBuffer[pOff + 2] *= dragFactor;

        // Apply velocity to transform position
        this.transformBuffer[tOff + 0] += this.physicsBuffer[pOff + 0] * dt;
        this.transformBuffer[tOff + 1] += this.physicsBuffer[pOff + 1] * dt;
        this.transformBuffer[tOff + 2] += this.physicsBuffer[pOff + 2] * dt;
      }
    }
  }
}
