import type { IsabellaDecision } from "@/core/models";
import { LONG_FORM_NARRATIVES, REAL_DEL_MONTE_FACTS } from "@/lib/tourism-knowledge";
import { type Intent } from "./types";

export const REAL_DEL_MONTE_SITES = [
  { id: "1", name: "Mina de Acosta", category: "historia", lat: 20.1466566, lng: -98.6676983, rating: 4.8, description: "Mina histórica del siglo XVIII, joya del patrimonio minero." },
  { id: "2", name: "Museo de Medicina Laboral", category: "cultura", lat: 20.1399368, lng: -98.6740568, rating: 4.6, description: "Historia médica de los mineros de Real del Monte." },
  { id: "3", name: "Panteón Inglés", category: "historia", lat: 20.1382163, lng: -98.6671239, rating: 4.9, description: "Cementerio histórico de mineros británicos, único en México." },
  { id: "4", name: "Pastes El Portal", category: "gastronomia", lat: 20.14, lng: -98.672, rating: 4.7, description: "Los mejores pastes tradicionales cornish del pueblo." },
  { id: "5", name: "Pastes Kikos", category: "gastronomia", lat: 20.139, lng: -98.674, rating: 4.5, description: "Pastes artesanales con recetas originales desde 1940." },
  { id: "6", name: "Hotel Real del Monte", category: "hospedaje", lat: 20.141, lng: -98.675, rating: 4.3, description: "Hospedaje colonial con vista a las montañas." },
  { id: "7", name: "Peña del Cuervo", category: "aventura", lat: 20.135, lng: -98.668, rating: 4.8, description: "Mirador natural con senderos de montaña espectaculares." },
  { id: "8", name: "Iglesia de la Asunción", category: "cultura", lat: 20.14, lng: -98.671, rating: 4.6, description: "Templo del siglo XVIII, centro espiritual del pueblo." },
  { id: "9", name: "Centro Cultural Nicolás Zavala", category: "cultura", lat: 20.138, lng: -98.672, rating: 4.4, description: "Galería de arte y espacio cultural comunitario." },
  { id: "10", name: "Sendero de las Minas", category: "aventura", lat: 20.136, lng: -98.669, rating: 4.7, description: "Recorrido por antiguas minas con guías locales." },
  { id: "11", name: "Plaza Principal", category: "cultura", lat: 20.1386, lng: -98.6707, rating: 4.5, description: "Nodo urbano para eventos, comercio local y vida comunitaria." },
  { id: "12", name: "Museo de Sitio Mina de Acosta", category: "historia", lat: 20.1396, lng: -98.6761, rating: 4.7, description: "Recorrido patrimonial por maquinaria minera y archivo técnico." },
  { id: "13", name: "Restaurante La Estación", category: "gastronomia", lat: 20.1377, lng: -98.6715, rating: 4.4, description: "Cocina regional con menú de temporada y fogón tradicional." },
  { id: "14", name: "Cabaña del Bosque", category: "hospedaje", lat: 20.1431, lng: -98.6784, rating: 4.6, description: "Refugio de montaña con vistas al corredor forestal." },
  { id: "15", name: "Cascada de la Sierra", category: "aventura", lat: 20.1324, lng: -98.6642, rating: 4.9, description: "Ruta eco-aventura con sendero interpretativo y mirador natural." },
  {
    id: "1",
    name: "Mina de Acosta",
    category: "historia",
    lat: 20.138,
    lng: -98.671,
    rating: 4.8,
    description: "Mina histórica del siglo XVIII con recorridos guiados sobre técnicas de extracción y vida obrera.",
  },
  {
    id: "2",
    name: "Museo de Medicina Laboral",
    category: "cultura",
    lat: 20.139,
    lng: -98.673,
    rating: 4.6,
    description: "Espacio clave para entender salud ocupacional, riesgos mineros y evolución hospitalaria en la región.",
  },
  {
    id: "3",
    name: "Panteón Inglés",
    category: "historia",
    lat: 20.137,
    lng: -98.67,
    rating: 4.9,
    description: "Patrimonio funerario británico con trazos simbólicos de la migración cornish a Hidalgo.",
  },
  {
    id: "4",
    name: "Pastes El Portal",
    category: "gastronomia",
    lat: 20.14,
    lng: -98.672,
    rating: 4.7,
    description: "Pastes tradicionales en rango local estimado de $20 a $25 MXN por pieza clásica.",
  },
  {
    id: "5",
    name: "Pastes Kiko's",
    category: "gastronomia",
    lat: 20.139,
    lng: -98.674,
    rating: 4.5,
    description: "Recetas artesanales con línea tradicional en rango local de $20 a $25 MXN por pieza.",
  },
  {
    id: "6",
    name: "Hotel Real del Monte",
    category: "hospedaje",
    lat: 20.141,
    lng: -98.675,
    rating: 4.3,
    description: "Hospedaje colonial con atmósfera de niebla, ideal para escapadas románticas de fin de semana.",
  },
  {
    id: "7",
    name: "Peña del Cuervo",
    category: "aventura",
    lat: 20.135,
    lng: -98.668,
    rating: 4.8,
    description: "Mirador natural para senderismo fotográfico, amaneceres de sierra y experiencias de aventura ligera.",
  },
  {
    id: "8",
    name: "Iglesia de la Asunción",
    category: "cultura",
    lat: 20.14,
    lng: -98.671,
    rating: 4.6,
    description: "Templo emblemático del centro histórico, referencia de continuidad espiritual y urbana del pueblo.",
  },
  {
    id: "9",
    name: "Centro Cultural Nicolás Zavala",
    category: "cultura",
    lat: 20.138,
    lng: -98.672,
    rating: 4.4,
    description: "Galería y foro para arte local, talleres y actividades de memoria comunitaria.",
  },
  {
    id: "10",
    name: "Sendero de las Minas",
    category: "aventura",
    lat: 20.136,
    lng: -98.669,
    rating: 4.7,
    description: "Ruta de caminata interpretativa entre vestigios mineros, bosque y vistas de alta montaña.",
  },
] as const;

const NARRATIVES: Record<Intent, string[]> = LONG_FORM_NARRATIVES;

export function inferIntent(query: string): Intent {
  const q = query.toLowerCase();
  if (q.match(/comer|paste|comida|restaurante|hambre|desayun|cena|caf[eé]/)) return "gastronomia";
  if (q.match(/hotel|dormir|hosped|quedar|descansar|cabaña|rom[aá]ntic/)) return "hospedaje";
  if (q.match(/historia|mina|museo|colonial|antiguo|pasado|patrimonio/)) return "historia";
  if (q.match(/aventura|sendero|caminar|montaña|senderismo|escalada|mirador/)) return "aventura";
  return "cultura";
}

export function getRecommendations(intent: Intent) {
  return REAL_DEL_MONTE_SITES.filter((p) => p.category === intent).slice(0, 3);
}

function narrativeByDecision(decision?: IsabellaDecision) {
  if (!decision) return null;

  if (decision.retentionIntent === "SAFE_EXIT") {
    return "Te acompaño con una salida segura: caminemos por rutas visibles, con paradas culturales breves y cierre tranquilo en el centro histórico.";
  }

  if (decision.retentionIntent === "UPSELL") {
    return "Antes de cerrar tu visita, te propongo una experiencia de alto valor: gastronomía local o mirador cercano con tiempo óptimo de traslado.";
  }

  return "Modo descubrimiento activo: tengo opciones cercanas con equilibrio entre historia, paisaje y experiencia gastronómica.";
}

export function generateNarrative(intent: Intent, decision?: IsabellaDecision): string {
  const decisionDriven = narrativeByDecision(decision);
  if (decisionDriven) return decisionDriven;

  const narrs = NARRATIVES[intent];
  return narrs[Math.floor(Math.random() * narrs.length)];
}

export function getAllPlaces() {
  return REAL_DEL_MONTE_SITES;
}

export function getSystemMetrics() {
  return {
    activeUsers: Math.floor(Math.random() * 50) + 120,
    placesIndexed: REAL_DEL_MONTE_SITES.length,
    kernelLatency: Math.floor(Math.random() * 30) + 80,
    uptime: 99.97,
    intentsProcessed: Math.floor(Math.random() * 200) + 1840,
  };
}

export interface KernelOutput {
  intent: Intent;
  recommendations: typeof REAL_DEL_MONTE_SITES[number][];
  narrative: string;
  confidence: number;
  destinationBrief: string[];
  sources: readonly string[];
}

export function runRealitoKernel(query: string, decision?: IsabellaDecision): KernelOutput {
  const intent = inferIntent(query);
  const recommendations = getRecommendations(intent);
  const narrative = generateNarrative(intent, decision);

  return {
    intent,
    recommendations,
    narrative,
    confidence: 0.85 + Math.random() * 0.12,
    destinationBrief: [...REAL_DEL_MONTE_FACTS.heritage, ...REAL_DEL_MONTE_FACTS.culture, ...REAL_DEL_MONTE_FACTS.romance],
    sources: REAL_DEL_MONTE_FACTS.sources,
  };
}
