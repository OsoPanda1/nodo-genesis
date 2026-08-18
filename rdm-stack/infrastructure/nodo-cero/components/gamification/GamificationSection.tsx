"use client";

import React, { useEffect, useState } from 'react';
import { Trophy, Medal, Target, CheckCircle2, Flame, Crown, Lock, TrendingUp, Loader2, Gift, Star, Activity, Boxes, Building2, CreditCard, AlertTriangle } from 'lucide-react';
import { RDM_BADGES, RDM_CHALLENGES } from '@/lib/rdm/rdm-content';
import { startSession, reportMission, getCachedSession, getDeviceId } from '@/lib/gamification/client';
import { playerLevel } from '@/lib/data/zombies-data';

const rarityColors: Record<string, string> = {
  Común: 'border-slate-500/40 text-slate-300',
  Raro: 'border-cyan-500/40 text-cyan-300',
  Épico: 'border-purple-500/40 text-purple-300',
  Legendario: 'border-amber-500/50 text-amber-300',
};

interface LiveSession {
  totalPoints: number;
  missions: string[];
}

interface TerritoryPulse {
  incidents: { open: number; critical: number; resolved: number; total: number };
  twins: { total: number; healthy: number };
  marketplace: { published: number; subscriptions: number };
  payments: { confirmed: number; confirmedAmount: number };
  pressureByZone: Record<string, number>;
}

interface ResolvedChallenge {
  id: string;
  title: string;
  category: string;
  points: number;
  progress: number;
}

const WELCOME_BONUS_MISSION = 'c-bienvenida';

export default function GamificationSection() {
  const [activeTab, setActiveTab] = useState<'badges' | 'retos'>('badges');
  const [xp, setXp] = useState<number | null>(null);
  const [claimed, setClaimed] = useState<Set<string>>(new Set());
  const [busyMission, setBusyMission] = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [territory, setTerritory] = useState<TerritoryPulse | null>(null);
  const [challenges, setChallenges] = useState<ResolvedChallenge[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const cached = getCachedSession();
        const session = cached ?? (await startSession());
        const deviceId = getDeviceId();
        const res = await fetch(
          `/api/gamification/status?deviceId=${encodeURIComponent(deviceId)}`,
        );
        const data = (await res.json()) as {
          ok: boolean;
          session?: { totalPoints: number; missions: string[] } | null;
          territory?: TerritoryPulse;
          challenges?: ResolvedChallenge[];
        };
        if (mounted) {
          if (data.ok && data.session) {
            setXp(data.session.totalPoints);
            setClaimed(new Set(data.session.missions));
          }
          if (data.ok && data.territory) setTerritory(data.territory);
          if (data.ok && Array.isArray(data.challenges) && data.challenges.length > 0) {
            setChallenges(data.challenges);
          } else {
            setChallenges(RDM_CHALLENGES.map(c => ({ id: c.id, title: c.title, category: c.category, points: c.points, progress: c.progress })));
          }
          setSessionReady(Boolean(session.sessionId) && !session.sessionId.startsWith('local-'));
          setXp(prev => prev ?? 0);
        }
      } catch {
        if (mounted) {
          setSessionReady(false);
          setXp(0);
          setChallenges(RDM_CHALLENGES.map(c => ({ id: c.id, title: c.title, category: c.category, points: c.points, progress: c.progress })));
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const userXp = xp ?? 0;
  const levelInfo = playerLevel(userXp);
  const level = levelInfo.level;
  const levelProgress = levelInfo.progress;
  const levelTitle = levelInfo.title;

  const unlockedCount = 1 + Math.min(5, Math.floor(userXp / 500));
  const unlockedIds = new Set<string>(RDM_BADGES.slice(0, Math.max(1, unlockedCount)).map(b => b.id));

  const claimMission = async (challengeId: string, points: number) => {
    if (claimed.has(challengeId) || busyMission) return;
    setBusyMission(challengeId);
    try {
      const total = await reportMission(challengeId, points);
      setXp(prev => total ?? (prev ?? 0) + points);
      setClaimed(prev => new Set(prev).add(challengeId));
      const session = getCachedSession();
      if (session && !session.sessionId.startsWith('local-') && challengeId === WELCOME_BONUS_MISSION) {
        await reportMission(WELCOME_BONUS_MISSION, 250);
      }
    } catch {
      /* el fallback local se aplica en el cliente */
    } finally {
      setBusyMission(null);
    }
  };

  const missionsCleared = claimed.size;
  const challengeById = new Map(challenges.map(c => [c.id, c]));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-400" />
          Gamificación del Nodo Cero
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          Insignias, retos y experiencia soberana para los habitantes del Real
          {sessionReady ? ' · sincronizada con el motor YUN' : ' · modo simulación local'}
        </p>
      </div>

      {/* Player Card */}
      <div className="p-5 rounded-2xl glass-panel border border-amber-500/30 bg-gradient-to-br from-amber-950/40 via-slate-950/60 to-slate-950/80 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 shadow-[0_0_25px_rgba(251,191,36,0.4)]">
              <Crown className="w-7 h-7" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-amber-400 uppercase tracking-widest">Minerx · Nodo Cero</div>
              <div className="text-lg font-black text-white">Nivel {level} — {levelTitle}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-mono text-slate-400 uppercase">XP Total</div>
            <div className="text-xl font-black text-amber-400">
              {xp === null ? <Loader2 className="h-5 w-5 inline animate-spin" /> : userXp.toLocaleString()} XP
            </div>
          </div>
        </div>
        <div>
          <div className="h-3 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 animate-shimmer" style={{ width: `${levelProgress}%` }} />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1.5">
            <span>{Math.round(userXp % 1500)} / 1500 XP</span>
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-emerald-400" />
              {territory ? `${territory.incidents.open} incidentes en vivo` : 'Conectando territorio...'}
            </span>
          </div>
        </div>
      </div>

      {/* Pulso territorial — datos reales de la plataforma */}
      {territory && (
        <div className="p-5 rounded-2xl glass-panel border border-cyan-500/20 bg-slate-950/60 space-y-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-300" />
            <h3 className="text-sm font-bold text-white">Pulso del Territorio</h3>
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest ml-auto">datos reales del Nodo Cero</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl border border-rose-500/20 bg-rose-950/30">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-rose-300">
                <AlertTriangle className="w-3 h-3" /> Incidentes
              </div>
              <div className="text-lg font-black text-white mt-1">
                {territory.incidents.open}<span className="text-[10px] text-slate-400 font-mono ml-1">abiertos · {territory.incidents.resolved} resueltos</span>
              </div>
            </div>
            <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-950/30">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-300">
                <Boxes className="w-3 h-3" /> Gemelos
              </div>
              <div className="text-lg font-black text-white mt-1">
                {territory.twins.total}<span className="text-[10px] text-slate-400 font-mono ml-1">· {territory.twins.healthy} saludables</span>
              </div>
            </div>
            <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-950/30">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-300">
                <Building2 className="w-3 h-3" /> Marketplace
              </div>
              <div className="text-lg font-black text-white mt-1">
                {territory.marketplace.published}<span className="text-[10px] text-slate-400 font-mono ml-1">listados publicados</span>
              </div>
            </div>
            <div className="p-3 rounded-xl border border-purple-500/20 bg-purple-950/30">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-purple-300">
                <CreditCard className="w-3 h-3" /> Pagos
              </div>
              <div className="text-lg font-black text-white mt-1">
                {territory.payments.confirmed}<span className="text-[10px] text-slate-400 font-mono ml-1">confirmados</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 p-1 rounded-2xl glass-panel border border-white/10 w-fit">
        <button
          onClick={() => setActiveTab('badges')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
            activeTab === 'badges' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Medal className="w-4 h-4" />
          Insignias
        </button>
        <button
          onClick={() => setActiveTab('retos')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
            activeTab === 'retos' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Target className="w-4 h-4" />
          Retos de la Comarca
        </button>
      </div>

      {activeTab === 'badges' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {RDM_BADGES.map(badge => {
            const unlocked = unlockedIds.has(badge.id);
            return (
            <div key={badge.id} className={`p-4 rounded-2xl glass-panel border bg-slate-950/60 text-center space-y-2 ${unlocked ? rarityColors[badge.rarity] : 'border-slate-800 opacity-50'}`}>
              <div className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center border-2 ${unlocked ? rarityColors[badge.rarity] + ' bg-slate-900' : 'border-slate-700 bg-slate-900'}`}>
                {unlocked ? <Medal className="w-6 h-6" /> : <Lock className="w-6 h-6 text-slate-600" />}
              </div>
              <div>
                <div className="text-xs font-bold text-white leading-tight">{badge.name}</div>
                <div className="text-[10px] font-mono text-slate-500 mt-1">{badge.rarity.toUpperCase()}</div>
              </div>
              <div className="text-[10px] font-mono text-slate-400 leading-snug">{badge.description}</div>
            </div>
            );
          })}
        </div>
      )}

      {activeTab === 'retos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {RDM_CHALLENGES.map(challenge => {
            const isClaimed = claimed.has(challenge.id);
            const real = challengeById.get(challenge.id);
            const progress = real?.progress ?? challenge.progress;
            const done = progress >= 100;
            return (
            <div key={challenge.id} className="p-5 rounded-2xl glass-panel-interactive border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">{challenge.category}</div>
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border ${
                  isClaimed
                    ? 'text-emerald-300 border-emerald-500/40 bg-emerald-950/60'
                    : done
                      ? 'text-amber-300 border-amber-500/40 bg-amber-950/60'
                      : 'text-slate-400 border-slate-700 bg-slate-900/60'
                }`}>
                  {isClaimed ? 'Reclamado' : `+${challenge.points} XP`}
                </span>
              </div>
              <h4 className="text-base font-bold text-white">{challenge.title}</h4>
              <p className="text-xs text-slate-300 leading-relaxed font-light">{challenge.description}</p>
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                  {isClaimed ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Flame className="w-3.5 h-3.5 text-orange-400" />}
                  {isClaimed ? 'Dominado' : done ? 'Listo para reclamar' : real ? 'Progreso real del territorio' : 'Por completar'}
                </span>
                <span className="text-[11px] font-mono text-slate-400">{Math.round(progress)}%</span>
              </div>
              {done && (
                <button
                  onClick={() => claimMission(challenge.id, challenge.points)}
                  disabled={isClaimed || busyMission !== null}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-3 py-2 text-xs font-bold text-slate-950 transition-all hover:from-amber-400 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {busyMission === challenge.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : isClaimed ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <Gift className="w-3.5 h-3.5" />
                  )}
                  {isClaimed ? 'Recompensa recibida' : `Reclamar +${challenge.points} XP`}
                </button>
              )}
            </div>
            );
          })}

          {/* Reto de bienvenida */}
          <div className="p-5 rounded-2xl glass-panel-interactive border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400">Nodo Cero</div>
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border ${
                claimed.has(WELCOME_BONUS_MISSION)
                  ? 'text-emerald-300 border-emerald-500/40 bg-emerald-950/60'
                  : 'text-amber-300 border-amber-500/40 bg-amber-950/60'
              }`}>
                +250 XP
              </span>
            </div>
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" />
              Bienvenida al Real
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              Activa tu bono de bienvenida por unirte al Nodo Cero. Se abona una sola vez por dispositivo.
            </p>
            <button
              onClick={() => claimMission(WELCOME_BONUS_MISSION, 250)}
              disabled={claimed.has(WELCOME_BONUS_MISSION) || busyMission !== null}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-3 py-2 text-xs font-bold text-slate-950 transition-all hover:from-amber-400 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {busyMission === WELCOME_BONUS_MISSION ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : claimed.has(WELCOME_BONUS_MISSION) ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <Gift className="w-3.5 h-3.5" />
              )}
              {claimed.has(WELCOME_BONUS_MISSION) ? 'Bono activado' : 'Activar bono de bienvenida'}
            </button>
          </div>
        </div>
      )}

      {/* Resumen de progreso */}
      <div className="p-4 rounded-2xl glass-panel border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="font-mono text-slate-400">
          Misiones reclamadas: <span className="text-amber-400 font-bold">{missionsCleared}</span> · XP real del motor YUN
        </span>
        <span className="font-mono text-slate-500">
          {sessionReady ? 'sesión firmada · server-authoritative' : 'simulación local · sin conexión'}
        </span>
      </div>
    </div>
  );
}
