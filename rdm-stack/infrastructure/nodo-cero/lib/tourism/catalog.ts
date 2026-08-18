/* ================================================================== */
/* TURISMO — Catálogo turístico vivo de Real del Monte               */
/* ================================================================== */
/* Almacén del catálogo /turismo/*. La fuente de verdad en caliente es */
/* memoria (mismo patrón que gamificación e identity). Cada registro   */
/* porta procedencia y caducidad de verificación: si expiresAt caduca, */
/* el dato deja de mostrarse como confirmado (se conserva en el       */
/* catálogo pero marcado para re-verificación).                        */
/*                                                                     */
/* Los seeds corresponden al informe editorial de Real del Monte       */
/* (Pueblo Mágico desde 2004, distrito minero Real del Monte–Pachuca,  */
/* nombre prehispánico Magotsi). Fuentes primarias: SIC, Ruta de la    */
/* Plata, Presidencia Municipal, Dirección de Turismo.                 */
/* ================================================================== */

import { registerHydrator } from '@/lib/core/persistence';
import type {
  TourismPlace,
  TourismEvent,
  TourismRoute,
  TourismStory,
  TourismFoodItem,
  TourismPlaceQuery,
  TourismEventQuery,
  TourismRouteQuery,
  TourismStoryQuery,
} from './contracts';

interface TourismStoreShape {
  places: Map<string, TourismPlace>;
  events: Map<string, TourismEvent>;
  routes: Map<string, TourismRoute>;
  stories: Map<string, TourismStory>;
  foodItems: Map<string, TourismFoodItem>;
}

const g = globalThis as unknown as { __rdmTourismStore?: TourismStoreShape };

function getStore(): TourismStoreShape {
  if (!g.__rdmTourismStore) {
    g.__rdmTourismStore = {
      places: new Map(),
      events: new Map(),
      routes: new Map(),
      stories: new Map(),
      foodItems: new Map(),
    };
  }
  return g.__rdmTourismStore;
}

const now = () => new Date().toISOString();

/* Horas de apertura tipadas (closed:false explícito). */
function openHours(
  days: string,
  open: string,
  close: string,
): { days: string; open: string; close: string; closed: boolean } {
  return { days, open, close, closed: false };
}

/* ------------------------------------------------------------------ */
/* SEEDS — informe editorial de Real del Monte                         */
/* ------------------------------------------------------------------ */

function seed(): void {
  const store = getStore();

  /* --- Atractivos --- */
  const places: TourismPlace[] = [
    {
      id: 'plaza-principal',
      name: 'Plaza Principal (Plaza de la Constitución)',
      shortName: 'Plaza Principal',
      category: 'plaza',
      description:
        'Corazón del pueblo mágico: portal empedrado, jardines y la arquitectura minera que define al Real. Punto de encuentro para festivales y calendas.',
      address: 'Centro, Real del Monte, Hidalgo',
      coordinates: { lat: 20.1406, lng: -98.6717 },
      admissionFee: 'Gratuito',
      accessibility: true,
      hours: [openHours('Lunes a domingo', '00:00', '23:59')],
      image: '/images/plaza-principal.jpg',
      tags: ['centro', 'plaza', 'patrimonio'],
      status: 'published',
      sourceType: 'municipio',
      sourceContact: 'Dirección de Turismo · 771 792 0747',
      verifiedAt: '2026-07-15',
      verifiedBy: 'editorial-rdm',
      expiresAt: '2027-01-15',
      confidenceLevel: 'verified',
      createdAt: now(),
      updatedAt: now(),
      publishedAt: now(),
    },
    {
      id: 'parroquia-asuncion',
      name: 'Parroquia de Nuestra Señora de la Asunción',
      shortName: 'Parroquia de la Asunción',
      category: 'iglesia',
      description:
        'Templo barroco del siglo XVIII con ornamentación minera. Recibe las fiestas patronales de agosto dedicadas a la Asunción.',
      address: 'Plaza de la Constitución s/n, Real del Monte',
      coordinates: { lat: 20.1411, lng: -98.6712 },
      admissionFee: 'Gratuito (aportación voluntaria)',
      accessibility: false,
      hours: [openHours('Lunes a domingo', '08:00', '20:00')],
      image: '/images/real-4.jpg',
      tags: ['iglesia', 'barroco', 'fe'],
      status: 'published',
      sourceType: 'municipio',
      sourceContact: 'Dirección de Turismo · 771 792 0747',
      verifiedAt: '2026-07-15',
      verifiedBy: 'editorial-rdm',
      expiresAt: '2027-01-15',
      confidenceLevel: 'verified',
      createdAt: now(),
      updatedAt: now(),
      publishedAt: now(),
    },
    {
      id: 'iglesia-veracruz',
      name: 'Iglesia de la Santa Veracruz',
      shortName: 'Santa Veracruz',
      category: 'iglesia',
      description:
        'Capilla histórica del barrio minero; custodia el Vía Crucis tradicional del Real durante la Semana Santa.',
      address: 'Barrio de la Veracruz, Real del Monte',
      accessibility: false,
      hours: [openHours('Sábado y domingo', '10:00', '17:00')],
      image: '/images/calles.jpg',
      tags: ['iglesia', 'semanasanta'],
      status: 'published',
      sourceType: 'municipio',
      sourceContact: 'Dirección de Turismo · 771 792 0747',
      verifiedAt: '2026-07-15',
      verifiedBy: 'editorial-rdm',
      expiresAt: '2027-01-15',
      confidenceLevel: 'verified',
      createdAt: now(),
      updatedAt: now(),
      publishedAt: now(),
    },
    {
      id: 'mina-acosta',
      name: 'Museo de Sitio Mina de Acosta',
      shortName: 'Mina de Acosta',
      category: 'mina',
      description:
        'Museo de sitio que conserva el socavón original de la mina más célebre del distrito: tiro, malacate y galerías visitables con vestimenta y casco de minero.',
      address: 'Camino Real a Acosta s/n, Real del Monte',
      coordinates: { lat: 20.1453, lng: -98.6751 },
      admissionFee: '$80 MXN',
      accessibility: false,
      hours: [openHours('Martes a domingo', '10:00', '15:00')],
      image: '/images/mina-acosta.jpg',
      tags: ['mina', 'museo', 'historia'],
      status: 'published',
      sourceType: 'sic',
      sourceContact: 'SIC México · sistema informático cultural',
      verifiedAt: '2026-07-10',
      verifiedBy: 'editorial-rdm',
      expiresAt: '2027-01-10',
      confidenceLevel: 'contradictory',
      createdAt: now(),
      updatedAt: now(),
      publishedAt: now(),
    },
    {
      id: 'museo-medicina',
      name: 'Museo de Medicina Laboral (Centro Cultural Nicolás Zavala)',
      shortName: 'Museo de Medicina Laboral',
      category: 'museo',
      description:
        'Hospital minero que atendió al distrito de 1907 a 1982. Exhibe salas de consulta, quirófano y la historia de la salud laboral minera.',
      address: 'Calle Nicolás Zavala s/n, Real del Monte',
      coordinates: { lat: 20.1428, lng: -98.6742 },
      admissionFee: '$30 MXN',
      accessibility: false,
      hours: [openHours('Miércoles a domingo', '10:00', '18:00')],
      image: '/images/museo-medicina.jpg',
      tags: ['museo', 'historia', 'salud'],
      status: 'published',
      sourceType: 'sic',
      sourceContact: 'SIC México · sistema informático cultural',
      verifiedAt: '2026-07-10',
      verifiedBy: 'editorial-rdm',
      expiresAt: '2027-01-10',
      confidenceLevel: 'verified',
      createdAt: now(),
      updatedAt: now(),
      publishedAt: now(),
    },
    {
      id: 'panteon-ingles',
      name: 'Panteón Inglés',
      shortName: 'Panteón Inglés',
      category: 'panteon',
      description:
        'Cementerio de la comunidad británica fundado en 1851: único en Latinoamérica, con panteones de mármol de los mineros de Cornualles.',
      address: 'Cerro del Cuixmí, Real del Monte',
      coordinates: { lat: 20.1439, lng: -98.677 },
      admissionFee: '$30 MXN',
      accessibility: false,
      hours: [openHours('Martes a domingo', '10:00', '17:00')],
      image: '/images/real-1.jpg',
      tags: ['panteon', 'cornish', 'historia'],
      status: 'published',
      sourceType: 'municipio',
      sourceContact: 'Dirección de Turismo · 771 792 0747',
      verifiedAt: '2026-07-15',
      verifiedBy: 'editorial-rdm',
      expiresAt: '2027-01-15',
      confidenceLevel: 'verified',
      createdAt: now(),
      updatedAt: now(),
      publishedAt: now(),
    },
    {
      id: 'museo-paste',
      name: 'Museo del Paste',
      shortName: 'Museo del Paste',
      category: 'museo',
      description:
        'Recinto dedicado al emblema gastronómico del Real: origen cornish, técnicas de repulgue y la fusión con el chile y la papa mexicanos.',
      address: 'Centro Histórico, Real del Monte',
      admissionFee: 'Consultar',
      accessibility: true,
      hours: [openHours('Martes a domingo', '10:00', '18:00')],
      image: '/images/gastronomia-2.jpg',
      tags: ['museo', 'gastronomia', 'paste'],
      status: 'published',
      sourceType: 'campo',
      sourceContact: 'Dirección de Turismo · 771 792 0747',
      verifiedAt: '2026-07-12',
      verifiedBy: 'editorial-rdm',
      expiresAt: '2027-01-12',
      confidenceLevel: 'pending',
      createdAt: now(),
      updatedAt: now(),
      publishedAt: now(),
    },
    {
      id: 'museo-casa-grande',
      name: 'Museo Casa Grande (UAEH)',
      shortName: 'Casa Grande',
      category: 'museo',
      description:
        'Casona de la época de bonanza gestionada por la Universidad Autónoma del Estado de Hidalgo; expone la vida señorial del distrito minero.',
      address: 'Centro Histórico, Real del Monte',
      admissionFee: 'Consultar',
      accessibility: false,
      hours: [openHours('Martes a domingo', '10:00', '18:00')],
      image: '/images/real-2.jpg',
      tags: ['museo', 'uaeh', 'patrimonio'],
      status: 'published',
      sourceType: 'campo',
      sourceContact: 'Dirección de Turismo · 771 792 0747',
      verifiedAt: '2026-07-12',
      verifiedBy: 'editorial-rdm',
      expiresAt: '2027-01-12',
      confidenceLevel: 'pending',
      createdAt: now(),
      updatedAt: now(),
      publishedAt: now(),
    },
    {
      id: 'bosque-hiloche',
      name: 'Bosque El Hiloche',
      shortName: 'El Hiloche',
      category: 'bosque',
      description:
        'Área boscosa de oyameles sobre la sierra: senderos de ecoturismo, miradores y clima de montaña a minutos del centro.',
      address: 'Carretera Real del Monte – Omitlán',
      coordinates: { lat: 20.1481, lng: -98.6655 },
      admissionFee: 'Gratuito (donativo sugerido)',
      accessibility: false,
      hours: [openHours('Lunes a domingo', '08:00', '18:00')],
      image: '/images/hiloche.jpg',
      tags: ['ecoturismo', 'bosque', 'naturaleza'],
      status: 'published',
      sourceType: 'campo',
      sourceContact: 'Dirección de Turismo · 771 792 0747',
      verifiedAt: '2026-07-15',
      verifiedBy: 'editorial-rdm',
      expiresAt: '2027-01-15',
      confidenceLevel: 'verified',
      createdAt: now(),
      updatedAt: now(),
      publishedAt: now(),
    },
    {
      id: 'penas-cargadas',
      name: 'Parque Ecológico Peñas Cargadas',
      shortName: 'Peñas Cargadas',
      category: 'bosque',
      description:
        'Parque con formaciones rocosas y senderos; sede del Trail de Peñas Cargadas y miradores hacia la sierra de Pachuca.',
      address: 'Real del Monte, Hidalgo',
      coordinates: { lat: 20.1522, lng: -98.6551 },
      admissionFee: 'Gratuito (donativo sugerido)',
      accessibility: false,
      hours: [openHours('Lunes a domingo', '08:00', '18:00')],
      image: '/images/penas-cargadas.jpg',
      tags: ['ecoturismo', 'senderismo', 'naturaleza'],
      status: 'published',
      sourceType: 'campo',
      sourceContact: 'Dirección de Turismo · 771 792 0747',
      verifiedAt: '2026-07-15',
      verifiedBy: 'editorial-rdm',
      expiresAt: '2027-01-15',
      confidenceLevel: 'verified',
      createdAt: now(),
      updatedAt: now(),
      publishedAt: now(),
    },
  ];

  for (const place of places) store.places.set(place.id, place);

  /* --- Eventos --- */
  const events: TourismEvent[] = [
    {
      id: 'feria-paste-2026',
      name: 'Festival Internacional del Paste 2026',
      category: 'gastronomico',
      place: 'El Real (Plaza de la Constitución y calles aledañas)',
      description:
        'La fiesta gastronómica del paste: concursos de repulgue, cientos de variedades y música en vivo. Edición 2026 confirmada.',
      image: '/images/gastronomia-3.jpg',
      recurring: true,
      sessions: [
        {
          id: 'feria-paste-2026-1',
          label: 'Festival Internacional del Paste',
          startsAt: '2026-10-09',
          endsAt: '2026-10-11',
          admission: 'Gratuito',
        },
      ],
      tags: ['gastronomia', 'paste', 'festival'],
      status: 'published',
      sourceType: 'prensa',
      sourceContact: 'Presidencia Municipal · 771 797 11216',
      verifiedAt: '2026-07-20',
      verifiedBy: 'editorial-rdm',
      expiresAt: '2026-10-11',
      confidenceLevel: 'verified',
      createdAt: now(),
      updatedAt: now(),
      publishedAt: now(),
    },
    {
      id: 'festival-plata-2026',
      name: 'Festival de la Plata 2026',
      category: 'fiesta',
      place: 'Real del Monte y Pachuca',
      description:
        'Fiesta de la plata y la identidad minera: conciertos, artesanías y actividades culturales. Edición realizada.',
      image: '/images/real-1.jpg',
      recurring: true,
      sessions: [
        {
          id: 'festival-plata-2026-1',
          label: 'Festival de la Plata',
          startsAt: '2026-07-30',
          endsAt: '2026-08-02',
          admission: 'Consultar',
        },
      ],
      tags: ['plata', 'festival', 'mineria'],
      status: 'published',
      sourceType: 'prensa',
      sourceContact: 'Presidencia Municipal · 771 797 11216',
      verifiedAt: '2026-07-20',
      verifiedBy: 'editorial-rdm',
      expiresAt: '2026-08-03',
      confidenceLevel: 'historical',
      createdAt: now(),
      updatedAt: now(),
      publishedAt: now(),
    },
    {
      id: 'huelga-1766',
      name: 'Festival de la Primera Huelga de América',
      category: 'fiesta',
      place: 'Mina de Dolores y Monumento al Minero',
      description:
        'Recuerda el levantamiento de los mineros de 1766, precedente mundial de los derechos laborales: teatro de calle, ofrendas y música de banda.',
      image: '/images/monumento-minero.jpg',
      recurring: true,
      sessions: [{ id: 'huelga-1766-1', label: 'Conmemoración anual (julio)' }],
      tags: ['historia', 'huelga', 'mineria'],
      status: 'published',
      sourceType: 'campo',
      sourceContact: 'Dirección de Turismo · 771 792 0747',
      verifiedAt: '2026-07-15',
      verifiedBy: 'editorial-rdm',
      expiresAt: '2027-07-15',
      confidenceLevel: 'verified',
      createdAt: now(),
      updatedAt: now(),
      publishedAt: now(),
    },
    {
      id: 'fiesta-asuncion',
      name: 'Fiestas Patronales de la Asunción',
      category: 'religioso',
      place: 'Parroquia de la Asunción y Plaza Principal',
      description:
        'Procesiones, castillos pirotécnicos, danzas tradicionales y verbena popular en honor a la Virgen de la Asunción.',
      image: '/images/real-4.jpg',
      recurring: true,
      sessions: [{ id: 'fiesta-asuncion-1', label: 'Fiesta patronal (agosto)' }],
      tags: ['religioso', 'fiesta', 'tradicion'],
      status: 'published',
      sourceType: 'campo',
      sourceContact: 'Dirección de Turismo · 771 792 0747',
      verifiedAt: '2026-07-15',
      verifiedBy: 'editorial-rdm',
      expiresAt: '2027-08-15',
      confidenceLevel: 'verified',
      createdAt: now(),
      updatedAt: now(),
      publishedAt: now(),
    },
    {
      id: 'semana-cornish',
      name: 'Semana de los Mineros de Cornualles',
      category: 'musical',
      place: 'Mina de Acosta, Panteón Inglés y Centro Histórico',
      description:
        'Conmemora la llegada de los 44 mineros ingleses en 1824: recorridos históricos, té cornish, conciertos y actos en el Panteón Inglés.',
      image: '/images/real-1.jpg',
      recurring: true,
      sessions: [{ id: 'semana-cornish-1', label: 'Semana Cornish (marzo)' }],
      tags: ['cornish', 'historia', 'musica'],
      status: 'published',
      sourceType: 'campo',
      sourceContact: 'Dirección de Turismo · 771 792 0747',
      verifiedAt: '2026-07-15',
      verifiedBy: 'editorial-rdm',
      expiresAt: '2027-03-15',
      confidenceLevel: 'verified',
      createdAt: now(),
      updatedAt: now(),
      publishedAt: now(),
    },
    {
      id: 'espantapajaros',
      name: 'Festival de Día de Muertos del Real',
      category: 'fiesta',
      place: 'Panteón Inglés y centro del pueblo',
      description:
        'Altar monumental, leyendas narradas en vivo y visita nocturna al Panteón Inglés iluminado con velas.',
      image: '/images/penas-cargadas.jpg',
      recurring: true,
      sessions: [{ id: 'espantapajaros-1', label: 'Día de Muertos (noviembre)' }],
      tags: ['muertos', 'leyendas', 'tradicion'],
      status: 'published',
      sourceType: 'campo',
      sourceContact: 'Dirección de Turismo · 771 792 0747',
      verifiedAt: '2026-07-15',
      verifiedBy: 'editorial-rdm',
      expiresAt: '2027-11-15',
      confidenceLevel: 'verified',
      createdAt: now(),
      updatedAt: now(),
      publishedAt: now(),
    },
    {
      id: 'trail-penas',
      name: 'Trail de Peñas Cargadas',
      category: 'deportivo',
      place: 'Parque Ecológico Peñas Cargadas',
      description:
        'Carrera de montaña por senderos entre oyameles con vistas a la sierra de Pachuca, organizada con la comunidad local.',
      image: '/images/hiloche.jpg',
      recurring: true,
      sessions: [{ id: 'trail-penas-1', label: 'Carrera de montaña (septiembre)' }],
      tags: ['deporte', 'senderismo', 'naturaleza'],
      status: 'published',
      sourceType: 'campo',
      sourceContact: 'Dirección de Turismo · 771 792 0747',
      verifiedAt: '2026-07-15',
      verifiedBy: 'editorial-rdm',
      expiresAt: '2027-09-15',
      confidenceLevel: 'verified',
      createdAt: now(),
      updatedAt: now(),
      publishedAt: now(),
    },
  ];

  for (const event of events) store.events.set(event.id, event);

  /* --- Rutas --- */
  const routes: TourismRoute[] = [
    {
      id: 'ruta-minera',
      name: 'Ruta de la Plata y las Minas',
      duration: '4-5 horas',
      distance: '6 km',
      difficulty: 'moderada',
      description:
        'El recorrido esencial por la historia minera del Real: del socavón de Acosta a las chimeneas de La Dificultad, pasando por la primera huelga de América.',
      image: '/images/mina-acosta.jpg',
      stops: [
        { order: 1, name: 'Mina de Acosta', placeId: 'mina-acosta' },
        { order: 2, name: 'Museo de Medicina Laboral', placeId: 'museo-medicina' },
        { order: 3, name: 'Panteón Inglés', placeId: 'panteon-ingles' },
      ],
      tags: ['mineria', 'historia', 'patrimonio'],
      status: 'published',
      sourceType: 'municipio',
      sourceContact: 'Dirección de Turismo · 771 792 0747',
      verifiedAt: '2026-07-15',
      verifiedBy: 'editorial-rdm',
      expiresAt: '2027-01-15',
      confidenceLevel: 'verified',
      createdAt: now(),
      updatedAt: now(),
      publishedAt: now(),
    },
    {
      id: 'ruta-english',
      name: 'Ruta del Legado Inglés (Cornish Trail)',
      duration: '3 horas',
      distance: '4 km',
      difficulty: 'facil',
      description:
        'Tras los pasos de los mineros de Cornualles: del Panteón Inglés a las casonas del barrio británico, con té y pastes al final.',
      image: '/images/real-1.jpg',
      stops: [
        { order: 1, name: 'Panteón Inglés', placeId: 'panteon-ingles' },
        { order: 2, name: 'Centro Histórico y Callejones', placeId: 'plaza-principal' },
        { order: 3, name: 'Museo del Paste', placeId: 'museo-paste' },
      ],
      tags: ['cornish', 'historia', 'gastronomia'],
      status: 'published',
      sourceType: 'municipio',
      sourceContact: 'Dirección de Turismo · 771 792 0747',
      verifiedAt: '2026-07-15',
      verifiedBy: 'editorial-rdm',
      expiresAt: '2027-01-15',
      confidenceLevel: 'verified',
      createdAt: now(),
      updatedAt: now(),
      publishedAt: now(),
    },
    {
      id: 'ruta-gourmet',
      name: 'Ruta del Paste y la Cocina de Minero',
      duration: '3-4 horas',
      distance: '3 km',
      difficulty: 'facil',
      description:
        'Degustación guiada por las pasteadoras más premiadas del Real, de la papa con carne al mole verde, pasando por el dulce de piloncillo.',
      image: '/images/gastronomia-2.jpg',
      stops: [
        { order: 1, name: 'Museo del Paste', placeId: 'museo-paste' },
        { order: 2, name: 'Pasteadoras del centro', placeId: 'plaza-principal' },
        { order: 3, name: 'Helados artesanales de la plaza', placeId: 'plaza-principal' },
      ],
      tags: ['gastronomia', 'paste', 'tradicion'],
      status: 'published',
      sourceType: 'municipio',
      sourceContact: 'Dirección de Turismo · 771 792 0747',
      verifiedAt: '2026-07-15',
      verifiedBy: 'editorial-rdm',
      expiresAt: '2027-01-15',
      confidenceLevel: 'verified',
      createdAt: now(),
      updatedAt: now(),
      publishedAt: now(),
    },
    {
      id: 'ruta-naturaleza',
      name: 'Ruta de los Miradores y el Bosque',
      duration: '5-6 horas',
      distance: '9 km',
      difficulty: 'exigente',
      description:
        'De la cumbre del Cristo de Zelontla al Bosque El Hiloche y el atardecer en el Mirador de la Purísima. Senderismo entre oyameles.',
      image: '/images/hiloche.jpg',
      stops: [
        { order: 1, name: 'Bosque El Hiloche', placeId: 'bosque-hiloche' },
        { order: 2, name: 'Parque Ecológico Peñas Cargadas', placeId: 'penas-cargadas' },
      ],
      tags: ['ecoturismo', 'senderismo', 'naturaleza'],
      status: 'published',
      sourceType: 'municipio',
      sourceContact: 'Dirección de Turismo · 771 792 0747',
      verifiedAt: '2026-07-15',
      verifiedBy: 'editorial-rdm',
      expiresAt: '2027-01-15',
      confidenceLevel: 'verified',
      createdAt: now(),
      updatedAt: now(),
      publishedAt: now(),
    },
  ];

  for (const route of routes) store.routes.set(route.id, route);

  /* --- Historias, dichos y leyendas --- */
  const stories: TourismStory[] = [
    {
      id: 'dicho-1',
      kind: 'dicho',
      title: 'El que trabaja en la mina, no sabe lo que es hambre',
      text: '"El que trabaja en la mina, no sabe lo que es hambre."',
      meaning: 'El trabajo minero era dignificado y su dureza se compensaba con comida abundante y respeto de la comunidad.',
      origin: 'Dicho tradicional de las plazas mineras de Pachuca y Real del Monte.',
      tags: ['dicho', 'mineria'],
      status: 'published',
      sourceType: 'oral',
      sourceContact: 'Tradición oral del Real',
      verifiedAt: '2026-07-15',
      verifiedBy: 'editorial-rdm',
      expiresAt: '2027-07-15',
      confidenceLevel: 'verified',
      createdAt: now(),
      updatedAt: now(),
      publishedAt: now(),
    },
    {
      id: 'dicho-2',
      kind: 'dicho',
      title: 'Paste frío, corazón caliente',
      text: '"Paste frío, corazón caliente."',
      meaning: 'Aunque el paste se enfríe al salir del horno, alimenta y abriga al minero que lo lleva al socavón.',
      origin: 'Leyenda popular de las pasteadoras del Real del Monte.',
      tags: ['dicho', 'paste', 'gastronomia'],
      status: 'published',
      sourceType: 'oral',
      sourceContact: 'Tradición oral del Real',
      verifiedAt: '2026-07-15',
      verifiedBy: 'editorial-rdm',
      expiresAt: '2027-07-15',
      confidenceLevel: 'verified',
      createdAt: now(),
      updatedAt: now(),
      publishedAt: now(),
    },
    {
      id: 'leyenda-tunel',
      kind: 'leyenda',
      title: 'El túnel que no acaba',
      text:
        'Se cuenta que los socavones del Real esconden túneles que nunca se terminaron, y que en las noches de niebla se escuchan las barretas de los barreteros que aún los abren.',
      meaning: 'La niebla y la profundidad de las minas alimentan el misterio del distrito.',
      origin: 'Relato popular recogido por guías locales.',
      tags: ['leyenda', 'mineria', 'misterio'],
      status: 'published',
      sourceType: 'oral',
      sourceContact: 'Guías locales del Real',
      verifiedAt: '2026-07-15',
      verifiedBy: 'editorial-rdm',
      expiresAt: '2027-07-15',
      confidenceLevel: 'verified',
      createdAt: now(),
      updatedAt: now(),
      publishedAt: now(),
    },
    {
      id: 'oral-magotsi',
      kind: 'oral',
      title: 'Magotsi: el nombre de antes',
      text:
        'Antes de los españoles, la sierra se llamaba Magotsi, palabra otomí del lugar. La memoria oral conserva ese nombre y los ritos en los cerros.',
      meaning: 'El Real del Monte no nació con la mina: ya había territorio y pueblo.',
      origin: 'Memoria oral de las comunidades otomíes de la sierra.',
      tags: ['historia', 'otomí', 'memoria'],
      status: 'published',
      sourceType: 'oral',
      sourceContact: 'Memoria oral otomí',
      verifiedAt: '2026-07-15',
      verifiedBy: 'editorial-rdm',
      expiresAt: '2027-07-15',
      confidenceLevel: 'verified',
      createdAt: now(),
      updatedAt: now(),
      publishedAt: now(),
    },
  ];

  for (const story of stories) store.stories.set(story.id, story);

  /* --- Gastronomía --- */
  const foodItems: TourismFoodItem[] = [
    {
      id: 'paste-papa-carne',
      name: 'Paste de papa con carne',
      description:
        'El clásico del Real: papa, carne de res y el repulgue tradicional cornish, recién salido del horno de piedra.',
      image: '/images/gastronomia-3.jpg',
      tags: ['paste', 'clasico'],
      status: 'published',
      sourceType: 'campo',
      sourceContact: 'Pasteadoras del centro',
      verifiedAt: '2026-07-15',
      verifiedBy: 'editorial-rdm',
      expiresAt: '2027-07-15',
      confidenceLevel: 'verified',
      createdAt: now(),
      updatedAt: now(),
      publishedAt: now(),
    },
    {
      id: 'paste-mole-verde',
      name: 'Paste de mole verde',
      description:
        'Variante de la fusión mexicanizada: mole verde con pollo y papas, todo dentro del mismo repulgue cornish.',
      image: '/images/gastronomia-1.jpg',
      tags: ['paste', 'mole'],
      status: 'published',
      sourceType: 'campo',
      sourceContact: 'Pasteadoras del centro',
      verifiedAt: '2026-07-15',
      verifiedBy: 'editorial-rdm',
      expiresAt: '2027-07-15',
      confidenceLevel: 'verified',
      createdAt: now(),
      updatedAt: now(),
      publishedAt: now(),
    },
    {
      id: 'dulce-piloncillo',
      name: 'Paste dulce de piloncillo',
      description:
        'El cierre perfecto: pasta dulce de piloncillo y nuez, herencia del postre cornish adaptado a los ingredientes de la sierra.',
      image: '/images/gastronomia-2.jpg',
      tags: ['paste', 'dulce'],
      status: 'published',
      sourceType: 'campo',
      sourceContact: 'Pasteadoras del centro',
      verifiedAt: '2026-07-15',
      verifiedBy: 'editorial-rdm',
      expiresAt: '2027-07-15',
      confidenceLevel: 'verified',
      createdAt: now(),
      updatedAt: now(),
      publishedAt: now(),
    },
  ];

  for (const item of foodItems) store.foodItems.set(item.id, item);
}

/* Hidratación del catálogo (arranque del server). */
registerHydrator('tourism', async () => {
  const store = getStore();
  if (store.places.size === 0) seed();
});

/* ------------------------------------------------------------------ */
/* Consultas públicas                                                  */
/* ------------------------------------------------------------------ */

export function listPlaces(query: TourismPlaceQuery = {}): TourismPlace[] {
  const store = getStore();
  if (store.places.size === 0) seed();
  const q = query.q?.toLowerCase().trim();
  return [...store.places.values()]
    .filter(place => place.status === 'published')
    .filter(place => (query.category ? place.category === query.category : true))
    .filter(place => (query.confidence ? place.confidenceLevel === query.confidence : true))
    .filter(place =>
      q
        ? `${place.name} ${place.description} ${place.tags.join(' ')}`.toLowerCase().includes(q)
        : true,
    )
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getPlace(id: string): TourismPlace | null {
  const store = getStore();
  if (store.places.size === 0) seed();
  const place = store.places.get(id);
  return place && place.status === 'published' ? place : null;
}

export function listEvents(query: TourismEventQuery = {}): TourismEvent[] {
  const store = getStore();
  if (store.events.size === 0) seed();
  const q = query.q?.toLowerCase().trim();
  const today = new Date().toISOString().slice(0, 10);
  return [...store.events.values()]
    .filter(event => event.status === 'published')
    .filter(event => (query.category ? event.category === query.category : true))
    .filter(event => (query.confidence ? event.confidenceLevel === query.confidence : true))
    .filter(event => {
      if (!query.upcoming) return true;
      const latest = event.sessions
        .map(s => s.endsAt ?? s.startsAt ?? '')
        .filter(Boolean)
        .sort()
        .at(-1);
      return latest !== undefined && latest >= today;
    })
    .filter(event =>
      q
        ? `${event.name} ${event.description} ${event.tags.join(' ')}`.toLowerCase().includes(q)
        : true,
    )
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getEvent(id: string): TourismEvent | null {
  const store = getStore();
  if (store.events.size === 0) seed();
  const event = store.events.get(id);
  return event && event.status === 'published' ? event : null;
}

export function listRoutes(query: TourismRouteQuery = {}): TourismRoute[] {
  const store = getStore();
  if (store.routes.size === 0) seed();
  const q = query.q?.toLowerCase().trim();
  return [...store.routes.values()]
    .filter(route => route.status === 'published')
    .filter(route => (query.difficulty ? route.difficulty === query.difficulty : true))
    .filter(route => (query.confidence ? route.confidenceLevel === query.confidence : true))
    .filter(route =>
      q
        ? `${route.name} ${route.description} ${route.tags.join(' ')}`.toLowerCase().includes(q)
        : true,
    )
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getRoute(id: string): TourismRoute | null {
  const store = getStore();
  if (store.routes.size === 0) seed();
  const route = store.routes.get(id);
  return route && route.status === 'published' ? route : null;
}

export function listStories(query: TourismStoryQuery = {}): TourismStory[] {
  const store = getStore();
  if (store.stories.size === 0) seed();
  const q = query.q?.toLowerCase().trim();
  return [...store.stories.values()]
    .filter(story => story.status === 'published')
    .filter(story => (query.kind ? story.kind === query.kind : true))
    .filter(story => (query.confidence ? story.confidenceLevel === query.confidence : true))
    .filter(story =>
      q
        ? `${story.title} ${story.text} ${story.tags.join(' ')}`.toLowerCase().includes(q)
        : true,
    )
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function getStory(id: string): TourismStory | null {
  const store = getStore();
  if (store.stories.size === 0) seed();
  const story = store.stories.get(id);
  return story && story.status === 'published' ? story : null;
}

export function listFoodItems(): TourismFoodItem[] {
  const store = getStore();
  if (store.foodItems.size === 0) seed();
  return [...store.foodItems.values()]
    .filter(item => item.status === 'published')
    .sort((a, b) => a.name.localeCompare(b.name));
}

/* ------------------------------------------------------------------ */
/* Estadísticas del catálogo (telemetría / página de turismo)         */
/* ------------------------------------------------------------------ */

export function tourismStats(): {
  places: number;
  events: number;
  routes: number;
  stories: number;
  foodItems: number;
  verified: number;
  pending: number;
  contradictory: number;
  historical: number;
} {
  const store = getStore();
  if (store.places.size === 0) seed();
  const all = [
    ...[...store.places.values()],
    ...[...store.events.values()],
    ...[...store.routes.values()],
    ...[...store.stories.values()],
    ...[...store.foodItems.values()],
  ];
  return {
    places: store.places.size,
    events: store.events.size,
    routes: store.routes.size,
    stories: store.stories.size,
    foodItems: store.foodItems.size,
    verified: all.filter(item => item.confidenceLevel === 'verified').length,
    pending: all.filter(item => item.confidenceLevel === 'pending').length,
    contradictory: all.filter(item => item.confidenceLevel === 'contradictory').length,
    historical: all.filter(item => item.confidenceLevel === 'historical').length,
  };
}

/** Limpieza total (uso en pruebas). */
export function resetTourismForTests(): void {
  const store = getStore();
  store.places.clear();
  store.events.clear();
  store.routes.clear();
  store.stories.clear();
  store.foodItems.clear();
}
