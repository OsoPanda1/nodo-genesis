import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Globe, Server, Cpu, Shield, Clock, Zap, Database, Radio,
  ArrowRight, Activity, GitBranch, Layers
} from "lucide-react";

interface DataStream {
  id: string;
  source_repo: string;
  federation: string;
  stream_type: string;
  payload: {
    role: string;
    modules: string[];
    contribution?: string;
    stack?: string;
  };
  integrity_hash: string;
  sync_status: string;
  upstream_repo: string | null;
  downstream_repo: string | null;
  last_synced_at: string;
}

const FEDERATION_ICONS: Record<string, typeof Globe> = {
  DEKATEOTL: Shield,
  ANUBIS: Shield,
  BOOKPI: Database,
  PHOENIX: Zap,
  MDD_TAMV: Globe,
  KAOS: Radio,
  CHRONOS: Clock,
};

const FEDERATION_COLORS: Record<string, string> = {
  DEKATEOTL: "from-amber-500 to-orange-600",
  ANUBIS: "from-purple-600 to-violet-800",
  BOOKPI: "from-emerald-500 to-teal-700",
  PHOENIX: "from-red-500 to-rose-700",
  MDD_TAMV: "from-blue-500 to-cyan-700",
  KAOS: "from-pink-500 to-fuchsia-700",
  CHRONOS: "from-slate-500 to-zinc-700",
};

export default function Federation() {
  const [streams, setStreams] = useState<DataStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStream, setActiveStream] = useState<string | null>(null);
  const [pulseIndex, setPulseIndex] = useState(0);

  useEffect(() => {
    const fetchStreams = async () => {
      const { data, error } = await supabase.functions.invoke("federation-pulse", { body: {} });

      if (!error && data?.modules) {
        setStreams(data.modules as unknown as DataStream[]);
      }
      setLoading(false);
    };
    fetchStreams();
    const interval = window.setInterval(fetchStreams, 30000);
    return () => window.clearInterval(interval);
  }, []);

  // Animate the pulse flowing through the chain
  useEffect(() => {
    if (streams.length === 0) return;
    const interval = setInterval(() => {
      setPulseIndex((prev) => (prev + 1) % streams.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [streams.length]);

  const totalModules = streams.reduce(
    (acc, s) => acc + (s.payload?.modules?.length || 0), 0
  );

  const uniqueFederations = [...new Set(streams.map((s) => s.federation))];

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Cpu className="h-12 w-12 text-primary" />
          </motion.div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <section className="py-16 px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <GitBranch className="h-8 w-8 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Cadena Viva de Datos
              </h1>
            </div>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Repositorios relacionados con RDM Digital, Smart City y Digital Twins formando un circuito vivo de datos.
              Cada repo alimenta al siguiente en una cadena heptafederada soberana.
            </p>
          </motion.div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            {[
              { label: "Repos conectados", value: streams.length, icon: Server },
              { label: "Módulos activos", value: totalModules, icon: Layers },
              { label: "Federaciones", value: uniqueFederations.length, icon: Globe },
              { label: "Estado", value: "ACTIVO", icon: Activity },
            ].map((stat) => (
              <Card key={stat.label} className="bg-card/50 border-border/50 backdrop-blur-sm">
                <CardContent className="flex items-center gap-3 p-4">
                  <stat.icon className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Living Chain Visualization */}
        <section className="px-4 pb-16 max-w-6xl mx-auto">
          <div className="relative">
            {streams.map((stream, index) => {
              const Icon = FEDERATION_ICONS[stream.federation] || Globe;
              const gradientClass = FEDERATION_COLORS[stream.federation] || "from-gray-500 to-gray-700";
              const isPulsing = index === pulseIndex;
              const isActive = activeStream === stream.id;

              return (
                <motion.div
                  key={stream.id}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="relative"
                >
                  {/* Connection line */}
                  {index < streams.length - 1 && (
                    <div className="flex justify-center py-2">
                      <motion.div
                        className="flex flex-col items-center"
                        animate={isPulsing ? { scale: [1, 1.3, 1] } : {}}
                        transition={{ duration: 0.6 }}
                      >
                        <div className={`w-0.5 h-8 ${isPulsing ? "bg-primary" : "bg-border"} transition-colors duration-300`} />
                        <ArrowRight className={`h-4 w-4 rotate-90 ${isPulsing ? "text-primary" : "text-muted-foreground"} transition-colors duration-300`} />
                      </motion.div>
                    </div>
                  )}

                  {/* Stream Card */}
                  <Card
                    className={`cursor-pointer transition-all duration-300 border-border/50 ${
                      isPulsing ? "ring-2 ring-primary shadow-lg shadow-primary/20" : ""
                    } ${isActive ? "scale-[1.02]" : ""}`}
                    onClick={() => setActiveStream(isActive ? null : stream.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${gradientClass}`}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-base font-semibold">
                              {stream.source_repo}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">
                              {stream.stream_type.replace(/_/g, " ")} · {(stream as any).latency_ms ?? "—"}ms
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {stream.federation}
                          </Badge>
                          <Badge className="bg-emerald-500/20 text-emerald-400 text-xs border-0">
                            {(stream as any).pulse ?? stream.sync_status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>

                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <CardContent className="pt-2 border-t border-border/30">
                            <p className="text-sm text-muted-foreground mb-3">
                              <strong>Rol:</strong> {stream.payload?.role?.replace(/_/g, " ")}
                            </p>
                            {stream.payload?.contribution && (
                              <p className="text-sm text-muted-foreground mb-3">
                                {stream.payload.contribution}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-1.5">
                              {stream.payload?.modules?.map((mod) => (
                                <Badge
                                  key={mod}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {mod}
                                </Badge>
                              ))}
                            </div>
                            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                              {stream.upstream_repo && (
                                <span>← desde <strong>{stream.upstream_repo}</strong></span>
                              )}
                              {stream.downstream_repo && (
                                <span>→ hacia <strong>{stream.downstream_repo}</strong></span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground/60 mt-2 font-mono">
                              hash: {stream.integrity_hash}
                            </p>
                          </CardContent>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>

                  {/* Circular indicator for last item connecting back */}
                  {index === streams.length - 1 && (
                    <div className="flex justify-center py-4">
                      <motion.div
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="flex items-center gap-2 text-xs text-primary"
                      >
                        <ArrowRight className="h-3 w-3 rotate-90" />
                        <span className="font-mono">↻ Ciclo completo → rdm-digital-2dbd42b0</span>
                      </motion.div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
