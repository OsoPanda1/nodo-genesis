export type ActivePillar = 
  | 'tourist-showcase'
  | 'info' 
  | 'turismo' 
  | 'gastronomia' 
  | 'cultura' 
  | 'comercio' 
  | 'servicios' 
  | 'foro' 
  | 'perfil' 
  | 'media'
  | 'onboarding' 
  | 'gamificacion' 
  | 'publicidad' 
  | 'mapa' 
  | 'membresias' 
  | 'tienda' 
  | 'isabella' 
  | 'chat-meet'
  | 'pagos-p2p'
  | 'kernel' 
  | 'readiness' 
  | 'manual';

export type UserRoleMode = 'Ciudadano' | 'Turista' | 'Operador Cívico' | 'Auditor TAMV';
export type AppThemeMode = 'dark' | 'light';
export type AppLanguage = 'ES' | 'EN';

// Módulo Gastronomía & Pastes
export interface GastronomySpot {
  id: string;
  name: string;
  type: 'Pastequería Histórica' | 'Fonda de Tradición' | 'Restaurante Minero' | 'Café & Panadería' | 'Cervecería Artesanal';
  specialty: string;
  rating: number;
  priceRange: '$' | '$$' | '$$$';
  address: string;
  phone: string;
  hasPasteCertificate: boolean; // Certificado de Paste Auténtico RDM
  recommendedDishes: string[];
  image: string;
  hours: string;
  deliveryAvailable: boolean;
  mercadoLibreLink?: string;
}

// Módulo Servicios Prácticos
export interface ServiceListing {
  id: string;
  title: string;
  providerName: string;
  category: 'Guías de Montaña' | 'Transporte & Mulas' | 'Oficios & Mantenimiento' | 'Fotografía & Tours' | 'Hospedaje Rústico';
  hourlyRateMXN: number;
  rating: number;
  completedJobs: number;
  availability: 'Disponible Hoy' | 'Bajo Reserva' | 'En Ruta';
  phone: string;
  description: string;
  verifiedIdentity: boolean;
  image: string;
}

// Módulo Foro Cívico RDM
export interface ForumThread {
  id: string;
  title: string;
  category: 'Turismo Responsable' | 'Patrimonio & Conservación' | 'Propuestas Urbanas' | 'Historias & Mitos' | 'Anuncios Comunitarios';
  author: string;
  authorRole: string;
  createdAt: string;
  upvotes: number;
  repliesCount: number;
  solved: boolean;
  content: string;
  tags: string[];
}

export interface ForumPost {
  id: string;
  threadId: string;
  author: string;
  authorRole: string;
  createdAt: string;
  content: string;
  upvotes: number;
  isSolution?: boolean;
}

// Módulo Gamificación & Misiones Territoriales
export interface Mission {
  id: string;
  title: string;
  category: 'Exploración Minera' | 'Ruta del Paste' | 'Cultura & Mitos' | 'Ciudadanía Activa';
  description: string;
  xpReward: number;
  badgeReward: string;
  completed: boolean;
  progressPercent: number;
  checkpointCount: number;
  completedCheckpoints: number;
}

export interface UserBadge {
  id: string;
  title: string;
  icon: string;
  description: string;
  unlockedAt?: string;
  rarity: 'Común' | 'Raro' | 'Épico' | 'Legendario';
}

// Módulo Onboarding & Registrar Negocio
export interface BusinessOnboardingForm {
  businessName: string;
  category: string;
  ownerName: string;
  phone: string;
  address: string;
  description: string;
  documentsUploaded: boolean;
  taxId?: string;
  wantsMercadoLibreSync: boolean;
}

// Módulo Tienda Nativa & Envíos Sync
export interface StoreProduct {
  id: string;
  name: string;
  artisan: string;
  category: 'Paste Embalado al Vacío' | 'Joyería Plata .925' | 'Textiles & Lana' | 'Artesanías en Madera' | 'Licor de Joya Local';
  priceMXN: number;
  rating: number;
  stock: number;
  description: string;
  image: string;
  heritagePercent: number;
  mercadoLibreUrl?: string;
  shippingWeightKg: number;
}

export interface ShipmentTracker {
  trackingId: string;
  carrier: 'Paquetexpress RDM' | 'Mercado Envíos' | 'Estafeta Local';
  status: 'Preparando Paquete' | 'En Tránsito por la Montaña' | 'En Sucursal Pachuca' | 'Entregado';
  estimatedDelivery: string;
  origin: 'Taller Central Real del Monte';
  destination: string;
  updates: { date: string; message: string }[];
}

// Módulo Membresías & Pagos Cívicos
export interface MembershipPlan {
  id: string;
  name: string;
  targetRole: 'Turista Frecuente' | 'Locatario RDM' | 'Patrocinador Cultural' | 'Comerciante Master';
  monthlyFeeMXN: number;
  annualFeeMXN: number;
  badgeColor: string;
  benefits: string[];
  heritageFundAllocationPercent: number;
}

// Módulo Publicidad Ética
export interface AdCampaign {
  id: string;
  title: string;
  advertiser: string;
  format: 'Destacado en Mapa' | 'Tarjeta de Experiencia' | 'Banner Clima';
  status: 'Activa' | 'Pausada' | 'Revision';
  impressions: number;
  clicks: number;
  ctrPercent: number;
  budgetMXN: number;
  spentMXN: number;
  startDate: string;
  endDate: string;
}

// Pilar 1: InfoMesh (RDM Información)
export interface NewsArticle {
  id: string;
  title: string;
  category: 'Noticia Comunitaria' | 'Crónica Histórica' | 'Aviso Municipal' | 'Alerta Clima/Neblina';
  summary: string;
  content: string;
  date: string;
  author: string;
  verifiedBy: string;
  tags: string[];
  readTime: string;
  views: number;
  featuredImage?: string;
  audioExcerpt?: string;
}

export interface HistoricalDocument {
  id: string;
  title: string;
  era: string; // e.g., 'Siglo XIX — 1824-1900'
  archivalRef: string; // e.g., 'ARCH-RDM-1824-MINA'
  description: string;
  archiveLocation: string;
  historicalContext: string;
  imageUrl: string;
}

// Pilar 2: GeoExplorer (RDM Turismo)
export interface POI {
  id: string;
  name: string;
  category: 'Mina & Patrimonio' | 'Gastronomía & Pastes' | 'Mirador & Naturaleza' | 'Templo & Leyenda' | 'Museo & Arte';
  coords: { lat: number; lng: number };
  altitudeMeters: number; // e.g., 2760
  shortDesc: string;
  fullDesc: string;
  rating: number;
  durationMinutes: number;
  audioGuideTitle?: string;
  address: string;
  openHours: string;
  entranceFee: string;
  image: string;
  highlights: string[];
}

export interface SelfGuidedRoute {
  id: string;
  title: string;
  duration: string;
  distanceKm: number;
  difficulty: 'Fácil' | 'Moderada' | 'Desafiante';
  description: string;
  poiIds: string[];
  tags: string[];
  headerImage: string;
}

export interface TraditionalEvent {
  id: string;
  name: string;
  dateStr: string;
  locationName: string;
  category: 'Festival Gastronómico' | 'Fiesta Patronal' | 'Evento Cultural' | 'Música & Leyendas';
  description: string;
  isOfficial: boolean;
}

// Pilar 3: TradeNode (RDM Comercio)
export interface Product {
  id: string;
  shopId: string;
  shopName: string;
  name: string;
  category: 'Pastes Tradicionales' | 'Joyería & Plata' | 'Artesanías & Textiles' | 'Gastronomía Local' | 'Tours & Experiencias';
  price: number;
  unit: string;
  description: string;
  image: string;
  inStock: boolean;
  heritageFundPercent: number; // e.g. 3% goes to Real del Monte Conservation Fund
}

export interface ArtisanShop {
  id: string;
  name: string;
  category: 'Pastequería Tradicional' | 'Platería & Taller' | 'Gastronomía & Café' | 'Hospedaje & Cabaña' | 'Guías & Excursiones';
  address: string;
  rating: number;
  verifiedBadge: boolean;
  description: string;
  phone: string;
  ownerName: string;
  products: Product[];
  image: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface TransactionReceipt {
  orderId: string;
  txHash: string;
  buyerName: string;
  totalAmount: number;
  heritageFee: number;
  items: CartItem[];
  timestamp: string;
  protocol: string;
  sovereigntyProof: string;
}

// TAMV Kernel & Event Bus
export interface SystemEvent {
  id: string;
  timestamp: string;
  layer: string;
  source: string;
  type: string;
  payload: Record<string, any>;
  hash: string;
}

export interface TamvLayer {
  layerNumber: number;
  name: string;
  title: string;
  status: 'OPERATIONAL' | 'PILOT' | 'HARDENING';
  description: string;
  techStack: string[];
  metrics: Record<string, string>;
}

export interface ReadinessArea {
  name: string;
  percentage: number;
  status: 'OPTIMAL' | 'ADVANCED' | 'IN_PROGRESS';
  description: string;
  keyActions: string[];
}
