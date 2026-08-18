export interface RDMEvent {
  id: string;
  name: string;
  date: string;
  month: string;
  place: string;
  category: 'fiesta' | 'gastronomico' | 'musical' | 'religioso' | 'deportivo';
  description: string;
  image: string;
}

export interface RDMRoute {
  id: string;
  name: string;
  duration: string;
  distance: string;
  difficulty: 'Fácil' | 'Moderada' | 'Exigente';
  image: string;
  description: string;
  stops: { name: string; poiId?: string }[];
}

export interface RDMDicho {
  id: string;
  text: string;
  meaning: string;
  origin: string;
}

export interface RDMTimelineEvent {
  year: string;
  title: string;
  description: string;
  icon: 'cross' | 'gear' | 'pickaxe' | 'building' | 'star' | 'leaf';
}

export interface RDMBusiness {
  id: string;
  name: string;
  category: 'paste' | 'plateria' | 'cafe' | 'artesania' | 'restaurante' | 'hotel' | 'panaderia' | 'heladeria';
  area: string;
  rating: number;
  description: string;
}

export const RDM_EVENTS: RDMEvent[] = [
  {
    id: 'feria-paste',
    name: 'Feria Internacional del Paste',
    date: 'Octubre',
    month: 'Octubre',
    place: 'Plaza de la Constitución y calles aledañas',
    category: 'gastronomico',
    description: 'La fiesta gastronómica más esperada del año: cientos de variedades de paste, concursos del mejor repulgue, música en vivo y demostraciones de la tradición cornish.',
    image: '/images/gastronomia-3.jpg',
  },
  {
    id: 'fiesta-asuncion',
    name: 'Fiestas Patronales de la Asunción',
    date: 'Agosto',
    month: 'Agosto',
    place: 'Parroquia de la Asunción y Plaza Principal',
    category: 'religioso',
    description: 'Procesiones, castillos pirotécnicos, danzas tradicionales y verbena popular en honor a la Virgen de la Asunción.',
    image: '/images/real-4.jpg',
  },
  {
    id: 'semana-cornish',
    name: 'Semana de los Mineros de Cornualles',
    date: 'Marzo',
    month: 'Marzo',
    place: 'Mina de Acosta, Panteón Inglés y Centro Histórico',
    category: 'musical',
    description: 'Conmemora la llegada de los 44 mineros ingleses en 1824: recorridos históricos, conciertos, té de la tarde estilo Cornish y actos en el Panteón Inglés.',
    image: '/images/real-1.jpg',
  },
  {
    id: 'huelga-1766',
    name: 'Festival de la Primera Huelga de América',
    date: 'Julio',
    month: 'Julio',
    place: 'Mina de Dolores y Monumento al Minero',
    category: 'fiesta',
    description: 'Recuerda el levantamiento de 1766 con teatro de calle, ofrendas florales al monumento minero y conciertos de música de bandas.',
    image: '/images/monumento-minero.jpg',
  },
  {
    id: 'calendas-mayos',
    name: 'Calendas y Flores de Mayo',
    date: 'Mayo',
    month: 'Mayo',
    place: 'Callejones del Centro Histórico',
    category: 'religioso',
    description: 'Las tradicionales calendas del Real: carros alegóricos, fuegos artificiales y música de banda recorriendo los callejones empedrados.',
    image: '/images/calles.jpg',
  },
  {
    id: 'espantapajaros',
    name: 'Festival de Día de Muertos del Real',
    date: 'Noviembre',
    month: 'Noviembre',
    place: 'Panteón Inglés y centro del pueblo',
    category: 'fiesta',
    description: 'Altar monumental, leyendas del pueblo narradas en vivo y la mística visita nocturna al Panteón Inglés iluminado con velas.',
    image: '/images/penas-cargadas.jpg',
  },
  {
    id: 'trail-penas',
    name: 'Trail de Peñas Cargadas',
    date: 'Septiembre',
    month: 'Septiembre',
    place: 'Parque Ecológico Peñas Cargadas',
    category: 'deportivo',
    description: 'Carrera de montaña por senderos entre oyameles con vistas a la Sierra de Pachuca, organizada con la comunidad local.',
    image: '/images/hiloche.jpg',
  },
  {
    id: 'noche-buena',
    name: 'Feria de la Nochebuena y Villa Navideña',
    date: 'Diciembre',
    month: 'Diciembre',
    place: 'Plaza de la Constitución',
    category: 'fiesta',
    description: 'El Real se ilumina con villas navideñas, pista de patinaje, piñatas gigantes y la feria de flores de nochebuena.',
    image: '/images/plaza-principal.jpg',
  },
];

export const RDM_ROUTES: RDMRoute[] = [
  {
    id: 'ruta-minera',
    name: 'Ruta de la Plata y las Minas',
    duration: '4-5 horas',
    distance: '6 km',
    difficulty: 'Moderada',
    image: '/images/mina-acosta.jpg',
    description: 'El recorrido esencial por la historia minera del Real: del socavón de Acosta a las chimeneas de La Dificultad, pasando por la primera huelga de América.',
    stops: [
      { name: 'Mina de Acosta', poiId: 'mina-acosta' },
      { name: 'Museo de Sitio Mina La Dificultad', poiId: 'mina-dificultad' },
      { name: 'Mina de Dolores y Monumento al Minero', poiId: 'mina-dolores' },
      { name: 'Museo de Medicina Laboral', poiId: 'museo-medicina' },
    ],
  },
  {
    id: 'ruta-english',
    name: 'Ruta del Legado Inglés (Cornish Trail)',
    duration: '3 horas',
    distance: '4 km',
    difficulty: 'Fácil',
    image: '/images/real-1.jpg',
    description: 'Tras los pasos de los mineros de Cornualles: del Panteón Inglés a las casonas del barrio británico, con té y pastes al final.',
    stops: [
      { name: 'Panteón Inglés', poiId: 'panteon-ingles' },
      { name: 'Centro Histórico y Callejones', poiId: 'centro-historico' },
      { name: 'Taller de Platería Arte Minero', poiId: 'taller-plata-real' },
      { name: 'Pastes El Portal & Museo del Paste', poiId: 'pasteleria-portal' },
    ],
  },
  {
    id: 'ruta-gourmet',
    name: 'Ruta del Paste y la Cocina de Minero',
    duration: '3-4 horas',
    distance: '3 km',
    difficulty: 'Fácil',
    image: '/images/gastronomia-2.jpg',
    description: 'Degustación guiada por las pasteadoras más premiadas del Real, de la papa con carne al mole verde, pasando por el dulce de piloncillo.',
    stops: [
      { name: 'Pastes El Portal & Museo del Paste', poiId: 'pasteleria-portal' },
      { name: 'Panaderías del centro', poiId: 'centro-historico' },
      { name: 'Helados artesanales de la plaza', poiId: 'plaza-constitucion' },
    ],
  },
  {
    id: 'ruta-naturaleza',
    name: 'Ruta de los Miradores y el Bosque',
    duration: '5-6 horas',
    distance: '9 km',
    difficulty: 'Exigente',
    image: '/images/mirador-purisima.jpg',
    description: 'De la cumbre del Cristo de Zelontla al Bosque El Hiloche y el atardecer en el Mirador de la Purísima. Senderismo entre oyameles.',
    stops: [
      { name: 'Cristo Rey de Zelontla', poiId: 'zelontla-cristo' },
      { name: 'Bosque El Hiloche', poiId: 'bosque-hiloche' },
      { name: 'Mirador del Atardecer (Purísima)', poiId: 'mirador-purisima' },
      { name: 'Parque Ecológico Peñas Cargadas', poiId: 'penas-cargadas' },
    ],
  },
  {
    id: 'ruta-fe',
    name: 'Ruta de las Capillas y la Fe Minera',
    duration: '2-3 horas',
    distance: '2.5 km',
    difficulty: 'Fácil',
    image: '/images/rosario.jpg',
    description: 'Por los templos del Real: la parroquia del Rosario, la Asunción y las capillas de barrio que resguardan santos protectores de mineros.',
    stops: [
      { name: 'Parroquia del Rosario', poiId: 'parroquia-rosario' },
      { name: 'Parroquia de la Asunción', poiId: 'parroquia-asuncion' },
      { name: 'Plaza de la Constitución', poiId: 'plaza-constitucion' },
    ],
  },
];

export const RDM_DICHOS: RDMDicho[] = [
  {
    id: 'dicho-1',
    text: '"El que trabaja en la mina, no sabe lo que es hambre."',
    meaning: 'El trabajo minero era dignificado y su dureza se compensaba con comida abundante y respeto de la comunidad.',
    origin: 'Dicho tradicional de las plazas mineras de Pachuca y Real del Monte.',
  },
  {
    id: 'dicho-2',
    text: '"Paste frío, corazón caliente."',
    meaning: 'Aunque el paste se enfríe al salir del horno, alimenta y abriga al minero que lo lleva al socavón.',
    origin: 'Leyenda popular de las pasteadoras del Real del Monte.',
  },
  {
    id: 'dicho-3',
    text: '"Real del Monte: donde hasta las piedras tienen nombre y las nubes peinan los cerros."',
    meaning: 'Describe la geografía única del Real, donde la niebla envuelve las minas y cada peña guarda una historia.',
    origin: 'Cronistas locales y guías del pueblo mágico.',
  },
  {
    id: 'dicho-4',
    text: '"El que nace en el Real, trae el brillo de la plata en la sangre."',
    meaning: 'Refuerza el orgullo de pertenencia a un pueblo construido por generaciones de mineros.',
    origin: 'Expresión común entre las familias realmontenses.',
  },
  {
    id: 'dicho-5',
    text: '"De Real del Monte a Cornualles, un solo corazón minero."',
    meaning: 'El hermanamiento cultural entre el Real y la tierra de los mineros ingleses que lo forjaron.',
    origin: 'Lema de los festivales de la Semana Cornish.',
  },
];

export const RDM_TIMELINE: RDMTimelineEvent[] = [
  { year: '1554', title: 'Nacimiento del Real', description: 'Los colonizadores españoles descubren vetas de plata y fundan el Real del Monte sobre la villa minera.', icon: 'pickaxe' },
  { year: '1727', title: 'Bonanza de Acosta', description: 'Se descubre la veta de Acosta y el Real se convierte en uno de los distritos mineros más ricos de Nueva España.', icon: 'star' },
  { year: '1743', title: 'El Conde de Regla', description: 'Pedro Romero de Terreros explota las minas más ricas y construye la fisonomía señorial del pueblo.', icon: 'building' },
  { year: '1766', title: 'Primera Huelga de América', description: 'Los mineros de la Mina de Dolores se levantan por mejores condiciones: precedente mundial de los derechos obreros.', icon: 'cross' },
  { year: '1824', title: 'Llegan los Cornish', description: 'La Compañía de Aventureros de Londres trae 44 mineros de Cornualles con máquinas de vapor: inicia la revolución industrial del Real.', icon: 'gear' },
  { year: '1851', title: 'Panteón Inglés', description: 'Se funda el cementerio de la comunidad británica, único en Latinoamérica, custodiando la memoria cornish.', icon: 'cross' },
  { year: '1920', title: 'El paste llega a la mesa', description: 'La tradición del paste cornish se fusiona con el chile y la papa mexicanos: nace el ícono gastronómico del Real.', icon: 'gear' },
  { year: '2017', title: 'Geoparque Mundial UNESCO', description: 'La Comarca Minera es reconocida como Geoparque Mundial por la UNESCO, poniendo al Real en el mapa global.', icon: 'leaf' },
  { year: '2024', title: 'RDM Digital Hub', description: 'Nace la plataforma del Nodo Cero: gemelo digital y arquitectura Heptafederada YUN para el futuro inteligente del pueblo.', icon: 'star' },
];

export const RDM_BUSINESSES: RDMBusiness[] = [
  { id: 'b-pastes-el-real', name: 'Pastes El Real (El Más Antiguo)', category: 'paste', area: 'Centro', rating: 4.9, description: 'La pasteadora más antigua del pueblo, famosa por su paste de papa con carne y el repulgue tradicional cornish.' },
  { id: 'b-pastes-mineros', name: 'Pastes Los Mineros', category: 'paste', area: 'Zona Minas', rating: 4.8, description: 'Pastes de frijol, chile y plátano con machaca, receta heredada de abuelos mineros.' },
  { id: 'b-taller-anubis', name: 'Taller de Platería Arte Minero', category: 'plateria', area: 'Centro', rating: 4.9, description: 'Joyería de plata .925 inspirada en cristalografía y geología del distrito.' },
  { id: 'b-plata-pachuca', name: 'Plata del Real', category: 'plateria', area: 'Portal', rating: 4.7, description: 'Diseños contemporáneos de orfebres jóvenes con certificado anti-falsificación.' },
  { id: 'b-cafe-altura', name: 'Café de Altura El Hiloche', category: 'cafe', area: 'Barrio Alto', rating: 4.8, description: 'Café de la Sierra de Hidalgo tostado en el Real, ideal contra el frío del altiplano.' },
  { id: 'b-helados-luna', name: 'Helados y Esquimos La Luna', category: 'heladeria', area: 'Plaza', rating: 4.6, description: 'Esquimos artesanales de leche quemada, guayaba y piloncillo en la plaza principal.' },
  { id: 'b-panaderia-real', name: 'Panadería El Horno del Real', category: 'panaderia', area: 'Centro', rating: 4.7, description: 'Pan de pulque, coyitas y pambazos mineros horneados en horno de piedra.' },
  { id: 'b-casa-huespedes', name: 'Casa de Huespedes La Purísima', category: 'hotel', area: 'Purísima', rating: 4.8, description: 'Hospedaje con vista al atardecer y desayuno con pastes recién horneados.' },
  { id: 'b-restaurante-acosta', name: 'Restaurante El Socavón', category: 'restaurante', area: 'Zona Minas', rating: 4.5, description: 'Cocina de montaña: mixiotes, barbacoa y chilacayotes con vista a las chimeneas.' },
  { id: 'b-artesania-callejon', name: 'Artesanías El Callejón', category: 'artesania', area: 'Callejones', rating: 4.6, description: 'Textiles, alebrijes mineros y réplicas en miniatura de las chimeneas de la Dificultad.' },
];
