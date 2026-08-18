/* ============================================================================
 * RDM DIGITAL — NODO CERO 3D ENGINE
 * 3D Spatial Hashing Grid, Terrain Elevation Math & Deterministic Solver
 * Topographical Occlusion and Frustum Culling Pipeline
 * ============================================================================ */

export type Vector3 = { x: number; y: number; z: number };
export type AABB3D = { min: Vector3; max: Vector3 };

export class SpatialHashGrid3D {
  private cellSize: number;
  private grid: Map<string, number[]>;

  constructor(cellSize: number = 10.0) {
    this.cellSize = cellSize;
    this.grid = new Map<string, number[]>();
  }

  private hashKey(x: number, y: number, z: number): string {
    const ix = Math.floor(x / this.cellSize);
    const iy = Math.floor(y / this.cellSize);
    const iz = Math.floor(z / this.cellSize);
    return `${ix}:${iy}:${iz}`;
  }

  public clear(): void {
    this.grid.clear();
  }

  public insertEntity(id: number, pos: Vector3): void {
    const key = this.hashKey(pos.x, pos.y, pos.z);
    let cell = this.grid.get(key);
    if (!cell) {
      cell = [];
      this.grid.set(key, cell);
    }
    cell.push(id);
  }

  public queryNearby(pos: Vector3, radius: number): number[] {
    const minX = Math.floor((pos.x - radius) / this.cellSize);
    const maxX = Math.floor((pos.x + radius) / this.cellSize);
    const minY = Math.floor((pos.y - radius) / this.cellSize);
    const maxY = Math.floor((pos.y + radius) / this.cellSize);
    const minZ = Math.floor((pos.z - radius) / this.cellSize);
    const maxZ = Math.floor((pos.z + radius) / this.cellSize);

    const results: number[] = [];
    const seen = new Set<number>();

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        for (let z = minZ; z <= maxZ; z++) {
          const key = `${x}:${y}:${z}`;
          const cell = this.grid.get(key);
          if (cell) {
            for (let i = 0; i < cell.length; i++) {
              const id = cell[i];
              if (!seen.has(id)) {
                seen.add(id);
                results.push(id);
              }
            }
          }
        }
      }
    }
    return results;
  }
}

/**
 * Topographical terrain elevation model for Real del Monte's mountainous surface.
 * Procedural harmonic synthesis simulating historic mine ridges, valleys, and cobblestone elevation.
 */
export function sampleRealDelMonteTerrainHeight(x: number, z: number): number {
  const scale1 = 0.005;
  const scale2 = 0.02;
  const scale3 = 0.08;

  const h1 = Math.sin(x * scale1) * Math.cos(z * scale1) * 85.0; // Primary mountain ridge (Real del Monte 2660m-2750m)
  const h2 = Math.sin(x * scale2 + 1.2) * Math.sin(z * scale2 + 0.4) * 22.0; // Mine shafts & ravine valleys
  const h3 = Math.cos(x * scale3) * Math.sin(z * scale3) * 4.5; // Cobblestone street slope details

  return 2660.0 + h1 + h2 + h3;
}

/**
 * Raycast against mountainous terrain topography
 */
export function raycastTerrain(
  origin: Vector3,
  direction: Vector3,
  maxDistance: number = 500.0,
  stepSize: number = 1.0
): { hit: boolean; point?: Vector3; distance?: number } {
  let currentDist = 0.0;
  let px = origin.x;
  let py = origin.y;
  let pz = origin.z;

  const dx = direction.x;
  const dy = direction.y;
  const dz = direction.z;

  while (currentDist < maxDistance) {
    const terrainHeight = sampleRealDelMonteTerrainHeight(px, pz);
    if (py <= terrainHeight) {
      return {
        hit: true,
        point: { x: px, y: terrainHeight, z: pz },
        distance: currentDist,
      };
    }
    px += dx * stepSize;
    py += dy * stepSize;
    pz += dz * stepSize;
    currentDist += stepSize;
  }

  return { hit: false };
}

/**
 * Deterministic physics fixed-step integrator with sub-stepping to prevent tunneling
 */
export class DeterministicPhysicsSolver {
  private fixedDeltaTime: number;
  private accumulator: number = 0.0;

  constructor(fixedHz: number = 60) {
    this.fixedDeltaTime = 1.0 / fixedHz;
  }

  public update(frameTime: number, stepCallback: (dt: number) => void): void {
    // Clamp max frame time to avoid spiral of death
    const clampedFrame = Math.min(frameTime, 0.25);
    this.accumulator += clampedFrame;

    while (this.accumulator >= this.fixedDeltaTime) {
      stepCallback(this.fixedDeltaTime);
      this.accumulator -= this.fixedDeltaTime;
    }
  }
}
