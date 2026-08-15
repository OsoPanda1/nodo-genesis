import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  analyzeFrequencies,
  calculateImmersion,
  frequencyToColor,
  handleRenderCors,
  renderError,
  renderSuccess,
} from '../_shared/render-core';

export async function performRender(payload: Record<string, unknown>) {
  const startTime = Date.now();
  const renderTime = Math.random() * 50 + 10;
  await new Promise((resolve) => setTimeout(resolve, renderTime));
  return {
    status: 'rendered',
    gltfHash: `gltf_${Date.now()}_${Math.random().toString(36).slice(7)}`,
    meshCount: 1,
    vertexCount: 24,
    triangleCount: 12,
    renderTime,
    totalTime: Date.now() - startTime,
    lightConfig: (payload as Record<string, unknown>).lightConfig || { intensity: 1.0, color: '#ffffff' },
    metadata: {
      renderer: 'WebGL2',
      shaders: ['vertex', 'fragment'],
      extensions: ['KHR_lights_punctual', 'KHR_materials_specular'],
    },
  };
}

export async function syncAudio(payload: Record<string, unknown>) {
  const audioSignal = (payload.audioSignal as number[]) || [];
  const frequencyBands = analyzeFrequencies(audioSignal);
  const immersion = calculateImmersion(frequencyBands);
  return {
    status: 'synced',
    frequencyBands,
    spatialAudioEnabled: true,
    immersionLevel: immersion,
    audioConfig: {
      sampleRate: (payload.sampleRate as number) || 44100,
      channels: (payload.channels as number) || 2,
      bitDepth: (payload.bitDepth as number) || 16,
    },
  };
}

export async function updateColor(payload: Record<string, unknown>) {
  const frequency = (payload.frequency as number) || 440;
  const targetColor = frequencyToColor(frequency);
  return {
    status: 'updated',
    color: targetColor,
    frequency,
    transitionDuration: (payload.transitionDuration as number) || 300,
    easing: (payload.easing as string) || 'easeInOutQuad',
  };
}

export function extractOperation(req: VercelRequest): { operation: string; payload: Record<string, unknown>; context?: { userId?: string; sessionId?: string } } {
  const { operation, payload, context } = req.body as { operation: string; payload: Record<string, unknown>; context?: { userId?: string; sessionId?: string } };
  return { operation, payload: payload || {}, context };
}

export const validOperations = ['render', 'sync-audio', 'update-color'] as const;

export async function executeRender3D(operation: string, payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  switch (operation) {
    case 'render':
      return await performRender(payload);
    case 'sync-audio':
      return await syncAudio(payload);
    case 'update-color':
      return await updateColor(payload);
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const startTime = Date.now();
  if (handleRenderCors(req, res)) return;

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-Cell-Type', 'Render3D');
  res.setHeader('X-Cell-Version', '1.0.0');

  if (req.method !== 'POST') {
    return renderError(res, 'METHOD_NOT_ALLOWED', 'Use POST for render-3d operations', 0, 405);
  }

  try {
    const { operation, payload, context } = extractOperation(req);

    if (!operation || !validOperations.includes(operation as typeof validOperations[number])) {
      return renderError(res, 'INVALID_OPERATION', `Operation '${operation}' not supported. Use: ${validOperations.join(', ')}`, Date.now() - startTime, 400);
    }

    const result = await executeRender3D(operation, payload);
    renderSuccess(res, result, startTime, context);
  } catch (err) {
    const executionTime = Date.now() - startTime;
    renderError(res, 'RENDER_3D_ERROR', err instanceof Error ? err.message : 'Unknown error', executionTime);
  }
}

export const render3dHandler = handler;
