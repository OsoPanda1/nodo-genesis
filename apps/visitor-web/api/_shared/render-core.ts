import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getCorsHeaders } from "./cors";
import { promises as fs } from "fs";
import path from "path";

const ALLOWED_ASSETS_DIR = path.resolve(process.cwd(), "src/assets/images");

// ── Existing types (preserved) ──

export interface RenderOperation {
  operation: string;
  payload: Record<string, unknown>;
  context?: { userId?: string; sessionId?: string };
}

// ── Existing render exports (preserved for backward compat) ──

export function analyzeFrequencies(signal: number[]): Record<string, number> {
  if (!signal || signal.length < 20) {
    return { bass: 0, mid: 0, treble: 0 };
  }
  return {
    bass: signal.slice(0, 5).reduce((a, b) => a + b, 0) / 5,
    mid: signal.slice(5, 15).reduce((a, b) => a + b, 0) / 10,
    treble: signal.slice(15, 20).reduce((a, b) => a + b, 0) / 5,
  };
}

export function calculateImmersion(frequencies: Record<string, number>): number {
  const total = Object.values(frequencies).reduce((a, b) => a + b, 0);
  return Math.min(total / 300, 1);
}

export function frequencyToColor(frequency: number): string {
  const hue = (frequency % 360).toString();
  return `hsl(${hue}, 100%, 50%)`;
}

export function frequencyToRGB(frequency: number): { r: number; g: number; b: number } {
  const wavelength = 380 + (frequency % 321);
  let r = 0, g = 0, b = 0;
  if (wavelength >= 380 && wavelength < 440) {
    r = Math.abs(wavelength - 440) / (440 - 380);
    b = 1;
  } else if (wavelength >= 440 && wavelength < 490) {
    g = (wavelength - 440) / (490 - 440);
    b = 1;
  } else if (wavelength >= 490 && wavelength < 510) {
    g = 1;
    b = Math.abs(wavelength - 510) / (510 - 490);
  } else if (wavelength >= 510 && wavelength < 580) {
    r = (wavelength - 510) / (580 - 510);
    g = 1;
  } else if (wavelength >= 580 && wavelength < 645) {
    r = 1;
    g = Math.abs(wavelength - 645) / (645 - 580);
  } else if (wavelength >= 645 && wavelength <= 700) {
    r = 1;
  }
  return { r: Math.floor(r * 255), g: Math.floor(g * 255), b: Math.floor(b * 255) };
}

export function hammingDistance(a: number, b: number): number {
  let distance = 0;
  let xor = a ^ b;
  while (xor) {
    distance += xor & 1;
    xor >>= 1;
  }
  return distance;
}

export function generateRotationMatrix(angle: number, plane: string = "xy"): number[][] {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const matrix: number[][] = [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ];
  if (plane === "xy" || plane === "yx") {
    matrix[0][0] = cos;
    matrix[0][1] = -sin;
    matrix[1][0] = sin;
    matrix[1][1] = cos;
  } else if (plane === "zw" || plane === "wz") {
    matrix[2][2] = cos;
    matrix[2][3] = -sin;
    matrix[3][2] = sin;
    matrix[3][3] = cos;
  }
  return matrix;
}

export function handleRenderCors(req: VercelRequest, res: VercelResponse): boolean {
  const origin = (req.headers.origin as string | undefined) ?? null;
  const cors = getCorsHeaders(origin);
  Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true;
  }
  return false;
}

export function renderError(res: VercelResponse, code: string, message: string, executionTime: number, status = 500): void {
  res.status(status).json({
    success: false,
    error: { code, message },
    performance: { executionTime },
    timestamp: new Date().toISOString(),
  });
}

export function renderSuccess(res: VercelResponse, data: Record<string, unknown>, startTime: number, context?: { userId?: string; sessionId?: string }): void {
  res.status(200).json({
    success: true,
    data,
    performance: { executionTime: Date.now() - startTime, startTime },
    timestamp: new Date().toISOString(),
    context,
  });
}

// ── Secure Mesh Processing & Asset Loading ──

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface MeshData {
  vertices: Vector3D[];
  faces: number[][];
  texturePath?: string;
}

export function sanitizeAssetPath(userPath: string): string {
  const safePath = path.normalize(userPath).replace(/^(\.\.(\/|\\))+/, "");
  const resolvedPath = path.resolve(ALLOWED_ASSETS_DIR, safePath);
  if (!resolvedPath.startsWith(ALLOWED_ASSETS_DIR)) {
    throw new Error("Path traversal detected: access denied");
  }
  return resolvedPath;
}

export async function processMeshAsync(rawData: string): Promise<MeshData> {
  const parsed = await new Promise<any>((resolve, reject) => {
    setImmediate(() => {
      try {
        resolve(JSON.parse(rawData));
      } catch {
        reject(new Error("Invalid mesh JSON format"));
      }
    });
  });

  const vertices: Vector3D[] = [];
  const faces: number[][] = parsed.faces || [];
  const rawVertices = parsed.vertices || [];
  const BATCH_SIZE = 500;

  for (let i = 0; i < rawVertices.length; i += 3) {
    if (i > 0 && (i / 3) % BATCH_SIZE === 0) {
      await new Promise((resolve) => setImmediate(resolve));
    }
    vertices.push({
      x: typeof rawVertices[i] === "number" ? rawVertices[i] : 0,
      y: typeof rawVertices[i + 1] === "number" ? rawVertices[i + 1] : 0,
      z: typeof rawVertices[i + 2] === "number" ? rawVertices[i + 2] : 0,
    });
  }

  return {
    vertices,
    faces,
    texturePath: parsed.texturePath ? sanitizeAssetPath(parsed.texturePath) : undefined,
  };
}

export async function loadSecureAssetTexture(assetRelativePath: string): Promise<Buffer> {
  const securePath = sanitizeAssetPath(assetRelativePath);
  return fs.readFile(securePath);
}
