import type { LucideIcon } from 'lucide-react';
import { Flame, Gift, Gem, Lamp, MapPin, Pickaxe, ScrollText, Shield, Skull, Sparkles, Ticket, Video } from 'lucide-react';
import { RDM_EVENTS } from '@/lib/data/rdm-tourism';
import { POI, RDM_POIS } from '@/lib/data/rdm-data';

/* ------------------------------------------------------------------ */
/* Tipos del dominio Zombies RDM Invasion                              */
/* ------------------------------------------------------------------ */

export type ZombieRarity = 'comun' | 'raro' | 'epico';
export type ZombieType = 'minero' | 'espectro' | 'bestia' | 'leyenda';
export type SpawnZone = 'mina' | 'cultura' | 'naturaleza' | 'gastronomia' | 'calles';
export type TimeSlot = 'dia' | 'noche' | 'niebla' | 'todo';
export type ArtifactKind = 'ofensivo' | 'defensivo' | 'soporte';

export interface ZombieArchetype {
  id: string;
  name: string;
  type: ZombieType;
  rarity: ZombieRarity;
  basePoints: number;
  resistance: number;
  evasion: number;
  threat: number;
  description: string;
  lore: string;
  zones: SpawnZone[];
  poiIds?: string[];
  timeSlots: TimeSlot[];
  color: string;
  sprite?: string;
  spriteVideo?: string;
}

export interface ZombieArtifact {
  id: string;
  name: string;
  kind: ArtifactKind;
  icon: LucideIcon;
  description: string;
  power: number;
  energyCost: number;
  cooldown: number;
  synergies: Array<{ type?: ZombieType; zone?: SpawnZone; bonus: number }>;
  quote: string;
  unlockable?: boolean;
}

export interface ZombiePrize {
  id: string;
  name: string;
  icon: LucideIcon;
  category: 'digital' | 'fisico';
  cost: number;
  description: string;
  kind: 'skin' | 'artefacto' | 'ruta' | 'xr' | 'cupon' | 'joyeria' | 'souvenir';
  artifactId?: string;
}

export interface ZombieMission {
  id: string;
  title: string;
  description: string;
  target: { type?: ZombieType; zone?: SpawnZone; archetypeId?: string; any?: boolean; count: number };
  reward: number;
  icon: LucideIcon;
}

export interface ZombieSpawn {
  id: string;
  archetypeId: string;
  poiId: string;
  poiName: string;
  poiCategory: POI['category'];
  zone: SpawnZone;
  lat: number;
  lng: number;
  expiresAt: number;
}

export interface CapturedZombie {
  id: string;
  archetypeId: string;
  poiId: string;
  poiName: string;
  zone: SpawnZone;
  capturedAt: string;
  points: number;
  lat: number;
  lng: number;
}

export interface TimeContext {
  hour: number;
  period: 'dia' | 'noche';
  niebla: boolean;
  isEventMonth: boolean;
}

export interface PlayerProfile {
  totalPoints: number;
  captures: CapturedZombie[];
  inventory: string[];
  redeemedPrizes: string[];
  claimedMissions: string[];
  missionProgress: Record<string, number>;
  energy: number;
}

/* ------------------------------------------------------------------ */
/* Arquetipos de zombies ligados al lore de Real del Monte             */
/* ------------------------------------------------------------------ */

export const ZOMBIE_ARCHETYPES: ZombieArchetype[] = [
  {
    id: 'z-caminero',
    name: 'Caminero del Socavón',
    type: 'minero',
    rarity: 'comun',
    basePoints: 100,
    resistance: 60,
    evasion: 0.15,
    threat: 6,
    description: 'Un peón de las vetas que subió por los socavones al romperse el pulso. Deambula sin rumbo por calles y plazas.',
    lore: 'Los camineros descendían cada madrugada a las vetas. Cuando el pulso resquebrajó la mina, algunos nunca volvieron a subir con la cara de siempre.',
    zones: ['mina', 'calles'],
    poiIds: ['mina-acosta', 'mina-dificultad', 'mina-dolores', 'plaza-constitucion', 'centro-historico'],
    timeSlots: ['todo'],
    color: '#8fae6b',
    sprite: '/images/zombies/zombie-minero.png',
    spriteVideo: '/videos/zombie-basico.mp4',
  },
  {
    id: 'z-barrenero',
    name: 'Barrenero de Veta Quebrada',
    type: 'minero',
    rarity: 'comun',
    basePoints: 100,
    resistance: 70,
    evasion: 0.1,
    threat: 8,
    description: 'Empuña un barreno oxidado y busca vetas que ya no existen en la superficie.',
    lore: 'Con pólvora y paciencia abrían la montaña. Ahora su pico golpea el aire buscando la plata que el monte se guardó.',
    zones: ['mina'],
    poiIds: ['mina-acosta', 'mina-dificultad'],
    timeSlots: ['todo'],
    color: '#c9a86a',
    sprite: '/images/zombies/zombie-minero.png',
    spriteVideo: '/videos/zombie-basico.mp4',
  },
  {
    id: 'z-pastelero',
    name: 'Pastelero Empedernido',
    type: 'minero',
    rarity: 'comun',
    basePoints: 100,
    resistance: 45,
    evasion: 0.22,
    threat: 4,
    description: 'Huele a repulgue quemado. Se agita alrededor de pastelerías y estufas de carbón.',
    lore: 'Desde 1824 la tradición del paste sobrevivió a todo: a la revolución, a la huelga y ahora a la invasión. Este espíritu sigue buscando su repulgue.',
    zones: ['gastronomia'],
    poiIds: ['pasteleria-portal'],
    timeSlots: ['todo'],
    color: '#e0a458',
    sprite: '/images/zombies/zombie-minero.png',
    spriteVideo: '/videos/zombie-cumbiandero.webm',
  },
  {
    id: 'z-panteonero',
    name: 'Custodio del Panteón Inglés',
    type: 'espectro',
    rarity: 'raro',
    basePoints: 500,
    resistance: 130,
    evasion: 0.25,
    threat: 12,
    description: 'Vela las 634 tumbas que miran hacia Inglaterra. No ataca: custodia.',
    lore: 'El panteón guarda a los que llegaron en 1824 y nunca regresaron. El custodio impide que los vivos profanen su sueño eterno.',
    zones: ['cultura'],
    poiIds: ['panteon-ingles'],
    timeSlots: ['noche', 'niebla'],
    color: '#7f8fa6',
    sprite: '/images/zombies/zombie-espectro.png',
    spriteVideo: '/videos/zombie-cumbiandero.webm',
  },
  {
    id: 'z-cornish',
    name: 'Espectro Cornish de la Niebla',
    type: 'espectro',
    rarity: 'raro',
    basePoints: 500,
    resistance: 150,
    evasion: 0.35,
    threat: 14,
    description: 'Canta canciones de Cornualles entre la niebla. Confunde el tiempo: cree que es 1824.',
    lore: 'Trajeron la máquina de vapor y el silbato. En las noches de niebla su eco baja de los cerros preguntando por los 44 que desembarcaron.',
    zones: ['cultura', 'naturaleza'],
    timeSlots: ['noche', 'niebla'],
    color: '#5d768c',
    sprite: '/images/zombies/zombie-espectro.png',
    spriteVideo: '/videos/zombie-cumbiandero.webm',
  },
  {
    id: 'z-llorona',
    name: 'La Llorona del Hiloche',
    type: 'espectro',
    rarity: 'raro',
    basePoints: 500,
    resistance: 120,
    evasion: 0.3,
    threat: 10,
    description: 'Llora entre los oyameles del bosque. Quien la escucha pierde el sentido del oriente.',
    lore: 'Las madres del Real bajaron a llorar a los mineros que no volvieron. La niebla del Hiloche aún guarda sus voces.',
    zones: ['naturaleza'],
    poiIds: ['bosque-hiloche', 'mirador-purisima'],
    timeSlots: ['niebla', 'noche'],
    color: '#8fa6a6',
    sprite: '/images/zombies/zombie-espectro.png',
    spriteVideo: '/videos/zombie-cumbiandero.webm',
  },
  {
    id: 'z-polvora',
    name: 'Polvorín del Monte',
    type: 'bestia',
    rarity: 'raro',
    basePoints: 500,
    resistance: 160,
    evasion: 0.1,
    threat: 16,
    description: 'Un montículo de escombros y mecha encendida. Explota en un charco de pólvora si se acerca demasiado.',
    lore: 'Las reservas de pólvora de las minas se fundieron con el pulso y tomaron vida. Cruje como madera vieja en un socavón.',
    zones: ['mina'],
    poiIds: ['mina-dolores', 'mina-dificultad'],
    timeSlots: ['todo'],
    color: '#b07848',
    sprite: '/images/zombies/zombie-jefe.png',
    spriteVideo: '/videos/zombie-basico.mp4',
  },
  {
    id: 'z-conde',
    name: 'El Conde de Regla',
    type: 'leyenda',
    rarity: 'epico',
    basePoints: 2000,
    resistance: 400,
    evasion: 0.15,
    threat: 24,
    description: 'El magnate que financió obras de imperios despierta de su leyenda en el corazón de la Mina de Acosta.',
    lore: 'Pedro Romero de Terreros, primer Conde de Regla, amasó su fortuna en estas vetas. El pulso lo devolvió del mármol para exigir su tributo de plata.',
    zones: ['mina'],
    poiIds: ['mina-acosta'],
    timeSlots: ['todo'],
    color: '#d4af37',
    sprite: '/images/zombies/zombie-jefe.png',
    spriteVideo: '/videos/zombie-basico.mp4',
  },
];

/* ------------------------------------------------------------------ */
/* Artefactos del guardián                                             */
/* ------------------------------------------------------------------ */

export const ZOMBIE_ARTIFACTS: ZombieArtifact[] = [
  {
    id: 'a-farol',
    name: 'Farol de Mina',
    kind: 'soporte',
    icon: Lamp,
    description: 'Ilumina zonas oscuras y reduce a la mitad la evasión de los zombies durante el combate.',
    power: 10,
    energyCost: 1,
    cooldown: 1,
    synergies: [],
    quote: 'La luz del barretero espanta lo que no es humano.',
  },
  {
    id: 'a-pico',
    name: 'Pico Encantado',
    kind: 'ofensivo',
    icon: Pickaxe,
    description: 'Aumenta el daño contra zombies mineros. El acero recuerda las vetas.',
    power: 30,
    energyCost: 2,
    cooldown: 1,
    synergies: [{ type: 'minero', bonus: 25 }],
    quote: 'El monte da, el monte quita.',
  },
  {
    id: 'a-talisman',
    name: 'Talismán de Plata',
    kind: 'ofensivo',
    icon: Gem,
    description: 'Debilita espectros y bestias asociadas a la economía de la plata.',
    power: 26,
    energyCost: 2,
    cooldown: 1,
    synergies: [{ type: 'espectro', bonus: 28 }, { type: 'bestia', bonus: 18 }],
    quote: 'Ley .925, pura plata del Real.',
  },
  {
    id: 'a-memoria',
    name: 'Carta de Memoria Histórica',
    kind: 'ofensivo',
    icon: ScrollText,
    description: 'Inflige daño epistemológico: recuerda la huelga de 1766 y las luchas obreras. Devastadora contra leyendas.',
    power: 22,
    energyCost: 3,
    cooldown: 2,
    synergies: [{ type: 'leyenda', bonus: 45 }],
    quote: 'Primera huelga de América: la memoria también golpea.',
  },
  {
    id: 'a-casco',
    name: 'Casco de Barretero',
    kind: 'defensivo',
    icon: Shield,
    description: 'Blinda al guardián: otorga dos turnos extra antes de que el zombie escape.',
    power: 0,
    energyCost: 1,
    cooldown: 2,
    synergies: [],
    quote: 'El barretero que se protege, vuelve a casa.',
    unlockable: true,
  },
  {
    id: 'a-lente',
    name: 'Lente de la Niebla',
    kind: 'soporte',
    icon: Sparkles,
    description: 'A través de la lente se ven las líneas de energía del pulso: duplica el bono de captura del Sello RDM.',
    power: 0,
    energyCost: 1,
    cooldown: 2,
    synergies: [],
    quote: 'Ver la niebla es entenderla.',
    unlockable: true,
  },
];

export const SEAL_ARTIFACT: ZombieArtifact = {
  id: 'a-sello',
  name: 'Sello RDM',
  kind: 'soporte',
  icon: Skull,
  description: 'Sello criptográfico del Nodo Cero. Captura zombies cuya resistencia esté al 35% o menos.',
  power: 0,
  energyCost: 0,
  cooldown: 1,
  synergies: [],
  quote: 'Nada escapa de la cadena del Nodo.',
};

export function getArtifact(id: string): ZombieArtifact | undefined {
  return ZOMBIE_ARTIFACTS.find(a => a.id === id);
}

/* ------------------------------------------------------------------ */
/* Catálogo de premios                                                 */
/* ------------------------------------------------------------------ */

export const ZOMBIE_PRIZES: ZombiePrize[] = [
  {
    id: 'p-skin-minero',
    name: 'Skin Minerx Legendario',
    icon: Sparkles,
    category: 'digital',
    cost: 4000,
    description: 'Apariencia exclusiva del guardián con casco cornish y farol encendido.',
    kind: 'skin',
  },
  {
    id: 'p-cupon-paste',
    name: 'Cupón Pastelería Local',
    icon: Ticket,
    category: 'digital',
    cost: 5000,
    description: 'Un paste clásico (papa con carne) en las pastelerías con sello RDM.',
    kind: 'cupon',
  },
  {
    id: 'p-art-casco',
    name: 'Artefacto: Casco de Barretero',
    icon: Shield,
    category: 'digital',
    cost: 6000,
    description: 'Desbloquea el artefacto defensivo Casco de Barretero en el inventario.',
    kind: 'artefacto',
    artifactId: 'a-casco',
  },
  {
    id: 'p-art-lente',
    name: 'Artefacto: Lente de la Niebla',
    icon: Sparkles,
    category: 'digital',
    cost: 8000,
    description: 'Desbloquea el artefacto de soporte Lente de la Niebla en el inventario.',
    kind: 'artefacto',
    artifactId: 'a-lente',
  },
  {
    id: 'p-ruta-guia',
    name: 'Ruta Guiada Ruta de la Plata',
    icon: MapPin,
    category: 'digital',
    cost: 10000,
    description: 'Acceso a una visita guiada de la Ruta de la Plata con cronista de la comarca.',
    kind: 'ruta',
  },
  {
    id: 'p-xr',
    name: 'Experiencia XR Panteón Inglés',
    icon: Video,
    category: 'digital',
    cost: 15000,
    description: 'Recorrido de realidad extendida por las 634 tumbas del Panteón Inglés.',
    kind: 'xr',
  },
  {
    id: 'p-joyeria',
    name: 'Joyería de Plata Ley .925',
    icon: Gem,
    category: 'fisico',
    cost: 25000,
    description: 'Pieza artesanal de plata .925 con certificado criptográfico de la platería Real.',
    kind: 'joyeria',
  },
  {
    id: 'p-souvenir',
    name: 'Souvenir Minero del Nodo',
    icon: Gift,
    category: 'fisico',
    cost: 3000,
    description: 'Figura de barretero, imán o postal sellada con el lacre del Nodo Cero.',
    kind: 'souvenir',
  },
];

/* ------------------------------------------------------------------ */
/* Misiones (micro-misiones del guardián)                              */
/* ------------------------------------------------------------------ */

export const ZOMBIE_MISSIONS: ZombieMission[] = [
  {
    id: 'm-minas',
    title: 'Guardia de las Vetas',
    description: 'Captura 3 zombies en zonas de minas para asegurar los socavones.',
    target: { zone: 'mina', count: 3 },
    reward: 800,
    icon: Pickaxe,
  },
  {
    id: 'm-espectros',
    title: 'Noche de Espectros',
    description: 'Captura 2 espectros del Panteón Inglés o de la niebla.',
    target: { type: 'espectro', count: 2 },
    reward: 1200,
    icon: Skull,
  },
  {
    id: 'm-naturaleza',
    title: 'Senderos Limpios',
    description: 'Captura 2 zombies en zonas de naturaleza (miradores y bosques).',
    target: { zone: 'naturaleza', count: 2 },
    reward: 900,
    icon: Shield,
  },
  {
    id: 'm-total',
    title: 'Invasión Contenida',
    description: 'Captura 6 zombies de cualquier tipo en la comarca.',
    target: { any: true, count: 6 },
    reward: 1500,
    icon: Flame,
  },
  {
    id: 'm-conde',
    title: 'El Tributo del Conde',
    description: 'Captura a El Conde de Regla en la Mina de Acosta.',
    target: { archetypeId: 'z-conde', count: 1 },
    reward: 5000,
    icon: Gem,
  },
];

/* ------------------------------------------------------------------ */
/* Motores del juego (spawns, contexto, puntos, captura)               */
/* ------------------------------------------------------------------ */

const MONTH_INDEX: Record<string, number> = {
  enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
  julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11,
};

const RARITY_WEIGHT: Record<ZombieRarity, number> = { comun: 0.66, raro: 0.3, epico: 0.04 };

export function getTimeContext(date: Date): TimeContext {
  const hour = date.getHours();
  const dayHash = ((date.getFullYear() * 372) + (date.getMonth() + 1) * 31 + date.getDate()) % 7;
  const period = hour >= 6 && hour < 19 ? 'dia' : 'noche';
  const fogWindow = (hour >= 4 && hour < 9) || (hour >= 19 && hour < 23);
  const niebla = fogWindow && dayHash !== 0 && dayHash !== 3;
  const isEventMonth = RDM_EVENTS.some(e => MONTH_INDEX[e.month.toLowerCase()] === date.getMonth());
  return { hour, period, niebla, isEventMonth };
}

const ZONE_FALLBACK: SpawnZone = 'calles';

export function zoneForPOI(poi: POI): SpawnZone {
  if (poi.category === 'mina') return 'mina';
  if (poi.category === 'gastronomia' || poi.category === 'plateria') return 'gastronomia';
  if (poi.category === 'naturaleza') return 'naturaleza';
  if (poi.category === 'cultura') return 'cultura';
  return ZONE_FALLBACK;
}

function pickWeighted<T extends { rarity: ZombieRarity }>(candidates: T[], rng: () => number = Math.random): T | undefined {
  if (candidates.length === 0) return undefined;
  let total = 0;
  const weights = candidates.map(c => {
    const w = RARITY_WEIGHT[c.rarity];
    total += w;
    return w;
  });
  let roll = rng() * total;
  for (let i = 0; i < candidates.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return candidates[i];
  }
  return candidates[candidates.length - 1];
}

function eligibleArchetypes(zone: SpawnZone, ctx: TimeContext): ZombieArchetype[] {
  return ZOMBIE_ARCHETYPES.filter(a => {
    const zoneOk = a.zones.includes(zone);
    const timeOk = a.timeSlots.includes('todo') || a.timeSlots.includes(ctx.period) || (ctx.niebla && a.timeSlots.includes('niebla'));
    return zoneOk && timeOk;
  });
}

export function generateSpawns(
  now: Date,
  count = 10,
  pois: POI[] = RDM_POIS,
  rng: () => number = Math.random,
  pressureByPoi?: Record<string, number>,
): ZombieSpawn[] {
  const ctx = getTimeContext(now);
  /* Los POIs con incidentes activos del territorio tienen prioridad de
     spawn: la invasión se concentra donde la ciudad reporta presión. */
  const shuffled = [...pois].sort((a, b) => {
    const pa = pressureByPoi?.[a.id] ?? 0;
    const pb = pressureByPoi?.[b.id] ?? 0;
    if (pb !== pa) return pb - pa;
    return rng() - 0.5;
  });
  const spawns: ZombieSpawn[] = [];

  for (const poi of shuffled) {
    if (spawns.length >= count) break;
    const zone = zoneForPOI(poi);
    const pressure = pressureByPoi?.[poi.id] ?? 0;
    let archetype = pickWeighted(eligibleArchetypes(zone, ctx), rng);
    if (!archetype) {
      const specific = ZOMBIE_ARCHETYPES.find(a => a.poiIds?.includes(poi.id));
      archetype = specific ?? ZOMBIE_ARCHETYPES.find(a => a.zones.includes(zone)) ?? ZOMBIE_ARCHETYPES[0];
    }
    if (!archetype) continue;
    const jitter = () => (rng() - 0.5) * 0.0012;
    spawns.push({
      id: `spawn-${poi.id}-${Date.now()}-${Math.floor(rng() * 1e6)}`,
      archetypeId: archetype.id,
      poiId: poi.id,
      poiName: poi.name,
      poiCategory: poi.category,
      zone,
      lat: poi.lat + jitter(),
      lng: poi.lng + jitter(),
      expiresAt: now.getTime() + (20 + Math.round(pressure * 40)) * 60 * 1000,
    });
    /* A mayor presión territorial, más spawns en el mismo POI. */
    if (pressure > 0.5 && spawns.length < count && rng() < (pressure - 0.5) * 2) {
      const extra = pickWeighted(eligibleArchetypes(zone, ctx), rng);
      if (extra) {
        spawns.push({
          id: `spawn-${poi.id}-${Date.now()}-${Math.floor(rng() * 1e6)}-p`,
          archetypeId: extra.id,
          poiId: poi.id,
          poiName: poi.name,
          poiCategory: poi.category,
          zone,
          lat: poi.lat + jitter(),
          lng: poi.lng + jitter(),
          expiresAt: now.getTime() + 20 * 60 * 1000,
        });
      }
    }
  }

  return spawns;
}

export function computeMultiplier(ctx: TimeContext, zone: SpawnZone): number {
  let m = 1;
  if (ctx.niebla) m *= 1.5;
  if (ctx.period === 'noche') m *= 1.3;
  if (ctx.isEventMonth) m *= 2;
  if (zone === 'mina') m *= 1.2;
  return m;
}

export function computePoints(archetype: ZombieArchetype, ctx: TimeContext, zone: SpawnZone): number {
  return Math.round(archetype.basePoints * computeMultiplier(ctx, zone));
}

export function artifactDamage(artifact: ZombieArtifact, archetype: ZombieArchetype, rng: () => number = Math.random): number {
  let power = artifact.power;
  const synergy = artifact.synergies.find(s => (s.type && s.type === archetype.type) || (s.zone && archetype.zones.includes(s.zone)));
  if (synergy) power += synergy.bonus;
  return Math.max(1, Math.round(power * (0.85 + rng() * 0.3)));
}

export function evasionRoll(archetype: ZombieArchetype, farolActive: boolean, rng: () => number = Math.random): boolean {
  const rate = farolActive ? archetype.evasion * 0.5 : archetype.evasion;
  return rng() < rate;
}

export function captureChance(archetype: ZombieArchetype, resistance: number, maxResistance: number, bonus: number, lenteActive: boolean): number {
  const hpFactor = 1 - resistance / maxResistance;
  let chance = 0.5 + hpFactor * 0.3 + bonus;
  if (lenteActive) chance += 0.25;
  chance -= archetype.evasion * 0.5;
  return Math.min(0.95, Math.max(0.2, chance));
}

export function playerLevel(totalPoints: number): { level: number; progress: number; title: string } {
  const level = Math.floor(totalPoints / 1500) + 1;
  const progress = (totalPoints % 1500) / 15;
  const titles = ['Hornero del Monte', 'Guardia de Socavón', 'Barretero de la Comarca', 'Cronista del Nodo', 'Señor de las Vetas'];
  const title = titles[Math.min(level - 1, titles.length - 1)];
  return { level, progress, title };
}

/* ------------------------------------------------------------------ */
/* Persistencia del perfil                                             */
/* ------------------------------------------------------------------ */

export const PROFILE_KEY = 'zombies:rdm:profile:v1';
export const SPAWNS_KEY = 'zombies:rdm:spawns:v1';

export function defaultProfile(): PlayerProfile {
  return {
    totalPoints: 0,
    captures: [],
    inventory: ['a-farol', 'a-pico', 'a-talisman', 'a-memoria'],
    redeemedPrizes: [],
    claimedMissions: [],
    missionProgress: {},
    energy: 10,
  };
}
