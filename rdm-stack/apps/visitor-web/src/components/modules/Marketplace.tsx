/**
 * Marketplace TAMV
 * Triple Federado: Conceptual | Legal | Técnico
 */

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  Search,
  Filter,
  Star,
  ShoppingCart,
  Heart,
  Truck,
  Shield,
  Clock,
  Tag,
  TrendingUp,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Product {
  id: string;
  title: string;
  description: string;
  seller: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  category: string;
  isDigital: boolean;
  isAuction: boolean;
  auctionEndsAt?: string;
  currentBid?: number;
  federationHash: string;
  imageUrl: string;
}

const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    title: "Pack de Avatares Premium",
    description: "50 avatares exclusivos para tu perfil TAMV",
    seller: "TAMV Store",
    price: 150,
    rating: 4.9,
    reviews: 1234,
    category: "Digital",
    isDigital: true,
    isAuction: false,
    federationHash: "TF-MKT001",
    imageUrl: "/placeholder.svg",
  },
  {
    id: "2",
    title: "DreamSpace Template - Galaxia",
    description: "Plantilla 3D lista para personalizar tu espacio",
    seller: "Space Creators",
    price: 280,
    originalPrice: 350,
    rating: 4.8,
    reviews: 567,
    category: "Templates",
    isDigital: true,
    isAuction: false,
    federationHash: "TF-MKT002",
    imageUrl: "/placeholder.svg",
  },
  {
    id: "3",
    title: "Colección NFT Génesis",
    description: "Los primeros 100 NFTs de la colección fundadora",
    seller: "Anubis Arts",
    price: 1500,
    rating: 5.0,
    reviews: 89,
    category: "NFT",
    isDigital: true,
    isAuction: true,
    auctionEndsAt: new Date(Date.now() + 86400000 * 3).toISOString(),
    currentBid: 1850,
    federationHash: "TF-MKT003",
    imageUrl: "/placeholder.svg",
  },
  {
    id: "4",
    title: "Curso Premium: Creación XR",
    description: "Aprende a crear experiencias de realidad extendida",
    seller: "Universidad TAMV",
    price: 450,
    rating: 4.7,
    reviews: 2345,
    category: "Educación",
    isDigital: true,
    isAuction: false,
    federationHash: "TF-MKT004",
    imageUrl: "/placeholder.svg",
  },
  {
    id: "5",
    title: "Mascota Digital - Dragón Cósmico",
    description: "Mascota interactiva con IA integrada",
    seller: "Pet Universe",
    price: 320,
    rating: 4.9,
    reviews: 890,
    category: "Mascotas",
    isDigital: true,
    isAuction: false,
    federationHash: "TF-MKT005",
    imageUrl: "/placeholder.svg",
  },
  {
    id: "6",
    title: "Pack de Efectos de Audio 3D",
    description: "200+ efectos de sonido espacializados",
    seller: "Kaos Audio",
    price: 85,
    originalPrice: 120,
    rating: 4.6,
    reviews: 456,
    category: "Audio",
    isDigital: true,
    isAuction: false,
    federationHash: "TF-MKT006",
    imageUrl: "/placeholder.svg",
  },
];

const CATEGORIES = ["Todos", "Digital", "NFT", "Templates", "Educación", "Audio", "Mascotas"];

const Marketplace = () => {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [activeTab, setActiveTab] = useState("products");
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cart, setCart] = useState<string[]>([]);

  const filteredProducts = MOCK_PRODUCTS.filter(
    (p) => selectedCategory === "Todos" || p.category === selectedCategory,
  ).filter((p) => p.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const auctionProducts = MOCK_PRODUCTS.filter((p) => p.isAuction);

  const toggleWishlist = (id: string) => {
    setWishlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const addToCart = (id: string) => {
    setCart((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const getTimeRemaining = (endDate: string) => {
    const diff = new Date(endDate).getTime() - Date.now();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h`;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 text-orange-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Marketplace TAMV</h1>
              <p className="text-muted-foreground">
                Compra y vende en el metaverso · Triple Federado
              </p>
            </div>
          </div>

          <Button variant="outline" className="relative">
            <ShoppingCart className="w-5 h-5" />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { icon: ShoppingBag, label: "Productos", value: "25K+" },
            { icon: TrendingUp, label: "Ventas hoy", value: "1,234" },
            { icon: Tag, label: "Ofertas activas", value: "156" },
            { icon: Clock, label: "Subastas activas", value: "45" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-card/50">
                <CardContent className="p-4 flex items-center gap-3">
                  <stat.icon className="w-8 h-8 text-primary/70" />
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="products">Productos</TabsTrigger>
          <TabsTrigger value="auctions">Subastas</TabsTrigger>
          <TabsTrigger value="wishlist">
            Lista de deseos
            {wishlist.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {wishlist.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 md:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

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

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Ordenar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Más popular</SelectItem>
                <SelectItem value="recent">Más reciente</SelectItem>
                <SelectItem value="price-low">Precio: Menor</SelectItem>
                <SelectItem value="price-high">Precio: Mayor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden group">
                  {/* Image */}
                  <div className="relative aspect-video bg-gradient-to-br from-orange-500/10 to-red-500/10 flex items-center justify-center">
                    <ShoppingBag className="w-16 h-16 text-muted-foreground/20" />

                    {/* Discount Badge */}
                    {product.originalPrice && (
                      <Badge className="absolute top-3 left-3 bg-red-500">
                        -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                      </Badge>
                    )}

                    {/* Digital Badge */}
                    {product.isDigital && (
                      <Badge className="absolute top-3 right-3" variant="secondary">
                        Digital
                      </Badge>
                    )}

                    {/* Wishlist Button */}
                    <Button
                      size="sm"
                      variant="ghost"
                      className={`absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity ${
                        wishlist.includes(product.id) ? "text-red-500" : ""
                      }`}
                      onClick={() => toggleWishlist(product.id)}
                    >
                      <Heart
                        className={`w-5 h-5 ${wishlist.includes(product.id) ? "fill-current" : ""}`}
                      />
                    </Button>
                  </div>

                  <CardContent className="p-4">
                    <h3 className="font-bold line-clamp-1 mb-1">{product.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {product.description}
                    </p>

                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span>{product.rating}</span>
                      </div>
                      <span className="text-muted-foreground">
                        ({product.reviews.toLocaleString()} reseñas)
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground mt-2">Vendedor: {product.seller}</p>
                  </CardContent>

                  <CardFooter className="p-4 pt-0 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold">{product.price} TAU</span>
                        {product.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            {product.originalPrice} TAU
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Shield className="w-3 h-3" />
                        <span className="font-mono">{product.federationHash}</span>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => addToCart(product.id)}>
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      Comprar
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="auctions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {auctionProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="relative aspect-video bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center">
                  <ShoppingBag className="w-16 h-16 text-muted-foreground/20" />
                  <Badge className="absolute top-3 left-3 bg-purple-600">
                    <Clock className="w-3 h-3 mr-1" />
                    Subasta
                  </Badge>
                </div>

                <CardContent className="p-4">
                  <h3 className="font-bold mb-2">{product.title}</h3>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Puja actual:</span>
                      <span className="font-bold text-purple-500">{product.currentBid} TAU</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Precio inicial:</span>
                      <span>{product.price} TAU</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Termina en:</span>
                      <span className="text-orange-500 font-mono">
                        {product.auctionEndsAt && getTimeRemaining(product.auctionEndsAt)}
                      </span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="p-4 pt-0">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">Hacer puja</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="wishlist" className="space-y-6">
          {wishlist.length === 0 ? (
            <Card className="p-12 text-center">
              <Heart className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-bold mb-2">Tu lista está vacía</h3>
              <p className="text-muted-foreground mb-4">Agrega productos que te interesen</p>
              <Button onClick={() => setActiveTab("products")}>Explorar productos</Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MOCK_PRODUCTS.filter((p) => wishlist.includes(p.id)).map((product) => (
                <Card key={product.id} className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <ShoppingBag className="w-8 h-8 text-muted-foreground/30" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold truncate">{product.title}</h3>
                      <p className="text-lg font-bold text-primary">{product.price} TAU</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button size="sm" onClick={() => addToCart(product.id)}>
                        <ShoppingCart className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => toggleWishlist(product.id)}>
                        <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Marketplace;
