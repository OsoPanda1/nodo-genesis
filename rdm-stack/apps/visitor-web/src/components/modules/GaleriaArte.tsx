/**
 * Galería de Arte TAMV
 * Triple Federado: Conceptual | Legal | Técnico
 */

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Palette,
  Heart,
  Eye,
  ShoppingCart,
  Filter,
  Grid,
  List,
  Sparkles,
  Shield,
  Image as ImageIcon,
} from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Artwork {
  id: string;
  title: string;
  artist: string;
  artistAvatar: string;
  imageUrl: string;
  price: number;
  likes: number;
  views: number;
  category: string;
  isNFT: boolean;
  federationHash: string;
}

const MOCK_ARTWORKS: Artwork[] = [
  {
    id: "1",
    title: "Sueños Cósmicos",
    artist: "Luna Digital",
    artistAvatar: "/placeholder.svg",
    imageUrl: "/placeholder.svg",
    price: 450,
    likes: 1234,
    views: 5678,
    category: "Digital",
    isNFT: true,
    federationHash: "TF-ART001",
  },
  {
    id: "2",
    title: "Metaverso Infinito",
    artist: "Anubis Art",
    artistAvatar: "/placeholder.svg",
    imageUrl: "/placeholder.svg",
    price: 780,
    likes: 2345,
    views: 8901,
    category: "3D",
    isNFT: true,
    federationHash: "TF-ART002",
  },
  {
    id: "3",
    title: "Aurora Boreal Digital",
    artist: "Pixel Dreams",
    artistAvatar: "/placeholder.svg",
    imageUrl: "/placeholder.svg",
    price: 320,
    likes: 890,
    views: 3456,
    category: "Paisaje",
    isNFT: false,
    federationHash: "TF-ART003",
  },
  {
    id: "4",
    title: "Ciudades del Futuro",
    artist: "Tech Visionary",
    artistAvatar: "/placeholder.svg",
    imageUrl: "/placeholder.svg",
    price: 1200,
    likes: 3456,
    views: 12000,
    category: "Arquitectura",
    isNFT: true,
    federationHash: "TF-ART004",
  },
  {
    id: "5",
    title: "Isabella Portrait",
    artist: "TAMV Studios",
    artistAvatar: "/placeholder.svg",
    imageUrl: "/placeholder.svg",
    price: 2500,
    likes: 5678,
    views: 25000,
    category: "Retrato",
    isNFT: true,
    federationHash: "TF-ART005",
  },
  {
    id: "6",
    title: "Ondas Cuánticas",
    artist: "Quantum Artist",
    artistAvatar: "/placeholder.svg",
    imageUrl: "/placeholder.svg",
    price: 650,
    likes: 1567,
    views: 6789,
    category: "Abstracto",
    isNFT: false,
    federationHash: "TF-ART006",
  },
];

const CATEGORIES = ["Todos", "Digital", "3D", "Paisaje", "Retrato", "Abstracto", "Arquitectura"];

const GaleriaArte = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [sortBy, setSortBy] = useState("popular");
  const [searchQuery, setSearchQuery] = useState("");
  const [likedArtworks, setLikedArtworks] = useState<string[]>([]);

  const filteredArtworks = MOCK_ARTWORKS.filter(
    (art) => selectedCategory === "Todos" || art.category === selectedCategory,
  ).filter(
    (art) =>
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.artist.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const toggleLike = (id: string) => {
    setLikedArtworks((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 flex items-center justify-center">
            <Palette className="w-8 h-8 text-pink-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Galería de Arte TAMV</h1>
            <p className="text-muted-foreground">
              Descubre y colecciona arte digital · Triple Federado
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { label: "Obras disponibles", value: "12,500+" },
            { label: "Artistas activos", value: "3,200+" },
            { label: "NFTs creados", value: "45K+" },
            { label: "Volumen total", value: "2.5M TAU" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-card/50">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Input
          placeholder="Buscar obras o artistas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="md:w-64"
        />

        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {CATEGORIES.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        <div className="flex gap-2 ml-auto">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Más popular</SelectItem>
              <SelectItem value="recent">Más reciente</SelectItem>
              <SelectItem value="price-low">Precio: Menor</SelectItem>
              <SelectItem value="price-high">Precio: Mayor</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex border border-border rounded-md">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div
        className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
      >
        {filteredArtworks.map((artwork, index) => (
          <motion.div
            key={artwork.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="overflow-hidden group cursor-pointer hover:shadow-xl transition-all">
              {/* Image */}
              <div className="relative aspect-square bg-gradient-to-br from-pink-500/10 to-purple-500/10 flex items-center justify-center overflow-hidden">
                <ImageIcon className="w-20 h-20 text-muted-foreground/20" />

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="sm" variant="secondary">
                    <Eye className="w-4 h-4 mr-1" />
                    Ver
                  </Button>
                  <Button size="sm">
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    Comprar
                  </Button>
                </div>

                {/* NFT Badge */}
                {artwork.isNFT && (
                  <Badge className="absolute top-3 left-3 bg-purple-600">
                    <Sparkles className="w-3 h-3 mr-1" />
                    NFT
                  </Badge>
                )}

                {/* Like Button */}
                <Button
                  size="sm"
                  variant="ghost"
                  className={`absolute top-3 right-3 ${likedArtworks.includes(artwork.id) ? "text-red-500" : "text-white"}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLike(artwork.id);
                  }}
                >
                  <Heart
                    className={`w-5 h-5 ${likedArtworks.includes(artwork.id) ? "fill-current" : ""}`}
                  />
                </Button>
              </div>

              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold line-clamp-1">{artwork.title}</h3>
                    <p className="text-sm text-muted-foreground">{artwork.artist}</p>
                  </div>
                  <Badge variant="outline">{artwork.category}</Badge>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      {artwork.likes.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {artwork.views.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-4 pt-0 flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{artwork.price.toLocaleString()} TAU</p>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Shield className="w-3 h-3" />
                    <span className="font-mono">{artwork.federationHash}</span>
                  </div>
                </div>
                <Button size="sm">
                  <ShoppingCart className="w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredArtworks.length === 0 && (
        <Card className="p-12 text-center">
          <Palette className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-bold mb-2">No se encontraron obras</h3>
          <p className="text-muted-foreground">Intenta con otros filtros o términos de búsqueda</p>
        </Card>
      )}
    </div>
  );
};

export default GaleriaArte;
