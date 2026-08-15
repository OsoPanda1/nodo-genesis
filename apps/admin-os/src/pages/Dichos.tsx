import { useEffect, useMemo, useState } from "react";
import { ElegantPagination } from "@/components/ElegantPagination";

const PAGE_SIZE_DICHOS = 12;
import { motion, AnimatePresence } from "framer-motion";
import {
  Quote,
  Heart,
  Lightbulb,
  Search,
  Share2,
  MapPin,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

const CATEGORIES = [
  { id: "all", label: "Todos", icon: "✨" },
  { id: "PERSONAJES", label: "Personajes", icon: "👤" },
  { id: "BRINDIS", label: "Brindis", icon: "🥂" },
  { id: "HUMOR", label: "Humor", icon: "🎭" },
  { id: "FAMILIA", label: "Familia", icon: "👥" },
  { id: "COMIDA_BEBIDA", label: "Comida y Bebida", icon: "🍷" },
  { id: "TRABAJO", label: "Trabajo", icon: "⚙️" },
  { id: "VIDA_COTIDIANA", label: "Vida Cotidiana", icon: "🏛️" },
  { id: "MINERIA", label: "Minería", icon: "💎" },
];

const DICHOS = [
  {
    id: "1",
    personaje: "Agustín Hernández",
    texto: "Estás Agustín Hernández",
    significado: "Estás débil",
    jergaOriginal: "Estás Agustín Hernández",
    categoria: "VIDA_COTIDIANA",
    likes: 156,
  },
  {
    id: "2",
    personaje: "Alberto Rivera",
    texto: "Vamos a hacer los Alberto Rivera",
    significado: "Vamos a hacer los ejercicios",
    jergaOriginal: "Vamos a hacer los Alberto Rivera",
    categoria: "TRABAJO",
    likes: 89,
  },
  {
    id: "3",
    personaje: "Amalia",
    texto: "Andas Amalia",
    significado: "Andas caliente",
    jergaOriginal: "Andas Amalia",
    categoria: "HUMOR",
    likes: 234,
  },
  {
    id: "4",
    personaje: "Aurelia Melgarejo",
    texto: "Ya estamos todas las Aurelia Melgarejo",
    significado: "Ya estamos todas las muchachas (usado para viejitas)",
    jergaOriginal: "Ya estamos todas las Aurelia Melgarejo",
    categoria: "FAMILIA",
    likes: 178,
  },
  {
    id: "5",
    personaje: "Braulia Rutas",
    texto: "Ponme para mi Braulia Rutas",
    significado: "Ponme para mi desayuno",
    jergaOriginal: "Ponme para mi Braulia Rutas",
    categoria: "COMIDA_BEBIDA",
    likes: 145,
  },
];

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariant = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 100, damping: 15 },
  },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

const DichosPage = () => {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSaid, setExpandedSaid] = useState<string | null>(null);
  const [likedDichos, setLikedDichos] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);

  const filteredDichos = useMemo(() => DICHOS.filter((dicho) => {
    const matchesCategory =
      selectedCategory === "all" || dicho.categoria === selectedCategory;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      dicho.texto.toLowerCase().includes(query) ||
      dicho.personaje.toLowerCase().includes(query) ||
      dicho.significado.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  }), [selectedCategory, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredDichos.length / PAGE_SIZE_DICHOS));
  useEffect(() => { if (page >= totalPages) setPage(0); }, [page, totalPages]);
  useEffect(() => { setPage(0); }, [selectedCategory, searchQuery]);
  const pagedDichos = filteredDichos.slice(page * PAGE_SIZE_DICHOS, (page + 1) * PAGE_SIZE_DICHOS);

  const handleLike = (id: string) => {
    setLikedDichos((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
        toast({
          title: "Nodo Guardado",
          description: "Añadido a tu memoria criptográfica.",
        });
      }
      return newSet;
    });
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#FDFCFB] text-slate-800 font-sans selection:bg-slate-200">
        <Navbar />

        <div className="relative h-[65vh] min-h-[500px] overflow-hidden flex items-center justify-center bg-gradient-to-b from-[#F5F5F0] to-[#FDFCFB]">
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[120vw] h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(215,220,225,0.4)_0%,transparent_70%)] pointer-events-none"
          />
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay z-0" />

          <div className="container relative z-20 mx-auto px-4 md:px-8 pt-24 flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.25, 0.8, 0.25, 1] }}
              className="max-w-4xl flex flex-col items-center"
            >
              <Badge
                variant="outline"
                className="mb-8 border border-slate-200/50 bg-white/50 backdrop-blur-xl text-slate-500 px-5 py-2 rounded-full tracking-[0.2em] text-[10px] uppercase shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex items-center gap-2"
              >
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Archivo Lingüístico | Operación Soberanía
              </Badge>

              <h1 className="text-5xl md:text-7xl lg:text-8xl font-extralight tracking-tighter mb-6 text-slate-800 leading-tight">
                Voces del{" "}
                <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-br from-slate-400 via-slate-600 to-slate-400 drop-shadow-sm">
                  Real
                </span>
              </h1>

              <p className="text-lg md:text-2xl text-slate-500 font-light leading-relaxed max-w-2xl mb-12 opacity-90">
                La identidad de la montaña codificada en 47 expresiones
                atemporales. Un ecosistema lingüístico preservado en alta
                fidelidad.
              </p>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-8 relative z-30 -mt-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-col md:flex-row gap-4 p-3 rounded-3xl bg-white/70 border border-white/80 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] mx-auto max-w-5xl"
          >
            <div className="flex-1 relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-slate-600 transition-colors" />
              <Input
                placeholder="Escanear registro o significado..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-14 h-14 bg-transparent border-none text-slate-700 placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0 text-lg font-light w-full"
              />
            </div>
            <div className="w-[1px] bg-slate-200/50 hidden md:block my-2" />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[280px] h-14 bg-transparent border-none text-slate-600 font-light focus:ring-0 focus:ring-offset-0 text-lg px-5">
                <SelectValue placeholder="Clasificación" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 border-slate-100 backdrop-blur-xl rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.1)]">
                {CATEGORIES.map((cat) => (
                  <SelectItem
                    key={cat.id}
                    value={cat.id}
                    className="focus:bg-slate-50 py-3 cursor-pointer"
                  >
                    <span className="flex items-center gap-3 text-base">
                      <span className="opacity-80">{cat.icon}</span>
                      <span className="font-light tracking-wide">{cat.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>
        </div>

        <div className="container mx-auto px-4 md:px-8 py-20 relative z-20">
          <section className="mb-24">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: "Personajes Mapeados", value: DICHOS.length },
                { label: "Taxonomías", value: CATEGORIES.length - 1 },
                { label: "Años de Herencia", value: "200+" },
                { label: "Registros Únicos", value: "47" },
              ].map((stat, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  key={stat.label}
                  className="p-8 rounded-3xl bg-white/40 border border-slate-100/50 backdrop-blur-lg text-center relative overflow-hidden group hover:bg-white/60 transition-all duration-500 shadow-[0_8px_30px_rgba(0,0,0,0.02)]"
                >
                  <p className="text-4xl md:text-5xl font-extralight text-slate-700 mb-3 relative z-10">
                    {stat.value}
                  </p>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400 font-medium relative z-10">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-10 px-2">
              <h2 className="text-2xl font-light tracking-wide text-slate-700 flex items-center gap-3">
                {selectedCategory === "all" ? (
                  "Directorio Completo"
                ) : (
                  <>
                    {CATEGORIES.find((c) => c.id === selectedCategory)?.icon}{" "}
                    {CATEGORIES.find((c) => c.id === selectedCategory)?.label}
                  </>
                )}
              </h2>
              <span className="text-xs font-medium text-slate-400 tracking-[0.2em] uppercase bg-slate-100 px-3 py-1 rounded-full">
                {filteredDichos.length} Nodos
              </span>
            </div>

            {filteredDichos.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-32 bg-white/40 border border-slate-100 rounded-3xl backdrop-blur-md"
              >
                <Search className="w-12 h-12 mx-auto mb-6 text-slate-200" />
                <p className="text-slate-500 font-light text-xl">
                  No existen registros bajo esos parámetros de búsqueda.
                </p>
              </motion.div>
            ) : (
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                <AnimatePresence mode="popLayout">
                  {pagedDichos.map((dicho) => (
                    <motion.div
                      variants={cardVariant}
                      layout="position"
                      key={dicho.id}
                      className="group"
                    >
                      <Card
                        className={`h-full cursor-pointer transition-all duration-500 rounded-3xl overflow-hidden relative
                          ${
                            expandedSaid === dicho.id
                              ? "bg-white shadow-[0_30px_60px_rgba(0,0,0,0.08)] border-slate-300 scale-[1.02] z-10"
                              : "bg-white/50 backdrop-blur-xl border-slate-200/60 hover:border-slate-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] hover:-translate-y-1"
                          }`}
                        onClick={() =>
                          setExpandedSaid(expandedSaid === dicho.id ? null : dicho.id)
                        }
                      >
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                        <CardContent className="p-8">
                          <div className="flex justify-between items-start mb-6">
                            <Badge
                              variant="outline"
                              className="bg-slate-50/50 border-slate-200 text-slate-500 font-medium tracking-widest text-[10px] uppercase px-3 py-1 rounded-full"
                            >
                              {dicho.personaje}
                            </Badge>
                            <Quote className="w-5 h-5 text-slate-200 group-hover:text-slate-400 transition-colors duration-500" />
                          </div>

                          <h3 className="text-xl md:text-2xl font-light text-slate-800 mb-4 leading-snug">
                            "{dicho.texto}"
                          </h3>

                          <AnimatePresence>
                            {expandedSaid === dicho.id ? (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{
                                  duration: 0.4,
                                  ease: [0.25, 0.8, 0.25, 1],
                                }}
                                className="overflow-hidden"
                              >
                                <div className="mt-6 pt-6 border-t border-slate-100 space-y-5">
                                  <div>
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-medium mb-2">
                                      Jerga Original
                                    </p>
                                    <p className="font-mono text-sm text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                      {dicho.jergaOriginal}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-medium mb-2">
                                      Decodificación
                                    </p>
                                    <p className="text-base font-light text-slate-600 leading-relaxed">
                                      {dicho.significado}
                                    </p>
                                  </div>
                                </div>
                              </motion.div>
                            ) : (
                              <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-base font-light text-slate-500 line-clamp-2"
                              >
                                {dicho.significado}
                              </motion.p>
                            )}
                          </AnimatePresence>

                          <div
                            className={`flex items-center justify-between transition-all duration-500 ${
                              expandedSaid === dicho.id
                                ? "mt-8 pt-6 border-t border-slate-100"
                                : "mt-8"
                            }`}
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLike(dicho.id);
                              }}
                              className="flex items-center gap-2 text-sm font-light text-slate-500 hover:text-slate-800 transition-colors group/btn"
                            >
                              <Heart
                                className={`w-5 h-5 transition-all duration-300 ${
                                  likedDichos.has(dicho.id)
                                    ? "fill-slate-800 text-slate-800 scale-110"
                                    : "group-hover/btn:fill-slate-200"
                                }`}
                              />
                              {dicho.likes + (likedDichos.has(dicho.id) ? 1 : 0)}
                            </button>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-medium text-slate-400 tracking-[0.2em] uppercase flex items-center gap-2">
                                {CATEGORIES.find((c) => c.id === dicho.categoria)?.icon}
                              </span>
                              <button className="text-slate-400 hover:text-slate-800 transition-colors p-2 rounded-full hover:bg-slate-100">
                                <Share2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}

            <ElegantPagination
              page={page}
              totalPages={totalPages}
              onChange={(p) => { setPage(p); window.scrollTo({ top: 400, behavior: "smooth" }); }}
              variant="numeric"
            />
          </section>

          <section className="mt-32">
            <Card className="bg-gradient-to-br from-[#FDFCFB] via-white to-[#F5F5F0] border border-slate-200 shadow-[0_20px_60px_rgba(0,0,0,0.03)] overflow-hidden relative rounded-[3rem]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(200,210,220,0.2)_0%,transparent_60%)] pointer-events-none" />
              <CardContent className="p-16 md:p-24 text-center relative z-10">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-slate-100 shadow-sm">
                  <Lightbulb className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-3xl md:text-5xl font-light text-slate-800 mb-6 tracking-tight">
                  Expande el Registro Histórico
                </h3>
                <p className="text-lg text-slate-500 font-light mb-10 max-w-2xl mx-auto leading-relaxed">
                  ¿Posees conocimiento de un nodo lingüístico no catalogado?
                  Contribuye a la preservación del patrimonio inmaterial de la
                  montaña.
                </p>
                <Button className="h-14 px-10 bg-slate-800 hover:bg-slate-900 text-white font-light tracking-wide rounded-full transition-all duration-300 shadow-[0_10px_30px_rgba(15,23,42,0.15)] hover:shadow-[0_15px_40px_rgba(15,23,42,0.25)] hover:-translate-y-1 text-lg">
                  Someter Dato al Sistema
                </Button>
              </CardContent>
            </Card>
          </section>
        </div>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default DichosPage;
