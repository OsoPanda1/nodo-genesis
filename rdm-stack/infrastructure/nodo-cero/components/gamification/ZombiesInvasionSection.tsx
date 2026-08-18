'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Award, Battery, Box, CalendarDays, Check, CloudFog, Crosshair, Hourglass, Lock,
  Map as MapIcon, Moon, Navigation, Package, RefreshCw, Skull, Swords, Trophy,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  CapturedZombie, PlayerProfile, PROFILE_KEY, SPAWNS_KEY, TimeContext, ZOMBIE_ARCHETYPES,
  ZOMBIE_ARTIFACTS, ZOMBIE_MISSIONS, ZOMBIE_PRIZES, ZombieMission, ZombiePrize,
  ZombieSpawn, computePoints, defaultProfile, generateSpawns, getTimeContext,
  playerLevel,
} from '@/lib/data/zombies-data';
import ZombieCombat from './ZombieCombat';
import ZombieSprite from './ZombieSprite';
import ArenaFXCanvas from './fx/ArenaFXCanvas';
import UnityInvasion3D from './UnityInvasion3D';
import { emitYunEvent } from '@/lib/isabella/events';
import { uuid } from '@/lib/isabella/utils';
import { reportKill, reportMission, reportPrize, startSession } from '@/lib/gamification/client';

interface ZombiesInvasionSectionProps {
  onAskIsabella?: (prompt: string) => void;
}

type TabId = 'map' | 'arena3d' | 'bestiary' | 'inventory' | 'missions' | 'prizes';

const TABS: Array<{ id: TabId; label: string; icon: LucideIcon }> = [
  { id: 'map', label: 'Mapa', icon: MapIcon },
  { id: 'arena3d', label: 'Arena 3D', icon: Box },
  { id: 'bestiary', label: 'Bestiario', icon: Skull },
  { id: 'inventory', label: 'Inventario', icon: Package },
  { id: 'missions', label: 'Misiones', icon: Crosshair },
  { id: 'prizes', label: 'Premios', icon: Award },
];

const RARITY_STYLE: Record<string, string> = {
  comun: 'text-slate-300 border-slate-500/40 bg-slate-900',
  raro: 'text-cyan-300 border-cyan-500/40 bg-cyan-950/60',
  epico: 'text-amber-300 border-amber-500/40 bg-amber-950/60',
};

const KIND_STYLE: Record<string, string> = {
  ofensivo: 'text-rose-300 border-rose-500/40 bg-rose-950/60',
  defensivo: 'text-cyan-300 border-cyan-500/40 bg-cyan-950/60',
  soporte: 'text-amber-300 border-amber-500/40 bg-amber-950/60',
};

const DEFAULT_CENTER = { lat: 20.1398, lng: -98.6738 };

const SKULL_SVG = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="white" stroke-width="2"><path d="M12 3a7 7 0 0 0-7 7c0 2 .6 3.6 1.6 5 .4.6.6 1.4.6 2.2V19a2 2 0 0 0 2 2h5.6a2 2 0 0 0 2-2v-1.8c0-.8.2-1.6.6-2.2.9-1.4 1.6-3 1.6-5a7 7 0 0 0-7-7Z"/><circle cx="9.5" cy="10" r="1.5"/><circle cx="14.5" cy="10" r="1.5"/><path d="M9.5 16.5c1.6.9 3.4.9 5 0"/></svg>';

function loadProfile(): PlayerProfile {
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    if (!raw) return defaultProfile();
    const parsed = JSON.parse(raw) as PlayerProfile;
    return { ...defaultProfile(), ...parsed };
  } catch {
    return defaultProfile();
  }
}

function loadSpawns(now: Date): ZombieSpawn[] {
  try {
    const raw = window.localStorage.getItem(SPAWNS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ZombieSpawn[];
      const fresh = parsed.filter(s => s.expiresAt > now.getTime());
      if (fresh.length > 0) return fresh;
    }
  } catch {
    /* regenerar */
  }
  return generateSpawns(now);
}

function missionMatches(target: ZombieMission['target'], captured: CapturedZombie): boolean {
  if (target.any) return true;
  if (target.archetypeId) return captured.archetypeId === target.archetypeId;
  if (target.type) return ZOMBIE_ARCHETYPES.find(a => a.id === captured.archetypeId)?.type === target.type;
  if (target.zone) return captured.zone === target.zone;
  return false;
}

export default function ZombiesInvasionSection({ onAskIsabella }: ZombiesInvasionSectionProps) {
  const [profile, setProfile] = useState<PlayerProfile>(defaultProfile);
  const [spawns, setSpawns] = useState<ZombieSpawn[]>([]);
  const [timeCtx, setTimeCtx] = useState<TimeContext | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('map');
  const [activeSpawn, setActiveSpawn] = useState<ZombieSpawn | null>(null);
  const [playerPos, setPlayerPos] = useState(DEFAULT_CENTER);
  const [geoStatus, setGeoStatus] = useState<'buscando' | 'ok' | 'fallo'>('buscando');
  const [toast, setToast] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  /* Hidratación: el estado persistido se carga tras el montaje para evitar
     discrepancias SSR (server === default, cliente === localStorage). */
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setProfile(loadProfile());
    setSpawns(loadSpawns(new Date()));
    setTimeCtx(getTimeContext(new Date()));
    /* eslint-enable react-hooks/set-state-in-effect */
    void startSession();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch {
      /* almacenamiento no disponible */
    }
  }, [profile]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(SPAWNS_KEY, JSON.stringify(spawns));
    } catch {
      /* almacenamiento no disponible */
    }
  }, [spawns]);

  useEffect(() => {
    if (!navigator.geolocation) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGeoStatus('fallo');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        setPlayerPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoStatus('ok');
      },
      () => setGeoStatus('fallo'),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const levelInfo = useMemo(() => playerLevel(profile.totalPoints), [profile.totalPoints]);

  const bestiary = useMemo(() => {
    const bestiaryMap = new Map<string, { count: number; points: number; last: string }>();
    for (const c of profile.captures) {
      const cur = bestiaryMap.get(c.archetypeId) ?? { count: 0, points: 0, last: '' };
      cur.count += 1;
      cur.points += c.points;
      cur.last = c.capturedAt;
      bestiaryMap.set(c.archetypeId, cur);
    }
    return bestiaryMap;
  }, [profile.captures]);

  /* ---------------- Mapa Leaflet ---------------- */

  useEffect(() => {
    if (activeTab !== 'map' || !mapContainerRef.current) return;
    let cancelled = false;
    let map: any = null;

    const init = async () => {
      const L = (await import('leaflet')).default;
      if (cancelled || !mapContainerRef.current) return;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      map = L.map(mapContainerRef.current, { center: [playerPos.lat, playerPos.lng], zoom: 14, zoomControl: false });
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO &copy; RDM Digital Hub',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      const playerIcon = L.divIcon({
        className: '',
        html: '<div class="zr-player"><span class="zr-player-ring"></span><span class="zr-player-core"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#0b1220" stroke-width="3"><circle cx="12" cy="12" r="4"/></svg></span></div>',
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });
      L.marker([playerPos.lat, playerPos.lng], { icon: playerIcon }).addTo(map);

      for (const spawn of spawns) {
        const archetype = ZOMBIE_ARCHETYPES.find(a => a.id === spawn.archetypeId);
        if (!archetype) continue;
        const icon = L.divIcon({
          className: '',
          html: `<div class="zr-spawn" style="--zc:${archetype.color}"><span class="zr-spawn-pulse"></span><span class="zr-spawn-core">${SKULL_SVG}</span></div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });
        const marker = L.marker([spawn.lat, spawn.lng], { icon }).addTo(map);
        marker.bindPopup(
          `<div class="zr-popup"><div class="zr-popup-title">${archetype.name}</div><div class="zr-popup-sub">${spawn.poiName} · ${archetype.rarity}</div><div class="zr-popup-sub">Toca el marcador para iniciar el encuentro</div></div>`,
          { closeButton: false, autoPan: false }
        );
        marker.on('click', () => setActiveSpawn(spawn));
      }

      map.setView([playerPos.lat, playerPos.lng], 14);
      mapRef.current = map;
    };

    init();
    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [activeTab, spawns, playerPos]);

  /* ---------------- Acciones del juego ---------------- */

  const refreshPatrol = () => {
    const now = new Date();
    setTimeCtx(getTimeContext(now));
    setSpawns(generateSpawns(now));
    setToast('Patrulla actualizada: nuevos zombies detectados en la comarca.');
  };

  const handleEnergyUse = useCallback((amount: number) => {
    setProfile(p => ({ ...p, energy: Math.max(0, p.energy - amount) }));
  }, []);

  const handleFinish = useCallback((result: { captured: boolean; points: number }) => {
    setActiveSpawn(current => {
      if (!current) return null;
      if (result.captured) {
        const spawn = current;
        const captured: CapturedZombie = {
          id: `cap-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          archetypeId: spawn.archetypeId,
          poiId: spawn.poiId,
          poiName: spawn.poiName,
          zone: spawn.zone,
          capturedAt: new Date().toISOString(),
          points: result.points,
          lat: spawn.lat,
          lng: spawn.lng,
        };
        emitYunEvent({
          eventType: 'gameplay.zombie.captured',
          domain: 'gameplay',
          traceId: uuid(),
          source: 'zombies-rdm-invasion',
          entityId: captured.archetypeId,
          severity: 'info',
          payload: {
            archetypeId: captured.archetypeId,
            poiId: captured.poiId,
            zone: captured.zone,
            points: result.points,
            totalCaptures: profile.captures.length + 1,
          },
        });
        const ctx = timeCtx ?? getTimeContext(new Date());
        const capturedArchetype = ZOMBIE_ARCHETYPES.find(a => a.id === captured.archetypeId);
        void reportKill({
          archetypeId: captured.archetypeId,
          archetypeName: capturedArchetype?.name,
          rarity: capturedArchetype?.rarity,
          zone: captured.zone,
          poiId: captured.poiId,
          basePoints: capturedArchetype?.basePoints ?? result.points,
          night: ctx.period === 'noche',
          fog: ctx.niebla,
          eventMonth: ctx.isEventMonth,
        });
        setProfile(p => {
          const missionProgress = { ...p.missionProgress };
          for (const m of ZOMBIE_MISSIONS) {
            if (missionMatches(m.target, captured)) {
              missionProgress[m.id] = (missionProgress[m.id] ?? 0) + 1;
            }
          }
          return {
            ...p,
            captures: [...p.captures, captured],
            totalPoints: p.totalPoints + result.points,
            missionProgress,
            energy: Math.min(12, p.energy + 2),
          };
        });
        setToast(`¡${spawn.poiName}: ${ZOMBIE_ARCHETYPES.find(a => a.id === spawn.archetypeId)?.name ?? 'zombie'} capturado! +${result.points} puntos.`);
      } else {
        setToast('El zombie escapó. Revisa tu energía y vuelve a la patrulla.');
      }
      setSpawns(prev => prev.filter(s => s.id !== current.id));
      return null;
    });
  }, [profile.captures.length, timeCtx]);

  const claimMission = (mission: ZombieMission) => {
    if (profile.claimedMissions.includes(mission.id)) return;
    const progress = profile.missionProgress[mission.id] ?? 0;
    if (progress < mission.target.count) return;
    emitYunEvent({
      eventType: 'gameplay.mission.completed',
      domain: 'gameplay',
      traceId: uuid(),
      source: 'zombies-rdm-invasion',
      entityId: mission.id,
      severity: 'info',
      payload: { missionId: mission.id, reward: mission.reward },
    });
    setProfile(p => ({
      ...p,
      totalPoints: p.totalPoints + mission.reward,
      claimedMissions: [...p.claimedMissions, mission.id],
    }));
    void reportMission(mission.id, mission.reward);
    setToast(`Misión completada: +${mission.reward} puntos.`);
  };

  const redeemPrize = (prize: ZombiePrize) => {
    if (profile.redeemedPrizes.includes(prize.id)) return;
    if (profile.totalPoints < prize.cost) return;
    emitYunEvent({
      eventType: 'gameplay.prize.redeemed',
      domain: 'gameplay',
      traceId: uuid(),
      source: 'zombies-rdm-invasion',
      entityId: prize.id,
      severity: 'info',
      payload: { prizeId: prize.id, cost: prize.cost, category: prize.category },
    });
    setProfile(p => {
      const inventory = prize.artifactId && !p.inventory.includes(prize.artifactId)
        ? [...p.inventory, prize.artifactId]
        : p.inventory;
      return {
        ...p,
        totalPoints: p.totalPoints - prize.cost,
        redeemedPrizes: [...p.redeemedPrizes, prize.id],
        inventory,
      };
    });
    void reportPrize(prize.id, prize.cost);
    setToast(`Canje realizado: ${prize.name}.`);
  };

  const askIsabella = (prompt: string) => {
    onAskIsabella?.(prompt);
  };

  /* ---------------- Render ---------------- */

  return (
    <section className="space-y-4">
      {/* Encabezado + perfil del guardián */}
      <div className="glass-panel rounded-2xl border border-emerald-500/30 p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500/30 via-slate-900 to-cyan-500/30 border border-emerald-400/40 flex items-center justify-center">
              <Skull className="w-7 h-7 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Zombies RDM Invasion
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-md border border-emerald-500/40 text-emerald-300 bg-emerald-950/60">
                  Nodo Cero · Juego
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Guardián del Nodo Cero · Nivel {levelInfo.level} — {levelInfo.title}
              </p>
              <div className="mt-2 max-w-xs">
                <div className="flex justify-between text-[9px] font-mono text-slate-500 mb-1">
                  <span>Experiencia</span>
                  <span>{profile.totalPoints} pts</span>
                </div>
                <div className="h-2 rounded-full bg-slate-900 border border-white/10 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 animate-shimmer" style={{ width: `${Math.min(100, levelInfo.progress)}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-slate-300 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" /> {profile.totalPoints} pts
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-slate-300 flex items-center gap-1.5">
              <Skull className="w-3.5 h-3.5 text-emerald-400" /> {profile.captures.length} capturas
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-slate-300 flex items-center gap-1.5">
              <Battery className="w-3.5 h-3.5 text-cyan-300" /> {profile.energy}/12 energía
            </span>
            <span className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
              geoStatus === 'ok'
                ? 'border-emerald-500/40 text-emerald-300 bg-emerald-950/60'
                : 'border-white/10 text-slate-400 bg-slate-900'
            }`}>
              <Navigation className="w-3.5 h-3.5" />
              {geoStatus === 'buscando' ? 'GPS activo' : geoStatus === 'ok' ? 'GPS conectado' : 'Simulación de posición'}
            </span>
          </div>
        </div>

        {timeCtx && (
          <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap gap-2 text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <Moon className="w-3 h-3 text-indigo-300" /> {timeCtx.period === 'dia' ? 'Día' : 'Noche'}
            </span>
            <span className={`flex items-center gap-1 ${timeCtx.niebla ? 'text-cyan-300' : ''}`}>
              <CloudFog className="w-3 h-3" /> {timeCtx.niebla ? 'Niebla activa ×1.5' : 'Sin niebla'}
            </span>
            <span className={`flex items-center gap-1 ${timeCtx.isEventMonth ? 'text-amber-300' : ''}`}>
              <CalendarDays className="w-3 h-3" /> {timeCtx.isEventMonth ? 'Mes de evento ×2' : 'Sin evento local'}
            </span>
            <span className="flex items-center gap-1">
              <Hourglass className="w-3 h-3" /> Multiplicador base por zona de mina ×1.2
            </span>
            <span className="ml-auto text-slate-500">{new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          </div>
        )}
      </div>

      {activeSpawn ? (
        <ZombieCombat
          spawn={activeSpawn}
          archetype={ZOMBIE_ARCHETYPES.find(a => a.id === activeSpawn.archetypeId) ?? ZOMBIE_ARCHETYPES[0]}
          ctx={timeCtx ?? getTimeContext(new Date())}
          ownedArtifacts={profile.inventory}
          energy={profile.energy}
          onEnergyUse={handleEnergyUse}
          onFinish={handleFinish}
          onAskIsabella={askIsabella}
        />
      ) : (
        <>
          {/* Pestañas */}
          <div className="flex flex-wrap gap-2">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${
                    active
                      ? 'bg-gradient-to-r from-emerald-600/30 to-cyan-600/30 border-emerald-400/50 text-emerald-200'
                      : 'bg-slate-900/60 border-white/10 text-slate-400 hover:border-emerald-400/40 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tab.id === 'missions' && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-amber-300">
                      {ZOMBIE_MISSIONS.filter(m => !profile.claimedMissions.includes(m.id) && (profile.missionProgress[m.id] ?? 0) >= m.target.count).length}
                    </span>
                  )}
                </button>
              );
            })}
            <button
              onClick={refreshPatrol}
              className="ml-auto px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 bg-slate-900/60 border border-white/10 text-slate-300 hover:border-cyan-400 transition-all"
            >
              <RefreshCw className="w-4 h-4" /> Actualizar patrulla
            </button>
          </div>

          {activeTab === 'map' && (
            <div className="grid lg:grid-cols-[1fr_300px] gap-4">
              <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden relative">
                <div ref={mapContainerRef} className="w-full h-[520px] z-0" />
                <ArenaFXCanvas
                  className="absolute inset-0 w-full h-full pointer-events-none z-[400]"
                  ambientRate={0.7}
                  initialBudget={60}
                />
                <div className="absolute top-3 left-3 z-[500] glass-panel rounded-xl px-3 py-2 text-[10px] font-mono text-slate-300">
                  <p className="text-slate-500 uppercase tracking-widest text-[9px] mb-0.5">Leyenda</p>
                  <p className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" /> Guardián (tú)</p>
                  <p className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-pulse inline-block" /> Zombie activo</p>
                </div>
              </div>

              <div className="glass-panel rounded-2xl border border-white/10 p-4">
                <h4 className="text-xs font-bold text-white mb-3 flex items-center gap-2">
                  <Swords className="w-4 h-4 text-rose-300" /> Zombies detectados ({spawns.length})
                </h4>
                <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
                  {spawns.length === 0 && (
                    <p className="text-[11px] text-slate-500">La comarca está limpia... por ahora.</p>
                  )}
                  {spawns.map(spawn => {
                    const a = ZOMBIE_ARCHETYPES.find(x => x.id === spawn.archetypeId);
                    if (!a) return null;
                    return (
                      <div key={spawn.id} className="p-2.5 rounded-xl bg-slate-950/60 border border-white/10 hover:border-emerald-400/40 transition-all">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-lg bg-slate-900 border border-white/10 overflow-hidden flex items-center justify-center">
                            <ZombieSprite archetype={a} size={34} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-bold text-white truncate">{a.name}</p>
                            <p className="text-[9px] text-slate-500 truncate">{spawn.poiName}</p>
                          </div>
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${RARITY_STYLE[a.rarity]}`}>{a.rarity}</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-[9px] font-mono text-amber-300">
                            {timeCtx ? computePoints(a, timeCtx, spawn.zone) : a.basePoints} pts
                          </span>
                          <button
                            onClick={() => setActiveSpawn(spawn)}
                            className="text-[10px] font-bold px-2 py-1 rounded-lg bg-rose-600/20 border border-rose-500/40 text-rose-300 hover:bg-rose-600/40 transition-all"
                          >
                            Enfrentar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'arena3d' && (
            <UnityInvasion3D onAskIsabella={askIsabella} />
          )}

          {activeTab === 'bestiary' && (
            <div className="glass-panel rounded-2xl border border-white/10 p-4">
              <h4 className="text-xs font-bold text-white mb-4">Bestiario del Nodo ({profile.captures.length} capturas)</h4>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {ZOMBIE_ARCHETYPES.map(a => {
                  const stats = bestiary.get(a.id);
                  return (
                    <div key={a.id} className="p-3 rounded-xl bg-slate-950/60 border border-white/10">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-12 rounded-lg bg-slate-900 border border-white/10 overflow-hidden flex items-center justify-center">
                          <ZombieSprite archetype={a} size={44} state={stats ? 'captured' : 'idle'} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-white truncate">{a.name}</p>
                          <p className="text-[9px] text-slate-500">{a.type} · {a.rarity}</p>
                        </div>
                      </div>
                      <div className="mt-2 flex justify-between text-[10px] font-mono">
                        <span className={stats ? 'text-emerald-300' : 'text-slate-600'}>
                          {stats ? `${stats.count} × capturado` : 'No capturado'}
                        </span>
                        {stats && <span className="text-amber-300">{stats.points} pts</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="glass-panel rounded-2xl border border-white/10 p-4">
              <h4 className="text-xs font-bold text-white mb-1">Inventario de artefactos</h4>
              <p className="text-[10px] text-slate-500 mb-4">Sinergias activas contra tipos o zonas de zombies. Desbloquea más en la tienda de premios.</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {ZOMBIE_ARTIFACTS.map(a => {
                  const Icon = a.icon;
                  const owned = profile.inventory.includes(a.id);
                  const unlocker = ZOMBIE_PRIZES.find(p => p.artifactId === a.id);
                  return (
                    <div key={a.id} className={`p-3.5 rounded-xl border ${owned ? 'bg-slate-950/70 border-white/10' : 'bg-slate-950/40 border-slate-800 opacity-60'}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${owned ? 'bg-gradient-to-br from-cyan-950 to-slate-900 border border-cyan-500/40' : 'bg-slate-900 border border-slate-800'}`}>
                            {owned ? <Icon className="w-5 h-5 text-cyan-300" /> : <Lock className="w-4 h-4 text-slate-600" />}
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-white">{a.name}</p>
                            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${KIND_STYLE[a.kind]}`}>{a.kind}</span>
                          </div>
                        </div>
                        {owned && <Check className="w-4 h-4 text-emerald-400" />}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2 leading-snug">{a.description}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5 text-[9px] font-mono text-slate-500">
                        {a.power > 0 && <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-white/10">Daño {a.power}+</span>}
                        <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-white/10">Energía {a.energyCost}</span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-white/10">CD {a.cooldown}</span>
                        {a.synergies.length > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-500/30 text-amber-300">
                            Sinergia +{a.synergies[0].bonus}
                          </span>
                        )}
                      </div>
                      <p className="text-[9px] italic text-slate-500 mt-2">&ldquo;{a.quote}&rdquo;</p>
                      {!owned && unlocker && (
                        <p className="text-[9px] font-mono text-cyan-300 mt-2">Desbloquea con el premio «{unlocker.name}» ({unlocker.cost} pts)</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'missions' && (
            <div className="glass-panel rounded-2xl border border-white/10 p-4">
              <h4 className="text-xs font-bold text-white mb-4">Misiones del guardián</h4>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {ZOMBIE_MISSIONS.map(m => {
                  const Icon = m.icon;
                  const progress = profile.missionProgress[m.id] ?? 0;
                  const complete = progress >= m.target.count;
                  const claimed = profile.claimedMissions.includes(m.id);
                  const pct = Math.min(100, Math.round((progress / m.target.count) * 100));
                  return (
                    <div key={m.id} className={`p-3.5 rounded-xl border ${claimed ? 'bg-slate-950/40 border-slate-800 opacity-60' : 'bg-slate-950/70 border-white/10'}`}>
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-950/60 to-slate-900 border border-amber-500/30 flex items-center justify-center">
                          <Icon className="w-4 h-4 text-amber-300" />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-white">{m.title}</p>
                          <p className="text-[9px] font-mono text-amber-300">Recompensa: {m.reward} pts</p>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2 leading-snug">{m.description}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full bg-slate-900 border border-white/10 overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-amber-500 to-rose-400" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[9px] font-mono text-slate-400">{progress}/{m.target.count}</span>
                      </div>
                      <div className="mt-2.5">
                        {claimed ? (
                          <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Recompensa recibida</span>
                        ) : complete ? (
                          <button onClick={() => claimMission(m)} className="w-full text-[10px] font-bold px-3 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-cyan-600 text-white hover:opacity-90 transition-all">
                            Reclamar {m.reward} pts
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-600">Continúa tu patrulla para avanzar.</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'prizes' && (
            <div className="glass-panel rounded-2xl border border-white/10 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <h4 className="text-xs font-bold text-white">Tienda de premios</h4>
                <span className="text-[11px] font-mono px-3 py-1.5 rounded-xl bg-slate-900 border border-amber-500/30 text-amber-300 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5" /> Saldo: {profile.totalPoints} pts
                </span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {ZOMBIE_PRIZES.map(p => {
                  const Icon = p.icon;
                  const redeemed = profile.redeemedPrizes.includes(p.id);
                  const affordable = profile.totalPoints >= p.cost;
                  return (
                    <div key={p.id} className={`p-3.5 rounded-xl border ${redeemed ? 'bg-slate-950/40 border-slate-800 opacity-60' : 'bg-slate-950/70 border-white/10'}`}>
                      <div className="flex items-start justify-between">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-950/60 to-slate-900 border border-amber-500/30 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-amber-300" />
                        </div>
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${p.category === 'fisico' ? 'border-purple-500/40 text-purple-300 bg-purple-950/60' : 'border-cyan-500/40 text-cyan-300 bg-cyan-950/60'}`}>
                          {p.category}
                        </span>
                      </div>
                      <p className="text-[11px] font-bold text-white mt-2.5">{p.name}</p>
                      <p className="text-[10px] text-slate-400 mt-1 leading-snug">{p.description}</p>
                      <p className="text-[11px] font-mono text-amber-300 mt-2">{p.cost.toLocaleString('es-MX')} pts</p>
                      <div className="mt-2.5">
                        {redeemed ? (
                          <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Canjeado</span>
                        ) : (
                          <button
                            onClick={() => redeemPrize(p)}
                            disabled={!affordable}
                            className={`w-full text-[10px] font-bold px-3 py-2 rounded-lg transition-all ${
                              affordable
                                ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white hover:opacity-90'
                                : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
                            }`}
                          >
                            Canjear
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-500 mt-4 leading-relaxed">
                Los premios físicos (joyería de plata .925, souvenirs) se coordinan en el módulo económico YUN: el juego solo gestiona puntos y el catálogo. La equivalencia 10,000 pts ≈ 1 MXN y el reparto 75/25% viven fuera del juego.
              </p>
            </div>
          )}
        </>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 right-6 z-[999] glass-panel rounded-xl border border-emerald-400/50 px-4 py-3 text-xs text-emerald-100 shadow-lg animate-crystal-float max-w-xs">
          {toast}
        </div>
      )}
    </section>
  );
}
