import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Edit,
  Eye,
  EyeOff,
  MapPin,
  Phone,
  Plus,
  Search,
  Star,
  Store,
  Trash2,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

const BUSINESS_CATEGORIES = [
  { value: "GASTRONOMIA", label: "Gastronomía", icon: "🍽️" },
  { value: "HOSPEDAJE", label: "Hospedaje", icon: "🏨" },
  { value: "ARTESANIA", label: "Artesanía", icon: "🎨" },
  { value: "PLATERIA", label: "Platería", icon: "💍" },
  { value: "BAR", label: "Bar", icon: "🍺" },
  { value: "COMERCIO", label: "Comercio", icon: "🏪" },
  { value: "SERVICIOS", label: "Servicios", icon: "🔧" },
  { value: "TURISMO", label: "Turismo", icon: "🗺️" },
  { value: "OTROS", label: "Otros", icon: "📦" },
] as const;

const PRICE_RANGES = [
  { value: "ECONOMICO", label: "Económico ($)" },
  { value: "MODERADO", label: "Moderado ($$)" },
  { value: "CARO", label: "Caro ($$$)" },
  { value: "LUJO", label: "Lujo ($$$$)" },
] as const;

type BusinessCategory = (typeof BUSINESS_CATEGORIES)[number]["value"];
type PriceRange = (typeof PRICE_RANGES)[number]["value"];
type StatusFilter = "all" | "active" | "inactive" | "premium" | "featured" | "pending";
type SortBy = "recent" | "name" | "views" | "rating";

type Business = {
  id: string;
  name: string;
  category: BusinessCategory;
  description: string;
  shortDescription: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  address: string;
  latitude?: number;
  longitude?: number;
  imageUrl: string;
  imageUrl2: string;
  imageUrl3: string;
  videoUrl: string;
  scheduleDisplay: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  isPremium: boolean;
  isVerified: boolean;
  isFeatured: boolean;
  isActive: boolean;
  viewsCount: number;
  rating: number;
  priceRange: PriceRange;
  createdAt: string;
};

type FormData = {
  name: string;
  category: BusinessCategory;
  description: string;
  shortDescription: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  address: string;
  latitude: string;
  longitude: string;
  imageUrl: string;
  imageUrl2: string;
  imageUrl3: string;
  videoUrl: string;
  scheduleDisplay: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  priceRange: PriceRange;
};

type Dito = {
  id: string;
  text: string;
  author: string;
  category: "MINERIA" | "TRADICION" | "HUMOR";
  isPublished: boolean;
};

const STORAGE_KEY = "rdm_admin_businesses_v2";
const DICHOS_STORAGE_KEY = "rdm_admin_dichos_v1";

const initialFormData: FormData = {
  name: "",
  category: "GASTRONOMIA",
  description: "",
  shortDescription: "",
  phone: "",
  whatsapp: "",
  email: "",
  website: "",
  address: "",
  latitude: "",
  longitude: "",
  imageUrl: "",
  imageUrl2: "",
  imageUrl3: "",
  videoUrl: "",
  scheduleDisplay: "",
  facebook: "",
  instagram: "",
  tiktok: "",
  priceRange: "MODERADO",
};

const sampleBusinesses: Business[] = [
  {
    id: "1",
    name: "Pastes El Portal",
    category: "GASTRONOMIA",
    description: "Los pastes más tradicionales de Real del Monte desde 1985. Sabores clásicos y nuevas creaciones.",
    shortDescription: "Tradición pastelera desde 1985",
    phone: "771 123 4567",
    whatsapp: "527711234567",
    email: "contacto@pastelesportal.com",
    website: "https://pastelesportal.com",
    address: "Calle Main #123, Centro",
    latitude: 20.1397,
    longitude: -98.6708,
    imageUrl: "/assets/paste.webp",
    imageUrl2: "/assets/rdm1.jpeg",
    imageUrl3: "/assets/rdm2.jpeg",
    videoUrl: "",
    scheduleDisplay: "Lun-Dom: 9:00 - 20:00",
    facebook: "pastelesportal",
    instagram: "@pastelesportal",
    tiktok: "",
    isPremium: true,
    isVerified: true,
    isFeatured: true,
    isActive: true,
    viewsCount: 1250,
    rating: 4.9,
    priceRange: "MODERADO",
    createdAt: "2025-01-08T12:00:00.000Z",
  },
  {
    id: "2",
    name: "Hotel Real de Minas",
    category: "HOSPEDAJE",
    description: "Hotel boutique en casona colonial restaurada con vista a la montaña.",
    shortDescription: "Casona colonial boutique",
    phone: "771 234 5678",
    whatsapp: "527712345678",
    email: "reservas@hotelrealdeminash.com",
    website: "https://hotelrealdeminash.com",
    address: "Av. Colonial #45",
    latitude: 20.1402,
    longitude: -98.6712,
    imageUrl: "/assets/calles-colonial.webp",
    imageUrl2: "",
    imageUrl3: "",
    videoUrl: "",
    scheduleDisplay: "Check-in: 15:00, Check-out: 12:00",
    facebook: "hotelrealdeminash",
    instagram: "@hotelrealdeminash",
    tiktok: "",
    isPremium: true,
    isVerified: true,
    isFeatured: false,
    isActive: true,
    viewsCount: 890,
    rating: 4.7,
    priceRange: "CARO",
    createdAt: "2025-02-20T12:00:00.000Z",
  },
  {
    id: "3",
    name: "Platería Los Hermanos",
    category: "PLATERIA",
    description: "Joyería artesanal en plata con diseños únicos inspirados en la herencia minera de Real del Monte.",
    shortDescription: "Joyería artesanal en plata",
    phone: "771 345 6789",
    whatsapp: "527713456789",
    email: "ventas@platerialoshermanos.com",
    website: "",
    address: "Calle Artesanal #78",
    latitude: 20.1395,
    longitude: -98.6705,
    imageUrl: "/assets/mina-acosta.webp",
    imageUrl2: "",
    imageUrl3: "",
    videoUrl: "",
    scheduleDisplay: "Lun-Sáb: 10:00 - 19:00",
    facebook: "platerialoshermanos",
    instagram: "@platerialoshermanos",
    tiktok: "",
    isPremium: false,
    isVerified: true,
    isFeatured: false,
    isActive: true,
    viewsCount: 456,
    rating: 4.8,
    priceRange: "MODERADO",
    createdAt: "2025-02-28T12:00:00.000Z",
  },
  {
    id: "4",
    name: "Café La Neblina",
    category: "GASTRONOMIA",
    description: "Café artesanal de altura con los mejores postres y vista al bosque de niebla.",
    shortDescription: "Café de altura con vista",
    phone: "771 456 7890",
    whatsapp: "527714567890",
    email: "hola@neblinacafe.com",
    website: "https://neblinacafe.com",
    address: "Camino al Bosque #12",
    latitude: 20.141,
    longitude: -98.672,
    imageUrl: "/assets/penas-cargadas.webp",
    imageUrl2: "/assets/rdm01.jpg",
    imageUrl3: "",
    videoUrl: "",
    scheduleDisplay: "Mar-Dom: 8:00 - 18:00",
    facebook: "neblinacafe",
    instagram: "@neblinacafe",
    tiktok: "",
    isPremium: false,
    isVerified: false,
    isFeatured: false,
    isActive: true,
    viewsCount: 320,
    rating: 4.4,
    priceRange: "MODERADO",
    createdAt: "2025-03-05T12:00:00.000Z",
  },
];

const initialDichos: Dito[] = [
  { id: "d1", text: "El que no baja a la mina, no valora la luz del día.", author: "Tradición local", category: "MINERIA", isPublished: true },
  { id: "d2", text: "Con lluvia y neblina, mejor cafecito en la esquina.", author: "Pueblo", category: "HUMOR", isPublished: true },
  { id: "d3", text: "Pueblo con memoria, pueblo con futuro.", author: "Comunidad", category: "TRADICION", isPublished: false },
];

const AdminDashboard = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("businesses");
  const [businesses, setBusinesses] = useState<Business[]>(sampleBusinesses);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<BusinessCategory | "all">("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("recent");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [dichos, setDichos] = useState<Dito[]>(initialDichos);
  const [newDicho, setNewDicho] = useState("");
  const [newDichoAuthor, setNewDichoAuthor] = useState("");
  const [newDichoCategory, setNewDichoCategory] = useState<Dito["category"]>("TRADICION");

  const [formData, setFormData] = useState<FormData>(initialFormData);

  useEffect(() => {
    const storedBusinesses = localStorage.getItem(STORAGE_KEY);
    if (storedBusinesses) {
      try {
        setBusinesses(JSON.parse(storedBusinesses));
      } catch {
        setBusinesses(sampleBusinesses);
      }
    }

    const storedDichos = localStorage.getItem(DICHOS_STORAGE_KEY);
    if (storedDichos) {
      try {
        setDichos(JSON.parse(storedDichos));
      } catch {
        setDichos(initialDichos);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(businesses));
  }, [businesses]);

  useEffect(() => {
    localStorage.setItem(DICHOS_STORAGE_KEY, JSON.stringify(dichos));
  }, [dichos]);

  const categoryLabelMap = useMemo(
    () => Object.fromEntries(BUSINESS_CATEGORIES.map((c) => [c.value, `${c.icon} ${c.label}`])),
    [],
  );

  const stats = useMemo(() => {
    const totalViews = businesses.reduce((acc, item) => acc + item.viewsCount, 0);
    const avgRating = businesses.length ? businesses.reduce((acc, item) => acc + item.rating, 0) / businesses.length : 0;

    return {
      total: businesses.length,
      active: businesses.filter((b) => b.isActive).length,
      pending: businesses.filter((b) => !b.isVerified).length,
      premium: businesses.filter((b) => b.isPremium).length,
      totalViews,
      avgRating,
    };
  }, [businesses]);

  const filteredBusinesses = useMemo(() => {
    return businesses
      .filter((business) => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          business.name.toLowerCase().includes(query) ||
          business.description.toLowerCase().includes(query) ||
          business.shortDescription.toLowerCase().includes(query);

        const matchesCategory = categoryFilter === "all" || business.category === categoryFilter;

        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "active" && business.isActive) ||
          (statusFilter === "inactive" && !business.isActive) ||
          (statusFilter === "premium" && business.isPremium) ||
          (statusFilter === "featured" && business.isFeatured) ||
          (statusFilter === "pending" && !business.isVerified);

        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "views") return b.viewsCount - a.viewsCount;
        if (sortBy === "rating") return b.rating - a.rating;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [businesses, categoryFilter, searchQuery, sortBy, statusFilter]);

  const analyticsByCategory = useMemo(() => {
    return BUSINESS_CATEGORIES.map((category) => {
      const inCategory = businesses.filter((b) => b.category === category.value);
      const totalViews = inCategory.reduce((acc, item) => acc + item.viewsCount, 0);
      return {
        ...category,
        count: inCategory.length,
        totalViews,
      };
    }).sort((a, b) => b.count - a.count);
  }, [businesses]);

  const topBusinesses = useMemo(() => {
    return [...businesses].sort((a, b) => b.viewsCount - a.viewsCount).slice(0, 5);
  }, [businesses]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value } as FormData));
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setSelectedBusiness(null);
  };

  const handleNewBusiness = () => {
    resetForm();
    setIsEditing(true);
  };

  const handleEditBusiness = (business: Business) => {
    setSelectedBusiness(business);
    setFormData({
      name: business.name,
      category: business.category,
      description: business.description,
      shortDescription: business.shortDescription,
      phone: business.phone,
      whatsapp: business.whatsapp,
      email: business.email,
      website: business.website,
      address: business.address,
      latitude: business.latitude?.toString() ?? "",
      longitude: business.longitude?.toString() ?? "",
      imageUrl: business.imageUrl,
      imageUrl2: business.imageUrl2,
      imageUrl3: business.imageUrl3,
      videoUrl: business.videoUrl,
      scheduleDisplay: business.scheduleDisplay,
      facebook: business.facebook,
      instagram: business.instagram,
      tiktok: business.tiktok,
      priceRange: business.priceRange,
    });
    setIsEditing(true);
  };

  const validateForm = () => {
    if (!formData.name.trim() || !formData.description.trim() || !formData.address.trim()) {
      return "Nombre, descripción y dirección son obligatorios.";
    }

    if (formData.description.length > 500) {
      return "La descripción no puede exceder 500 caracteres.";
    }

    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      return "El correo no tiene un formato válido.";
    }

    if (formData.website && !/^https?:\/\//.test(formData.website)) {
      return "El sitio web debe iniciar con http:// o https://";
    }

    if (formData.latitude && (Number(formData.latitude) < -90 || Number(formData.latitude) > 90)) {
      return "La latitud debe estar entre -90 y 90.";
    }

    if (formData.longitude && (Number(formData.longitude) < -180 || Number(formData.longitude) > 180)) {
      return "La longitud debe estar entre -180 y 180.";
    }

    return null;
  };

  const handleSaveBusiness = () => {
    const formError = validateForm();
    if (formError) {
      toast({ title: "Formulario inválido", description: formError, variant: "destructive" });
      return;
    }

    const payload: Omit<Business, "id" | "createdAt" | "isPremium" | "isFeatured" | "isActive" | "isVerified" | "viewsCount" | "rating"> = {
      name: formData.name.trim(),
      category: formData.category,
      description: formData.description.trim(),
      shortDescription: formData.shortDescription.trim(),
      phone: formData.phone.trim(),
      whatsapp: formData.whatsapp.trim(),
      email: formData.email.trim(),
      website: formData.website.trim(),
      address: formData.address.trim(),
      latitude: formData.latitude ? Number(formData.latitude) : undefined,
      longitude: formData.longitude ? Number(formData.longitude) : undefined,
      imageUrl: formData.imageUrl.trim() || "/assets/rdm1.jpeg",
      imageUrl2: formData.imageUrl2.trim(),
      imageUrl3: formData.imageUrl3.trim(),
      videoUrl: formData.videoUrl.trim(),
      scheduleDisplay: formData.scheduleDisplay.trim(),
      facebook: formData.facebook.trim(),
      instagram: formData.instagram.trim(),
      tiktok: formData.tiktok.trim(),
      priceRange: formData.priceRange,
    };

    if (selectedBusiness) {
      setBusinesses((prev) => prev.map((item) => (item.id === selectedBusiness.id ? { ...item, ...payload } : item)));
      toast({ title: "Éxito", description: "Negocio actualizado correctamente" });
    } else {
      const newBusiness: Business = {
        id: Date.now().toString(),
        ...payload,
        isPremium: false,
        isVerified: true,
        isFeatured: false,
        isActive: true,
        viewsCount: 0,
        rating: 0,
        createdAt: new Date().toISOString(),
      };
      setBusinesses((prev) => [newBusiness, ...prev]);
      toast({ title: "Éxito", description: "Negocio creado correctamente" });
    }

    setIsEditing(false);
    resetForm();
  };

  const handleToggleStatus = (id: string) => {
    setBusinesses((prev) => prev.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b)));
  };

  const handleTogglePremium = (id: string) => {
    setBusinesses((prev) => prev.map((b) => (b.id === id ? { ...b, isPremium: !b.isPremium } : b)));
  };

  const handleToggleFeatured = (id: string) => {
    setBusinesses((prev) => prev.map((b) => (b.id === id ? { ...b, isFeatured: !b.isFeatured } : b)));
  };

  const handleDeleteBusiness = (id: string) => {
    if (!window.confirm("¿Eliminar este negocio? Esta acción no se puede deshacer.")) return;
    setBusinesses((prev) => prev.filter((b) => b.id !== id));
    setSelectedIds((prev) => prev.filter((item) => item !== id));
    toast({ title: "Eliminado", description: "El negocio ha sido eliminado" });
  };

  const handleDuplicateBusiness = (business: Business) => {
    const duplicated: Business = {
      ...business,
      id: `${Date.now()}`,
      name: `${business.name} (Copia)`,
      createdAt: new Date().toISOString(),
      isVerified: false,
      isFeatured: false,
      viewsCount: 0,
      rating: 0,
    };
    setBusinesses((prev) => [duplicated, ...prev]);
    toast({ title: "Duplicado", description: "Se creó una copia editable del negocio" });
  };

  const handleToggleSelection = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleSelectAllVisible = () => {
    const allVisibleIds = filteredBusinesses.map((item) => item.id);
    const allSelected = allVisibleIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !allVisibleIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...allVisibleIds])));
    }
  };

  const handleBulkAction = (action: "activate" | "deactivate" | "delete") => {
    if (!selectedIds.length) return;

    if (action === "delete") {
      if (!window.confirm(`¿Eliminar ${selectedIds.length} negocios seleccionados?`)) return;
      setBusinesses((prev) => prev.filter((business) => !selectedIds.includes(business.id)));
      setSelectedIds([]);
      toast({ title: "Lote eliminado", description: "Negocios eliminados correctamente" });
      return;
    }

    setBusinesses((prev) =>
      prev.map((business) => {
        if (!selectedIds.includes(business.id)) return business;
        return { ...business, isActive: action === "activate" };
      }),
    );
    toast({ title: "Lote actualizado", description: `Se actualizaron ${selectedIds.length} negocios` });
  };

  const handleCreateDicho = () => {
    if (!newDicho.trim()) {
      toast({ title: "Error", description: "Escribe un dicho antes de guardarlo", variant: "destructive" });
      return;
    }

    const next: Dito = {
      id: Date.now().toString(),
      text: newDicho.trim(),
      author: newDichoAuthor.trim() || "Anónimo",
      category: newDichoCategory,
      isPublished: true,
    };

    setDichos((prev) => [next, ...prev]);
    setNewDicho("");
    setNewDichoAuthor("");
    setNewDichoCategory("TRADICION");
  };

  const toggleDichoPublished = (id: string) => {
    setDichos((prev) => prev.map((dicho) => (dicho.id === id ? { ...dicho, isPublished: !dicho.isPublished } : dicho)));
  };

  const deleteDicho = (id: string) => {
    setDichos((prev) => prev.filter((dicho) => dicho.id !== id));
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />

        <div className="bg-gradient-to-r from-foreground to-foreground/85 pt-28 pb-12">
          <div className="container mx-auto px-4 md:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-3 mb-2">
                <Store className="w-8 h-8 text-background" />
                <h1 className="font-serif text-3xl md:text-4xl font-bold text-background">Panel de Administración</h1>
              </div>
              <p className="text-background/80">Gestiona negocios, dichos locales y métricas del portal RDM Digital.</p>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-8 -mt-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card className="bg-card border-0 shadow-lg"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total</p><p className="text-2xl font-bold">{stats.total}</p></CardContent></Card>
            <Card className="bg-card border-0 shadow-lg"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Activos</p><p className="text-2xl font-bold">{stats.active}</p></CardContent></Card>
            <Card className="bg-card border-0 shadow-lg"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Pendientes</p><p className="text-2xl font-bold">{stats.pending}</p></CardContent></Card>
            <Card className="bg-card border-0 shadow-lg"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Premium</p><p className="text-2xl font-bold">{stats.premium}</p></CardContent></Card>
            <Card className="bg-card border-0 shadow-lg"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Visitas</p><p className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</p></CardContent></Card>
            <Card className="bg-card border-0 shadow-lg"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Rating prom.</p><p className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</p></CardContent></Card>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-8 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start mb-6 overflow-x-auto">
              <TabsTrigger value="businesses">Negocios</TabsTrigger>
              <TabsTrigger value="dichos">Dichos del Pueblo</TabsTrigger>
              <TabsTrigger value="analytics">Estadísticas</TabsTrigger>
            </TabsList>

            <TabsContent value="businesses">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3 mb-4">
                <div className="xl:col-span-2 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Buscar por nombre, descripción..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                </div>

                <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as BusinessCategory | "all")}>
                  <SelectTrigger><SelectValue placeholder="Categoría" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {BUSINESS_CATEGORIES.map((cat) => <SelectItem key={cat.value} value={cat.value}>{cat.icon} {cat.label}</SelectItem>)}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
                  <SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Activos</SelectItem>
                    <SelectItem value="inactive">Inactivos</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="featured">Destacados</SelectItem>
                    <SelectItem value="pending">Pendientes</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex gap-2">
                  <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortBy)}>
                    <SelectTrigger><SelectValue placeholder="Ordenar" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Más recientes</SelectItem>
                      <SelectItem value="name">Nombre</SelectItem>
                      <SelectItem value="views">Más visitas</SelectItem>
                      <SelectItem value="rating">Mejor rating</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleNewBusiness} className="bg-foreground text-background hover:bg-foreground/90"><Plus className="w-4 h-4 mr-1" />Nuevo</Button>
                </div>
              </div>

              <Card className="mb-4">
                <CardContent className="p-3 flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleSelectAllVisible}>{selectedIds.length ? "Limpiar/Invertir" : "Seleccionar visibles"}</Button>
                  <Button variant="outline" size="sm" onClick={() => handleBulkAction("activate")} disabled={!selectedIds.length}><CheckCircle className="w-4 h-4 mr-1" />Activar</Button>
                  <Button variant="outline" size="sm" onClick={() => handleBulkAction("deactivate")} disabled={!selectedIds.length}><XCircle className="w-4 h-4 mr-1" />Desactivar</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleBulkAction("delete")} disabled={!selectedIds.length}><Trash2 className="w-4 h-4 mr-1" />Eliminar</Button>
                  <span className="text-sm text-muted-foreground ml-auto">{selectedIds.length} seleccionados</span>
                </CardContent>
              </Card>

              <div className="space-y-4">
                {!filteredBusinesses.length && (
                  <Card>
                    <CardContent className="p-10 text-center text-muted-foreground">
                      No se encontraron negocios con los filtros actuales.
                    </CardContent>
                  </Card>
                )}

                {filteredBusinesses.map((business) => {
                  const isSelected = selectedIds.includes(business.id);
                  return (
                    <Card key={business.id} className={`${!business.isActive ? "opacity-60" : ""} ${isSelected ? "ring-2 ring-foreground/30" : ""}`}>
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                          <div className="flex items-start gap-2">
                            <input type="checkbox" checked={isSelected} onChange={() => handleToggleSelection(business.id)} className="mt-2" />
                            <div className="w-28 h-24 rounded-lg overflow-hidden shrink-0 bg-muted">
                              <img src={business.imageUrl || "/assets/rdm1.jpeg"} alt={business.name} className="w-full h-full object-cover" />
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="font-semibold truncate">{business.name}</h3>
                                  {business.isPremium && <Badge className="bg-foreground text-background">Premium</Badge>}
                                  {business.isFeatured && <Badge className="bg-secondary text-foreground">Destacado</Badge>}
                                  {!business.isVerified && <Badge variant="outline">Pendiente</Badge>}
                                  <Badge variant="outline">{categoryLabelMap[business.category]}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{business.shortDescription || business.description}</p>
                              </div>

                              <div className="flex items-center gap-1 flex-wrap justify-end">
                                <Button variant="ghost" size="icon" onClick={() => handleToggleStatus(business.id)} title={business.isActive ? "Desactivar" : "Activar"}>
                                  {business.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleTogglePremium(business.id)} title="Premium"><Star className={`w-4 h-4 ${business.isPremium ? "fill-foreground" : ""}`} /></Button>
                                <Button variant="ghost" size="icon" onClick={() => handleToggleFeatured(business.id)} title="Destacado"><TrendingUp className={`w-4 h-4 ${business.isFeatured ? "text-foreground" : ""}`} /></Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDuplicateBusiness(business)} title="Duplicar"><Users className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => handleEditBusiness(business)} title="Editar"><Edit className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteBusiness(business.id)} className="text-red-500 hover:text-red-600" title="Eliminar"><Trash2 className="w-4 h-4" /></Button>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{business.phone || "Sin teléfono"}</span>
                              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{business.address}</span>
                              <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />{business.viewsCount} visitas</span>
                              <span className="flex items-center gap-1"><Star className="w-3 h-3" />{business.rating.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="dichos">
              <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Nuevo dicho</CardTitle>
                    <CardDescription>Publica refranes y tradición oral del pueblo.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Textarea value={newDicho} onChange={(e) => setNewDicho(e.target.value)} placeholder="Ej. Cuando truena en la mina, se respeta la rutina..." maxLength={180} />
                    <div className="grid md:grid-cols-2 gap-2">
                      <Input value={newDichoAuthor} onChange={(e) => setNewDichoAuthor(e.target.value)} placeholder="Autor o fuente" />
                      <Select value={newDichoCategory} onValueChange={(value) => setNewDichoCategory(value as Dito["category"])}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MINERIA">Minería</SelectItem>
                          <SelectItem value="TRADICION">Tradición</SelectItem>
                          <SelectItem value="HUMOR">Humor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleCreateDicho}><Plus className="w-4 h-4 mr-1" />Agregar dicho</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Listado de dichos</CardTitle>
                    <CardDescription>{dichos.length} registros en memoria local.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 max-h-[480px] overflow-y-auto">
                    {dichos.map((dicho) => (
                      <div key={dicho.id} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <Badge variant="outline">{dicho.category}</Badge>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => toggleDichoPublished(dicho.id)}>{dicho.isPublished ? "Ocultar" : "Publicar"}</Button>
                            <Button variant="ghost" size="sm" className="text-red-500" onClick={() => deleteDicho(dicho.id)}>Eliminar</Button>
                          </div>
                        </div>
                        <p className="text-sm">“{dicho.text}”</p>
                        <p className="text-xs text-muted-foreground">— {dicho.author} · {dicho.isPublished ? "Publicado" : "Borrador"}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Rendimiento por categoría</CardTitle>
                    <CardDescription>Negocios y visitas acumuladas.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {analyticsByCategory.map((item) => (
                      <div key={item.value} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between text-sm">
                          <span>{item.icon} {item.label}</span>
                          <span className="font-semibold">{item.count} negocios</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{item.totalViews.toLocaleString()} visitas acumuladas</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top 5 negocios más vistos</CardTitle>
                    <CardDescription>Ranking actualizado automáticamente.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {topBusinesses.map((business, index) => (
                      <div key={business.id} className="flex items-center justify-between border rounded-lg px-3 py-2">
                        <div>
                          <p className="text-sm font-medium">#{index + 1} {business.name}</p>
                          <p className="text-xs text-muted-foreground">{categoryLabelMap[business.category]}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">{business.viewsCount}</p>
                          <p className="text-xs text-muted-foreground">visitas</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Alertas operativas</CardTitle>
                  <CardDescription>Recomendaciones rápidas según estado del panel.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-4">
                  <div className="rounded-lg border p-3">
                    <p className="text-sm font-medium flex items-center gap-2"><AlertCircle className="w-4 h-4" />Pendientes de verificación</p>
                    <p className="text-2xl font-bold mt-2">{stats.pending}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-sm font-medium flex items-center gap-2"><Clock className="w-4 h-4" />Inactivos</p>
                    <p className="text-2xl font-bold mt-2">{businesses.filter((b) => !b.isActive).length}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-sm font-medium flex items-center gap-2"><CheckCircle className="w-4 h-4" />Dichos publicados</p>
                    <p className="text-2xl font-bold mt-2">{dichos.filter((d) => d.isPublished).length}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedBusiness ? "Editar Negocio" : "Nuevo Negocio"}</DialogTitle>
              <DialogDescription>{selectedBusiness ? "Actualiza la información del negocio." : "Completa los datos del nuevo negocio para el directorio."}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre del Negocio *</label>
                <Input name="name" value={formData.name} onChange={handleInputChange} placeholder="Ej: Pastes El Portal" />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Categoría *</label>
                  <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {BUSINESS_CATEGORIES.map((cat) => <SelectItem key={cat.value} value={cat.value}>{cat.icon} {cat.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rango de Precio</label>
                  <Select value={formData.priceRange} onValueChange={(value) => handleSelectChange("priceRange", value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PRICE_RANGES.map((pr) => <SelectItem key={pr.value} value={pr.value}>{pr.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Descripción *</label>
                <Textarea name="description" value={formData.description} onChange={handleInputChange} maxLength={500} className="min-h-[100px]" />
                <p className="text-xs text-muted-foreground text-right">{formData.description.length}/500</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Descripción Corta</label>
                <Input name="shortDescription" value={formData.shortDescription} onChange={handleInputChange} maxLength={200} />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Input name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Teléfono" />
                <Input name="whatsapp" value={formData.whatsapp} onChange={handleInputChange} placeholder="WhatsApp" />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Input name="email" value={formData.email} onChange={handleInputChange} placeholder="Email" />
                <Input name="website" value={formData.website} onChange={handleInputChange} placeholder="https://sitio.com" />
              </div>

              <Input name="address" value={formData.address} onChange={handleInputChange} placeholder="Dirección" />

              <div className="grid md:grid-cols-2 gap-4">
                <Input name="latitude" type="number" step="any" value={formData.latitude} onChange={handleInputChange} placeholder="Latitud" />
                <Input name="longitude" type="number" step="any" value={formData.longitude} onChange={handleInputChange} placeholder="Longitud" />
              </div>

              <div className="grid md:grid-cols-3 gap-2">
                <Input name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} placeholder="Imagen principal" />
                <Input name="imageUrl2" value={formData.imageUrl2} onChange={handleInputChange} placeholder="Imagen 2" />
                <Input name="imageUrl3" value={formData.imageUrl3} onChange={handleInputChange} placeholder="Imagen 3" />
              </div>

              <Input name="videoUrl" value={formData.videoUrl} onChange={handleInputChange} placeholder="Video URL" />
              <Input name="scheduleDisplay" value={formData.scheduleDisplay} onChange={handleInputChange} placeholder="Horario" />

              <div className="grid md:grid-cols-3 gap-4">
                <Input name="facebook" value={formData.facebook} onChange={handleInputChange} placeholder="Facebook" />
                <Input name="instagram" value={formData.instagram} onChange={handleInputChange} placeholder="Instagram" />
                <Input name="tiktok" value={formData.tiktok} onChange={handleInputChange} placeholder="TikTok" />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancelar</Button>
              <Button onClick={handleSaveBusiness} className="bg-foreground text-background hover:bg-foreground/90">
                {selectedBusiness ? "Guardar Cambios" : "Crear Negocio"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default AdminDashboard;
