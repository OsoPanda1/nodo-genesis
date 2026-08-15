import {
  NewsArticle,
  HistoricalDocument,
  POI,
  SelfGuidedRoute,
  TraditionalEvent,
  ArtisanShop,
  TamvLayer,
  ReadinessArea
} from './types';

export const NEWS_ARTICLES: NewsArticle[] = [
  {
    id: 'news-01',
    title: 'Aviso del Clima Territorial: Banco de Neblina Intenso y Baja Temperatura en la Comarca Minera',
    category: 'Alerta Clima/Neblina',
    summary: 'Se registra descenso térmico a 7°C con el clásico chipichipi en el Centro Histórico y parajes altos.',
    content: 'El Nodo Cero informa a habitantes y visitantes que durante el fin de semana se mantendrá una densa neblina procedente del Bosque del Cedral. Se recomienda circular con luces intermitentes en la carretera Pachuca-Real del Monte y abrigarse adecuadamente para caminatas al aire libre.',
    date: '2026-08-01',
    author: 'Estación Meteorológica RDM Edge',
    verifiedBy: 'Gobernanza Cívica RDM',
    tags: ['Clima', 'Neblina', 'Precaución', 'Montaña'],
    readTime: '2 min',
    views: 1420
  },
  {
    id: 'news-02',
    title: 'Digitalización del Archivo Histórico de la Mina de Acosta: Descubren Mapas de Vetas de Plata de 1835',
    category: 'Crónica Histórica',
    summary: 'Estudiosos del patrimonio minero rescatan planos originales redactados por la Compañía de los Caballeros Mineros de Cornwall.',
    content: 'En un esfuerzo coordinado entre el archivo municipal de Real del Monte y el kernel de RDM InfoMesh, se digitalizaron 48 mapas cartográficos en alta resolución de las vetas de Acosta y San Andrés. Los documentos detallan el funcionamiento de las máquinas de vapor traídas desde Falmouth en 1824.',
    date: '2026-07-28',
    author: 'Cronista Comunitario Prof. M. Castillo',
    verifiedBy: 'Comité de Patrimonio Histórico',
    tags: ['Historia', 'Minería', 'Cornwall', 'Archivo'],
    readTime: '5 min',
    views: 2890
  },
  {
    id: 'news-03',
    title: 'ConvocatoriaAbierta: Registro de Productores Artesanales de Paste en el Directorio Verificado RDM TradeNode',
    category: 'Aviso Municipal',
    summary: 'Se invita a pastequerías familiares a certificar el uso de ingredientes locales y procesos tradicionales.',
    content: 'Para proteger la denominación de origen y el sabor auténtico del Paste Hidalguense, RDM Comercio abre el padrón digital soberano. Los establecimientos inscritos obtendrán distintivo QR de autenticidad y acceso directo a la pasarela Cattleya Pay con fondo comunitario.',
    date: '2026-07-20',
    author: 'Dirección de Desarrollo Económico Local',
    verifiedBy: 'Red de Comercio Soberano',
    tags: ['Comercio', 'Pastes', 'Certificación', 'CattleyaPay'],
    readTime: '3 min',
    views: 3100
  },
  {
    id: 'news-04',
    title: 'Celebración de la Hermandad Cornish-Mexicana: 202 Años de la Llegada de las Máquinas de Vapor',
    category: 'Noticia Comunitaria',
    summary: 'Representantes del Condado de Cornwall visitan Real del Monte para conmemorar la ruta histórica de los mineros.',
    content: 'Música de gaita, bailes tradicionales y jornadas gastronómicas encabezaron los actos conmemorativos en el Portal del Comercio y el Panteón Inglés. Se reafirmaron lazos culturales y la preservación del patrimonio inmaterial anglo-mexicano.',
    date: '2026-07-12',
    author: 'Asociación Cultural Cornish RDM',
    verifiedBy: 'Consejo Comunitario',
    tags: ['Cultura', 'Cornwall', 'Hermandad', 'Eventos'],
    readTime: '4 min',
    views: 1950
  }
];

export const HISTORICAL_DOCUMENTS: HistoricalDocument[] = [
  {
    id: 'doc-1824',
    title: 'Bitácora del Desembarco del Vapor "Enterprise" y Travesía de las Máquinas a Real del Monte (1824)',
    era: 'Siglo XIX — 1824',
    archivalRef: 'ARCH-RDM-1824-BOULTON',
    description: 'Manuscrito que narra la heroica travesía de 1,500 toneladas de maquinaria desde el puerto de Veracruz hasta los 2,760 msnm de Real del Monte a lo largo de un año entero.',
    archiveLocation: 'Museo de la Mina de Acosta / Archivo RDM Digital',
    historicalContext: 'Tras la guerra de Independencia, las minas estaban inundadas. Los inversores británicos trajeron motores de vapor Trevithick para desaguar las galerías de plata.',
    imageUrl: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'doc-paste-origin',
    title: 'Recetario Tradicional Cornish Pasty & Su Modificación Hidalguense con Chile Serrano (1860)',
    era: 'Siglo XIX — 1860',
    archivalRef: 'ARCH-GASTRO-RDM-04',
    description: 'Registro de la adición del perejil, chile serrano y guisados de mole al tradicional pastel de minero originalmente relleno de papa, poro y carne picada.',
    archiveLocation: 'Museo Nacional del Paste (Real del Monte)',
    historicalContext: 'Los mineros británicos llevaban el paste a la mina porque la trenza de masa ("repulgue") servía como mango desechable para comer con las manos sucias de plomo y plata.',
    imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281232?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'doc-pantheon',
    title: 'Estatuto de Orientación de las Tumbas del Panteón Inglés hacia Cornualles (1851)',
    era: 'Siglo XIX — 1851',
    archivalRef: 'ARCH-CEMETERY-ENG-01',
    description: 'Documento original que estipula la cesión del terreno donado por Thomas Straffon para la sepultura de los mineros británicos y sus familias.',
    archiveLocation: 'Panteón Inglés de Real del Monte',
    historicalContext: 'Todas las tumbas están orientadas hacia Inglaterra (dirección noreste), con la célebre excepción del payaso de fama mundial Richard Bell.',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80'
  }
];

export const POINTS_OF_INTEREST: POI[] = [
  {
    id: 'poi-mina-acosta',
    name: 'Mina de Acosta',
    category: 'Mina & Patrimonio',
    coords: { lat: 20.1415, lng: -98.6728 },
    altitudeMeters: 2760,
    shortDesc: 'Histórico socavón minero con chimenea victoriana, tiro de mina de 400 metros y vestigios de máquinas de vapor.',
    fullDesc: 'La Mina de Acosta es uno de los sitios mineros más emblemáticos de México. Inició operaciones en la época virreinal y vivió su máximo esplendor con la llegada de la Compañía de los Aventureros de Cornwall en 1824. En la visita se ingresa con casco y lámpara a un socavón de 400 metros de profundidad mientras se contemplan las chimeneas y bodegas originales.',
    rating: 4.9,
    durationMinutes: 90,
    audioGuideTitle: 'El Eco de los Socavones y la Plata Profunda',
    address: 'Camino a Mina de Acosta S/N, Barrio de Acosta, Real del Monte',
    openHours: 'Mar a Dom: 10:00 - 18:00 hrs',
    entranceFee: '$60 MXN',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    highlights: ['Chimenea estilo británico', 'Recorrido en socavón real', 'Exposición de maquinaria Trevithick', 'Vista panorámica del pueblo']
  },
  {
    id: 'poi-panteon-ingles',
    name: 'Panteón Inglés (English Cemetery)',
    category: 'Mina & Patrimonio',
    coords: { lat: 20.1462, lng: -98.6701 },
    altitudeMeters: 2800,
    shortDesc: 'Místico cementerio rodeado de oyameles con más de 700 tumbas victorianas orientadas hacia Inglaterra.',
    fullDesc: 'Ubicado en la cima del cerro del Judío, envuelto por una perpetua neblina y altos oyameles, reposan los restos de los colonos británicos que llegaron desde 1824. Destaca la tumba del payaso Richard Bell y la labor de custodia ininterrumpida de la familia Cheno durante generaciones.',
    rating: 4.8,
    durationMinutes: 60,
    audioGuideTitle: 'Leyendas en la Neblina del Cerro del Judío',
    address: 'Cerro del Judío S/N, Real del Monte',
    openHours: 'Lun a Dom: 09:00 - 17:00 hrs',
    entranceFee: 'Cooperación voluntaria patrimonial',
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    highlights: ['Tumba de Richard Bell', 'Simbología masónica y victoriana', 'Arquitectura funeraria de 1851', 'Bosque sagrado de oyamel']
  },
  {
    id: 'poi-museo-paste',
    name: 'Museo del Paste',
    category: 'Gastronomía & Pastes',
    coords: { lat: 20.1388, lng: -98.6750 },
    altitudeMeters: 2750,
    shortDesc: 'Primer museo interactivo dedicado al platillo icónico de la comarca minera, con taller de elaboración en vivo.',
    fullDesc: 'Muestra la evolución del "Cornish Pasty" traído por los mineros ingleses y su fusión con la cocina mexicana tradicional. El visitante puede amasar su propio paste, elaborar el "repulgue" o trenza de hojaldre, hornearlo y degustarlo recién salido del horno de tabique.',
    rating: 4.9,
    durationMinutes: 60,
    audioGuideTitle: 'Del Condado de Cornwall al Horno Hidalguense',
    address: 'Carretera Pachuca-Tazquillo Km 12, Real del Monte',
    openHours: 'Lun a Dom: 10:00 - 19:00 hrs',
    entranceFee: '$50 MXN (Incluye taller de pasta)',
    image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281232?auto=format&fit=crop&w=800&q=80',
    highlights: ['Crea tu propio paste', 'Horno tradicional de ladrillo', 'Exposición fotográfica 1824-2026', 'Tienda de insumos artesanales']
  },
  {
    id: 'poi-parroquia-rosario',
    name: 'Parroquia de Nuestra Señora del Rosario',
    category: 'Templo & Leyenda',
    coords: { lat: 20.1395, lng: -98.6742 },
    altitudeMeters: 2760,
    shortDesc: 'Templo neoclásico del siglo XVIII ubicado en el corazón de la plaza principal con dos majestuosas torres balcón.',
    fullDesc: 'Fundada por la devoción de los mineros novohispanos, guarda en su interior altares dorados y la venerada imagen del Señor de Celontla, patrón de los mineros. Frente a ella se extiende la Plaza Juárez con su fuente de bronce fundida en Inglaterra.',
    rating: 4.7,
    durationMinutes: 45,
    audioGuideTitle: 'El Santo Patrón de las Profundidades Mineras',
    address: 'Plaza Juárez #1, Centro Histórico, Real del Monte',
    openHours: 'Lun a Dom: 08:00 - 20:00 hrs',
    entranceFee: 'Entrada Libre',
    image: 'https://images.unsplash.com/photo-1548625361-188b3f27480a?auto=format&fit=crop&w=800&q=80',
    highlights: ['Torres gemelas balconeadas', 'Señor de Celontla', 'Plaza Juárez', 'Reloj monumental de campana']
  },
  {
    id: 'poi-mina-dificultad',
    name: 'Museo de Sitio Mina La Dificultad',
    category: 'Mina & Patrimonio',
    coords: { lat: 20.1428, lng: -98.6710 },
    altitudeMeters: 2780,
    shortDesc: 'Conjunto monumental de arquitectura industrial del siglo XIX con la chimenea más alta de la comarca.',
    fullDesc: 'Mina La Dificultad testimonio la transición de la tracción de vapor a la energía eléctrica a finales del siglo XIX. Conserva un malacate de vapor monumental con winche doble, calderas, fragua y la célebre chimenea de mampostería de 42 metros de altura.',
    rating: 4.8,
    durationMinutes: 75,
    audioGuideTitle: 'La Chimenea Gigante y el Triunfo de la Técnica',
    address: 'Barrio de la Dificultad S/N, Real del Monte',
    openHours: 'Mar a Dom: 10:00 - 17:30 hrs',
    entranceFee: '$60 MXN',
    image: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80',
    highlights: ['Chimenea de 42 metros', 'Malacate monumental', 'Maquinaria eléctrica alemana', 'Galería fotográfica de época']
  },
  {
    id: 'poi-el-cedral',
    name: 'Parque Ecológico El Cedral',
    category: 'Mirador & Naturaleza',
    coords: { lat: 20.1601, lng: -98.6602 },
    altitudeMeters: 2850,
    shortDesc: 'Tranquila presa rodeada de densos pinares y oyameles ideales para paseos en lancha, senderismo y tirolesa.',
    fullDesc: 'Ubicado a pocos minutos del centro urbano de Real del Monte, El Cedral ofrece un microclima alpino fresco. Los visitantes pueden rentar lanchas de remos, recorrer senderos de montaña, avistar aves acuáticas y probar truchas frescas a las brasas.',
    rating: 4.8,
    durationMinutes: 120,
    audioGuideTitle: 'Soplos del Bosque Fiel y las Aguas Tranquilas',
    address: 'Presa El Cedral, Llano Grande, Real del Monte',
    openHours: 'Lun a Dom: 08:00 - 19:00 hrs',
    entranceFee: '$25 MXN acceso ecológico',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    highlights: ['Presa de montaña', 'Renta de lanchas', 'Tirolesa extrema', 'Pesca y restaurantes de trucha']
  }
];

export const SELF_GUIDED_ROUTES: SelfGuidedRoute[] = [
  {
    id: 'ruta-plata-minas',
    title: 'Ruta Magna de la Plata & las Minas Subterráneas',
    duration: '2.5 - 3 horas',
    distanceKm: 3.2,
    difficulty: 'Moderada',
    description: 'Camina por las históricas calzadas mineras conectando la Mina de Acosta, la Mina La Dificultad y los callejones del barroco novohispano.',
    poiIds: ['poi-mina-acosta', 'poi-mina-dificultad', 'poi-parroquia-rosario'],
    tags: ['Minería', 'Historia', 'Socavones', 'Arquitectura Industrial'],
    headerImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'ruta-gastronomic-paste',
    title: 'Ruta Gastronómica del Paste Tradicional & Hornos de Tabique',
    duration: '1.5 - 2 horas',
    distanceKm: 1.8,
    difficulty: 'Fácil',
    description: 'Un recorrido sensorial por el centro histórico probando los pastes de papa con carne, mole con pollo y manzana en las pastequerías certificadas.',
    poiIds: ['poi-museo-paste', 'poi-parroquia-rosario'],
    tags: ['Gastronomía', 'Pastes', 'Cornwall', 'Talleres'],
    headerImage: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281232?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'ruta-leyendas-neblina',
    title: 'Ruta del Patrimonio, Leyendas & Bosque de Oyamel',
    duration: '2 horas',
    distanceKm: 4.5,
    difficulty: 'Moderada',
    description: 'Asciende entre el denso chipichipi hacia el Panteón Inglés y adéntrate en el paisaje protegido del Cedral.',
    poiIds: ['poi-panteon-ingles', 'poi-el-cedral'],
    tags: ['Naturaleza', 'Misterio', 'Panteón Inglés', 'Bosque'],
    headerImage: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80'
  }
];

export const TRADITIONAL_EVENTS: TraditionalEvent[] = [
  {
    id: 'evt-fest-paste',
    name: 'Festival Internacional del Paste de Real del Monte',
    dateStr: 'Octubre 10 - 12, 2026',
    locationName: 'Avenida Hidalgo & Plaza Juárez, Real del Monte',
    category: 'Festival Gastronómico',
    description: 'El evento culinario más importante de la región. Decenas de maestros pastequeros hornean miles de pastes con visitas de chefs del Condado de Cornwall.',
    isOfficial: true
  },
  {
    id: 'evt-senor-celontla',
    name: 'Fiesta Patronal del Señor de Celontla (El Santo Niño del Minerito)',
    dateStr: 'Enero 18 - 20, 2027',
    locationName: 'Parroquia de Nuestra Señora del Rosario',
    category: 'Fiesta Patronal',
    description: 'Procesiones solemnes con alfombras de aserrín de colores, música de viento y bendición de los instrumentos de trabajo minero.',
    isOfficial: true
  },
  {
    id: 'evt-noche-leyendas',
    name: 'Noches Teatrales de Leyendas en los Callejones de Tezontle',
    dateStr: 'Todos los Viernes y Sábados — 20:00 hrs',
    locationName: 'Portal del Comercio y Callejón de la Dificultad',
    category: 'Música & Leyendas',
    description: 'Actores caracterizados representan la historia del minero fantasma, el payaso Richard Bell y los amores prohibidos de la mina.',
    isOfficial: true
  }
];

export const ARTISAN_SHOPS: ArtisanShop[] = [
  {
    id: 'shop-pastes-el-portal',
    name: 'Pastes El Portal Tradicional (Est. 1928)',
    category: 'Pastequería Tradicional',
    address: 'Portal del Comercio #4, Centro Histórico',
    rating: 4.9,
    verifiedBadge: true,
    description: 'Tercera generación de maestros pastequeros horneando la receta original con manteca de cerdo, carne picada a cuchillo, papa, poro y chile serrano.',
    phone: '771-797-0102',
    ownerName: 'Doña Teresa Cheno & Familia',
    image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281232?auto=format&fit=crop&w=800&q=80',
    products: [
      {
        id: 'prod-paste-papa',
        shopId: 'shop-pastes-el-portal',
        shopName: 'Pastes El Portal Tradicional',
        name: 'Paste Tradicional de Papa con Carne',
        category: 'Pastes Tradicionales',
        price: 28,
        unit: 'Pieza (220g)',
        description: 'Masa de hojaldre crocante rellena de carne picada fina, papa de la sierra, pimienta negra y chile serrano.',
        image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281232?auto=format&fit=crop&w=800&q=80',
        inStock: true,
        heritageFundPercent: 3
      },
      {
        id: 'prod-paste-frijol',
        shopId: 'shop-pastes-el-portal',
        shopName: 'Pastes El Portal Tradicional',
        name: 'Paste de Frijol con Chorizo Artesanal',
        category: 'Pastes Tradicionales',
        price: 28,
        unit: 'Pieza (220g)',
        description: 'Frijoles negros refritos con chorizo de casa y queso mantecoso.',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
        inStock: true,
        heritageFundPercent: 3
      },
      {
        id: 'prod-paste-manzana',
        shopId: 'shop-pastes-el-portal',
        shopName: 'Pastes El Portal Tradicional',
        name: 'Paste Dulce de Manzana de Criolla con Canela',
        category: 'Pastes Tradicionales',
        price: 28,
        unit: 'Pieza (200g)',
        description: 'Manzana criolla cultivada en la comarca minera barnizada con canela y piñones.',
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
        inStock: true,
        heritageFundPercent: 3
      }
    ]
  },
  {
    id: 'shop-plateria-los-arcos',
    name: 'Taller de Joyería & Platería Los Arcos (.925)',
    category: 'Platería & Taller',
    address: 'Calle Real #18, Barrio de San Nicolás',
    rating: 4.8,
    verifiedBadge: true,
    description: 'Plateros orfebres con certificación de Ley .925 y .999. Diseños inspirados en la vegetación de oyamel y las herramientas de minería.',
    phone: '771-797-0488',
    ownerName: 'Maestro Platero Gustavo Trejo',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
    products: [
      {
        id: 'prod-dije-chimenea',
        shopId: 'shop-plateria-los-arcos',
        shopName: 'Taller de Joyería & Platería Los Arcos',
        name: 'Dije Escultórico "Chimenea de Acosta" en Plata .925',
        category: 'Joyería & Plata',
        price: 650,
        unit: 'Pieza con cadena',
        description: 'Dije calado a mano representando la icónica chimenea de la Mina de Acosta en plata fina hidalguense.',
        image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
        inStock: true,
        heritageFundPercent: 5
      },
      {
        id: 'prod-arete-oyamel',
        shopId: 'shop-plateria-los-arcos',
        shopName: 'Taller de Joyería & Platería Los Arcos',
        name: 'Aretes Hoja de Oyamel Martillada en Plata .925',
        category: 'Joyería & Plata',
        price: 480,
        unit: 'Par',
        description: 'Aretes con textura que simula las acículas del bosque de montaña de Real del Monte.',
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
        inStock: true,
        heritageFundPercent: 5
      }
    ]
  },
  {
    id: 'shop-cabanas-cedral',
    name: 'Cabañas Eco-Lodge El Cedral Real',
    category: 'Hospedaje & Cabaña',
    address: 'Presa El Cedral Km 2.5, Real del Monte',
    rating: 4.9,
    verifiedBadge: true,
    description: 'Cabañas de madera tratada con chimenea de piedra, vista a la presa y energía solar complementaria.',
    phone: '771-120-9900',
    ownerName: 'Don Aurelio Vargas',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    products: [
      {
        id: 'prod-tour-guiado-minas',
        shopId: 'shop-cabanas-cedral',
        shopName: 'Cabañas Eco-Lodge El Cedral Real',
        name: 'Paseo Guiado Nocturno "Misterios de la Neblina"',
        category: 'Tours & Experiencias',
        price: 220,
        unit: 'Boleto Persona',
        description: 'Recorrido nocturno con lámpara minera por senderos de montaña y relatos de la comarca.',
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
        inStock: true,
        heritageFundPercent: 4
      }
    ]
  }
];

export const TAMV_LAYERS: TamvLayer[] = [
  {
    layerNumber: 0,
    name: 'Capa 0: Infraestructura Física & Soberanía Edge',
    title: 'Nodos Edge & Hardware Territorial',
    status: 'OPERATIONAL',
    description: 'Servidores self-hosted en Proxmox/Docker con conectividad redundante, canal DNS soberano y almacenamiento resiliente.',
    techStack: ['Proxmox VE', 'Docker', 'Nginx Edge', 'Cloudflare Tunnels', 'PostgreSQL'],
    metrics: { Uptime: '99.94%', Latencia: '12ms', NodosActivos: '1 (Nodo Cero)' }
  },
  {
    layerNumber: 1,
    name: 'Capa 1: Identidad Digital Soberana',
    title: 'CivicAuth & Credenciales Verificables',
    status: 'OPERATIONAL',
    description: 'Pasaporte cívico territorial para artesanos, comercios y residentes de Real del Monte con firmas criptográficas sin seguimiento abusivo.',
    techStack: ['JWT Soberano', 'Ed25519', 'Role-Based Access Control', 'Civic Ledger'],
    metrics: { CredencialesEmitidas: '412', PadrónComercial: '84 Vendedores', Algoritmo: 'Ed25519' }
  },
  {
    layerNumber: 2,
    name: 'Capa 2: Experiencia XR & Sensorial',
    title: 'GeoExplorer Audio & Mapeo Georreferenciado',
    status: 'OPERATIONAL',
    description: 'Interfaz inmersiva con geolocalización de puntos de interés, audioguías históricas, altitudes y mapas táctiles.',
    techStack: ['React 19', 'Tailwind CSS v4', 'Leaflet / Canvas Maps', 'Web Audio API'],
    metrics: { POIsRegistrados: '14 Sitios', RutasGuiadas: '3 Itinerarios', AudiosHD: '10 Pistas' }
  },
  {
    layerNumber: 3,
    name: 'Capa 3: Arquitectura de Sistemas Distribuidos',
    title: 'TAMV OS Kernel & Stream Event Store',
    status: 'OPERATIONAL',
    description: 'Bus de eventos event-driven con ordenamiento por stream, hash SHA-256 de auditoría y circuit breaker resiliente.',
    techStack: ['Node.js EventBus', 'JSON Event Stream', 'Cryptographic Hashes', 'REST Engine'],
    metrics: { EventosProcesados: '18,420', ReplayLatency: '<5ms', CircuitBreaker: 'CLOSED' }
  },
  {
    layerNumber: 4,
    name: 'Capa 4: IA Civilizacional ISABELLA',
    title: 'Inteligencia Territorial & Asesoramiento',
    status: 'OPERATIONAL',
    description: 'Núcleo de IA apoyado en Gemini 3.6 Flash que analiza consultas turísticas, historia minera, normativas y scoring territorial.',
    techStack: ['@google/genai SDK', 'Gemini 3.6 Flash', 'System Prompt RDM-Soberano', 'Express API'],
    metrics: { RespuestasGeneradas: '1,240', ModeloDefault: 'gemini-3.6-flash', PrecisionContexto: '98.2%' }
  },
  {
    layerNumber: 5,
    name: 'Capa 5: Economía Digital Ética',
    title: 'Cattleya Pay Ledger & Fondo de Conservación',
    status: 'OPERATIONAL',
    description: 'Pasarela transaccional idempotente con retención del 3% al 5% para la restauración de la infraestructura y patrimonio de Real del Monte.',
    techStack: ['Cattleya Ledger Protocol', 'Idempotency Engine', 'Heritage Conservation Pool', 'QR Receipts'],
    metrics: { RecaudacionPatrimonio: '$14,820 MXN', HashAuditable: 'Verificado', Transacciones30d: '320' }
  },
  {
    layerNumber: 6,
    name: 'Capa 6: Gobernanza, Legalidad & Compliance',
    title: 'Marco Operativo & Ownership Roles',
    status: 'PILOT',
    description: 'Estructura cívico-técnica alineada con Product Owner, Tech Lead, Data/AI Lead, SRE/DevOps y Security Lead para gobernanza transparente.',
    techStack: ['TypeScript Contracts', 'CI/CD Pipelines', 'Audit Trail Logs', 'RBAC Policies'],
    metrics: { OwnershipReadiness: '80%', ComplianceLegal: 'Padrón Abierto', Auditability: 'Completa' }
  },
  {
    layerNumber: 7,
    name: 'Capa 7: Metacivilización & Legado',
    title: 'Preservación Histórica Inmaterial & Red TAMV',
    status: 'HARDENING',
    description: 'Interconexión de Real del Monte como Nodo Cero con la red federada de comunidades soberanas TAMV.',
    techStack: ['Federated Node Protocol', 'Inter-Node Sync', 'Archival Deep Memory'],
    metrics: { ArchivosDigitalizados: '142 Manuscritos', NodosConectados: '1 (Nodo Cero)', EstadoLegado: 'Activo' }
  }
];

export const READINESS_AREAS: ReadinessArea[] = [
  {
    name: 'Frontend & Experiencia de Usuario (React + Tailwind + Modales)',
    percentage: 95,
    status: 'OPTIMAL',
    description: 'Navegación fluida por los tres pilares web, modales de compra, mapa interactivo y terminal de IA.',
    keyActions: ['Optimizaciones táctiles', 'Visualizador de altitud y clima', 'Animaciones de transición']
  },
  {
    name: 'Kernel Event Store & Bus de Eventos',
    percentage: 90,
    status: 'OPTIMAL',
    description: 'Manejo de flujo de eventos con hashes criptográficos y visualización de logs en vivo.',
    keyActions: ['Inyección de eventos en tiempo real', 'Persistencia transaccional']
  },
  {
    name: 'ISABELLA AI & Integración con Gemini',
    percentage: 88,
    status: 'OPTIMAL',
    description: 'Servicio server-side con prompt del Civilizational Core de Real del Monte.',
    keyActions: ['Consultas contextuales', 'Recomendaciones turísticas georreferenciadas']
  },
  {
    name: 'Pasarela & Ledger Cattleya Pay',
    percentage: 82,
    status: 'ADVANCED',
    description: 'Generación de recibos con Hash de soberanía y cálculo automático del Fondo de Conservación del Patrimonio.',
    keyActions: ['Simulación de comprobantes QR', 'Fondo comunitario retribuido']
  },
  {
    name: 'Seguridad, Hardening & Compliance Legal',
    percentage: 58,
    status: 'IN_PROGRESS',
    description: 'Área identificada en el informe de readiness para reforzar en fases de producción masiva.',
    keyActions: ['Cifrado mTLS entre nodos', 'Auditoría externa de contratos', 'Métricas BCP/DR']
  },
  {
    name: 'Observabilidad Profunda & Métricas Edge',
    percentage: 65,
    status: 'IN_PROGRESS',
    description: 'Instalación de agentes Prometheus/Grafana en el servidor Proxmox del Nodo Cero.',
    keyActions: ['Monitoreo de latencia DNS', 'Traceability distribuidos']
  }
];
