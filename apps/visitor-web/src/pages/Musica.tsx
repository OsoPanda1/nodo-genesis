import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { RDMLayout } from "@/components/rdm/RDMLayout";
import { SEOMeta } from "@/components/SEOMeta";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Play,
  Pause,
  Download,
  Heart,
  Clock,
  Headphones,
  Disc3,
  Award,
  BookOpen,
  ExternalLink,
  ChevronDown,
  Waves,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useAudioPlayer, type Track } from "@/contexts/AudioPlayerContext";
import playlistMd from "@/assets/musica/playlist.md?raw";

// Ecos Música — New system components
import { SpatialPlayer } from "@/features/music/components/SpatialPlayer";
import { recommendTracks } from "@/features/music/engine";
import { recordMusicAction } from "@/features/music/api";
import type { MusicTrack } from "@/features/music/types";

const trackSrc = (name: string): string => new URL(`../assets/musica/${name}`, import.meta.url).href;

const PLAYLIST: Track[] = [
  {
    id: "a_mimadre",
    title: "El Real (Legend)",
    artist: "Edwin Castillo",
    description: "Tema principal del intro de la plataforma.",
    src: trackSrc("a_mimadre.mp3"),
    duration: 210,
    bpm: 70,
    mood: "Emotivo",
  },
  {
    id: "reina_trejo",
    title: "A Mi Madre",
    artist: "RDM Digital",
    description: "Homenaje musical a mi madre, al amor incondicional y al sacrificio silencioso.",
    src: trackSrc("reina_trejo.mp3"),
    duration: 275,
    bpm: 70,
    mood: "Emotivo",
  },
  {
    id: "tumirada",
    title: "Tu Mirada",
    artist: "RDM Digital",
    description: "Melodía íntima que captura la esencia de una mirada que lo dice todo.",
    src: trackSrc("tumirada.mp3"),
    duration: 240,
    bpm: 72,
    mood: "Melancólico",
  },
  {
    id: "adicted_toyou",
    title: "Adicted to You",
    artist: "Edwin Castillo",
    description:
      "Canción que explora la adicción emocional que nace del corazón y se niega a soltar los recuerdos del ayer.",
    src: trackSrc("adicted_toyou).mp3"),
    duration: 220,
    bpm: 85,
    mood: "Pasional",
  },
  {
    id: "cada_noche",
    title: "Cada Noche",
    artist: "Edwin Castillo",
    description: "Ritmo nocturno que evoca las madrugadas de insomnio y reflexión.",
    src: trackSrc("cada_noche.mp3"),
    duration: 230,
    bpm: 78,
    mood: "Nocturno",
  },
  {
    id: "el_senalado",
    title: "El Señalado",
    artist: "Edwin Castillo",
    description:
      "Narrativa musical sobre llevar una marca distinta y encontrar fuerza en la propia identidad.",
    src: trackSrc("el_señalado.mp3"),
    duration: 240,
    bpm: 82,
    mood: "Intenso",
  },
  {
    id: "legado_1",
    title: "Legado (Versión Extendida)",
    artist: "RDM Digital",
    description:
      "Como deseo ser recordado, que dejo como legado, una pregunta que vive a diario en mi mente.",
    src: trackSrc("Legado (1).mp3"),
    duration: 260,
    bpm: 80,
    mood: "Épico",
  },
  {
    id: "patio_detierra",
    title: "Patio de Tierra",
    artist: "Edwin Castillo",
    description: "Melodía que evoca los patios de las casas antiguas y las memorias que ahí habitan.",
    src: trackSrc("patio_detierra.mp3"),
    duration: 200,
    bpm: 65,
    mood: "Nostálgico",
  },
  {
    id: "puro_dolor",
    title: "Puro Dolor",
    artist: "Edwin Castillo",
    description: "Balada que transforma el dolor en arte y catarsis musical.",
    src: trackSrc("puro_dolor.mp3"),
    duration: 250,
    bpm: 68,
    mood: "Triste",
  },
  {
    id: "shooting_star",
    title: "Shooting Star",
    artist: "Edwin Castillo",
    description:
      "Inspirado en la estrella fugaz que iluminó mi andar y cruza el cielo de Real del Monte.",
    src: trackSrc("shooting_star.mp3"),
    duration: 225,
    bpm: 88,
    mood: "Inspirador",
  },
  {
    id: "rdm_yoteadoro",
    title: "RDM Yo Te Adoro",
    artist: "RDM Digital",
    description: "Declaración de amor al Pueblo Mágico de Real del Monte.",
    src: trackSrc("rdm_yoteadoro.mp3"),
    duration: 210,
    bpm: 76,
    mood: "Emotivo",
  },
  {
    id: "rdm_intro",
    title: "RDM Intro (Versión Extendida)",
    artist: "RDM Digital",
    description: "Melodía de apertura extendida de la plataforma RDM Digital.",
    src: trackSrc("rdmintro (2).mp3"),
    duration: 195,
    bpm: 70,
    mood: "Épico",
  },
];

const DONATION_AMOUNTS = [50, 100, 200, 500, 1000];

const MOOD_COLORS: Record<string, string> = {
  Triste: "#FF1744",
  Intenso: "#FF1744",
  Energético: "#00D4FF",
  Épico: "#00D4FF",
  Melancólico: "#A7F300",
  Emotivo: "#A7F300",
  Pasional: "#A7F300",
  Nocturno: "#A7F300",
  Nostálgico: "#A7F300",
  Inspirador: "#A7F300",
};

function formatDuration(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/* ------------------------------------------------------------------ */
/*  TRACK ROW ESTILO STREAMING                                         */
/* ------------------------------------------------------------------ */

function TrackRow({
  track,
  index,
  isActive,
  isPlaying,
  onPlay,
}: {
  track: Track;
  index: number;
  isActive: boolean;
  isPlaying: boolean;
  onPlay: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const open = expanded || isActive;
  const prefersReducedMotion = useReducedMotion();

  const moodColor = MOOD_COLORS[track.mood ?? ""] ?? "#A7F300";

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? { duration: 0 } : { delay: index * 0.03 }}
      className={`group rounded-2xl border transition-all duration-200 will-change-transform will-change-opacity ${
        isActive
          ? "border-[#00D4FF] bg-[#F3F4F6] shadow-[0_12px_35px_rgba(0,212,255,0.35)]"
          : "border-[#E5E7EB] bg-white hover:border-[#00D4FF]/70 hover:shadow-[0_10px_30px_rgba(11,18,32,0.15)]"
      }`}
    >
      <button
        onClick={() => {
          onPlay();
          if (!isActive) setExpanded(true);
        }}
        className="w-full flex items-center gap-3 px-3 py-2.5 text-left"
      >
        {/* index / playing */}
        <div className="relative shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-[#050814]">
          {isActive && isPlaying ? (
            <span className="flex gap-px items-end h-3.5">
              {[1, 2, 3].map((b) => (
                <span
                  key={b}
                  className="w-[3px] rounded-full animate-bounce"
                  style={{
                    background: "linear-gradient(to top, #00D4FF, #A7F300)",
                    height: `${5 + b * 3}px`,
                    animationDelay: `${b * 0.42}s`,
                  }}
                />
              ))}
            </span>
          ) : (
            <span className="text-[10px] font-semibold text-[#1F2937] group-hover:opacity-0 transition-opacity">
              {String(index + 1).padStart(2, "0")}
            </span>
          )}
          {!isActive && (
            <Play className="absolute w-3.5 h-3.5 text-[#00D4FF] opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>

        {/* Title + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-semibold truncate ${
                isActive ? "text-[#0b1020]" : "text-[#0b1020]"
              }`}
            >
              {track.title}
            </span>
            {track.mood && (
              <span
                className="text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-[0.18em] shrink-0 hidden sm:inline"
                style={{
                  backgroundColor: `${moodColor}15`,
                  color: moodColor,
                  border: `1px solid ${moodColor}55`,
                }}
              >
                {track.mood}
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#24304f]">{track.artist}</p>
        </div>

        {/* Duration + controls */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-[#4B5563] tabular-nums">
            {formatDuration(track.duration)}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay();
            }}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all will-change-transform will-change-opacity ${
              isActive
                ? "bg-[#00D4FF]/15 text-[#00D4FF]"
                : "text-[#4B5563] hover:text-[#00D4FF] hover:bg-[#00D4FF]/10"
            }`}
          >
            {isActive && isPlaying ? (
              <Pause className="w-3.5 h-3.5" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className={`p-1 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            } text-[#9CA3AF] hover:text-[#374151]`}
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </button>

      {/* Expanded details */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-0 border-t border-[#E5E7EB] mt-1">
              <p className="text-[12px] text-[#1c2540] leading-relaxed mb-2 mt-2">
                {track.description}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-[10px] text-[#4B5563]">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDuration(track.duration)}
                </span>
                {track.bpm && (
                  <span className="flex items-center gap-1">
                    <Headphones className="w-3 h-3" />
                    {track.bpm} BPM
                  </span>
                )}
                {track.mood && (
                  <span className="flex items-center gap-1">
                    <Disc3 className="w-3 h-3" />
                    {track.mood}
                  </span>
                )}
              </div>
              {isActive && <ActiveProgressBar />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  PROGRESS BAR / NOW PLAYING                                         */
/* ------------------------------------------------------------------ */

function ActiveProgressBar() {
  const { progress } = useAudioPlayer();
  return (
    <div className="mt-2 h-1.5 rounded-full bg-[#E5E7EB] overflow-hidden">
      <div
        className="h-full rounded-full transition-[width] duration-250"
        style={{
          width: `${progress * 100}%`,
          background: "linear-gradient(90deg, #FF1744, #00D4FF, #A7F300)",
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PLAYLIST → MusicTrack conversion (single source of truth)          */
/* ------------------------------------------------------------------ */

function playlistToMusicTracks(playlist: Track[]): MusicTrack[] {
  return playlist.map((track, idx) => ({
    id: track.id,
    album_id: null,
    artist_id: null,
    title: track.title,
    slug: track.id,
    file_flac: null,
    file_wav: null,
    file_alac: null,
    file_mp3_320: track.src,
    file_mp3_128: track.src,
    duration_ms: track.duration * 1000,
    track_number: idx + 1,
    canonical_level: "community",
    curator_notes: track.description,
    curated_by: track.artist,
    location_name: "Real del Monte, Hidalgo",
    location_lat: 20.2145,
    location_lng: -98.4567,
    spatial_profiles: {
      archivo: { reverb: 0.1 },
      espacio: { reverb: 0.4, panorama: true, effects: ["mine_echo"] },
      metaverso: { reverb: 0.6, panorama: true, hrtf: true, effects: ["mine_echo", "echo"] },
    },
    era: null,
    play_count: 0,
    lyrics: null,
    credits: {},
    status: "active",
    metadata: {},
    created_at: new Date().toISOString(),
    artist: {
      id: track.artist === "Edwin Castillo" ? "art-edwin" : "art-rdm",
      name: track.artist,
      slug: track.artist.toLowerCase().replace(/\s+/g, "-"),
      bio: null,
      origin: "Real del Monte, Hidalgo",
      era: null,
      avatar_url: null,
      status: "active",
      metadata: {},
      created_at: new Date().toISOString(),
    },
  }));
}

/* ------------------------------------------------------------------ */
/*  ECOS MUSICA — Single unified music section                          */
/* ------------------------------------------------------------------ */

function EcosMusicaSection({
  tracks,
  donationAmount,
  setDonationAmount,
  customAmount,
  setCustomAmount,
  donating,
  donationError,
  handleDonation,
}: {
  tracks: MusicTrack[];
  donationAmount: number | null;
  setDonationAmount: (v: number | null) => void;
  customAmount: string;
  setCustomAmount: (v: string) => void;
  donating: boolean;
  donationError: string | null;
  handleDonation: () => void;
}) {
  const { currentTrack, isPlaying, play, togglePlay } = useAudioPlayer();
  const recommended = useMemo(
    () => recommendTracks(tracks, { territory_id: "rdm" }, 4),
    [tracks],
  );
  const [selectedTrack, setSelectedTrack] = useState<MusicTrack>(recommended[0]);
  const [trackIndex, setTrackIndex] = useState(0);
  const [xpToast, setXpToast] = useState<string | null>(null);
  const xpTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const handleXpEarned = useCallback((xp: number) => {
    setXpToast(`+${xp} XP Cultura`);
    if (xpTimerRef.current) clearTimeout(xpTimerRef.current);
    xpTimerRef.current = setTimeout(() => setXpToast(null), 2500);
  }, []);

  useEffect(() => {
    return () => {
      if (xpTimerRef.current) clearTimeout(xpTimerRef.current);
    };
  }, []);

  const handleNextTrack = () => {
    const next = (trackIndex + 1) % recommended.length;
    setTrackIndex(next);
    setSelectedTrack(recommended[next]);
    recordMusicAction("track_play", {
      track_id: recommended[next].id,
      spatial_mode: "archivo",
    });
  };

  const handlePrevTrack = () => {
    const prev = trackIndex > 0 ? trackIndex - 1 : recommended.length - 1;
    setTrackIndex(prev);
    setSelectedTrack(recommended[prev]);
  };

  const totalPlaylistSecs = PLAYLIST.reduce((a: number, t: Track) => a + t.duration, 0);

  return (
    <section className="py-16 px-6 md:px-16 bg-[#050814] relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(0,212,255,0.12) 0%, transparent 50%), " +
            "radial-gradient(circle at 80% 70%, rgba(167,243,0,0.08) 0%, transparent 50%)",
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[#A7F300]/30 bg-[#A7F300]/10 px-4 py-1.5 text-[9px] uppercase tracking-[0.25em] text-[#A7F300] mb-4">
            <Waves className="h-3 w-3" />
            <span>Archivo Histórico Musical</span>
          </div>
          <h2
            className="text-[2rem] md:text-[2.8rem] font-bold text-white tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Música de
            <span className="bg-gradient-to-r from-[#00D4FF] to-[#A7F300] bg-clip-text text-transparent">
              {" "}
              Real del Monte
            </span>
          </h2>
          <p className="mt-3 text-sm text-[#9CA3AF] max-w-xl">
            Una colección viva de {PLAYLIST.length} pistas que narran la historia, el amor y la memoria del
            Pueblo Mágico. Tres modos de escucha: Archivo (lossless puro), Espacio (acústica de las minas),
            y Metaverso (experiencia XR espacial).
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] text-[#6B7280]">
            <span className="flex items-center gap-2">
              <Award className="w-3.5 h-3.5 text-[#00D4FF]" />
              {PLAYLIST.length} pistas
            </span>
            <span className="w-1 h-1 rounded-full bg-[#374151]" />
            <span className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#00D4FF]" />
              {formatDuration(totalPlaylistSecs)}
            </span>
            <span className="w-1 h-1 rounded-full bg-[#374151]" />
            <span className="flex items-center gap-2">
              <Download className="w-3.5 h-3.5 text-[#00D4FF]" />
              Descarga libre
            </span>
          </div>
        </motion.div>

        {/* XP toast */}
        <AnimatePresence>
          {xpToast && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-20 right-6 z-50 px-4 py-2 rounded-xl bg-[#A7F300] text-[#050814] text-xs font-bold shadow-lg"
            >
              {xpToast}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Manifiesto */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-10 p-4 rounded-xl bg-white/5 border border-white/10"
        >
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00D4FF]/12 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4 text-[#00D4FF]" />
            </div>
            <div className="prose prose-sm max-w-none text-[#9CA3AF] text-[13px]">
              <ReactMarkdown>{playlistMd}</ReactMarkdown>
            </div>
          </div>
        </motion.div>

        {/* Spatial Player + recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <SpatialPlayer
            track={selectedTrack}
            queue={recommended}
            currentIndex={trackIndex}
            onPrev={handlePrevTrack}
            onNext={handleNextTrack}
            onXpEarned={handleXpEarned}
          />

          {/* Recommended tracks */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#A7F300]/60 mb-3">
              Recomendados para ti
            </p>
            <div className="space-y-2">
              {recommended.map((track, idx) => (
                <button
                  key={track.id}
                  onClick={() => {
                    setSelectedTrack(track);
                    setTrackIndex(idx);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                    selectedTrack.id === track.id
                      ? "bg-white/10 border border-[#A7F300]/30"
                      : "bg-white/5 border border-transparent hover:bg-white/8"
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-[#A7F300]/15 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-[#A7F300]">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{track.title}</p>
                    <p className="text-[10px] text-[#9CA3AF]">{track.artist?.name}</p>
                  </div>
                  <span className="text-[9px] text-[#9CA3AF] tabular-nums">
                    {Math.round(track.duration_ms / 60000)}:
                    {String(Math.round((track.duration_ms % 60000) / 1000)).padStart(2, "0")}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 mb-12" />

        {/* Track catalog */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <span className="text-[10px] uppercase tracking-[0.22em] text-[#9CA3AF]">
              Catálogo sonoro — {PLAYLIST.length} pistas
            </span>
            <span className="text-[10px] text-[#9CA3AF] tabular-nums">
              {formatDuration(totalPlaylistSecs)} total
            </span>
          </div>

          <div className="space-y-1.5">
            {PLAYLIST.map((track, idx) => (
              <TrackRow
                key={track.id}
                track={track}
                index={idx}
                isActive={currentTrack?.id === track.id}
                isPlaying={isPlaying && currentTrack?.id === track.id}
                onPlay={() => {
                  if (currentTrack?.id === track.id) {
                    togglePlay();
                  } else {
                    play(track, PLAYLIST);
                  }
                }}
              />
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 mb-12" />

        {/* Donation section */}
        <div>
          <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5">
            <div className="relative h-28 overflow-hidden">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "linear-gradient(120deg, rgba(0,212,255,0.22), rgba(255,23,68,0.18), rgba(167,243,0,0.20))",
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#050814] to-transparent" />
              <div className="absolute bottom-4 left-6 flex items-center gap-3">
                <Heart className="w-7 h-7 text-[#A7F300]" />
                <div>
                  <h3 className="text-sm font-bold text-white">Apoya esta música</h3>
                  <p className="text-[11px] text-[#9CA3AF]">
                    Tu donación mantiene vivo este archivo sonoro.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 pb-6 pt-4">
              <p className="text-[13px] text-[#9CA3AF] leading-relaxed mb-5">
                Esta música es y será siempre gratuita. Pero mantener servidores, dominio y el
                desarrollo de RDM Digital requiere inversión constante. Si este proyecto resuena
                contigo, considera hacer una contribución.
              </p>

              {donationError && (
                <p className="mb-3 text-[11px] text-[#FF1744] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF1744]" />
                  {donationError}
                </p>
              )}
              <DonationControls
                donationAmount={donationAmount}
                setDonationAmount={setDonationAmount}
                customAmount={customAmount}
                setCustomAmount={setCustomAmount}
                donating={donating}
                onDonate={handleDonation}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  PAGE: Música — Archivo Histórico Musical                           */
/* ------------------------------------------------------------------ */

export default function Musica() {
  const { currentTrack, isPlaying, play, togglePlay } = useAudioPlayer();
  const [donationAmount, setDonationAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [donating, setDonating] = useState(false);
  const [donationError, setDonationError] = useState<string | null>(null);

  const handleDonation = async () => {
    const parsed = customAmount ? parseInt(customAmount, 10) : null;
    if (customAmount && (isNaN(parsed!) || parsed! <= 0)) {
      setDonationError("Ingresa una cantidad válida en MXN.");
      return;
    }
    const amount = donationAmount ?? parsed;
    if (!amount || amount <= 0) return;
    setDonationError(null);
    setDonating(true);
    try {
      const res = await fetch("/api/donations/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      if (!res.ok) {
        setDonationError("Error al procesar el pago. Intenta de nuevo.");
        setDonating(false);
        return;
      }
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      setDonationError("Error de conexión. Verifica tu internet e intenta de nuevo.");
      setDonating(false);
    }
  };

  const musicTracks = useMemo(() => playlistToMusicTracks(PLAYLIST), []);

  return (
    <RDMLayout>
      <SEOMeta
        title="Archivo Histórico Musical — RDM Digital"
        description="Archivo histórico musical del Pueblo Mágico. Melodías que capturan el espíritu de Real del Monte. Apoya con una donación."
      />
      <EcosMusicaSection
        tracks={musicTracks}
        donationAmount={donationAmount}
        setDonationAmount={setDonationAmount}
        customAmount={customAmount}
        setCustomAmount={setCustomAmount}
        donating={donating}
        donationError={donationError}
        handleDonation={handleDonation}
      />
    </RDMLayout>
  );
}

/* ------------------------------------------------------------------ */
/*  DONATION CONTROLS                                                  */
/* ------------------------------------------------------------------ */

function DonationControls({
  donationAmount,
  setDonationAmount,
  customAmount,
  setCustomAmount,
  donating,
  onDonate,
}: {
  donationAmount: number | null;
  setDonationAmount: (v: number | null) => void;
  customAmount: string;
  setCustomAmount: (v: string) => void;
  donating: boolean;
  onDonate: () => void;
}) {
  const currentAmount = donationAmount ?? (customAmount ? parseInt(customAmount) || 0 : 0);

  return (
    <>
      <div className="flex flex-wrap gap-3 mb-5">
        {DONATION_AMOUNTS.map((amount) => (
          <button
            key={amount}
            onClick={() => {
              setDonationAmount(amount);
              setCustomAmount("");
            }}
            className={`relative px-5 py-2.5 rounded-xl text-sm font-bold transition-all will-change-transform will-change-opacity ${
              donationAmount === amount
                ? "bg-gradient-to-br from-[#00D4FF] to-[#FF1744] text-white shadow-lg shadow-[#00D4FF]/35 scale-105"
                : "bg-white border border-[#E5E7EB] text-[#0b1020] hover:bg-[#F3F4F6] hover:text-[#00D4FF]"
            }`}
          >
            ${amount.toLocaleString()}
            {amount === 500 && (
              <span className="block text-[9px] font-normal opacity-70">Más apoyado</span>
            )}
            {amount === 1000 && (
              <span className="block text-[9px] font-normal opacity-70">⭐ Patrocinador</span>
            )}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-6">
        <span className="text-[11px] text-[#4B5563] shrink-0">Otra cantidad:</span>
        <div className="relative flex-1 max-w-[200px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] text-sm font-semibold">
            $
          </span>
          <input
            type="number"
            min={1}
            placeholder="0"
            value={customAmount}
            onChange={(e) => {
              setCustomAmount(e.target.value);
              setDonationAmount(null);
            }}
            className="w-full pl-7 pr-4 py-2.5 rounded-xl bg-white border border-[#E5E7EB] text-[#0b1020] text-sm focus:outline-none focus:border-[#00D4FF] transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
        <span className="text-[11px] text-[#6B7280]">MXN</span>
      </div>

      <button
        onClick={onDonate}
        disabled={donating || (!donationAmount && !customAmount)}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-3.5 rounded-xl bg-gradient-to-br from-[#00D4FF] via-[#FF1744] to-[#A7F300] text-white font-bold text-sm hover:opacity-90 hover:scale-[1.02] disabled:opacity-40 disabled:scale-100 transition-all shadow-xl shadow-[#00D4FF]/25 will-change-transform will-change-opacity"
      >
        {donating ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Procesando…
          </>
        ) : (
          <>
            <Heart className="w-4 h-4" />
            Donar ${currentAmount.toLocaleString() || "…"}
          </>
        )}
      </button>

      <p className="mt-3 text-[9px] text-[#6B7280] leading-relaxed">
        <ExternalLink className="w-3 h-3 inline mr-1" />
        Pago procesado vía Stripe. No almacenamos datos bancarios.
      </p>
    </>
  );
}
