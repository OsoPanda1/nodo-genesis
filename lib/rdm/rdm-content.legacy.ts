export interface RDMArtist {
  id: string;
  name: string;
  discipline: string;
  location: string;
  bio: string;
  image: string;
  rating: number;
}

export interface RDMGastronomy {
  id: string;
  name: string;
  type: 'paste' | 'restaurante' | 'panaderia' | 'heladeria' | 'cafe';
  specialty: string;
  priceRange: string;
  location: string;
  image: string;
  rating: number;
  description: string;
}

export interface RDMTrack {
  id: string;
  title: string;
  artist: string;
  genre: string;
  duration: string;
  image: string;
}

export interface RDMPodcastEpisode {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  date: string;
  image: string;
  description: string;
  tags: string[];
}

export interface RDMBadge {
  id: string;
  name: string;
  icon: 'pickaxe' | 'paste' | 'mountain' | 'scroll' | 'globe' | 'star';
  description: string;
  rarity: 'ComÃºn' | 'Raro' | 'Ã‰pico' | 'Legendario';
}

export interface RDMChallenge {
  id: string;
  title: string;
  points: number;
  description: string;
  category: string;
  progress: number;
}

export interface RDMLegend {
  id: string;
  title: string;
  category: string;
  image: string;
  story: string;
  moral: string;
}

export interface RDMForumThread {
  id: string;
  title: string;
  author: string;
  role: string;
  category: string;
  replies: number;
  likes: number;
  time: string;
  excerpt: string;
  pinned?: boolean;
}

export interface RDMHonoree {
  id: string;
  name: string;
  title: string;
  achievement: string;
  image: string;
  year: string;
}

export interface RDMGalleryItem {
  id: string;
  image: string;
  caption: string;
  author: string;
  type: 'imagen' | 'video';
  category: string;
  likes: number;
}

export interface RDMTodoItem {
  id: string;
  title: string;
  icon: 'pickaxe' | 'paste' | 'mountain' | 'scroll' | 'globe' | 'star' | 'camera' | 'music';
}

export const RDM_ARTISTS: RDMArtist[] = [
  { id: 'art-anubis', name: 'Anubis VillaseÃ±or', discipline: 'OrfebrerÃ­a y PlaterÃ­a', location: 'CallejÃ³n de la Plata', bio: 'Maestro orfebre que forja plata ley .925 inspirada en la cristalografÃ­a del distrito minero. Sus piezas portan certificado criptogrÃ¡fico anti-falsificaciÃ³n.', image: '/images/pedro-romero.jpg', rating: 4.9 },
  { id: 'art-barro', name: 'Taller de Barro El Barretero', discipline: 'CerÃ¡mica y barro', location: 'Barrio de la AsunciÃ³n', bio: 'Tres generaciones moldeando barro de la sierra: cazuelas, macetas y rÃ©plicas de las chimeneas de La Dificultad.', image: '/images/real-3.jpg', rating: 4.7 },
  { id: 'art-murales', name: 'Colectivo Pincel de Plata', discipline: 'Muralismo', location: 'Callejones del Centro', bio: 'JÃ³venes muralistas que pintan la memoria minera: retratos de mineros, niÃ±as pasteadoras y la niebla dorada del monte.', image: '/images/realito-arte.png', rating: 4.8 },
  { id: 'art-oyamel', name: 'Telar El Oyametl', discipline: 'Textil de lana', location: 'PurÃ­sima', bio: 'Telares de pedal que tejen cobijas y sarapes con lana de la Comarca y tintes naturales de la sierra.', image: '/images/real-4.jpg', rating: 4.6 },
  { id: 'art-niebla', name: 'FotÃ³grafos de la Niebla', discipline: 'FotografÃ­a documental', location: 'Mirador PurÃ­sima', bio: 'Colectivo dedicado a capturar el atardecer, la niebla y la vida cotidiana del Real. Exponen en el Museo de la Dificultad.', image: '/images/mirador-purisima.jpg', rating: 4.9 },
  { id: 'art-retablos', name: 'Maestros del Retablo', discipline: 'Escultura en madera', location: 'Parroquia del Rosario', bio: 'Talladores de retablos y altares que restauran el patrimonio religioso de las capillas del Real.', image: '/images/rosario.jpg', rating: 4.8 },
];

export const RDM_GASTRONOMY: RDMGastronomy[] = [
  { id: 'g-pastes-real', name: 'Pastes El Real (El MÃ¡s Antiguo)', type: 'paste', specialty: 'Paste de papa con carne, repulgue cornish', priceRange: '$30â€“$40', location: 'Centro', image: '/images/gastronomia-1.jpg', rating: 4.9, description: 'La pasteadora mÃ¡s antigua: masa artesanal, trenzado lateral y horno de piedra, receta heredada desde 1824.' },
  { id: 'g-pastes-mineros', name: 'Pastes Los Mineros', type: 'paste', specialty: 'Frijol, chile, plÃ¡tano con machaca', priceRange: '$25â€“$35', location: 'Zona Minas', image: '/images/gastronomia-2.jpg', rating: 4.8, description: 'Pastes con sabor a socavÃ³n: recetas que los abuelos llevaban al interior de las minas.' },
  { id: 'g-pastes-dulce', name: 'Paste Dulce La Joyita', type: 'paste', specialty: 'Dulce de arroz con leche y pasas', priceRange: '$30â€“$40', location: 'Portal', image: '/images/gastronomia-3.jpg', rating: 4.7, description: 'El postre-paste: arroz con leche, piloncillo y canela horneados en la masa tradicional.' },
  { id: 'g-socavon', name: 'Restaurante El SocavÃ³n', type: 'restaurante', specialty: 'Mixiotes, barbacoa, chilacayotes', priceRange: '$150â€“$300', location: 'Zona Minas', image: '/images/gastronomia-4.jpg', rating: 4.5, description: 'Cocina de montaÃ±a con vista a las chimeneas de La Dificultad. Cocido hidalguense todos los fines de semana.' },
  { id: 'g-casona', name: 'Casona del Conde', type: 'restaurante', specialty: 'Cocina novomexicana con toque britÃ¡nico', priceRange: '$200â€“$400', location: 'Centro HistÃ³rico', image: '/images/centro.jpg', rating: 4.6, description: 'MenÃº de autor que mezcla mole y tÃ© de la tarde estilo Cornualles en una casona del siglo XVIII.' },
  { id: 'g-horno', name: 'PanaderÃ­a El Horno del Real', type: 'panaderia', specialty: 'Pan de pulque, coyitas, pambazos', priceRange: '$10â€“$30', location: 'Centro', image: '/images/gastronomia-5.jpg', rating: 4.7, description: 'Hornos de piedra centenarios. El pan de pulque sale caliente a las 6:00 am.' },
  { id: 'g-luna', name: 'Helados y Esquimos La Luna', type: 'heladeria', specialty: 'Esquimos de leche quemada y guayaba', priceRange: '$25â€“$50', location: 'Plaza', image: '/images/plaza-principal.jpg', rating: 4.6, description: 'Los esquimos mÃ¡s famosos del Real: leche quemada, guayaba con queso y piloncillo.' },
  { id: 'g-altura', name: 'CafÃ© de Altura El Hiloche', type: 'cafe', specialty: 'CafÃ© de la Sierra de Hidalgo', priceRange: '$40â€“$70', location: 'Barrio Alto', image: '/images/ecoturismo.jpg', rating: 4.8, description: 'Tueste en el Real, cafÃ© de 2,400 msnm. Ideal contra el frÃ­o del altiplano, con vistas al bosque.' },
];

export const RDM_TRACKS: RDMTrack[] = [
  { id: 't-1', title: 'Hijos de la Sierra', artist: 'Banda de Viento Hidalgo', genre: 'MÃºsica de viento', duration: '3:42', image: '/images/realito-cultura.png' },
  { id: 't-2', title: 'Marcha de los Mineros', artist: 'Estudiantina del Real', genre: 'Estudiantina', duration: '4:10', image: '/images/plaza-principal.jpg' },
  { id: 't-3', title: 'Polka de la Niebla', artist: 'Ensemble Cornish RDM', genre: 'Polka cornish', duration: '2:58', image: '/images/pueblo.jpg' },
  { id: 't-4', title: 'El Repulgue', artist: 'Son Huasteco del Monte', genre: 'Son huasteco', duration: '3:25', image: '/images/gastronomia-1.jpg' },
  { id: 't-5', title: 'Caminos de Plata', artist: 'Mariachi Real de Minas', genre: 'Mariachi', duration: '3:50', image: '/images/monumento-minero.jpg' },
  { id: 't-6', title: 'El SocavÃ³n Sonoro', artist: 'Mina Sonora', genre: 'ElectrÃ³nica ambiental', duration: '5:12', image: '/images/ladificultad.jpg' },
  { id: 't-7', title: 'Corrido del PanteÃ³n InglÃ©s', artist: 'Los Mineros del Viento', genre: 'Corrido', duration: '4:05', image: '/images/real-1.jpg' },
  { id: 't-8', title: 'Atardecer en la PurÃ­sima', artist: 'Jazz de la Niebla', genre: 'Jazz', duration: '6:20', image: '/images/mirador-purisima.jpg' },
];

export const RDM_PODCAST: RDMPodcastEpisode[] = [
  { id: 'p-1', title: 'La Huelga de 1766', subtitle: 'La primera huelga de AmÃ©rica naciÃ³ aquÃ­', duration: '28 min', date: '12 Ene 2026', image: '/images/monumento-minero.jpg', description: 'CronologÃ­a del levantamiento de los mineros de la Mina de Dolores y su impacto mundial en los derechos laborales.', tags: ['Historia', 'Minas'] },
  { id: 'p-2', title: 'La receta secreta del paste', subtitle: 'ConversaciÃ³n con una pasteadora de 82 aÃ±os', duration: '35 min', date: '29 Ene 2026', image: '/images/gastronomia-1.jpg', description: 'DoÃ±a Chole revela el repulgue perfecto, el punto de la masa y por quÃ© el paste se trenza de lado.', tags: ['GastronomÃ­a', 'TradiciÃ³n'] },
  { id: 'p-3', title: 'El PanteÃ³n InglÃ©s y sus leyendas', subtitle: '634 tumbas que miran hacia Inglaterra', duration: '41 min', date: '14 Feb 2026', image: '/images/real-1.jpg', description: 'Los fantasmas, el payaso y las historias reales de la comunidad cornish enterrada en el Real.', tags: ['Leyendas', 'Cornish'] },
  { id: 'p-4', title: 'Isabella y el Gemelo Digital', subtitle: 'CÃ³mo una IA cuida el territorio', duration: '22 min', date: '01 Mar 2026', image: '/images/hidalgo-hero1.png', description: 'El equipo explica la HeptafederaciÃ³n YUN, los 7 nÃºcleos y el gemelo digital 2D/3D del Real.', tags: ['TecnologÃ­a', 'YUN'] },
  { id: 'p-5', title: 'Post-cuÃ¡ntica para el pueblo', subtitle: 'Â¿QuÃ© significa blindar un municipio?', duration: '26 min', date: '18 Mar 2026', image: '/images/realito-arte.png', description: 'De Dilithium a Falcon: la criptografÃ­a del futuro al servicio de la soberanÃ­a territorial.', tags: ['Seguridad', 'Futuro'] },
  { id: 'p-6', title: 'PeÃ±as Cargadas: el bosque que cuenta', subtitle: 'Senderos, mitos y reforestaciÃ³n', duration: '31 min', date: '04 Abr 2026', image: '/images/penas-cargadas.jpg', description: 'Las formaciones rocosas, los manantiales y las jornadas de conservaciÃ³n con la comunidad.', tags: ['Naturaleza', 'Comunidad'] },
];

export const RDM_BADGES: RDMBadge[] = [
  { id: 'b-1', name: 'GuardiÃ¡n Minero', icon: 'pickaxe', description: 'Visita la Mina de Acosta y su socavÃ³n.', rarity: 'ComÃºn' },
  { id: 'b-2', name: 'Maestro del Trenzado', icon: 'paste', description: 'Prueba pastes en 5 pasteadoras distintas.', rarity: 'Raro' },
  { id: 'b-3', name: 'Explorador de PeÃ±as', icon: 'mountain', description: 'Completa el sendero de PeÃ±as Cargadas.', rarity: 'Raro' },
  { id: 'b-4', name: 'Cronista Cornish', icon: 'scroll', description: 'Conoce la historia de los 44 mineros ingleses de 1824.', rarity: 'Ã‰pico' },
  { id: 'b-5', name: 'Embajador del Monte', icon: 'globe', description: 'Comparte 5 experiencias en la galerÃ­a comunitaria.', rarity: 'Ã‰pico' },
  { id: 'b-6', name: 'Leyenda del Real', icon: 'star', description: 'Completa los 7 nÃºcleos del pasaporte YUN.', rarity: 'Legendario' },
];

export const RDM_CHALLENGES: RDMChallenge[] = [
  { id: 'c-1', title: 'La Ruta de la Plata', points: 500, description: 'Visita las 4 minas histÃ³ricas: Acosta, Dificultad, Dolores y Museo de Medicina.', category: 'Minas', progress: 75 },
  { id: 'c-2', title: 'Cata de Pastes', points: 300, description: 'Prueba pastes de papa con carne, frijol, chile y dulce en un solo dÃ­a.', category: 'GastronomÃ­a', progress: 100 },
  { id: 'c-3', title: 'Atardecer Soberano', points: 200, description: 'FotografÃ­a el atardecer desde el Mirador PurÃ­sima y compÃ¡rtelo en la galerÃ­a.', category: 'Naturaleza', progress: 40 },
  { id: 'c-4', title: 'Legado Cornish', points: 350, description: 'Recorre el PanteÃ³n InglÃ©s y cuenta la leyenda del payaso Richard Bell.', category: 'Cultura', progress: 60 },
  { id: 'c-5', title: 'Embajador Verde', points: 250, description: 'Participa en la reforestaciÃ³n de PeÃ±as Cargadas o El Hiloche.', category: 'Comunidad', progress: 10 },
  { id: 'c-6', title: 'Cronista del Foro', points: 150, description: 'Publica tu primera historia de familia minera en el Foro RDM.', category: 'Comunidad', progress: 0 },
];

export const RDM_LEGENDS: RDMLegend[] = [
  { id: 'l-1', title: 'El TÃ­o de la Mina', category: 'MinerÃ­a', image: '/images/ladificultad.jpg', story: 'Los mineros del Real contaban que dentro de la tierra vive "El TÃ­o", el guardiÃ¡n del subsuelo que cuida las vetas. Antes de entrar al socavÃ³n, se le deja ofrenda de tabaco y pulque para pedir permiso y protecciÃ³n. Quien olvida al TÃ­o, corre el riesgo de que se cierre la veta.', moral: 'El respeto a la tierra es respeto al trabajo.' },
  { id: 'l-2', title: 'El Payaso del PanteÃ³n InglÃ©s', category: 'Leyenda', image: '/images/real-1.jpg', story: 'Cuentan que un payaso llamado Richard Bell fue enterrado en el PanteÃ³n InglÃ©s y que su fantasma vaga entre las tumbas haciendo malabares con una pelota de plata. Los vecinos juran haberlo visto las noches de niebla, y por eso se le dejan flores blancas que apuntan hacia Inglaterra.', moral: 'Hasta los muertos extraÃ±an su tierra.' },
  { id: 'l-3', title: 'El Duende del CallejÃ³n', category: 'Callejones', image: '/images/callejon.jpg', story: 'En el callejÃ³n del Zopilote, un duende vestido de minero aparece a los viajeros que caminan de noche. Solo quien le ofrece un paste de frijol continÃºa su camino seguro; el que se rÃ­e de Ã©l, pierde el rumbo hasta el amanecer.', moral: 'En el Real, la cortesÃ­a siempre abre puertas.' },
  { id: 'l-4', title: 'La Niebla del Mirador', category: 'Naturaleza', image: '/images/mirador-purisima.jpg', story: 'Dicen que la PurÃ­sima se viste de niebla cuando llora a los mineros que no volvieron. Por eso el atardecer es sagrado: es el momento en que las almas de los socavones suben al mirador a despedir el dÃ­a.', moral: 'La memoria vive en los paisajes.' },
  { id: 'l-5', title: 'El Cristo que Protege el Pueblo', category: 'Fe', image: '/images/zelotla.jpg', story: 'El Cristo Rey de Zelontla vigila el Real desde la peÃ±a. En las fiestas de la AsunciÃ³n, los mineros lo visten con casco y lÃ¡mpara, y se dice que la noche de tormenta su brazo se extiende para cubrir a los que trabajan bajo tierra.', moral: 'La fe y el oficio van de la mano en el monte.' },
];

export const RDM_DICHOS_MINEROS = [
  { id: 'dm-1', text: '"Minero que no pita, no es minero."', meaning: 'La pitada (silbato) era la seÃ±al de identidad y de peligro en el socavÃ³n.' },
  { id: 'dm-2', text: '"Al tiro y a la pala, con la lÃ¡mpara encendida."', meaning: 'Se trabaja con todo y a la vista: sin miedo y con preparaciÃ³n.' },
  { id: 'dm-3', text: '"El monte da, el monte quita."', meaning: 'La tierra regala la plata pero exige respeto y sacrificio.' },
  { id: 'dm-4', text: '"A buen minero, poca pala le sobra."', meaning: 'El oficio no estÃ¡ en la herramienta, sino en las manos del que la usa.' },
  { id: 'dm-5', text: '"El que baja al socavÃ³n, sube con memoria."', meaning: 'Todo minero vuelve a la superficie con una historia que contar.' },
  { id: 'dm-6', text: '"Plata por dÃ­a, leyenda por vida."', meaning: 'El minero no solo extrae riqueza, construye la identidad del pueblo.' },
];

export const RDM_FORUM_THREADS: RDMForumThread[] = [
  { id: 'f-1', title: 'Â¿CuÃ¡l es el mejor paste de Real del Monte? Debate definitivo', author: 'Don Beto', role: 'Cocinero local', category: 'GastronomÃ­a', replies: 48, likes: 132, time: 'hace 2 h', excerpt: 'Todos defendemos nuestra pasteadora, pero las pruebas son claras: el repulgue de Los Mineros no se compara...', pinned: true },
  { id: 'f-2', title: 'Historia de mi abuelo minero en la Mina de Acosta', author: 'Mariana V.', role: 'Nieta de minero', category: 'Historias', replies: 27, likes: 210, time: 'hace 5 h', excerpt: 'Mi abuelo bajaba con una lÃ¡mpara de carburo y un paste de frijol. Me enseÃ±Ã³ que el respeto al TÃ­o...' },
  { id: 'f-3', title: 'Feria del Paste 2026: propuestas de la comunidad', author: 'Colectivo GastronÃ³mico', role: 'Organizador', category: 'Eventos', replies: 19, likes: 86, time: 'hace 1 d', excerpt: 'Proponemos un concurso de repulgue en vivo y una cata de pastes dulces...', pinned: true },
  { id: 'f-4', title: 'CÃ³mo llegar desde CDMX en transporte pÃºblico', author: 'Turista_Ana', role: 'Visitante', category: 'Turismo', replies: 33, likes: 74, time: 'hace 1 d', excerpt: 'ADO a Pachuca + urbano al Real. Comparto horarios y consejos para evitar la niebla...' },
  { id: 'f-5', title: 'FotografÃ­as del PanteÃ³n InglÃ©s al atardecer', author: 'FotÃ³grafos de la Niebla', role: 'Colectivo', category: 'FotografÃ­a', replies: 15, likes: 168, time: 'hace 2 d', excerpt: 'Subimos nuestra Ãºltima sesiÃ³n con la luz dorada. Â¡Compartan las suyas en la galerÃ­a!', },
  { id: 'f-6', title: 'Voluntariado: reforestaciÃ³n en PeÃ±as Cargadas', author: 'Embajadores del Monte', role: 'Voluntarios', category: 'Comunidad', replies: 22, likes: 95, time: 'hace 3 d', excerpt: 'Este sÃ¡bado plantamos 400 oyameles. Necesitamos manos y botas...' },
];

export const RDM_HONOREES: RDMHonoree[] = [
  { id: 'h-1', name: 'Pedro Romero de Terreros', title: 'El Conde de Regla (1743)', achievement: 'ElevÃ³ el Real a la riqueza minera mÃ¡s grande de su Ã©poca y financiÃ³ la Marina Real espaÃ±ola.', image: '/images/pedro-romero.jpg', year: 'Siglo XVIII' },
  { id: 'h-2', name: 'Los 44 Mineros de Cornualles', title: 'Ingenieros del vapor (1824)', achievement: 'Trajeron la revoluciÃ³n industrial: mÃ¡quinas de vapor, el paste y el PanteÃ³n InglÃ©s.', image: '/images/real-1.jpg', year: '1824' },
  { id: 'h-3', name: 'Mineros de la Mina de Dolores', title: 'Primera huelga de AmÃ©rica', achievement: 'En 1766 se levantaron por sus derechos laborales, precedente mundial de la organizaciÃ³n obrera.', image: '/images/monumento-minero.jpg', year: '1766' },
  { id: 'h-4', name: 'DoÃ±a Chole Aguilar', title: 'Pasteadora Maestra', achievement: '60 aÃ±os horneando el paste perfecto; mentora de tres generaciones de pasteadoras.', image: '/images/gastronomia-1.jpg', year: '2025' },
  { id: 'h-5', name: 'Don Fidencio CortÃ©s', title: 'Capataz de Mina', achievement: '41 aÃ±os en el socavÃ³n de Acosta; cronista oral de los Ãºltimos dÃ­as de la minerÃ­a tradicional.', image: '/images/mina-acosta.jpg', year: '2024' },
  { id: 'h-6', name: 'Anubis VillaseÃ±or', title: 'Arquitecto de la HeptafederaciÃ³n YUN', achievement: 'Fundador del RDM Digital Hub, diseÃ±ador del Nodo Cero y del gemelo digital del territorio.', image: '/images/hidalgo-hero1.png', year: '2026' },
  { id: 'h-7', name: 'Embajadores del Monte', title: 'Voluntarios de la Comarca', achievement: '2,500 Ã¡rboles plantados y 120 jornadas de conservaciÃ³n del patrimonio en 2025.', image: '/images/hiloche.jpg', year: '2025' },
  { id: 'h-8', name: 'Isabella VillaseÃ±or AI', title: 'NÃºcleo de DecisiÃ³n YUN-01', achievement: 'La primera asistente cognitiva del territorio: orienta, recomienda y protege la identidad del Real.', image: '/images/realito-cultura.png', year: '2026' },
];

export const RDM_GALLERY: RDMGalleryItem[] = [
  { id: 'g-1', image: '/images/mirador-purisima.jpg', caption: 'Atardecer desde la PurÃ­sima, niebla dorada', author: 'FotÃ³grafos de la Niebla', type: 'imagen', category: 'Naturaleza', likes: 214 },
  { id: 'g-2', image: '/images/pueblo.jpg', caption: 'El Real visto desde el camino a Pachuca', author: 'Mariana V.', type: 'imagen', category: 'Pueblo', likes: 156 },
  { id: 'g-3', image: '/images/gastronomia-1.jpg', caption: 'Pastes reciÃ©n salidos del horno de piedra', author: 'Don Beto', type: 'imagen', category: 'GastronomÃ­a', likes: 189 },
  { id: 'g-4', image: '/images/calles.jpg', caption: 'Callejones empedrados tras la lluvia', author: 'Ana Turista', type: 'imagen', category: 'Pueblo', likes: 143 },
  { id: 'g-5', image: '/images/ladificultad.jpg', caption: 'Las chimeneas de La Dificultad al mediodÃ­a', author: 'Colectivo Pincel', type: 'imagen', category: 'Minas', likes: 178 },
  { id: 'g-6', image: '/images/penas-cargadas.jpg', caption: 'Rocas de PeÃ±as Cargadas entre oyameles', author: 'Senderista_RDM', type: 'imagen', category: 'Naturaleza', likes: 131 },
  { id: 'g-7', image: '/images/real-1.jpg', caption: 'El PanteÃ³n InglÃ©s en la niebla matutina', author: 'Cronista Cornish', type: 'imagen', category: 'Cultura', likes: 245 },
  { id: 'g-8', image: '/images/plaza-principal.jpg', caption: 'Vida de plaza un domingo por la maÃ±ana', author: 'Don Beto', type: 'video', category: 'Pueblo', likes: 97 },
  { id: 'g-9', image: '/images/realito-minas.png', caption: 'Video: recorrido guiado por la Mina de Acosta', author: 'Patronato Minero', type: 'video', category: 'Minas', likes: 320 },
  { id: 'g-10', image: '/images/rosario.jpg', caption: 'La Parroquia del Rosario iluminada', author: 'Mariana V.', type: 'imagen', category: 'Cultura', likes: 167 },
  { id: 'g-11', image: '/images/hiloche.jpg', caption: 'El Hiloche: el bosque que respira', author: 'Embajadores del Monte', type: 'imagen', category: 'Naturaleza', likes: 119 },
  { id: 'g-12', image: '/images/zelotla.jpg', caption: 'El Cristo de Zelontla vigilando el valle', author: 'Ana Turista', type: 'imagen', category: 'Cultura', likes: 154 },
];

export const RDM_TEAM = [
  { id: 'team-1', name: 'Edwin Oswaldo Castillo Trejo', role: 'Fundador Â· Arquitecto de la HeptafederaciÃ³n YUN', alias: 'Anubis VillaseÃ±or', bio: 'Visionario de la soberanÃ­a territorial digital. DiseÃ±Ã³ el Nodo Cero y el gemelo digital de Real del Monte.', image: '/images/hidalgo-hero1.png' },
  { id: 'team-2', name: 'Isabella VillaseÃ±or AI', role: 'NÃºcleo de DecisiÃ³n Â· Asistente Cognitiva', alias: 'YUN-01', bio: 'Inteligencia artificial del territorio: orienta turistas, custodia la historia y responde en tiempo real.', image: '/images/realito-cultura.png' },
  { id: 'team-3', name: 'Consejo de la Comarca', role: 'Gobernanza comunitaria de los 7 nÃºcleos', alias: 'CiudadanÃ­a Digital', bio: 'Pasteadoras, mineros, artesanos, jÃ³venes y autoridades locales que alimentan los datos del territorio.', image: '/images/pueblo.jpg' },
  { id: 'team-4', name: 'Patronato Minero RDM', role: 'Custodia del patrimonio histÃ³rico', alias: 'Minas & Socavones', bio: 'GuÃ­as certificados y conservadores de la Mina de Acosta, La Dificultad y el PanteÃ³n InglÃ©s.', image: '/images/mina-acosta.jpg' },
];

export const RDM_VALUES = [
  { id: 'v-1', title: 'SoberanÃ­a', description: 'Los datos y la identidad del territorio pertenecen a su gente, no a corporaciones.' },
  { id: 'v-2', title: 'Memoria', description: 'Honramos a mineros, pasteadoras y cronistas que construyeron el Real.' },
  { id: 'v-3', title: 'InnovaciÃ³n', description: 'Gemelo digital, IA y criptografÃ­a post-cuÃ¡ntica al servicio del pueblo.' },
  { id: 'v-4', title: 'Comunidad', description: 'Foro, muro de honor y galerÃ­a compartida: el Real es de quienes lo habitan.' },
];
