import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Loader2, MonitorSmartphone, RefreshCw, ShieldAlert, Trophy } from 'lucide-react';
import { useUnityWebGL, sendZombieVisualProfile, type UnityMessage } from '@/hooks/use-unity-webgl';
import {
  endSession,
  reportCombo,
  reportKill,
  reportMission,
  reportPrize,
  reportWave,
  startSession,
  type ClientSession,
} from '@/lib/gamification/client';
import { requestZombieVisualProfile } from '@/lib/gamification/zombies/visual-client';
import { emitYunEvent } from '@/lib/isabella/events';
import { uuid } from '@/lib/isabella/utils';
import ZombieInvasionFallback from './ZombieInvasionFallback';

interface UnityInvasion3DProps {
  onAskIsabella?: (prompt: string) => void;
}

/** Ruta del build WebGL publicado (copiar Builds/WebGL/RDMArena → /public/unity/). */
const UNITY_BASE_URL = '/unity/RDMArena';

const STATUS_LABEL: Record<string, string> = {
  checking: 'Buscando la arena 3D...',
  loading: 'Cargando el motor 3D...',
  ready: 'Arena 3D activa',
  error: 'No se pudo cargar la arena 3D',
  missing: 'Arena 3D no publicada',
};

/**
 * Arena de zombies en 3D alimentada por Unity WebGL.
 * - Si el build está publicado, monta el canvas del motor y reenvía sus
 *   eventos (kill, wave, combo, session) al backend server-authoritative.
 * - Si no, degrada al juego 2D existente (ZombieCombat + mapa) sin romper
 *   la página.
 */
export default function UnityInvasion3D({ onAskIsabella }: UnityInvasion3DProps) {
  const [session, setSession] = useState<ClientSession | null>(null);
  const [lastEvent, setLastEvent] = useState<UnityMessage | null>(null);
  const [bridgeReady, setBridgeReady] = useState(false);

  /* Refs para romper la dependencia circular entre el hook (provee
     sendMessage) y el handler de mensajes (consume sendMessage). */
  const onUnityMessageRef = useRef<((msg: UnityMessage) => void) | null>(null);

  const { containerRef, status, progress, sendMessage, sendTo, reload } = useUnityWebGL({
    baseUrl: UNITY_BASE_URL,
    onMessage: (msg: UnityMessage) => onUnityMessageRef.current?.(msg),
  });

  const sendMessageRef = useRef(sendMessage);

  useEffect(() => {
    sendMessageRef.current = sendMessage;
  }, [sendMessage]);

  const sendToRef = useRef(sendTo);

  useEffect(() => {
    sendToRef.current = sendTo;
  }, [sendTo]);

  const onUnityMessage = useCallback((msg: UnityMessage) => {
    setLastEvent(msg);
    const payload = (msg.payload ?? {}) as Record<string, unknown>;
    const notify = sendMessageRef.current;

    switch (msg.type) {
      case 'session-started':
        emitYunEvent({
          eventType: 'gameplay.arena3d.session',
          domain: 'gameplay',
          traceId: uuid(),
          source: 'unity-rdm-invasion',
          entityId: String(payload.sessionId ?? ''),
          severity: 'info',
          payload: { sessionId: payload.sessionId, bridge: 'unity-webgl' },
        });
        break;
      case 'kill': {
        void reportKill({
          archetypeId: String(payload.archetypeId ?? 'zombie'),
          archetypeName: String(payload.archetypeName ?? 'Zombie'),
          basePoints: Number(payload.basePoints ?? 10),
          comboCount: Number(payload.comboCount ?? 0),
          night: false,
          fog: false,
          eventMonth: false,
        }).then(totalPoints => {
          if (totalPoints != null) {
            setBridgeReady(true);
            notify('ScoreUpdated', String(totalPoints));
          }
        });
        break;
      }
      case 'wave':
        void reportWave(Number(payload.waveNumber ?? 1));
        break;
      case 'combo':
        void reportCombo(Number(payload.comboCount ?? 0));
        break;
      case 'mission-completed':
        void reportMission(String(payload.missionId ?? ''), Number(payload.reward ?? 0));
        break;
      case 'prize-redeemed':
        void reportPrize(String(payload.prizeId ?? ''), Number(payload.cost ?? 0));
        break;
      default:
        break;
    }
  }, []);

  useEffect(() => {
    onUnityMessageRef.current = onUnityMessage;
  }, [onUnityMessage]);

  /* Conecta la sesión del navegador al motor Unity para que ambos compartan
     la sesión server-authoritative (evita sesiones duplicadas). */
  const connectSession = useCallback(async () => {
    const s = await startSession('guardian-unity-arena');
    setSession(s);
    if (s.sessionId && !s.sessionId.startsWith('local-')) {
      sendMessage('ConnectHost', JSON.stringify({ sessionId: s.sessionId, token: s.token, baseUrl: '/api/gamification' }));
    }
  }, [sendMessage]);

  /* Generador de perfiles visuales (cosmético). Pide muestras de variantes
     al backend y las aplica al bridge de Unity: Unity conserva la autoridad
     sobre prefabs, NavMesh, Animator, daño, oleadas y ciclo de vida. */
  const prepareVisualProfiles = useCallback(async () => {
    const samples = [
      { archetype: 'walker' as const, seed: 101, frequency: 220, colorScheme: 'monochrome' as const, sourceOperation: 'compile-scene' as const },
      { archetype: 'runner' as const, seed: 202, frequency: 880, colorScheme: 'thermal' as const, sourceOperation: 'color-map' as const },
      { archetype: 'spectral' as const, seed: 303, frequency: 1320, colorScheme: 'spectrum' as const, sourceOperation: 'project-to-3d' as const },
    ];

    for (const sample of samples) {
      try {
        const profile = await requestZombieVisualProfile(sample);
        if (profile) sendZombieVisualProfile(sendToRef.current, profile);
      } catch {
        /* Cosmético: la arena funciona sin perfiles si el backend falla. */
      }
    }
  }, []);

  useEffect(() => {
    if (status === 'ready' && session && !session.sessionId.startsWith('local-')) {
      void prepareVisualProfiles();
    }
  }, [status, session, prepareVisualProfiles]);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    void connectSession();
    /* eslint-enable react-hooks/set-state-in-effect */
    return () => {
      void endSession();
    };
  }, [connectSession]);

  const statusColor =
    status === 'ready' ? 'text-emerald-300 border-emerald-400/40' : 'text-slate-300 border-white/10';

  return (
    <section className="relative">
      {/* Cabecera de la arena */}
      <div className="glass-panel rounded-2xl border border-white/10 p-4 mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-950/70 to-slate-900 border border-emerald-500/40 flex items-center justify-center">
              <Box className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                Arena 3D <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">UNITY WEBGL</span>
              </h4>
              <p className="text-[10px] text-slate-400">
                Motor 3D en el navegador · eventos firmados al backend YUN (server-authoritative)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
            <span className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 ${statusColor}`}>
              {status === 'loading' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MonitorSmartphone className="w-3.5 h-3.5" />}
              {STATUS_LABEL[status]}
              {status === 'loading' && <b className="text-emerald-300">{progress}%</b>}
            </span>
            {session?.mode === 'signed' && (
              <span className="px-2.5 py-1.5 rounded-lg border border-cyan-500/40 text-cyan-300 bg-cyan-950/60 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5" /> Sesión firmada
              </span>
            )}
            <button
              onClick={reload}
              className="px-2.5 py-1.5 rounded-lg border border-white/10 text-slate-300 hover:border-emerald-400 hover:text-emerald-200 transition-all flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Recargar motor
            </button>
          </div>
        </div>

        {bridgeReady && (
          <p className="mt-3 text-[10px] text-emerald-300/90 font-mono flex items-center gap-1.5">
            <ShieldAlert className="w-3 h-3" /> Puntuación sincronizada con el servidor: los eventos de Unity se validan en el backend antes de sumar.
          </p>
        )}
        {lastEvent && (
          <p className="mt-1.5 text-[10px] text-slate-500 font-mono">
            último evento del motor: <span className="text-slate-300">{lastEvent.type}</span> · {new Date(lastEvent.timestamp).toLocaleTimeString('es-MX')}
          </p>
        )}
      </div>

      {/* Motor 3D (o fallback 2D) */}
      <div className="rounded-2xl overflow-hidden border border-white/10 relative">
        {status === 'missing' || status === 'error' ? (
          <div className="w-full h-[560px]">
            <ZombieInvasionFallback
              session={session}
              onAskIsabella={onAskIsabella}
              onReconnectUnity={() => reload()}
            />
          </div>
        ) : (
          <div ref={containerRef} className="w-full h-[560px] bg-[#060a12] relative">
            {(status === 'checking' || status === 'loading') && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#060a12]/80 z-10">
                <Loader2 className="w-8 h-8 text-emerald-300 animate-spin" />
                <p className="text-xs font-mono text-slate-300">
                  {status === 'checking' ? 'Buscando la arena 3D…' : `Compilando la arena 3D… ${progress}%`}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
