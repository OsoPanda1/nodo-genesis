import {
  GastronomySpot,
  ServiceListing,
  ForumThread,
  ForumPost,
  Mission,
  UserBadge,
  StoreProduct,
  ShipmentTracker,
  MembershipPlan,
  AdCampaign
} from './types';

export const GASTRONOMY_SPOTS: GastronomySpot[] = [
  {
    id: 'gast-01',
    name: 'Pastes El Portal (Casa Fundadora 1928)',
    type: 'Pastequería Histórica',
    specialty: 'Paste Tradicional de Carne con Papa y Poro',
    rating: 4.9,
    priceRange: '$',
    address: 'Portal del Mercado Principal #4, Centro Histórico',
    phone: '+52 771 123 4567',
    hasPasteCertificate: true,
    recommendedDishes: ['Paste de Carne y Papa', 'Paste Frijol con Chorizo', 'Paste Dulce de Manzana'],
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&q=80&w=800',
    hours: '08:00 AM - 09:00 PM',
    deliveryAvailable: true,
    mercadoLibreLink: 'https://articulo.mercadolibre.com.mx/MLM-pastes-real-del-monte-paquete-tradicional'
  },
  {
    id: 'gast-02',
    name: 'Restaurante Mina de Oro & Cerveza de Oyamel',
    type: 'Restaurante Minero',
    specialty: 'Enchiladas Mineras con Queso de Cuenca y Cecina de Montaña',
    rating: 4.8,
    priceRange: '$$',
    address: 'Calle Real de Minas #42',
    phone: '+52 771 987 6543',
    hasPasteCertificate: true,
    recommendedDishes: ['Enchiladas Mineras', 'Sopa de Poro y Papa estilo Cornwall', 'Cerveza Neblina Nitro'],
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800',
    hours: '09:00 AM - 10:00 PM',
    deliveryAvailable: false
  },
  {
    id: 'gast-03',
    name: 'Pastes La Dificultad (Horno de Leña Minero)',
    type: 'Pastequería Histórica',
    specialty: 'Paste de Picadillo Tradicional con Hoja de Comino',
    rating: 4.9,
    priceRange: '$',
    address: 'Avenida de las Chimeneas #12, Barrio Alto',
    phone: '+52 771 456 7890',
    hasPasteCertificate: true,
    recommendedDishes: ['Paste Minero de Picadillo', 'Paste de Arroz con Leche'],
    image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&q=80&w=800',
    hours: '07:30 AM - 08:30 PM',
    deliveryAvailable: true,
    mercadoLibreLink: 'https://articulo.mercadolibre.com.mx/MLM-pastes-la-dificultad-artesanal'
  },
  {
    id: 'gast-04',
    name: 'Café El Panteón Inglés & Panadería de Niebla',
    type: 'Café & Panadería',
    specialty: 'Café de Olla con Piloncillo de la Sierra y Scones Ingleses',
    rating: 4.7,
    priceRange: '$$',
    address: 'Camino al Panteón Inglés s/n',
    phone: '+52 771 333 2211',
    hasPasteCertificate: false,
    recommendedDishes: ['Scones Mineros con Mermelada de Zarzamora', 'Café Espreso Neblina'],
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=800',
    hours: '08:30 AM - 07:00 PM',
    deliveryAvailable: true
  }
];

export const SERVICES_CATALOG: ServiceListing[] = [
  {
    id: 'serv-01',
    title: 'Guía de Alta Montaña & Recorridos Subterráneos',
    providerName: 'Don Tiburcio Acosta (40 años de minero)',
    category: 'Guías de Montaña',
    hourlyRateMXN: 350,
    rating: 5.0,
    completedJobs: 142,
    availability: 'Disponible Hoy',
    phone: '+52 771 555 0192',
    description: 'Recorrido especializado en el socavón de Mina de Acosta y mitos de los duendes mineros. Certificado por Protección Civil.',
    verifiedIdentity: true,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'serv-02',
    title: 'Transporte Rústico & Excursiones en El Cedral',
    providerName: 'Cooperativa de Transportes Los Oyameles',
    category: 'Transporte & Mulas',
    hourlyRateMXN: 500,
    rating: 4.8,
    completedJobs: 98,
    availability: 'Disponible Hoy',
    phone: '+52 771 888 3344',
    description: 'Servicio de camionetas 4x4 y mulas para ascenso a veredas de niebla y transporte de equipo de campamento.',
    verifiedIdentity: true,
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'serv-03',
    title: 'Mantenimiento & Restauración de Fachadas de Madera',
    providerName: 'Taller Carpintería Minera Hermanos Morales',
    category: 'Oficios & Mantenimiento',
    hourlyRateMXN: 280,
    rating: 4.9,
    completedJobs: 64,
    availability: 'Bajo Reserva',
    phone: '+52 771 222 9988',
    description: 'Especialistas en barnices resistentes a la humedad de la neblina y conservación de madera victoriana.',
    verifiedIdentity: true,
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800'
  }
];

export const FORUM_THREADS: ForumThread[] = [
  {
    id: 'thread-01',
    title: '¿Cómo conservar la iluminación tenue en las calles de piedra sin perder seguridad?',
    category: 'Propuestas Urbanas',
    author: 'Cronista_Mina_99',
    authorRole: 'Operador Cívico',
    createdAt: 'Hace 2 horas',
    upvotes: 38,
    repliesCount: 14,
    solved: true,
    content: 'Proponemos sustituir lámparas LED frías por faroles de tono calido a gas o solar simulado con luz ámbar de 2200K para respetar la mística de la neblina sin dejar zonas oscuras en los callejones.',
    tags: ['Iluminación', 'Patrimonio', 'Seguridad']
  },
  {
    id: 'thread-02',
    title: 'Iniciativa: Registro Digital de la Receta Original del Paste de 1824 en Blockchain TAMV',
    category: 'Patrimonio & Conservación',
    author: 'Doña_Beatriz_Pastes',
    authorRole: 'Ciudadano',
    createdAt: 'Hace 1 día',
    upvotes: 72,
    repliesCount: 29,
    solved: false,
    content: 'Queremos certificar la proporción exacta de papa, carne, cebolla y grasa de res que usaban las familias Cornish al llegar a las minas de Real del Monte.',
    tags: ['Gastronomía', 'Soberanía', 'Cultura']
  },
  {
    id: 'thread-03',
    title: 'Ruta nocturna de leyendas en el Panteón Inglés: Límites de aforo recomendado',
    category: 'Turismo Responsable',
    author: 'Guia_Tiburcio',
    authorRole: 'Ciudadano',
    createdAt: 'Hace 3 días',
    upvotes: 45,
    repliesCount: 8,
    solved: true,
    content: 'Se sugiere no ingresar en grupos de más de 15 personas para cuidar el musgo de las lápidas Victorianas y evitar la contaminación acústica durante la neblina nocturna.',
    tags: ['Turismo', 'PanteónInglés', 'Respeto']
  }
];

export const FORUM_POSTS: ForumPost[] = [
  {
    id: 'post-101',
    threadId: 'thread-01',
    author: 'Arquitecto_Patrimonial',
    authorRole: 'Auditor TAMV',
    createdAt: 'Hace 1 hora',
    content: 'Excelente propuesta. En el Consejo aprobamos la norma de 2200K ámbar con sensor de movimiento para que solo se intensifique al paso de peatones.',
    upvotes: 19,
    isSolution: true
  },
  {
    id: 'post-102',
    threadId: 'thread-01',
    author: 'Vecino_Barrio_Alto',
    authorRole: 'Ciudadano',
    createdAt: 'Hace 45 mins',
    content: 'Aprobado por el comité de callejones. El reflejo en el adoquín mojado por el chipichipi se ve hermoso con esa temperatura de luz.',
    upvotes: 12
  }
];

export const TERRITORIAL_MISSIONS: Mission[] = [
  {
    id: 'mis-01',
    title: 'Guardian de las Chimeneas Mineras',
    category: 'Exploración Minera',
    description: 'Escanea el código QR o haz Check-in en las 3 grandes minas: Mina de Acosta, La Dificultad y Dolores.',
    xpReward: 250,
    badgeReward: 'Insignia Veta de Plata',
    completed: true,
    progressPercent: 100,
    checkpointCount: 3,
    completedCheckpoints: 3
  },
  {
    id: 'mis-02',
    title: 'Maestro Catador del Paste Auténtico',
    category: 'Ruta del Paste',
    description: 'Prueba la receta certificada en 2 pastequerías de la red Cattleya Pay con aportación al patrimonio.',
    xpReward: 300,
    badgeReward: 'Sello Cornish RDM',
    completed: false,
    progressPercent: 50,
    checkpointCount: 2,
    completedCheckpoints: 1
  },
  {
    id: 'mis-03',
    title: 'Caminante de las Brumas del Panteón',
    category: 'Cultura & Mitos',
    description: 'Completa la caminata audiotour del Panteón Inglés al atardecer cuando la neblina desciende.',
    xpReward: 400,
    badgeReward: 'Vigías de la Neblina',
    completed: false,
    progressPercent: 0,
    checkpointCount: 4,
    completedCheckpoints: 0
  }
];

export const USER_BADGES: UserBadge[] = [
  {
    id: 'badge-01',
    title: 'Insignia Veta de Plata',
    icon: '💎',
    description: 'Otorgado por visitar las 3 minas históricas de Real del Monte.',
    unlockedAt: '2026-07-28',
    rarity: 'Épico'
  },
  {
    id: 'badge-02',
    title: 'Sello Cornish RDM',
    icon: '🥟',
    description: 'Otorgado por apoyar a las cocinas familiares de paste en el centro.',
    unlockedAt: '2026-07-30',
    rarity: 'Raro'
  },
  {
    id: 'badge-03',
    title: 'Cronista del Nodo Cero',
    icon: '📜',
    description: 'Aportador de 3 crónicas o soluciones validadas en el Foro Cívico.',
    rarity: 'Legendario'
  },
  {
    id: 'badge-04',
    title: 'Vigía de la Neblina',
    icon: '🌫️',
    description: 'Completó los recorridos con clima de chipichipi en alta montaña.',
    rarity: 'Común'
  }
];

export const STORE_PRODUCTS: StoreProduct[] = [
  {
    id: 'prod-101',
    name: 'Caja de 6 Pastes Tradicionales Embalados al Vacío',
    artisan: 'Pastequería El Portal (Fundada 1928)',
    category: 'Paste Embalado al Vacío',
    priceMXN: 240,
    rating: 4.9,
    stock: 45,
    description: 'Envío especial en empaque térmico con conservación de sabor para calentar en horno de leña.',
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&q=80&w=800',
    heritagePercent: 5,
    mercadoLibreUrl: 'https://articulo.mercadolibre.com.mx/MLM-caja-6-pastes-real-del-monte',
    shippingWeightKg: 1.2
  },
  {
    id: 'prod-102',
    name: 'Dije de Plata .925 Réplica Socavón Mina de Acosta',
    artisan: 'Taller de Platería Don Gonzalo Morales',
    category: 'Joyería Plata .925',
    priceMXN: 850,
    rating: 5.0,
    stock: 12,
    description: 'Hecho a mano por plateros locales con plata auténtica extraída de la sierra de Pachuca y Real del Monte.',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800',
    heritagePercent: 10,
    mercadoLibreUrl: 'https://articulo.mercadolibre.com.mx/MLM-dije-plata-mina-acosta-rdm',
    shippingWeightKg: 0.2
  },
  {
    id: 'prod-103',
    name: 'Chalina Tejida a Mano en Lana de Sierra',
    artisan: 'Cooperativa de Tejedoras del Oyamel',
    category: 'Textiles & Lana',
    priceMXN: 520,
    rating: 4.8,
    stock: 18,
    description: 'Abrigo tradicional impermeable ideal para caminatas con neblina y chipichipi.',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800',
    heritagePercent: 5,
    shippingWeightKg: 0.6
  }
];

export const SAMPLE_SHIPMENT: ShipmentTracker = {
  trackingId: 'RDM-2026-90412',
  carrier: 'Paquetexpress RDM',
  status: 'En Tránsito por la Montaña',
  estimatedDelivery: 'Mañana, 04:00 PM',
  origin: 'Taller Central Real del Monte',
  destination: 'Ciudad de México / Benito Juárez',
  updates: [
    { date: 'Hoy 09:30 AM', message: 'Paquete recolectado en Taller El Portal con sello de frescura.' },
    { date: 'Hoy 11:15 AM', message: 'En ruta por la carretera de montaña Pachuca-Real del Monte.' },
    { date: 'Hoy 02:40 PM', message: 'Llegada a Centro Logístico Regional de la Sierra.' }
  ]
};

export const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    id: 'plan-01',
    name: 'Socio Explorador Cultural',
    targetRole: 'Turista Frecuente',
    monthlyFeeMXN: 99,
    annualFeeMXN: 990,
    badgeColor: 'border-amber-400 bg-amber-500/10 text-amber-300',
    benefits: [
      'Acceso a audioguías offline en todas las minas',
      'Descuento directo del 10% en pastequerías afiliadas',
      'Acceso exclusivo al Foro Cívico y votaciones',
      'Pase de cortesía para el Festival Internacional del Paste'
    ],
    heritageFundAllocationPercent: 20
  },
  {
    id: 'plan-02',
    name: 'Locatario Digital Soberano',
    targetRole: 'Locatario RDM',
    monthlyFeeMXN: 299,
    annualFeeMXN: 2990,
    badgeColor: 'border-emerald-400 bg-emerald-500/10 text-emerald-300',
    benefits: [
      'Publicación de catálogo ilimitado en la Tienda Nativa',
      'Sincronización directa con publicaciones de Mercado Libre',
      'Sello de Autenticidad RDM Verificado en mapa',
      'Panel de métricas de ventas y afluencia peatonal horaria'
    ],
    heritageFundAllocationPercent: 15
  },
  {
    id: 'plan-03',
    name: 'Patrocinador del Patrimonio',
    targetRole: 'Patrocinador Cultural',
    monthlyFeeMXN: 890,
    annualFeeMXN: 8900,
    badgeColor: 'border-purple-400 bg-purple-500/10 text-purple-300',
    benefits: [
      'Placa conmemorativa grabada en el Panteón Inglés o Mina La Dificultad',
      'Reconocimiento en todas las publicaciones del periódico InfoMesh',
      'Prioridad de asignación para la restauración de fachadas Victorianas',
      'Informe auditado de retención de capital de Cattleya Pay'
    ],
    heritageFundAllocationPercent: 50
  }
];

export const AD_CAMPAIGN_DATA: AdCampaign[] = [
  {
    id: 'ad-01',
    title: 'Campaña Festival del Paste 2026',
    advertiser: 'Comité de Turismo Municipal',
    format: 'Destacado en Mapa',
    status: 'Activa',
    impressions: 24500,
    clicks: 1890,
    ctrPercent: 7.7,
    budgetMXN: 5000,
    spentMXN: 3200,
    startDate: '2026-07-15',
    endDate: '2026-08-15'
  },
  {
    id: 'ad-02',
    title: 'Recorridos Nocturnos de Neblina',
    advertiser: 'Guías de Montaña Don Tiburcio',
    format: 'Tarjeta de Experiencia',
    status: 'Activa',
    impressions: 12100,
    clicks: 940,
    ctrPercent: 7.7,
    budgetMXN: 2500,
    spentMXN: 1800,
    startDate: '2026-07-20',
    endDate: '2026-08-20'
  }
];

// Podcasts & Música RDM
export const PODCAST_EPISODES = [
  {
    id: 'pod-01',
    title: 'Capítulo 1: El fantasma del Sir Richard Bell y las tumbas orientadas al norte',
    duration: '18 min',
    category: 'Mitos y Leyendas',
    host: 'Cronista Don Mateo',
    description: 'Historias del Panteón Inglés narradas con efectos de sonido de viento de montaña y pasos en el musgo.',
    coverUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'pod-02',
    title: 'Capítulo 2: La Huelga Minera de 1766: La cuna del sindicalismo de América',
    duration: '24 min',
    category: 'Historia Cívica',
    host: 'Prof. Esteban Trejo',
    description: 'Documental sonoro sobre Pedro Romero de Terreros y la huelga de los mineros de Real del Monte.',
    coverUrl: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'pod-03',
    title: 'Capítulo 3: La llegada de los mineros cónicos de Cornwall y la primera receta del paste',
    duration: '15 min',
    category: 'Gastronomía & Orígenes',
    host: 'Doña Beatriz Morales',
    description: 'Cómo las esposas de los mineros británicos enseñaron a hornear el hojaldre trenzado para proteger el alimento de las manos con arsénico.',
    coverUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'pod-04',
    title: 'Capítulo 4: Música tradicional de vientos y bandas de mineros de la Sierra de Pachuca',
    duration: '32 min',
    category: 'Música & Banda',
    host: 'Banda Sinfónica Minera RDM',
    description: 'Compilación de marchas tradicionales, valses de montaña y sones huastecos del Estado de Hidalgo.',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800'
  }
];

// Galería de Fotos y Videos
export const MEDIA_GALLERY = [
  {
    id: 'med-01',
    title: 'Neblina cubriendo los techos rojos victorianos al atardecer',
    type: 'foto',
    category: 'Paisajes',
    url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&q=80&w=800',
    likes: 342,
    author: 'Cámara Cívica RDM'
  },
  {
    id: 'med-02',
    title: 'Socavón y chimenea principal de la Mina de Acosta (4K HDR)',
    type: 'video',
    category: 'Patrimonio',
    url: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&q=80&w=800',
    likes: 512,
    author: 'Dron Parroquia RDM'
  },
  {
    id: 'med-03',
    title: 'Trenzado artesanal de la orilla del paste tradicional hidalguense',
    type: 'foto',
    category: 'Gastronomía',
    url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&q=80&w=800',
    likes: 420,
    author: 'Pastequería El Portal'
  },
  {
    id: 'med-04',
    title: 'Bosque de Oyamel y Presa El Cedral entre bruma de montaña',
    type: 'foto',
    category: 'Paisajes',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=800',
    likes: 289,
    author: 'Ecoturismo Cedral'
  }
];

// Ecoturismo Spots
export const ECOTOURISM_SPOTS = [
  {
    id: 'eco-01',
    name: 'Parque Ecoturístico El Cedral & Presa de Oyameles',
    description: 'Lago de montaña rodeado de densos bosques de oyamel. Paseos en lancha, tirolesas de 800m, pesca de trucha y senderos.',
    feeMXN: 35,
    difficulty: 'Fácil',
    activities: ['Paseo en Lancha', 'Tirolesa', 'Pesca de Trucha', 'Camping'],
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'eco-02',
    name: 'Peñas Cargadas & Formaciones Rocosas',
    description: 'Monolitos gigantescos de basalto suspendidos en equilibrio natural. Excelente para escalada en roca y fotografía de paisaje.',
    feeMXN: 30,
    difficulty: 'Moderado',
    activities: ['Senderismo', 'Escalada en Roca', 'Fotografía', 'Caminata nocturna'],
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'eco-03',
    name: 'Senda de la Neblina en Bosque del Hiloche',
    description: 'Reserva ecológica protegida ideal para caminatas mañaneras bajo el dosel de la sierra y observación de aves montanas.',
    feeMXN: 0,
    difficulty: 'Fácil',
    activities: ['Avistamiento de Aves', 'Caminata Meditativa', 'Picnic'],
    image: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&q=80&w=800'
  }
];

// Estacionamientos
export const TOURIST_PARKINGS = [
  {
    id: 'park-01',
    name: 'Estacionamiento Central Mina de Acosta',
    spacesAvailable: 28,
    totalCapacity: 80,
    hourlyRateMXN: 20,
    occupancyStatus: 'Disponible',
    address: 'Camino a Mina de Acosta #2, a 3 mins del Centro'
  },
  {
    id: 'park-02',
    name: 'Estacionamiento Parroquia de la Asunción',
    spacesAvailable: 12,
    totalCapacity: 50,
    hourlyRateMXN: 25,
    occupancyStatus: 'Moderado',
    address: 'Avenida Hidalgo s/n, a espaldas del templo'
  },
  {
    id: 'park-03',
    name: 'Estacionamiento Plaza Principal & Turibús',
    spacesAvailable: 2,
    totalCapacity: 40,
    hourlyRateMXN: 25,
    occupancyStatus: 'Lleno',
    address: 'Plaza Juárez s/n, Centro Histórico'
  }
];

// Guided Tours
export const GUIDED_TOURS = [
  {
    id: 'tour-01',
    title: 'Recorrido en Turibús Histórico por las 3 Minas & Centro',
    duration: '1 hr 15 min',
    priceMXN: 120,
    description: 'Paseo panorámico en tranvía de estilo inglés visitando la Mina de Acosta, La Dificultad y los portales históricos.',
    schedule: 'Cada hora desde las 10:00 AM a 06:00 PM'
  },
  {
    id: 'tour-02',
    title: 'Callejoneada Nocturna de Neblina y Leyendas del Panteón',
    duration: '1 hr 45 min',
    priceMXN: 180,
    description: 'Acompañado por callejeros tradicionales con guitarra y jarro de ponche o café, escuchando relatos fantasmales.',
    schedule: 'Viernes, Sábados y Domingos 07:30 PM y 09:00 PM'
  },
  {
    id: 'tour-03',
    title: 'Taller Interactivo "Haz tu Propio Paste" en Mina de Acosta',
    duration: '1 hr 30 min',
    priceMXN: 220,
    description: 'Ingresa al horno tradicional, hornea tu propio paste con la receta Cornish y llévate tu diploma de pastequero honorario.',
    schedule: 'Diario 11:30 AM y 03:00 PM'
  }
];

// Mitos y Leyendas
export const MYTHS_AND_LEGENDS = [
  {
    id: 'myth-01',
    title: 'La tumba al revés de Richard Bell',
    location: 'Panteón Inglés',
    era: 'Siglo XIX',
    story: 'El célebre payaso y minero británico pidió ser enterrado dando la espalda a Inglaterra por diferencias con la Corona, siendo la única tumba no orientada a la metrópoli.'
  },
  {
    id: 'myth-02',
    title: 'El Duende de la Mina La Dificultad',
    location: 'Socavón Principal',
    era: 'Siglo XVIII',
    story: 'Los mineros dejaban un pedazo de paste y un trago de mezcal al "Chaneque" del socavón para evitar derrumbes y que les señalara las vetas ricas en plata.'
  },
  {
    id: 'myth-03',
    title: 'La Dama Blanca del Callejón del Beso Minero',
    location: 'Barrio Alto',
    era: 'Siglo XIX',
    story: 'Se dice que cuando desciende la neblina densa, una silueta vestida con velo victoriano camina los escalones de piedra desvaneciéndose en el viento.'
  }
];

export const REAL_DEL_MONTE_POIS = [
  {
    id: 'poi-acosta',
    name: 'Mina de Acosta',
    shortDesc: 'Mina histórica con socavón visitable y museo minero',
    fullDesc: 'Inició operaciones en 1727. Cuenta con maquinaria de vapor original traída de Cornwall.',
    category: 'Mina & Patrimonio',
    rating: 4.9,
    address: 'Camino a Mina de Acosta #1'
  }
];

