export interface POI {
  id: string;
  name: string;
  category: 'mina' | 'gastronomia' | 'cultura' | 'naturaleza' | 'plateria' | 'hotel';
  lat: number;
  lng: number;
  description: string;
  history: string;
  phygitalBadge: string;
  rating: number;
  image: string;
  status: 'Abierto' | 'En mantenimiento' | 'Tour Guiado';
  sensors: {
    temp?: string;
    traffic?: string;
    occupancy?: string;
  };
}

export interface YUNNode {
  id: string;
  code: string;
  coreId: number;
  coreName: string;
  title: string;
  subtitle: string;
  category: string;
  description: string;
  status: 'Optimo' | 'Sincronizado' | 'Cripto-Protegido' | 'Standby';
  latency: string;
  details: string[];
  metrics: { label: string; value: string; change: string }[];
  endpoint?: string;
}

export const YUN_CORES = [
  {
    id: 1,
    name: 'Núcleo de Decisión',
    subtitle: 'Isabella AI & Orquestación Estratégica',
    icon: 'Cpu',
    color: 'from-cyan-500 to-blue-600',
  },
  {
    id: 2,
    name: 'Núcleo de Trazabilidad',
    subtitle: 'Criptografía Post-Cuántica & Ledger',
    icon: 'ShieldCheck',
    color: 'from-purple-500 to-indigo-600',
  },
  {
    id: 3,
    name: 'Núcleo de Experiencia Visual',
    subtitle: 'Gemelo Digital 2D/3D & Mapas Phygital',
    icon: 'Box',
    color: 'from-amber-400 to-orange-500',
  },
  {
    id: 4,
    name: 'Núcleo de Resiliencia',
    subtitle: 'Red Soberana, Edge & Sensores IoT',
    icon: 'Activity',
    color: 'from-emerald-400 to-teal-600',
  },
  {
    id: 5,
    name: 'Núcleo de Operación',
    subtitle: 'Turismo, Comercio Local & Pastes',
    icon: 'Store',
    color: 'from-pink-500 to-rose-600',
  },
  {
    id: 6,
    name: 'Núcleo de Identidad',
    subtitle: 'Ciudadanía Digital & Pasaporte Phygital',
    icon: 'UserCheck',
    color: 'from-violet-400 to-purple-600',
  },
  {
    id: 7,
    name: 'Núcleo de Interconexión',
    subtitle: 'Federación YUN, Supabase & Vercel API',
    icon: 'Globe',
    color: 'from-blue-400 to-cyan-500',
  },
];

export const RDM_POIS: POI[] = [
  {
    id: 'mina-acosta',
    name: 'Mina de Acosta',
    category: 'mina',
    lat: 20.1415,
    lng: -98.6722,
    description: 'Una de las minas más antiguas e históricas de Real del Monte. Cuenta con tiro de mina, socavón de 400m e historia minera británica.',
    history: 'Inició operaciones en la época virreinal (mina real fundada en 1727) y fue clave durante la llegada de los mineros de Cornualles (Reino Unido) en 1824.',
    phygitalBadge: 'Insignia Guardián Minero',
    rating: 4.9,
    image: '/images/mina-acosta.jpg',
    status: 'Tour Guiado',
    sensors: { temp: '14°C', occupancy: '65%' }
  },
  {
    id: 'panteon-ingles',
    name: 'Panteón Inglés (English Cemetery)',
    category: 'cultura',
    lat: 20.1397,
    lng: -98.6769,
    description: 'Único cementerio inglés de Latinoamérica. Rodeado de oyameles, descansan aquí los mineros británicos de Cornualles; casi todas las tumbas miran hacia Inglaterra.',
    history: 'Fundado en 1851. Custodia 634 sepulturas de la comunidad cornish y la leyenda del payaso Richard Bell y la joven Inés Valiño.',
    phygitalBadge: 'Sello Cornish Heritage',
    rating: 4.95,
    image: '/images/real-1.jpg',
    status: 'Abierto',
    sensors: { temp: '12°C', occupancy: '40%' }
  },
  {
    id: 'mina-dificultad',
    name: 'Museo de Sitio Mina La Dificultad',
    category: 'mina',
    lat: 20.1428,
    lng: -98.671,
    description: 'Gran testimonio de la transición del vapor a la electricidad en la minería hidalguense con chimeneas históricas majestuosas.',
    history: 'Símbolo del esplendor tecnológico de finales del siglo XIX: de la máquina de vapor a la corriente eléctrica, con la chimenea emblemática del distrito.',
    phygitalBadge: 'Sello Vapor y Electricidad',
    rating: 4.8,
    image: '/images/ladificultad.jpg',
    status: 'Abierto',
    sensors: { temp: '15°C', occupancy: '50%' }
  },
  {
    id: 'pasteleria-portal',
    name: 'Pastes El Portal & Museo del Paste',
    category: 'gastronomia',
    lat: 20.1398,
    lng: -98.6738,
    description: 'Taller gastronómico tradicional del verdadero Paste Cornish adaptado al sazón hidalguense (papa con carne, frijol y chile).',
    history: 'El paste llegó con los mineros de Cornualles en 1824. Su trenzado lateral permitía a los mineros tomarlo con las manos sucias sin contaminar la comida. El repulgue es su firma.',
    phygitalBadge: 'Maestro del Trenzado Cornish',
    rating: 4.98,
    image: '/images/gastronomia-1.jpg',
    status: 'Abierto',
    sensors: { occupancy: '88%', traffic: 'Alto' }
  },
  {
    id: 'parroquia-rosario',
    name: 'Parroquia de Nuestra Señora del Rosario',
    category: 'cultura',
    lat: 20.1395,
    lng: -98.6742,
    description: 'Templo icónico del centro histórico con su fachada churrigueresca y campanario donde retumbaban las llamadas a las minas.',
    history: 'Construida en el siglo XVIII financiada por las bonanzas del Conde de Regla, en el corazón de la vida espiritual minera.',
    phygitalBadge: 'Sello Corazón del Monte',
    rating: 4.85,
    image: '/images/rosario.jpg',
    status: 'Abierto',
    sensors: { occupancy: '35%' }
  },
  {
    id: 'parroquia-asuncion',
    name: 'Parroquia de la Asunción',
    category: 'cultura',
    lat: 20.1412,
    lng: -98.6738,
    description: 'La parroquia principal del Real, sede de las festividades patronales de la Asunción cada 15 de agosto.',
    history: 'Junto a la Plaza de la Constitución, conforma el núcleo ceremonial desde la fundación del Real del Monte en el siglo XVI.',
    phygitalBadge: 'Sello Fe del Monte',
    rating: 4.8,
    image: '/images/real-3.jpg',
    status: 'Abierto',
    sensors: { occupancy: '30%' }
  },
  {
    id: 'plaza-constitucion',
    name: 'Plaza de la Constitución',
    category: 'cultura',
    lat: 20.1389,
    lng: -98.675,
    description: 'La plaza principal del pueblo, punto de encuentro de locales y visitantes, ideal para iniciar cualquier recorrido.',
    history: 'Escenario del primer movimiento obrero de América (1766, en la Mina de Dolores) y del comercio tradicional del Real.',
    phygitalBadge: 'Sello Origen de la Huelga',
    rating: 4.75,
    image: '/images/plaza-principal.jpg',
    status: 'Abierto',
    sensors: { occupancy: '55%', traffic: 'Medio' }
  },
  {
    id: 'museo-medicina',
    name: 'Museo de Medicina Laboral',
    category: 'cultura',
    lat: 20.1405,
    lng: -98.6729,
    description: 'Antiguo hospital de mineros que conserva instrumental médico histórico y la memoria de las enfermedades del trabajo subterráneo.',
    history: 'Construido en el siglo XVIII, fue uno de los primeros hospitales mineros de América: la medicina industrial del Real.',
    phygitalBadge: 'Sello Sanidad Minera',
    rating: 4.6,
    image: '/images/museo-medicina.jpg',
    status: 'Abierto',
    sensors: { occupancy: '20%' }
  },
  {
    id: 'mina-dolores',
    name: 'Mina de Dolores y Monumento a la 1ra Huelga',
    category: 'mina',
    lat: 20.143,
    lng: -98.67,
    description: 'Cuna de la primera huelga de América (1766). Hoy alberga el monumento en memoria de los mineros que se levantaron por sus derechos.',
    history: 'En 1766 los mineros de la Mina de Dolores protagonizaron la primera huelga laboral de América, precedente de los derechos obreros del mundo.',
    phygitalBadge: 'Insignia Memoria Obrera',
    rating: 4.85,
    image: '/images/monumento-minero.jpg',
    status: 'Abierto',
    sensors: { occupancy: '28%' }
  },
  {
    id: 'centro-historico',
    name: 'Centro Histórico y Callejones',
    category: 'cultura',
    lat: 20.1392,
    lng: -98.6744,
    description: 'Callejones empedrados, balcones de madera y casonas del siglo XIX que narran la vida de la aristocracia minera.',
    history: 'Barrio fundado por los inversionistas ingleses; las calles conservan la traza del Real virreinal y la huella cornish.',
    phygitalBadge: 'Caminante del Real',
    rating: 4.7,
    image: '/images/calles.jpg',
    status: 'Abierto',
    sensors: { traffic: 'Medio' }
  },
  {
    id: 'mirador-purisima',
    name: 'Mirador del Atardecer (Purísima)',
    category: 'naturaleza',
    lat: 20.1489,
    lng: -98.6711,
    description: 'El punto más espectacular para ver el sol hundirse entre los cerros y la niebla dorada del Real del Monte.',
    history: 'Mirador natural sobre la Purísima, favorito de fotógrafos por sus vistas a los picos de la Sierra de Pachuca.',
    phygitalBadge: 'Atardecer Soberano',
    rating: 4.9,
    image: '/images/mirador-purisima.jpg',
    status: 'Abierto',
    sensors: { temp: '10°C', occupancy: '45%' }
  },
  {
    id: 'bosque-hiloche',
    name: 'Bosque El Hiloche',
    category: 'naturaleza',
    lat: 20.1556,
    lng: -98.6856,
    description: 'Bosque de pino y oyamel ideal para senderismo, avistamiento de aves y días de campo en familia.',
    history: 'Uno de los pulmones de la Comarca Minera de Hidalgo, Geoparque Mundial UNESCO desde 2017.',
    phygitalBadge: 'Explorador del Bosque',
    rating: 4.8,
    image: '/images/hiloche.jpg',
    status: 'Abierto',
    sensors: { temp: '11°C', occupancy: '22%' }
  },
  {
    id: 'zelontla-cristo',
    name: 'Cristo Rey de Zelontla (Peña del Zumate)',
    category: 'naturaleza',
    lat: 20.146,
    lng: -98.669,
    description: 'Cristo que vigila el Real desde la Peña del Zumate, con una vista panorámica inigualable del pueblo minero.',
    history: 'El Cristo de Zelontla, vestido con casco de minero en algunas festividades, une la fe con la identidad del trabajo subterráneo.',
    phygitalBadge: 'Guardián de la Cumbre',
    rating: 4.85,
    image: '/images/zelotla.jpg',
    status: 'Abierto',
    sensors: { temp: '9°C', occupancy: '18%' }
  },
  {
    id: 'penas-cargadas',
    name: 'Parque Ecológico Peñas Cargadas',
    category: 'naturaleza',
    lat: 20.118,
    lng: -98.645,
    description: 'Formaciones rocosas gigantes entre bosques de pino y oyamel. Ideal para senderismo, tirolesa y turismo de aventura.',
    history: 'Mítico paraje natural guardián de los manantiales del altiplano y santuario del ecoturismo hidalguense.',
    phygitalBadge: 'Explorador del Bosque Esmeralda',
    rating: 4.9,
    image: '/images/penas-cargadas.jpg',
    status: 'Abierto',
    sensors: { temp: '11°C', occupancy: '25%' }
  },
  {
    id: 'taller-plata-real',
    name: 'Taller de Platería Arte Minero',
    category: 'plateria',
    lat: 20.1405,
    lng: -98.6732,
    description: 'Artesanos locales forjando joyería fina de plata de ley .925 inspirada en las estructuras geológicas de Real del Monte.',
    history: 'Herederos de la tradición metalúrgica centenaria del distrito minero Pachuca-Real del Monte.',
    phygitalBadge: 'Orfebre de la Plata Ley .925',
    rating: 4.92,
    image: '/images/real-2.jpg',
    status: 'Abierto',
    sensors: { occupancy: '45%' }
  }
];

// The 35 Nodes of RDM Digital Hub across 7 Cores
export const RDM_NODES_35: YUNNode[] = [
  // Core 1: Decisión
  {
    id: 'node-01',
    code: 'YUN-01-A',
    coreId: 1,
    coreName: 'Núcleo 1: Decisión',
    title: 'Isabella AI Cognitive Hub',
    subtitle: 'Motor Conversacional y Recomendación Territorial',
    category: 'Inteligencia Artificial',
    description: 'Procesamiento de lenguaje natural mediante la bóveda nativa CROWN de IAs open source para orientación turística, asistencia en trámites y consultas en tiempo real.',
    status: 'Optimo',
    latency: '14ms',
    details: ['Bóveda CROWN: Llama / Qwen / DeepSeek', 'Memoria conversacional contextual', 'Incrustación de datos del territorio'],
    metrics: [{ label: 'Consultas/Min', value: '420', change: '+12%' }, { label: 'Precisión', value: '99.4%', change: '+0.2%' }],
    endpoint: '/api/isabella'
  },
  {
    id: 'node-02',
    code: 'YUN-01-B',
    coreId: 1,
    coreName: 'Núcleo 1: Decisión',
    title: 'Orquestador de Tráfico y Aforo',
    subtitle: 'Simulación Preventiva de Congestión en Accesos',
    category: 'Analítica Predictiva',
    description: 'Predice embotellamientos en el corredor Pachuca-Real del Monte y redistribuye el flujo hacia estacionamientos periféricos.',
    status: 'Optimo',
    latency: '22ms',
    details: ['Camaras AI de conteo vehicular', 'Sistemas de alerta a teléfonos inteligentes', 'Control semafórico inteligente'],
    metrics: [{ label: 'Vehículos/Hora', value: '1,240', change: '-8%' }, { label: 'Tiempo de Espera', value: '4 min', change: '-25%' }]
  },
  {
    id: 'node-03',
    code: 'YUN-01-C',
    coreId: 1,
    coreName: 'Núcleo 1: Decisión',
    title: 'Algoritmo de Rutas Phygitales',
    subtitle: 'Generador de Itinerarios Dinámicos por Perfil',
    category: 'Sugerencia Personalizada',
    description: 'Crea rutas a la medida mezclando interés histórico, clima, gusto gastronómico y condición física del visitante.',
    status: 'Optimo',
    latency: '18ms',
    details: ['Personalización en 3 clics', 'Generación de Código QR Phygital', 'Integración con Pasaporte RDM'],
    metrics: [{ label: 'Rutas Generadas', value: '3,890', change: '+34%' }, { label: 'Satisfacción', value: '4.9/5', change: '+0.1' }]
  },
  {
    id: 'node-04',
    code: 'YUN-01-D',
    coreId: 1,
    coreName: 'Núcleo 1: Decisión',
    title: 'Simulador de Eventos y Festivales',
    subtitle: 'Planificación Estratégica del Festival del Paste',
    category: 'Logística Territorial',
    description: 'Proyecciones de demanda para el Festival Internacional del Paste y festividades patronales.',
    status: 'Sincronizado',
    latency: '30ms',
    details: ['Modelo probabilístico de aforo', 'Plan de contingencia ambiental', 'Gestión de comerciantes ambulantes'],
    metrics: [{ label: 'Proyección Aforo', value: '85,000', change: '+15%' }, { label: 'Puestos Mapeados', value: '240', change: '100%' }]
  },
  {
    id: 'node-05',
    code: 'YUN-01-E',
    coreId: 1,
    coreName: 'Núcleo 1: Decisión',
    title: 'Ecosistema de Precios Justos',
    subtitle: 'Monitoreo de Tarifas Comerciales y Taxis',
    category: 'Transparencia Económica',
    description: 'Audita precios sugeridos en pastes, platería, guías de turistas y transporte público para evitar abusos.',
    status: 'Optimo',
    latency: '11ms',
    details: ['Tarifario oficial verificado', 'Reportes anónimos de turistas', 'Sello de Precio Justo RDM'],
    metrics: [{ label: 'Comercios Regulados', value: '180', change: '+5%' }, { label: 'Quejas Resueltas', value: '98%', change: '+4%' }]
  },

  // Core 2: Trazabilidad
  {
    id: 'node-06',
    code: 'YUN-02-A',
    coreId: 2,
    coreName: 'Núcleo 2: Trazabilidad',
    title: 'Ledger Criptográfico Post-Cuántico',
    subtitle: 'Inmutabilidad de Transacciones y Registros con CRYSTALS-Dilithium',
    category: 'Seguridad Post-Cuántica',
    description: 'Registro distribuido que blinda los registros catastrales, sellos digitales y transacciones locales contra ataques cuánticos futuros.',
    status: 'Cripto-Protegido',
    latency: '8ms',
    details: ['Algoritmo CRYSTALS-Dilithium', 'Consenso de Nodos Soberanos', 'Hash inmutable por bloque'],
    metrics: [{ label: 'Bloques Minados', value: '1,420,890', change: '+100%' }, { label: 'Seguridad', value: '256-bit PQ', change: 'MAX' }]
  },
  {
    id: 'node-07',
    code: 'YUN-02-B',
    coreId: 2,
    coreName: 'Núcleo 2: Trazabilidad',
    title: 'Trazabilidad del Paste Cornish Tradicional',
    subtitle: 'Certificación Digital de Origen Gastronómico',
    category: 'Certificación Phygital',
    description: 'Verifica la autenticidad del paste mediante QR con código inmutable que avala insumos locales y técnica artesanal.',
    status: 'Cripto-Protegido',
    latency: '12ms',
    details: ['Trazabilidad de la harina y carne', 'Trenzado Cornish certificado', 'Badge NFT/Badge Soberano'],
    metrics: [{ label: 'Pastes Certificados', value: '124,500', change: '+22%' }, { label: 'Establecimientos', value: '18', change: '100%' }]
  },
  {
    id: 'node-08',
    code: 'YUN-02-C',
    coreId: 2,
    coreName: 'Núcleo 2: Trazabilidad',
    title: 'Registro de Joyería de Plata Ley .925',
    subtitle: 'Sello Digital para Orfebres y Plateros de RDM',
    category: 'Comercio Auténtico',
    description: 'Garantiza que la plata adquirida en el municipio cumple con el grado de pureza .925 y fue moldeada localmente.',
    status: 'Cripto-Protegido',
    latency: '10ms',
    details: ['Prueba de autenticidad por espectrometría', 'Certificado digital de propiedad', 'Garantía extendida'],
    metrics: [{ label: 'Piezas Verificadas', value: '8,920', change: '+18%' }, { label: 'Artesanos', value: '34', change: '+2' }]
  },
  {
    id: 'node-09',
    code: 'YUN-02-D',
    coreId: 2,
    coreName: 'Núcleo 2: Trazabilidad',
    title: 'Auditoría Abierta de Datos de la Ciudad',
    subtitle: 'Portal de Transparencia Ciudadana en Tiempo Real',
    category: 'Gobernanza Abierta',
    description: 'Permite a cualquier ciudadano auditar ingresos turísticos, mantenimiento de minas y presupuestos participativos.',
    status: 'Optimo',
    latency: '16ms',
    details: ['Sin intermediarios', 'Descarga de datos en formato abierto JSON/CSV', 'Firmas digitales comprobables'],
    metrics: [{ label: 'Auditorías Mensuales', value: '1,890', change: '+40%' }, { label: 'Uptime Ledger', value: '100%', change: '0%' }]
  },

  // Core 3: Experiencia Visual
  {
    id: 'node-10',
    code: 'YUN-03-A',
    coreId: 3,
    coreName: 'Núcleo 3: Experiencia Visual',
    title: 'Gemelo Digital 3D de Real del Monte',
    subtitle: 'Representación Fotogramétrica Interactiva Three.js',
    category: 'Gemelo Digital',
    description: 'Modelo virtual tridimensional con elevación topográfica real, edificios históricos renderizados y capas de datos en vivo.',
    status: 'Optimo',
    latency: '25ms',
    details: ['WebGL & Three.js Canvas', 'Renderizado iridiscente crystal clear', 'Capas de minas subterráneas'],
    metrics: [{ label: 'Edificios 3D', value: '1,120', change: '+15%' }, { label: 'FPS Promedio', value: '60 FPS', change: 'ESTABLE' }]
  },
  {
    id: 'node-11',
    code: 'YUN-03-B',
    coreId: 3,
    coreName: 'Núcleo 3: Experiencia Visual',
    title: 'Mapa Cartográfico 2D Interactivo Leaflet',
    subtitle: 'Capa Geolocalizada con Puntos de Interés y Rutas',
    category: 'Geovisualización',
    description: 'Mapa vectorial ligero optimizado para dispositivos móviles con visualización de tráfico, POIs y geofencing.',
    status: 'Optimo',
    latency: '9ms',
    details: ['Leaflet vector tiles', 'Filtro por minas, restaurantes y hoteles', 'Modo nocturno crystal glow'],
    metrics: [{ label: 'Capas Activas', value: '12', change: '+2' }, { label: 'Tiempo de Carga', value: '180ms', change: '-40%' }]
  },
  {
    id: 'node-12',
    code: 'YUN-03-C',
    coreId: 3,
    coreName: 'Núcleo 3: Experiencia Visual',
    title: 'Visor de Minas Subterráneas 3D',
    subtitle: 'Navegación Virtual por los Socavones de Acosta y La Dificultad',
    category: 'Inmersión Histórica',
    description: 'Permite explorar los niveles subterráneos de las minas históricas desde cualquier lugar del mundo.',
    status: 'Optimo',
    latency: '32ms',
    details: ['Mallas tridimensionales de socavones', 'Audio ambiental 8D', 'Puntos de aprendizaje interactivo'],
    metrics: [{ label: 'Metros Escaneados', value: '2,400m', change: '+300m' }, { label: 'Visitas Virtuales', value: '14,200', change: '+55%' }]
  },
  {
    id: 'node-13',
    code: 'YUN-03-D',
    coreId: 3,
    coreName: 'Núcleo 3: Experiencia Visual',
    title: 'Interfaz Crystal Clear HUD UI',
    subtitle: 'Sistema de Componentes Iridiscentes y Cristalinos',
    category: 'Design System',
    description: 'Lenguaje visual vanguardista con efectos de refracción de luz, degradados iridiscentes y transparencia alta.',
    status: 'Optimo',
    latency: '5ms',
    details: ['Tailwind v4 CSS Custom Variables', 'Blur dinámico de 16px', 'Sombra holográfica RGB'],
    metrics: [{ label: 'Componentes UI', value: '48', change: '+10' }, { label: 'Contraste WCAG', value: 'AAA', change: 'PASS' }]
  },

  // Core 4: Resiliencia
  {
    id: 'node-14',
    code: 'YUN-04-A',
    coreId: 4,
    coreName: 'Núcleo 4: Resiliencia',
    title: 'Red de Telemetría IoT y Clima',
    subtitle: 'Estaciones Meteorológicas y Calidad del Aire en Vivo',
    category: 'Sensores Ambientales',
    description: 'Monitoreo de temperatura, humedad de la neblina clásica del monte, presión atmosférica y partículas en suspensión.',
    status: 'Optimo',
    latency: '15ms',
    details: ['12 Sensores distribuidos', 'Alerta de niebla densa para carretera', 'Histórico pluviométrico'],
    metrics: [{ label: 'Temperatura', value: '13.8°C', change: 'Normal' }, { label: 'Humedad Niebla', value: '88%', change: '+12%' }]
  },
  {
    id: 'node-15',
    code: 'YUN-04-B',
    coreId: 4,
    coreName: 'Núcleo 4: Resiliencia',
    title: 'Servidor Soberano Edge Cloud Run',
    subtitle: 'Despliegue Distribuido y Recuperación Ante Desastres',
    category: 'Infraestructura Tecnológica',
    description: 'Instancia en contenedor de alta disponibilidad con réplicas automáticas y latencia ultrabaja en Vercel/Cloud Run.',
    status: 'Optimo',
    latency: '6ms',
    details: ['SSL/TLS 1.3 Cripto-Firmado', 'Failover automático < 2s', 'Aislamiento de microservicios'],
    metrics: [{ label: 'Disponibilidad', value: '99.99%', change: '0%' }, { label: 'Peticiones/Seg', value: '1,850', change: '+15%' }]
  },
  {
    id: 'node-16',
    code: 'YUN-04-C',
    coreId: 4,
    coreName: 'Núcleo 4: Resiliencia',
    title: 'Monitor de Estacionamientos Inteligentes',
    subtitle: 'Detección de Espacios Libres en Tiempo Real',
    category: 'Movilidad Urbana',
    description: 'Informa al turista sobre la ocupación exacta de los 8 estacionamientos del centro y zonas periféricas.',
    status: 'Optimo',
    latency: '19ms',
    details: ['Sensores ultrasónicos de piso', 'Indicadores LED de disponibilidad', 'Abono digital antes de llegada'],
    metrics: [{ label: 'Lugares Totales', value: '850', change: '100%' }, { label: 'Ocupación Actual', value: '62%', change: '+8%' }]
  },
  {
    id: 'node-17',
    code: 'YUN-04-D',
    coreId: 4,
    coreName: 'Núcleo 4: Resiliencia',
    title: 'Módulo de Respuesta a Emergencias y Niebla',
    subtitle: 'Botón de Auxilio Phygital y Ubicación de Protección Civil',
    category: 'Seguridad Ciudadana',
    description: 'Puntos de socorro geolocalizados para asistencias en montaña, accidentes viales o extravío de senderistas.',
    status: 'Optimo',
    latency: '4ms',
    details: ['Enlace directo con patrullas locales', 'Ubicación GPS por triangulación', 'Alerta en pantalla de Isabella AI'],
    metrics: [{ label: 'Tiempo Respuesta', value: '3.2 min', change: '-40%' }, { label: 'Puntos de Auxilio', value: '16', change: '+4' }]
  },

  // Core 5: Operación
  {
    id: 'node-18',
    code: 'YUN-05-A',
    coreId: 5,
    coreName: 'Núcleo 5: Operación',
    title: 'Marketplace Local Phygital',
    subtitle: 'Venta Directa de Pastes, Platería, Artesanías y Boletos',
    category: 'Economía Local',
    description: 'Catálogo unificado para comercios locales sin comisiones intermediarias abusivas.',
    status: 'Optimo',
    latency: '15ms',
    details: ['Pago QR con respuesta instantánea', 'Reservas de tours en minas', 'Envío de plata certificada'],
    metrics: [{ label: 'Ventas del Mes', value: '$485,000 MXN', change: '+28%' }, { label: 'Negocios Activos', value: '76', change: '+12' }]
  },
  {
    id: 'node-19',
    code: 'YUN-05-B',
    coreId: 5,
    coreName: 'Núcleo 5: Operación',
    title: 'Directorio Comercial y Gastronómico',
    subtitle: 'Guía Verificada de Restaurantes, Cafés y Pastelerías',
    category: 'Turismo e Integración',
    description: 'Listado con menú digital en tiempo real, horarios, promociones del día y reseña verificada de clientes.',
    status: 'Optimo',
    latency: '10ms',
    details: ['Menú accesible por QR', 'Filtro para productos vegetarianos o sin gluten', 'Reseñas auténticas con prueba de visita'],
    metrics: [{ label: 'Locales Registrados', value: '112', change: '+8' }, { label: 'Escaneos QR/Día', value: '2,400', change: '+18%' }]
  },
  {
    id: 'node-20',
    code: 'YUN-05-C',
    coreId: 5,
    coreName: 'Núcleo 5: Operación',
    title: 'Módulo de Guías Turísticos Acreditados',
    subtitle: 'Contratación Directa de Historiadores y Anfitriones Locales',
    category: 'Servicios Turísticos',
    description: 'Verificación de credenciales oficiales para guías de las minas, Panteón Inglés y senderos de Peñas Cargadas.',
    status: 'Optimo',
    latency: '14ms',
    details: ['Perfil profesional de guías', 'Calificación de visitantes', 'Garantía de recorrido bioseguro'],
    metrics: [{ label: 'Guías Certificados', value: '28', change: '+4' }, { label: 'Tours Realizados', value: '1,150', change: '+32%' }]
  },
  {
    id: 'node-21',
    code: 'YUN-05-D',
    coreId: 5,
    coreName: 'Núcleo 5: Operación',
    title: 'Pasaporte Gastronómico "Ruta del Paste"',
    subtitle: 'Gamificación de Visita a Pastelerías Tradicionales',
    category: 'Gamificación Phygital',
    description: 'Incentiva al turista a probar pastes en diferentes establecimientos para desbloquear insignias y recompensas.',
    status: 'Optimo',
    latency: '11ms',
    details: ['Sello digital en cada compra', 'Premios en plata local al completar 5 sellos', 'Ranking de visitantes'],
    metrics: [{ label: 'Pasaportes Activos', value: '6,420', change: '+45%' }, { label: 'Insignias Otorgadas', value: '18,900', change: '+50%' }]
  },

  // Core 6: Identidad
  {
    id: 'node-22',
    code: 'YUN-06-A',
    coreId: 6,
    coreName: 'Núcleo 6: Identidad',
    title: 'Pasaporte Digital Ciudadano & Turista RDM',
    subtitle: 'Credencial Phygital Cripto-Firmada para Beneficios',
    category: 'Identidad Digital',
    description: 'Identidad digital que respeta la privacidad del usuario y otorga descuentos a residentes o ventajas a turistas frecuentes.',
    status: 'Cripto-Protegido',
    latency: '7ms',
    details: ['Privacidad Zero-Knowledge (ZKP)', 'Credencial W3C Verifiable', 'Compatible con Apple Wallet & Google Wallet'],
    metrics: [{ label: 'Usuarios Emitidos', value: '14,800', change: '+38%' }, { label: 'Verificaciones/Día', value: '890', change: '+14%' }]
  },
  {
    id: 'node-23',
    code: 'YUN-06-B',
    coreId: 6,
    coreName: 'Núcleo 6: Identidad',
    title: 'Gestor de Voluntariado y Conservación Minera',
    subtitle: 'Iniciativas de Restauración del Patrimonio Histórico',
    category: 'Participación Comunitaria',
    description: 'Organiza jornadas de reforestación en Peñas Cargadas y conservación del Panteón Inglés.',
    status: 'Optimo',
    latency: '13ms',
    details: ['Registro de horas de servicio', 'Certificado de Impacto Ambiental', 'Red de Embajadores del Monte'],
    metrics: [{ label: 'Voluntarios Activos', value: '340', change: '+25%' }, { label: 'Árboles Plantados', value: '2,500', change: '+500' }]
  },
  {
    id: 'node-24',
    code: 'YUN-06-C',
    coreId: 6,
    coreName: 'Núcleo 6: Identidad',
    title: 'Gobernanza Participativa y Voto Soberano',
    subtitle: 'Consultas Ciudadanas Locales sobre Proyectos Urbanos',
    category: 'Democracia Digital',
    description: 'Permite a los habitantes votar sobre mejoras en parques, alumbrado público y proyectos culturales.',
    status: 'Cripto-Protegido',
    latency: '9ms',
    details: ['Voto anónimo e inalterable en Ledger', 'Resultado transparente al instante', 'Sin duplicidad de identidad'],
    metrics: [{ label: 'Consultas Realizadas', value: '14', change: '+3' }, { label: 'Participación', value: '68%', change: '+12%' }]
  },

  // Core 7: Interconexión
  {
    id: 'node-25',
    code: 'YUN-07-A',
    coreId: 7,
    coreName: 'Núcleo 7: Interconexión',
    title: 'Federación YUN Supabase & Vercel Gateway',
    subtitle: 'Enlace de Datos entre Nodos Metropolitanos',
    category: 'Arquitectura de Datos',
    description: 'API Gateway de alta eficiencia conectando el servidor local con Supabase PostgreSQL y Vercel Edge.',
    status: 'Optimo',
    latency: '5ms',
    details: ['Edge Functions en TypeScript', 'PostgreSQL Row Level Security (RLS)', 'Sincronización bidireccional'],
    metrics: [{ label: 'Tiempo de Respuesta', value: '5ms', change: '-2ms' }, { label: 'Peticiones Exitosas', value: '99.98%', change: '0%' }]
  },
  {
    id: 'node-26',
    code: 'YUN-07-B',
    coreId: 7,
    coreName: 'Núcleo 7: Interconexión',
    title: 'API Abierta de Datos de la Ciudad (Open Data RDM)',
    subtitle: 'Endpoints Públicos para Desarrolladores e Investigadores',
    category: 'APIs & Developer Hub',
    description: 'Permite a investigadores universitarios y creadores de apps consumir datos en tiempo real de Real del Monte.',
    status: 'Optimo',
    latency: '12ms',
    details: ['REST & GraphQL endpoints', 'Documentación OpenAPI 3.0', 'Throttling adaptativo inteligente'],
    metrics: [{ label: 'Devs Registrados', value: '88', change: '+14' }, { label: 'Llamadas API/Mes', value: '1.2M', change: '+40%' }]
  },
  {
    id: 'node-27',
    code: 'YUN-07-C',
    coreId: 7,
    coreName: 'Núcleo 7: Interconexión',
    title: 'Nodo de Interconexión con Mineral del Chico y Huasca',
    subtitle: 'Red de Pueblos Mágicos de la Comarca Minera',
    category: 'Integración Regional',
    description: 'Intercambio de datos turísticos y alertas viales con los municipios vecinos del Corredor de la Montaña.',
    status: 'Sincronizado',
    latency: '24ms',
    details: ['Protocolo Inter-Nodo YUN', 'Intercambio de flujo vehicular', 'Paquetes turísticos regionales multi-pueblo'],
    metrics: [{ label: 'Nodos Vecinos Conectados', value: '3', change: '100%' }, { label: 'Turistas Compartidos', value: '12,400', change: '+20%' }]
  },
  {
    id: 'node-28',
    code: 'YUN-07-D',
    coreId: 7,
    coreName: 'Núcleo 7: Interconexión',
    title: 'Hub Cornish-Mexican Heritage Connection',
    subtitle: 'Enlace Cultural Internacional con Redruth y Camborne (Cornwall, UK)',
    category: 'Relaciones Internacionales',
    description: 'Plataforma de intercambio cultural, histórico y hermanamiento entre Real del Monte y Cornualles, Inglaterra.',
    status: 'Optimo',
    latency: '85ms',
    details: ['Archivo histórico compartido digitalizado', 'Intercambio estudiantil y gastronómico', 'Streaming de festivales hermanados'],
    metrics: [{ label: 'Archivos Históricos', value: '4,500', change: '+120' }, { label: 'Visitas desde UK', value: '3,200', change: '+15%' }]
  },
  {
    id: 'node-29',
    code: 'YUN-01-D',
    coreId: 1,
    coreName: 'Núcleo 1: Decisión',
    title: 'Sensor de Clima Turístico Inteligente',
    subtitle: 'Alertas en Tiempo Real para Visitantes',
    category: 'Inteligencia Artificial',
    description: 'Monitorea lluvia, niebla y temperatura en los miradores para recomendar el mejor momento del recorrido y prevenir accidentes.',
    status: 'Sincronizado',
    latency: '16ms',
    details: ['Estaciones meteorológicas IoT', 'Alertas push de niebla en miradores', 'Índice de confort para caminatas'],
    metrics: [{ label: 'Estaciones Activas', value: '9', change: '+2' }, { label: 'Alertas Emitidas', value: '1,100', change: '+18%' }]
  },
  {
    id: 'node-30',
    code: 'YUN-02-D',
    coreId: 2,
    coreName: 'Núcleo 2: Trazabilidad',
    title: 'Custodia de Piezas de Plata Certificadas',
    subtitle: 'Certificado Digital Anti-Falsificación del Taller',
    category: 'Autenticación',
    description: 'Emiten certificados criptográficos para cada pieza de plata vendida en el Real, verificables por QR ante cualquier comprador.',
    status: 'Cripto-Protegido',
    latency: '8ms',
    details: ['Firma Falcon-1024 por pieza', 'Verificación pública sin registro', 'Auditoría de orfebres locales'],
    metrics: [{ label: 'Piezas Certificadas', value: '3,100', change: '+26%' }, { label: 'Orfebres Registrados', value: '17', change: '+3' }]
  },
  {
    id: 'node-31',
    code: 'YUN-03-D',
    coreId: 3,
    coreName: 'Núcleo 3: Experiencia Visual',
    title: 'Gemelo Digital 3D del Centro Histórico',
    subtitle: 'Recorrido Inmersivo en Tres Dimensiones',
    category: 'Gemelo Digital',
    description: 'Réplica fotorrealista del centro histórico, callejones y casonas mineras para visitas virtuales y realidad aumentada en sitio.',
    status: 'Optimo',
    latency: '19ms',
    details: ['Modelado de 120 inmuebles', 'Modo AR para recorridos en sitio', 'Línea de tiempo interactiva 1600-2026'],
    metrics: [{ label: 'Inmuebles Modelados', value: '120', change: '+15' }, { label: 'Visitas VR', value: '8,700', change: '+41%' }]
  },
  {
    id: 'node-32',
    code: 'YUN-04-D',
    coreId: 4,
    coreName: 'Núcleo 4: Resiliencia',
    title: 'Red de Alumbrado Público Autónomo',
    subtitle: 'Luminarias Solares con Sensores IoT',
    category: 'Infraestructura',
    description: 'Red de luminarias solares con sensores de aforo y cámaras de seguridad en calles emblemáticas, soberana ante cortes de energía.',
    status: 'Optimo',
    latency: '10ms',
    details: ['Panel solar + batería LFP por poste', 'Monitoreo remoto de fallas', 'Alumbrado adaptativo al flujo peatonal'],
    metrics: [{ label: 'Luminarias Inteligentes', value: '215', change: '+60' }, { label: 'Ahorro Energético', value: '38%', change: '+5%' }]
  },
  {
    id: 'node-33',
    code: 'YUN-05-D',
    coreId: 5,
    coreName: 'Núcleo 5: Operación',
    title: 'Calendario de Festivales y Fiestas Patronales',
    subtitle: 'Eventos Culturales del Real con Reserva',
    category: 'Turismo',
    description: 'Agenda viva de la Feria del Paste, Fiestas de la Asunción, Semana de los Mineros de Cornualles y festivales de la Comarca Minera.',
    status: 'Optimo',
    latency: '14ms',
    details: ['Compra de boletos y paquetes', 'Notificaciones de fechas límite', 'Mapa de sedes con aforo'],
    metrics: [{ label: 'Eventos Publicados', value: '48', change: '+12' }, { label: 'Asistentes Registrados', value: '52,000', change: '+30%' }]
  },
  {
    id: 'node-34',
    code: 'YUN-06-D',
    coreId: 6,
    coreName: 'Núcleo 6: Identidad',
    title: 'Biblioteca de Historia Oral del Real',
    subtitle: 'Testimonios de Mineros y Criadoras de Pastes',
    category: 'Patrimonio Cultural',
    description: 'Archivo audiovisual con testimonios de los últimos mineros y de las familias pasteadoras que preservan la tradición cornish.',
    status: 'Sincronizado',
    latency: '21ms',
    details: ['400+ entrevistas digitalizadas', 'Transcripción bilingüe ES-EN', 'Acceso abierto para investigadores'],
    metrics: [{ label: 'Testimonios', value: '412', change: '+34' }, { label: 'Horas de Audio', value: '1,240', change: '+90' }]
  },
  {
    id: 'node-35',
    code: 'YUN-07-E',
    coreId: 7,
    coreName: 'Núcleo 7: Interconexión',
    title: 'Gemelo Territorial de la Comarca Minera',
    subtitle: 'Geoparque UNESCO Digital Inter-Municipal',
    category: 'Integración Regional',
    description: 'Replica digital de los 5 municipios del Geoparque Mundial UNESCO de la Comarca Minera para planificación territorial y promoción.',
    status: 'Sincronizado',
    latency: '28ms',
    details: ['Capas LiDAR y SIG municipales', 'Corredores geoturísticos interactivos', 'Panel de gobernanza regional'],
    metrics: [{ label: 'Municipios Conectados', value: '5', change: '100%' }, { label: 'Capas SIG', value: '62', change: '+8' }]
  }
];
