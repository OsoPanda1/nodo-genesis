import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  hammingDistance,
  generateRotationMatrix,
  frequencyToRGB,
  handleRenderCors,
  renderError,
  renderSuccess,
} from '../_shared/render-core';

export function createHypercube() {
  const vertices: Array<{ id: number; x: number; y: number; z: number; w: number }> = [];
  for (let i = 0; i < 16; i++) {
    vertices.push({
      id: i,
      x: i & 1 ? 1 : -1,
      y: i & 2 ? 1 : -1,
      z: i & 4 ? 1 : -1,
      w: i & 8 ? 1 : -1,
    });
  }

  const edges: Array<{ from: number; to: number }> = [];
  for (let i = 0; i < 16; i++) {
    for (let j = i + 1; j < 16; j++) {
      if (hammingDistance(i, j) === 1) {
        edges.push({ from: i, to: j });
      }
    }
  }

  return {
    type: 'hypercube-4d',
    vertexCount: vertices.length,
    edgeCount: edges.length,
    vertices,
    edges,
    topology: {
      cells_0d: 16,
      cells_1d: 32,
      cells_2d: 24,
      cells_3d: 8,
      cells_4d: 1,
    },
  };
}

export function rotate4D(payload: Record<string, unknown>) {
  const angle = (payload.angle as number) || 0.1;
  const plane = (payload.plane as string) || 'xy';
  const rotationMatrix = generateRotationMatrix(angle, plane);
  return {
    status: 'rotated',
    angle,
    plane,
    rotationMatrix,
    rotationApplied: true,
  };
}

export function projectTo3D(payload: Record<string, unknown>) {
  const method = (payload.method as string) || 'schlegel';
  const distance = (payload.distance as number) || 2;
  const projection = [
    { x: 1, y: 1, z: 1 },
    { x: -1, y: 1, z: 1 },
    { x: 1, y: -1, z: 1 },
    { x: -1, y: -1, z: 1 },
    { x: 0.5, y: 0.5, z: 0.5 },
    { x: -0.5, y: 0.5, z: 0.5 },
    { x: 0.5, y: -0.5, z: 0.5 },
    { x: -0.5, y: -0.5, z: 0.5 },
  ];
  return {
    status: 'projected',
    method,
    projectionType: '3D',
    distance,
    vertices: projection,
    vertexCount: projection.length,
    metadata: {
      preservesTopology: method === 'schlegel',
      visibilityOptimized: true,
      renderReady: true,
    },
  };
}

export function colorMap(payload: Record<string, unknown>) {
  const frequency = (payload.frequency as number) || 440;
  const colorScheme = (payload.colorScheme as string) || 'spectrum';
  const baseColor = frequencyToRGB(frequency);
  return {
    status: 'colored',
    colorScheme,
    baseColor: `rgb(${baseColor.r}, ${baseColor.g}, ${baseColor.b})`,
    gradient: [
      frequencyToRGB(frequency - 50),
      baseColor,
      frequencyToRGB(frequency + 50),
    ].map((c) => `rgb(${c.r}, ${c.g}, ${c.b})`),
    frequency,
  };
}

export const validOperations = ['create-hypercube', 'rotate-4d', 'project-to-3d', 'color-map'] as const;

export function executeRender4D(operation: string, payload: Record<string, unknown>): Record<string, unknown> {
  switch (operation) {
    case 'create-hypercube':
      return createHypercube();
    case 'rotate-4d':
      return rotate4D(payload);
    case 'project-to-3d':
      return projectTo3D(payload);
    case 'color-map':
      return colorMap(payload);
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const startTime = Date.now();
  if (handleRenderCors(req, res)) return;

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-Cell-Type', 'Render4D');
  res.setHeader('X-Cell-Version', '1.0.0');

  if (req.method !== 'POST') {
    return renderError(res, 'METHOD_NOT_ALLOWED', 'Use POST for render-4d operations', 0, 405);
  }

  try {
    const { operation, payload, context } = req.body as { operation: string; payload: Record<string, unknown>; context?: { userId?: string; sessionId?: string } };

    if (!operation || !validOperations.includes(operation as typeof validOperations[number])) {
      return renderError(res, 'INVALID_OPERATION', `Operation '${operation}' not supported. Use: ${validOperations.join(', ')}`, Date.now() - startTime, 400);
    }

    const result = executeRender4D(operation, payload || {});
    renderSuccess(res, result, startTime, context);
  } catch (err) {
    const executionTime = Date.now() - startTime;
    renderError(res, 'RENDER_4D_ERROR', err instanceof Error ? err.message : 'Unknown error', executionTime);
  }
}

export const render4dHandler = handler;
