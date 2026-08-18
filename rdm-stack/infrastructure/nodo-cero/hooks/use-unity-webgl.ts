import { useCallback, useEffect, useRef, useState } from 'react';
import type React from 'react';

interface UnityMessage {
  type: string;
  source: string;
  timestamp: number;
  payload: Record<string, unknown>;
}

export type { UnityMessage };

interface UnityBridgeApi {
  instance: unknown;
  onMessage: (msg: UnityMessage) => void;
  sendMessage: (gameObject: string, method: string, value?: string) => void;
}

declare global {
  interface Window {
    rdmUnityBridge?: UnityBridgeApi;
  }
}

interface UseUnityWebGLOptions {
  /** Ruta base del build WebGL (loader + data + wasm). */
  baseUrl: string;
  /** Nombre del GameObject raíz del juego (default: "RDM Arena"). */
  gameObject?: string;
  onMessage?: (msg: UnityMessage) => void;
}

interface UseUnityWebGLResult {
  status: 'idle' | 'checking' | 'loading' | 'ready' | 'error' | 'missing';
  progress: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  sendMessage: (method: string, value?: string) => void;
  sendTo: (gameObject: string, method: string, value?: string) => void;
  reload: () => void;
}

type UnityModule = {
  createUnityInstance: (
    canvas: HTMLCanvasElement,
    config: Record<string, unknown>
  ) => Promise<unknown>;
};

/** GameObject raíz del motor que recibe los comandos del host. */
export const RDM_GAME_OBJECT = 'RDM Arena';

/** Emisor compatible con `sendTo` del hook (gameObject, method, value). */
export type UnityBridgeSender = (gameObject: string, method: string, value?: string) => void;

/** Envía un ZombieVisualProfile al bridge de Unity (cosmético). */
export function sendZombieVisualProfile(sender: UnityBridgeSender, profile: unknown): void {
  sender(RDM_GAME_OBJECT, 'ApplyZombieVisualProfile', JSON.stringify(profile));
}

/** Envía un comando de spawn de variante al bridge de Unity. */
export function sendZombieSpawnCommand(sender: UnityBridgeSender, command: unknown): void {
  sender(RDM_GAME_OBJECT, 'SpawnZombieVariant', JSON.stringify(command));
}

/**
 * Carga el build WebGL de la Arena 3D (Unity) dentro del canvas del host
 * y expone un puente hacia `window.rdmUnityBridge` para intercambiar
 * eventos con el motor (ver Assets/WebGLTemplates/RDM).
 * Devuelve `status === 'missing'` cuando el build no está publicado, para
 * que la interfaz use el fallback 2D sin romper la página.
 */
export function useUnityWebGL({
  baseUrl,
  gameObject = 'RDM Arena',
  onMessage,
}: UseUnityWebGLOptions): UseUnityWebGLResult {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<{ SendMessage?: (go: string, method: string, value: string) => void } | null>(null);
  const onMessageRef = useRef(onMessage);
  const [status, setStatus] = useState<UseUnityWebGLResult['status']>('checking');
  const [progress, setProgress] = useState(0);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    onMessageRef.current = onMessage;
  });

  const normalizeUrl = useCallback(
    (path: string) => `${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`,
    [baseUrl]
  );

  const sendMessage = useCallback(
    (method: string, value?: string) => {
      if (!instanceRef.current) return;
      window.rdmUnityBridge?.sendMessage(gameObject, method, value ?? '');
    },
    [gameObject]
  );

  const sendTo = useCallback(
    (target: string, method: string, value?: string) => {
      window.rdmUnityBridge?.sendMessage(target, method, value ?? '');
    },
    []
  );

  const load = useCallback(() => {
    if (typeof window === 'undefined') return;
    const container = containerRef.current;
    if (!container) return;

    setStatus('checking');
    setProgress(0);

    let cancelled = false;

    const boot = async () => {
      try {
        const loaderPath = normalizeUrl('RDMArena.loader.js');
        const probe = await fetch(loaderPath, { method: 'HEAD' });
        if (!probe.ok || cancelled) {
          setStatus('missing');
          return;
        }

        setStatus('loading');
        container.innerHTML = '';
        const canvas = document.createElement('canvas');
        canvas.id = 'unity-canvas';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.display = 'block';
        container.appendChild(canvas);

        const bridge: UnityBridgeApi = {
          instance: null,
          onMessage: (msg: UnityMessage) => onMessageRef.current?.(msg),
          sendMessage: (target: string, method: string, value?: string) => {
            instanceRef.current?.SendMessage?.(target, method, value ?? '');
          },
        };
        window.rdmUnityBridge = bridge;

        await loadScript(loaderPath);

        const mod = (globalThis as unknown as { createUnityInstance?: unknown }).createUnityInstance;
        if (typeof mod !== 'function' || cancelled) {
          setStatus('missing');
          return;
        }

        const create = (mod as unknown as UnityModule).createUnityInstance;
        const instance = (await create(canvas, {
          dataUrl: normalizeUrl('RDMArena.data'),
          frameworkUrl: normalizeUrl('RDMArena.framework.js'),
          codeUrl: normalizeUrl('RDMArena.wasm'),
          streamingAssetsUrl: normalizeUrl('StreamingAssets'),
          matchWebGLToCanvasSize: true,
          devicePixelRatio: Math.min(window.devicePixelRatio || 1, 1.5),
          onProgress: (p: number) => {
            if (!cancelled) setProgress(Math.round(p * 100));
          },
        })) as { SendMessage?: (go: string, method: string, value: string) => void };

        if (cancelled) return;
        instanceRef.current = instance;
        bridge.instance = instance;
        setStatus('ready');
        setProgress(100);
      } catch {
        if (!cancelled) setStatus('missing');
      }
    };

    boot();

    return () => {
      cancelled = true;
      window.rdmUnityBridge = undefined;
      instanceRef.current = null;
      if (container) container.innerHTML = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseUrl, tick, normalizeUrl]);

  useEffect(() => {
    const cleanup = load();
    return cleanup;
  }, [load]);

  const reload = useCallback(() => setTick(t => t + 1), []);

  return { status, progress, sendMessage, sendTo, reload, containerRef };
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`no se pudo cargar ${src}`));
    document.head.appendChild(script);
  });
}
