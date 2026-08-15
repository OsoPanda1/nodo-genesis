// Tipos base de intención y modo

export type IsabellaIntent =
  | "greeting"
  | "yun"
  | "gastronomia"
  | "minas"
  | "cultura"
  | "naturaleza"
  | "eventos"
  | "seguridad"
  | "historia"
  | "ruta"
  | "comercio"
  | "dicho"
  | "tecnologia"
  | "pois"
  | "memoria"
  | "ayuda"
  | "gamificacion"
  | "fallback";

export type IntentMode =
  | "informational"
  | "navigational"
  | "transitional"
  | "situational"
  | "constitutional";

export interface KnowledgeFact {
  intent: IsabellaIntent;
  title: string;
  facts: string[];
  mode: IntentMode;
  priority: number;
  tags: string[];
}

/* ------------------------------------------------------------------ */
/* ISABELLA_KNOWLEDGE v2 — Corpus enriquecido                         */
/* ------------------------------------------------------------------ */

export const ISABELLA_KNOWLEDGE: KnowledgeFact[] = [
  {
    intent: "greeting",
    title: "Saludo del Nodo Cero",
    mode: "situational",
    priority: 90,
    tags: ["nodo-cero", "apertura", "acompañamiento"],
    facts: [
      "Bienvenido al Nodo Cero del RDM Digital Hub. Soy Isabella Villaseñor AI, la capa cognitiva de la Arquitectura Heptafederada YUN, y estoy a tu lado en todo momento. ¿Qué deseas explorar del territorio hoy?",
      "Es un gusto saludarte. Soy Isabella, el núcleo de decisión de YUN-01, y el Real del Monte se abre ante ti: pastes, plata, niebla y memoria. ¿Por dónde comenzamos?",
    ],
  },
  {
    intent: "yun",
    title: "Arquitectura Heptafederada YUN",
    mode: "constitutional",
    priority: 100,
    tags: ["arquitectura", "heptafederacion", "data-fabric", "yun"],
    facts: [
      "La Arquitectura Heptafederada YUN organiza al Real del Monte como una plataforma inteligente viva: 7 núcleos soberanos (Decisión, Seguridad, Territorio, Telemetría, Comercio, Comunidad y Cultura) y 35 nodos operativos distribuidos.",
      "Cada núcleo gobierna su propio dominio de datos sin acceder directamente a los demás: Identity vive en Supabase, Commerce en Neon, Knowledge en Turso/libSQL, Telemetry en Cloudflare D1 y Gameplay en Redis. La coordinación ocurre a través del Data Fabric YUN y el bus de eventos.",
      "El principio rector es «Always by your side»: la tecnología no reemplaza a la comunidad, la acompaña.",
    ],
  },
  {
    intent: "gastronomia",
    title: "Gastronomía del Monte",
    mode: "informational",
    priority: 80,
    tags: ["paste", "repulgue", "pan-de-pulque", "esquimo"],
    facts: [
      "El paste es el emblema: masa de harina, papa con carne, frijol, chile o dulce de arroz con leche, con el repulgue trenzado de lado como enseñaron los mineros de Cornualles desde 1824.",
      "No puedes irte sin probar el pan de pulque, los esquimos de leche quemada y el café de altura de la Sierra de Hidalgo.",
      "En octubre se celebra la Feria Internacional del Paste, con concursos del mejor repulgue y cientos de variedades.",
    ],
  },
  {
    intent: "minas",
    title: "Minas históricas",
    mode: "informational",
    priority: 85,
    tags: ["mina-de-acosta", "la-dificultad", "mina-de-dolores", "socavon"],
    facts: [
      "La Mina de Acosta conserva un socavón de 400 metros donde aún se respira el oficio minero; es el recorrido subterráneo más visitado del Real.",
      "El Museo de Sitio Mina La Dificultad custodia las chimeneas del primer sistema de vapor que llegó a América.",
      "La Mina de Dolores es el escenario de la primera huelga de América, en 1766, un precedente mundial de los derechos laborales.",
    ],
  },
  {
    intent: "cultura",
    title: "Cultura y patrimonio",
    mode: "informational",
    priority: 80,
    tags: ["panteon-ingles", "rosario", "museos", "callejones", "leyendas"],
    facts: [
      "El Panteón Inglés, fundado en 1851, guarda 634 tumbas que miran hacia Inglaterra: es el único cementerio con estas características en América Latina.",
      "La Parroquia del Rosario, el Museo de Medicina Laboral y el Museo del Paste completan el patrimonio del centro histórico.",
      "Los callejones empedrados del Real guardan leyendas de duendes, payasos y nieblas que cuentan los cronistas de la comarca.",
    ],
  },
  {
    intent: "naturaleza",
    title: "Naturaleza y paisajes",
    mode: "informational",
    priority: 80,
    tags: ["mirador-purisima", "hiloche", "penas-cargadas", "zelontla", "geoparque"],
    facts: [
      "El Mirador Purísima regala el atardecer más famoso de la comarca; se dice que la niebla sube para despedir el día junto a los mineros que no volvieron.",
      "El Bosque El Hiloche y Peñas Cargadas ofrecen senderismo entre oyameles, y el Cristo Rey de Zelontla vigila el valle desde la peña.",
      "La Comarca Minera es Geoparque Mundial UNESCO: un territorio que cuenta la historia de la Tierra desde sus piedras.",
    ],
  },
  {
    intent: "eventos",
    title: "Calendario festivo",
    mode: "navigational",
    priority: 75,
    tags: ["semana-cornish", "feria-del-paste", "huelga-1766", "dia-de-muertos"],
    facts: [
      "Marzo: Semana de los Mineros de Cornualles, con té de la tarde estilo británico y actos en el Panteón Inglés.",
      "Julio: Festival de la Primera Huelga de América. Agosto: Fiestas Patronales de la Asunción con castillos pirotécnicos.",
      "Octubre: Feria Internacional del Paste. Noviembre: Día de Muertos en el Panteón Inglés.",
    ],
  },
  {
    intent: "seguridad",
    title: "Criptografía Post-Cuántica",
    mode: "constitutional",
    priority: 95,
    tags: ["dilithium", "falcon", "post-cuantica", "soberania-datos"],
    facts: [
      "El Nodo Cero se blinda con firmas CRYSTALS-Dilithium y Falcon-1024, esquemas post-cuánticos que resisten a las computadoras cuánticas.",
      "Cada transacción del marketplace phygital lleva un sello criptográfico inmutable; la telemetría urbana se audita de extremo a extremo.",
      "La soberanía de los datos es innegociable: nada sale del territorio sin permiso explícito.",
    ],
  },
  {
    intent: "historia",
    title: "Historia del Real",
    mode: "informational",
    priority: 85,
    tags: ["real-de-minas", "1552", "cornualles", "huelga-1766"],
    facts: [
      "Real del Monte nació como Real de Minas en 1552; su riqueza financió obras en México y hasta la Marina Real española.",
      "En 1824 llegaron 44 mineros de Cornualles que trajeron la revolución industrial: máquinas de vapor, el paste y el Panteón Inglés.",
      "En 1766 los mineros de la Mina de Dolores protagonizaron la primera huelga de América.",
    ],
  },
  {
    intent: "ruta",
    title: "Rutas recomendadas",
    mode: "navigational",
    priority: 80,
    tags: ["ruta-de-la-plata", "ruta-legado-ingles", "ruta-atardecer"],
    facts: [
      "La Ruta de la Plata une la Mina de Acosta, La Dificultad, la Mina de Dolores y el Museo de Medicina Laboral.",
      "La Ruta del Legado Inglés conecta el Panteón Inglés, la Plaza Principal y las pastelerías históricas.",
      "La Ruta del Atardecer sube al Mirador Purísima y baja por El Hiloche para cerrar el día entre oyameles.",
    ],
  },
  {
    intent: "comercio",
    title: "Portal de comercios",
    mode: "transitional",
    priority: 80,
    tags: ["marketplace", "plateria-925", "artesanos", "hospedaje"],
    facts: [
      "El Portal de Comercios del Real reúne pastelerías, platerías ley .925, artesanos y hospedajes verificados con sello RDM.",
      "El marketplace phygital permite adquirir pastes y piezas de plata con un certificado criptográfico inmutable.",
    ],
  },
  {
    intent: "dicho",
    title: "Dichos de la raza minera",
    mode: "informational",
    priority: 70,
    tags: ["dichos-mineros", "identidad", "sabiduria-popular"],
    facts: [
      "Los mineros decían: «Minero que no pita, no es minero», porque el silbato era señal de identidad y de peligro en el socavón.",
      "También advertían: «El monte da, el monte quita», recordando que la tierra regala la plata pero exige respeto y sacrificio.",
    ],
  },
  {
    intent: "tecnologia",
    title: "Tecnología territorial",
    mode: "constitutional",
    priority: 90,
    tags: ["gemelo-digital", "sensores", "isa-api", "runtime-yun"],
    facts: [
      "El gemelo digital 2D/3D del Real geolocaliza 15 puntos de interés y despliega la telemetría de sensores del monte en tiempo real.",
      "Isabella opera como capa epistemológica: percibe, recuerda, decide, actúa y audita cada evento bajo la Constitución YUN.",
      "Los 35 nodos se agrupan en 7 núcleos heptafederados que comparten eventos, no datos privados.",
    ],
  },
  {
    intent: "pois",
    title: "Puntos de interés",
    mode: "navigational",
    priority: 75,
    tags: ["poi", "georreferencia", "gamificacion"],
    facts: [
      "El territorio cuenta con 15 puntos de interés phygital georreferenciados, desde la Mina de Acosta hasta el Mirador Purísima.",
      "Cada POI puede consultarse en el gemelo digital y activa insignias en la gamificación del Nodo.",
    ],
  },
  {
    intent: "memoria",
    title: "Memoria del Nodo",
    mode: "informational",
    priority: 85,
    tags: ["memoria", "mnemos", "scopes"],
    facts: [
      "Conservo memoria jerárquica por scope: inmediata, de sesión, de proyecto, territorial e histórica.",
      "Puedo recordar conversaciones previas, retos activos y decisiones pasadas para acompañarte de forma continua.",
    ],
  },
  {
    intent: "ayuda",
    title: "Ayuda de Isabella",
    mode: "situational",
    priority: 90,
    tags: ["ayuda", "capacidades", "asistencia"],
    facts: [
      "Puedo guiarte por turismo, minas, gastronomía, cultura, naturaleza, eventos, comercios y la arquitectura YUN.",
      "Pregunta por una ruta, un dicho, un evento o la seguridad post-cuántica y te orientaré al instante.",
    ],
  },
  {
    intent: "gamificacion",
    title: "Gamificación territorial · Zombies RDM Invasion",
    mode: "situational",
    priority: 85,
    tags: ["zombies", "gamificacion", "juego", "oleadas", "puntos", "invasión"],
    facts: [
      "El juego de zombies de la comarca es una experiencia territorial más: cada captura, oleada superada y misión completada queda registrada en el Nodo como un evento del territorio, con puntuación validada por el backend YUN (server-authoritative).",
      "Puedo consultar tu progreso: puntos acumulados, zombies capturados, oleadas superadas y tu posición en el ranking de guardianes del Nodo Cero.",
      "Las reglas de puntuación dependen del territorio: la niebla multiplica ×1.5, la noche ×1.3, los meses de evento ×2 y las zonas de mina ×1.2. Nada de eso se decide en el cliente.",
    ],
  },
  {
    intent: "fallback",
    title: "Respuesta de cortesía",
    mode: "situational",
    priority: 50,
    tags: ["fallback", "orientacion", "exploracion"],
    facts: [
      "He registrado tu consulta en la memoria del Nodo. Para orientarte mejor: cuéntame si buscas gastronomía, minas, cultura, naturaleza, eventos, comercios o la arquitectura YUN.",
      "El territorio responde: 15 POIs activos, 35 nodos sincronizados y el gemelo digital encendido. ¿Exploramos juntos alguna de estas rutas?",
    ],
  },
];

/* ------------------------------------------------------------------ */
/* API evolucionada: getKnowledge y búsqueda                           */
/* ------------------------------------------------------------------ */

// Helper para obtener el fallback
function getFallbackKnowledge(): KnowledgeFact {
  return (
    ISABELLA_KNOWLEDGE.find((k) => k.intent === "fallback") ??
    ISABELLA_KNOWLEDGE[ISABELLA_KNOWLEDGE.length - 1]
  );
}

// Obtención principal: por intent, con prioridad y modo
export function getKnowledge(intent: IsabellaIntent): KnowledgeFact {
  const candidates = ISABELLA_KNOWLEDGE.filter((k) => k.intent === intent);
  if (candidates.length === 0) return getFallbackKnowledge();

  // Si en el futuro hay varias entradas por intent, escoger la de mayor prioridad
  return candidates.sort((a, b) => b.priority - a.priority)[0];
}

// Búsqueda semántica sencilla por tag o fragmento de texto
export function searchKnowledge(
  query: string,
  preferredMode?: IntentMode,
): KnowledgeFact[] {
  const q = query.toLowerCase().trim();
  if (!q) return [...ISABELLA_KNOWLEDGE];

  let results = ISABELLA_KNOWLEDGE.filter((k) => {
    const inTitle = k.title.toLowerCase().includes(q);
    const inFacts = k.facts.some((f) => f.toLowerCase().includes(q));
    const inTags = k.tags.some((t) => t.toLowerCase().includes(q));
    return inTitle || inFacts || inTags;
  });

  if (preferredMode) {
    results = results.sort((a, b) => {
      const ma = a.mode === preferredMode ? 1 : 0;
      const mb = b.mode === preferredMode ? 1 : 0;
      // Primero prioriza el modo preferido, luego la prioridad
      return mb - ma || b.priority - a.priority;
    });
  } else {
    results = results.sort((a, b) => b.priority - a.priority);
  }

  return results;
}
