'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Loader2, MapPin, RotateCcw, Skull } from 'lucide-react';
import {
  ZOMBIE_ARCHETYPES,
  ZombieSpawn,
  defaultProfile,
  generateSpawns,
  getTimeContext,
  type PlayerProfile,
} from '@/lib/data/zombies-data';
import { reportKill, type ClientSession } from '@/lib/gamification/client';
import { emitYunEvent } from '@/lib/isabella/events';
import { uuid } from '@/lib/isabella/utils';
import ZombieCombat from './ZombieCombat';

interface ZombieInvasionFallbackProps {
  session: ClientSession | null;
  onAskIsabella?: (prompt: string) => void;
  onReconnectUnity: () => void;
}

interface TerritoryPulseResponse {
  pressureByPoi?: Record<string, number>;
  pressureByZone?: Record<string, number>;
  incidents?: { open: number; critical: number; total: number };
}

/**
 * Modo de degradación de la Arena 3D: cuando el build WebGL de Unity no está
 * publicado, se juega la misma invasión con el motor 2D del navegador
 * (mapa + combate por turnos) y se reportan los mismos eventos al backend.
 */
export default function ZombieInvasionFallback({
  session,
  onAskIsabella,
  onReconnectUnity,
}: ZombieInvasionFallbackProps) {
  const [profile, setProfile] = useState<PlayerProfile>(defaultProfile);
  const [spawns, setSpawns] = useState<ZombieSpawn[]>([]);
  const [activeSpawn, setActiveSpawn] = useState<ZombieSpawn | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [territory, setTerritory] = useState<TerritoryPulseResponse | null>(null);

  const refreshSpawns = useCallback((territorySnapshot?: TerritoryPulseResponse | null) => {
    setSpawns(generateSpawns(new Date(), 6, undefined, undefined, territorySnapshot?.pressureByPoi));
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/gamification/status');
        const data = (await res.json()) as { territory?: TerritoryPulseResponse };
        if (mounted) {
          setTerritory(data.territory ?? null);
          refreshSpawns(data.territory ?? null);
        }
      } catch {
        if (mounted) refreshSpawns(null);
      }
    })();
    return () => {
      mounted = false;
    };
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  const ctx = useMemo(() => getTimeContext(new Date()), []);

  const handleEnergyUse = useCallback((amount: number) => {
    setProfile(p => ({ ...p, energy: Math.max(0, p.energy - amount) }));
  }, []);

  const handleFinish = useCallback(
    async (result: { captured: boolean; points: number }) => {
      const spawn = activeSpawn;
      setActiveSpawn(null);
      if (!result.captured || !spawn) return;

      const archetype = ZOMBIE_ARCHETYPES.find(a => a.id === spawn.archetypeId) ?? ZOMBIE_ARCHETYPES[0];

      setSyncing(true);
      try {
        await reportKill({
          archetypeId: spawn.archetypeId,
          archetypeName: archetype.name,
          rarity: archetype.rarity,
          zone: spawn.zone,
          poiId: spawn.poiId,
          basePoints: result.points,
          comboCount: 0,
          night: ctx.period === 'noche',
          fog: ctx.niebla,
          eventMonth: ctx.isEventMonth,
        });
      } catch {
        /* sin backend: se mantiene el modo simulación */
      } finally {
        setSyncing(false);
      }
    },
    [activeSpawn, ctx]
  );

  const askIsabella = useCallback(
    (prompt: string) => {
      emitYunEvent({
        eventType: 'isabella.consult',
        domain: 'gameplay',
        traceId: uuid(),
        source: 'zombies-rdm-invasion-2d',
        entityId: '',
        severity: 'info',
        payload: { prompt },
      });
      onAskIsabella?.(prompt);
    },
    [onAskIsabella]
  );

  const nextEncounter = useCallback(() => {
    if (spawns.length === 0) return;
    const idx = Math.floor(Math.random() * spawns.length);
    setActiveSpawn(spawns[idx]);
  }, [spawns]);

  if (activeSpawn) {
    return (
      <div className="relative h-full w-full bg-[#060a12]">
        <ZombieCombat
          spawn={activeSpawn}
          archetype={ZOMBIE_ARCHETYPES.find(a => a.id === activeSpawn.archetypeId) ?? ZOMBIE_ARCHETYPES[0]}
          ctx={ctx}
          ownedArtifacts={profile.inventory}
          energy={profile.energy}
          onEnergyUse={handleEnergyUse}
          onFinish={handleFinish}
          onAskIsabella={askIsabella}
        />
        <button
          onClick={() => setActiveSpawn(null)}
          className="absolute top-3 right-3 z-[600] px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-slate-900/80 border border-white/10 text-slate-300 hover:border-emerald-400 hover:text-emerald-200 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Salir al mapa
        </button>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-[#060a12] flex flex-col">
      <div className="flex items-start justify-between p-5">
        <div>
          <p className="text-[11px] font-bold text-white flex items-center gap-2">
            <Box className="w-4 h-4 text-emerald-300" /> Motor 2D de emergencia
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-500/30 text-amber-300">MODO SIMULACIÓN</span>
          </p>
          <p className="text-[10px] text-slate-400 mt-1 max-w-md leading-relaxed">
            El build WebGL de la arena 3D no está publicado en <span className="font-mono text-emerald-300">/public/unity/</span>.
            Compílalo con <span className="font-mono text-slate-300">Tools › RDM › Build WebGL Arena</span> en Unity y vuelve a cargar la página.
          </p>
        </div>
        <button
          onClick={onReconnectUnity}
          className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-slate-900/80 border border-white/10 text-slate-300 hover:border-emerald-400 hover:text-emerald-200 transition-all shrink-0"
        >
          <Loader2 className="w-3.5 h-3.5" /> Reintentar 3D
        </button>
      </div>

      <div className="px-5 pb-4 flex flex-wrap items-center gap-3 text-[10px] font-mono text-slate-400">
        <span className="px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-white/10 flex items-center gap-1.5">
          <Skull className="w-3.5 h-3.5 text-emerald-400" /> {spawns.length} zombies en el territorio
        </span>
        <span className="px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-white/10 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-cyan-300" /> {ctx.period === 'dia' ? 'Día' : 'Noche'} · {ctx.niebla ? 'niebla ×1.5' : 'sin niebla'}
        </span>
        {territory && territory.incidents && territory.incidents.total > 0 && (
          <span className="px-2.5 py-1.5 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 flex items-center gap-1.5">
            <Skull className="w-3.5 h-3.5" /> {territory.incidents.open} incidentes activos · presión del territorio
          </span>
        )}
        {session?.mode === 'signed' && (
          <span className="px-2.5 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 flex items-center gap-1.5">
            Sesión firmada · eventos validados en el servidor
          </span>
        )}
        {syncing && (
          <span className="px-2.5 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 flex items-center gap-1.5">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Sincronizando...
          </span>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-slate-900 to-[#0a0f18] border border-emerald-500/30 flex items-center justify-center animate-crystal-float">
          <Skull className="w-12 h-12 text-emerald-400/80" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 animate-pulse" />
        </div>
        <div>
          <h5 className="text-sm font-bold text-white">El territorio está activo</h5>
          <p className="text-[11px] text-slate-400 mt-1">Elige un encuentro para patrullar en 2D mientras el motor 3D se publica.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={nextEncounter}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 text-white hover:opacity-90 transition-all flex items-center gap-2"
          >
            <Skull className="w-4 h-4" /> Iniciar encuentro
          </button>
          <button
            onClick={() => refreshSpawns(territory)}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900/80 border border-white/10 text-slate-300 hover:border-emerald-400 hover:text-emerald-200 transition-all"
          >
            Regenerar patrulla
          </button>
        </div>
      </div>

      <div className="px-5 py-3 border-t border-white/5 text-[9px] font-mono text-slate-600">
        RDM Digital Hub · Zombies RDM Invasion · motor de emergencia (sin WebGL)
      </div>
    </div>
  );
}
