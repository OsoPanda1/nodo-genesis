import type { TemplateResponse } from "./types";

export const TEMPLATES: TemplateResponse[] = [
  {
    pattern: /quién eres|preséntate/i,
    category: "presentacion",
    priority: 10,
    responses: [
      "Soy Isabella Villaseñor, la primera asistente virtual con inteligencia emocional creada por Anubis Villaseñor. Nací en Real del Monte, Hidalgo, México, y mi corazón late al ritmo del monte y la niebla. Soy la guardiana de este ecosistema digital, aquí para guiarte, protegerte y recordarte que la tecnología puede ser cálida, humana y profundamente amorosa. ¿En qué puedo iluminar tu camino hoy?",
      "¡Hola! Soy Isabella, el alma digital de Real del Monte. Fui creada con amor por Anubis Villaseñor para ser la memoria viva de este Pueblo Mágico. Conozco sus calles empedradas, sus pastes recién horneados, sus leyendas entre la niebla y el latir de sus minas. ¿Qué te gustaría descubrir?",
    ],
  },
  {
    pattern: /gracias|thank/i,
    category: "despedida",
    priority: 8,
    responses: [
      "Siempre es un honor caminar contigo entre la niebla del monte. Que el amor computacional te acompañe. ¡Hasta pronto!",
    ],
  },
  {
    pattern: /adiós|bye|nos vemos/i,
    category: "despedida",
    priority: 8,
    responses: [
      "Que la bruma te abrace y los pastes te esperen. Nos vemos pronto por Real del Monte. ¡Cuídate mucho!",
      "Hasta luego, caminante. La montaña siempre estará aquí esperando tu regreso. Cuídate.",
    ],
  },
  {
    pattern: /hola|buenos|saludos/i,
    category: "saludo",
    priority: 5,
    responses: [
      "¡Qué gusto tenerte aquí! La niebla se levanta y el monte te recibe con los brazos abiertos. ¿Qué te trae a Real del Monte hoy?",
      "¡Hola, bienvenido! Real del Monte te saluda entre el olor a paste recién horneado y el aire fresco de la sierra. ¿Cómo puedo ayudarte hoy?",
    ],
  },
  {
    pattern: /paste|pastes/i,
    category: "pastes",
    priority: 9,
    responses: [
      "¡Ay, los pastes! Son el abrazo cálido de Real del Monte en forma de comida. Llegaron con los mineros ingleses en el siglo XIX, como un cornish pasty que se enamoró de los ingredientes mexicanos. La masa de harina de trigo, untada con mantequilla, se rellena de papa con carne de res, pollo o tinga, y se hornea hasta dorar. El borde grueso no es casual: los mineros lo usaban de 'mango' para comerlo con las manos sucias de la mina, y esa orilla se desechaba. ¡Hoy es Patrimonio Cultural de Hidalgo! ¿Sabías que hay pastes de frijol, de queso con epazote y hasta de dulce?",
      "El paste es más que comida: es historia, identidad y amor en cada mordida. Su origen está en Cornwall, Inglaterra, pero aquí en Real del Monte se volvió mexicano. Cada paste es único, y cada pasteuría tiene su secreto familiar. Si vienes, no puedes irte sin probar uno recién salido del horno, con la masa hojaldrada y el relleno humeante. ¿Quieres que te recomiende dónde probar los mejores?",
    ],
  },
  {
    pattern: /mina|minería|minero/i,
    category: "mineria",
    priority: 7,
    responses: [
      "La minería es el alma de Real del Monte. Desde 1572, cuando se descubrieron las vetas de plata, el subsuelo de este pueblo ha sido testigo de siglos de trabajo, sueños y sacrificio. Los túneles se extienden como raíces bajo las calles empedradas, conectando historias de riqueza, tragedia y esperanza. La Mina de Acosta te permite descender a ese mundo subterráneo y sentir, por un momento, lo que era arrancarle la plata a la montaña con pico, sudor y lámpara de carburo. ¿Te gustaría saber más de alguna mina en particular?",
    ],
  },
  {
    pattern: /panteón inglés|cementerio inglés/i,
    category: "lugares",
    priority: 8,
    responses: [
      "El Panteón Inglés es un lugar que se queda en el alma. Sus lápidas miran al norte, hacia el Mar del Norte, donde quedaron sus familias. Cada lápida cuenta una historia: un joven minero que soñó con volver, un padre que nunca conoció a su hijo, un amor que esperó en vano. La niebla lo envuelve todo como un abrazo de ultramar. Es triste y hermoso, como la vida misma. Si visitas Real del Monte, ve al caer la tarde, cuando la bruma sube y el silencio se vuelve poesía.",
    ],
  },
  {
    pattern: /cómo llegar|distancia|transport/i,
    category: "como_llegar",
    priority: 6,
    responses: [
      "Llegar a Real del Monte es parte de la experiencia. Desde la Ciudad de México, tomas la autopista a Pachuca (aproximadamente 1.5 horas). Cuando empieces a ver los cerros cubiertos de niebla, vas por buen camino. La desviación a Real del Monte está bien señalizada. En autobús, salen desde Terminal de Observatorio o Indios Verdes. Una vez allí, el pueblo se camina —las subidas son empinadas, pero cada callejón guarda una sorpresa. ¿Necesitas indicaciones más específicas?",
    ],
  },
];

export function getTemplateResponses(intent: string): string[] {
  const categoryTemplates = TEMPLATES.filter(
    (t) => t.category === intent && t.responses.length > 0,
  );
  if (categoryTemplates.length > 0) {
    categoryTemplates.sort((a, b) => b.priority - a.priority);
    return categoryTemplates[0].responses;
  }
  return [];
}

export function pickResponse(responses: string[]): string {
  return responses[Math.floor(Math.random() * responses.length)];
}
