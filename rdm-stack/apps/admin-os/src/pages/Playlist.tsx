import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRole";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { ElegantPagination } from "@/components/ElegantPagination";
import { paymentsApi } from "@/lib/api";
import { Play, Pause, Music, Heart, Upload, Loader2, SkipForward, SkipBack } from "lucide-react";

interface Track {
  id: string;
  title: string;
  artist: string;
  description: string | null;
  audio_url: string;
  cover_url: string | null;
  duration_seconds: number;
  play_count: number;
  is_active: boolean;
  created_at: string;
}

const DONATION_AMOUNTS = [25, 50, 100, 150, 200, 500, 1000];
const PAGE_SIZE = 8;

export default function Playlist() {
  const { user } = useAuth();
  const { isAdmin } = useUserRoles();
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement>(null);

  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [page, setPage] = useState(1);

  const [donateOpen, setDonateOpen] = useState(false);
  const [donateAmount, setDonateAmount] = useState<number>(25);
  const [customAmount, setCustomAmount] = useState("");
  const [donating, setDonating] = useState(false);
  const [activeTrackForDonation, setActiveTrackForDonation] = useState<Track | null>(null);

  // Admin upload
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadArtist, setUploadArtist] = useState("");
  const [uploadDesc, setUploadDesc] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("tracks" as never)
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setTracks((data as Track[]) ?? []);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const totalPages = Math.max(1, Math.ceil(tracks.length / PAGE_SIZE));
  const paged = tracks.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function publicUrl(path: string) {
    if (path.startsWith("http")) return path;
    return supabase.storage.from("tracks-audio").getPublicUrl(path).data.publicUrl;
  }

  async function handlePlay(track: Track, idx: number) {
    setActiveTrackForDonation(track);
    setCurrentIdx(idx);
    setPlaying(true);
    // Open donation dialog the first time the user plays a track in this session
    const seen = sessionStorage.getItem("rdm-donation-notice");
    if (!seen) {
      setDonateOpen(true);
      sessionStorage.setItem("rdm-donation-notice", "1");
    }
    // increment play count (best-effort)
    void supabase.from("tracks" as never).update({ play_count: track.play_count + 1 } as never).eq("id", track.id);
  }

  function togglePlay() {
    if (!audioRef.current) return;
    if (playing) audioRef.current.pause();
    else audioRef.current.play();
    setPlaying(!playing);
  }

  function next() {
    if (currentIdx === null) return;
    const i = (currentIdx + 1) % tracks.length;
    handlePlay(tracks[i], i);
  }
  function prev() {
    if (currentIdx === null) return;
    const i = (currentIdx - 1 + tracks.length) % tracks.length;
    handlePlay(tracks[i], i);
  }

  useEffect(() => {
    if (currentIdx !== null && audioRef.current) {
      audioRef.current.src = publicUrl(tracks[currentIdx].audio_url);
      audioRef.current.play().catch(() => {});
    }
  }, [currentIdx]);

  async function handleDonate() {
    const amount = Number(customAmount) || donateAmount;
    if (!amount || amount < 25) {
      toast({ title: "Monto mínimo $25 MXN", variant: "destructive" });
      return;
    }
    setDonating(true);
    try {
      const r = await paymentsApi.createDonation({ amount, currency: "MXN", message: `Donación Playlist — ${activeTrackForDonation?.title ?? ""}` });
      window.location.href = r.data.url;
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setDonating(false);
    }
  }

  async function handleUpload() {
    if (!uploadFile || !uploadTitle || !user) {
      toast({ title: "Faltan datos", description: "Título y archivo son obligatorios.", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const ext = uploadFile.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("tracks-audio").upload(path, uploadFile, { contentType: uploadFile.type });
      if (upErr) throw upErr;
      const { error: insErr } = await supabase.from("tracks" as never).insert({
        title: uploadTitle,
        artist: uploadArtist || "Anónimo",
        description: uploadDesc || null,
        audio_url: path,
        uploaded_by: user.id,
      } as never);
      if (insErr) throw insErr;
      toast({ title: "Pista publicada 🎶" });
      setUploadOpen(false);
      setUploadTitle(""); setUploadArtist(""); setUploadDesc(""); setUploadFile(null);
      await load();
    } catch (e: any) {
      toast({ title: "Error al subir", description: e.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }

  const currentTrack = currentIdx !== null ? tracks[currentIdx] : null;

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-28 pb-32 container mx-auto px-4">
          <div className="text-center mb-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/60 text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4">
              <Music className="w-3.5 h-3.5" /> Playlist Soberana
            </div>
            <h1 className="font-display text-4xl md:text-5xl mb-4">Música por Donación</h1>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
              La música disponible en esta plataforma se ofrece con el objetivo de generar
              <strong> donaciones voluntarias desde MX$25</strong> (50, 100, 150, 200, 500, 1,000 u otra cantidad).
              Estas aportaciones sostienen los costos operativos de RDM Digital. Gracias por apoyar el proyecto.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <Button onClick={() => setDonateOpen(true)} className="rounded-full">
                <Heart className="w-4 h-4 mr-2" /> Donar ahora
              </Button>
              {isAdmin && (
                <Button variant="outline" onClick={() => setUploadOpen(true)} className="rounded-full">
                  <Upload className="w-4 h-4 mr-2" /> Subir pista
                </Button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>
          ) : tracks.length === 0 ? (
            <Card className="max-w-xl mx-auto">
              <CardContent className="py-12 text-center text-muted-foreground">
                <Music className="w-10 h-10 mx-auto mb-3 opacity-50" />
                Aún no hay pistas publicadas. {isAdmin && "Sube la primera desde el botón superior."}
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {paged.map((t, i) => {
                  const globalIdx = (page - 1) * PAGE_SIZE + i;
                  const isCurrent = currentIdx === globalIdx;
                  return (
                    <Card key={t.id} className={`group transition ${isCurrent ? "border-primary shadow-lg" : ""}`}>
                      <CardHeader className="pb-3">
                        <div className="aspect-square rounded-lg bg-gradient-to-br from-primary/20 via-accent/10 to-muted flex items-center justify-center mb-3 relative overflow-hidden">
                          {t.cover_url ? (
                            <img src={t.cover_url} alt={t.title} className="w-full h-full object-cover" />
                          ) : (
                            <Music className="w-12 h-12 text-primary/60" />
                          )}
                          <button
                            onClick={() => isCurrent ? togglePlay() : handlePlay(t, globalIdx)}
                            className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                          >
                            <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                              {isCurrent && playing ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                            </div>
                          </button>
                        </div>
                        <CardTitle className="text-base truncate">{t.title}</CardTitle>
                        <p className="text-xs text-muted-foreground truncate">{t.artist}</p>
                      </CardHeader>
                      <CardContent className="pt-0 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{t.play_count} reproducciones</span>
                        <button onClick={() => { setActiveTrackForDonation(t); setDonateOpen(true); }} className="inline-flex items-center gap-1 hover:text-primary">
                          <Heart className="w-3.5 h-3.5" /> Apoyar
                        </button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="mt-8">
                <ElegantPagination page={page - 1} totalPages={totalPages} onChange={(p) => setPage(p + 1)} />
              </div>
            </>
          )}
        </main>

        {/* Sticky player */}
        {currentTrack && (
          <div className="fixed bottom-0 inset-x-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur-xl">
            <div className="container mx-auto px-4 py-3 flex items-center gap-4">
              <div className="w-12 h-12 rounded-md bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Music className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{currentTrack.title}</p>
                <p className="text-xs text-muted-foreground truncate">{currentTrack.artist}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost" onClick={prev}><SkipBack className="w-4 h-4" /></Button>
                <Button size="icon" onClick={togglePlay} className="rounded-full">
                  {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </Button>
                <Button size="icon" variant="ghost" onClick={next}><SkipForward className="w-4 h-4" /></Button>
                <Button size="sm" variant="outline" onClick={() => setDonateOpen(true)} className="ml-2 hidden md:inline-flex">
                  <Heart className="w-3.5 h-3.5 mr-1.5" /> Donar
                </Button>
              </div>
              <audio
                ref={audioRef}
                onEnded={next}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                className="hidden"
              />
            </div>
          </div>
        )}

        {/* Donation dialog */}
        <Dialog open={donateOpen} onOpenChange={setDonateOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">Apoya con una donación</DialogTitle>
              <DialogDescription className="leading-relaxed">
                La música que escuchas en esta plataforma se ofrece con el fin de generar donaciones que ayudan a sostener
                los costos de RDM Digital. <strong>Monto mínimo: MX$25.</strong> Elige una cantidad o ingresa la tuya.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-4 gap-2 my-4">
              {DONATION_AMOUNTS.map((a) => (
                <Button
                  key={a}
                  type="button"
                  variant={donateAmount === a && !customAmount ? "default" : "outline"}
                  onClick={() => { setDonateAmount(a); setCustomAmount(""); }}
                >
                  ${a}
                </Button>
              ))}
            </div>
            <div className="space-y-2">
              <Label htmlFor="otra">Otra cantidad (MXN)</Label>
              <Input
                id="otra" type="number" min={25} placeholder="Mínimo 25"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
              />
            </div>
            <DialogFooter className="mt-4">
              <Button variant="ghost" onClick={() => setDonateOpen(false)}>Cancelar</Button>
              <Button onClick={handleDonate} disabled={donating}>
                {donating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Heart className="w-4 h-4 mr-2" />}
                Donar ${customAmount || donateAmount} MXN
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Admin upload dialog */}
        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Subir nueva pista</DialogTitle>
              <DialogDescription>Solo administradores. Formatos: mp3, wav, m4a, ogg.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div><Label>Título *</Label><Input value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} /></div>
              <div><Label>Artista</Label><Input value={uploadArtist} onChange={(e) => setUploadArtist(e.target.value)} /></div>
              <div><Label>Descripción</Label><Textarea value={uploadDesc} onChange={(e) => setUploadDesc(e.target.value)} /></div>
              <div>
                <Label>Archivo de audio *</Label>
                <Input type="file" accept="audio/*" onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setUploadOpen(false)}>Cancelar</Button>
              <Button onClick={handleUpload} disabled={uploading}>
                {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                Publicar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Footer />
      </div>
    </PageTransition>
  );
}
