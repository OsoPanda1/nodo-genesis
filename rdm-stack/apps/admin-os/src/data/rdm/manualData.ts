export interface ManualChapter {
  chapterNum: number;
  id: string;
  title: string;
  category: 'Fundamentos' | 'Sistema de Diseño' | 'Componentes UI' | 'Patrones de Eje' | 'Visualización de Datos' | 'Motion & Accesibilidad' | 'Especificaciones Técnicas';
  summary: string;
  guidelines: string[];
  tailwindTokens: string[];
  codeSnippet: string;
  previewType: 'color' | 'typography' | 'button' | 'card' | 'badge' | 'input' | 'modal' | 'chart' | 'motion' | 'token' | 'layout';
}

export const MANUAL_CHAPTERS: ManualChapter[] = [
  {
    chapterNum: 1,
    id: 'cap-01',
    title: 'Capítulo 01: Introducción & Filosofía Territorial Soberana',
    category: 'Fundamentos',
    summary: 'RDM Digital es la infraestructura digital soberana de Real del Monte (Nodo Cero). Combina la herencia minera del siglo XIX, la niebla de montaña y la tecnología federada TAMV OS.',
    guidelines: [
      'Estética minera victoriana combinada con tablero cívico inteligente.',
      'Soberanía de datos: No rastreo publicitario, arquitectura self-hosted en Proxmox.',
      'Trazabilidad ética con retribución al patrimonio comunitario (Cattleya Pay).'
    ],
    tailwindTokens: ['bg-slate-950', 'text-slate-100', 'border-slate-800', 'accent-amber-400'],
    codeSnippet: `<div className="bg-slate-950 text-slate-100 p-6 rounded-3xl border border-slate-800">
  <h2 className="text-2xl font-bold font-serif text-white">Nodo Cero — Real del Monte</h2>
  <p className="text-xs text-slate-400 mt-2">Plataforma civilizacional federada TAMV</p>
</div>`,
    previewType: 'layout'
  },
  {
    chapterNum: 2,
    id: 'cap-02',
    title: 'Capítulo 02: Paleta Atmosférica de Color & Gradientes Mineros',
    category: 'Sistema de Diseño',
    summary: 'Inspirada en la plata subterránea, la niebla del bosque de oyamel y los tonos dorados del sol sobre las chimeneas inglesas.',
    guidelines: [
      'Fondo Base: Slate-950 (#020617) y Slate-900 (#0F172A) para atmósfera nocturna minera.',
      'Acento Primario: Dorado Plata (#FACC15 / amber-400) representando vetas luminosas.',
      'Secundario Territorial: Verde Esmeralda (#064E3B / emerald-900) para naturaleza y resiliencia.',
      'Alertas & Clima: Rojo carmesí para riesgos (#B91C1C) y Azul neblina (#38BDF8) para chipichipi.'
    ],
    tailwindTokens: ['bg-slate-900', 'bg-slate-950', 'text-amber-400', 'text-emerald-400', 'bg-emerald-950/60', 'border-amber-500/30'],
    codeSnippet: `/* Paleta Oficial RDM Digital */
--color-bg-base: #020617; /* Slate 950 */
--color-card-surface: #0f172a; /* Slate 900 */
--color-gold-mining: #facc15; /* Yellow 400 */
--color-emerald-heritage: #10b981; /* Emerald 500 */
--color-sky-mist: #38bdf8; /* Sky 400 */`,
    previewType: 'color'
  },
  {
    chapterNum: 3,
    id: 'cap-03',
    title: 'Capítulo 03: Tipografía & Jerarquía Visual Doble',
    category: 'Sistema de Diseño',
    summary: 'Combinación armónica de una tipografía Serif clásica para títulos patrimoniales y Sans-serif de alta legibilidad para densidad UI.',
    guidelines: [
      'Display Serif: Playfair / Georgia para encabezados culturales, historias y títulos de sección.',
      'Modern Sans: Inter / Plus Jakarta Sans para datos numéricos, controles, listas y tablas.',
      'Escala Tipográfica: Step ratio de 1.25. H1 (30px/36px), H2 (24px/28px), Body (14px), Tiny (11px).'
    ],
    tailwindTokens: ['font-serif', 'font-sans', 'font-mono', 'tracking-tight', 'leading-relaxed'],
    codeSnippet: `<h1 className="font-serif text-3xl font-bold text-white tracking-tight">
  Panteón Inglés & Leyendas de la Neblina
</h1>
<p className="font-sans text-xs text-slate-300 leading-relaxed mt-2">
  Texto de alta legibilidad optimizado para pantallas móviles y tableros cívicos.
</p>`,
    previewType: 'typography'
  },
  {
    chapterNum: 4,
    id: 'cap-04',
    title: 'Capítulo 04: Sistema de Spacing, Grids & Contenedores',
    category: 'Sistema de Diseño',
    summary: 'Matemática espacial rigurosa basada en rejillas de 8px y reglas de nesting para prevenir desalineaciones.',
    guidelines: [
      'Grid de 8px: Margen interno de contenedores siempre múltiplo de 8px (16px, 24px, 32px).',
      'Padding Math: El padding externo del contenedor mayor o igual al espacio entre hijos.',
      'Radios Proporcionales: Radio Interior = Radio Exterior - Padding.'
    ],
    tailwindTokens: ['p-4', 'p-6', 'gap-4', 'gap-6', 'rounded-2xl', 'rounded-3xl', 'max-w-7xl'],
    codeSnippet: `<div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
    <span className="text-xs text-amber-400 font-mono">Padding interno 16px</span>
  </div>
</div>`,
    previewType: 'card'
  },
  {
    chapterNum: 5,
    id: 'cap-05',
    title: 'Capítulo 05: Botones & Estados Interactivos Proporcionales',
    category: 'Componentes UI',
    summary: 'Botones táctiles con padding horizontal 2x el padding vertical, micro-retroalimentación y estados de hover suaves.',
    guidelines: [
      'Primario (Gold): Acción principal (Comprar, Consultar IA).',
      'Secundario (Emerald): Rutas, Mapa y Actividades cívicas.',
      'Terciario (Slate Outline): Filtros, pestañas inactivas.',
      'Touch Targets: Mínimo 44px de altura en móviles.'
    ],
    tailwindTokens: ['px-5', 'py-2.5', 'rounded-xl', 'font-bold', 'text-xs', 'transition-all', 'hover:scale-102'],
    codeSnippet: `<button className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer">
  ✨ Consultar con ISABELLA AI
</button>`,
    previewType: 'button'
  },
  {
    chapterNum: 6,
    id: 'cap-06',
    title: 'Capítulo 06: Inputs, Formularios & Buscadores Territoriales',
    category: 'Componentes UI',
    summary: 'Campos de entrada oscuros de alto contraste con enfoque luminoso en dorado o púrpura y validación clara.',
    guidelines: [
      'Bordes discretos slate-800 que se iluminan al focus (border-amber-400 o border-purple-500).',
      'Textos de sugerencias rápidas (chips) bajo el input.',
      'Respeto a desactivación de autocomplete engañoso.'
    ],
    tailwindTokens: ['bg-slate-950', 'border-slate-800', 'focus:border-amber-400', 'text-white', 'placeholder-slate-500'],
    codeSnippet: `<input
  type="text"
  placeholder="Escribe tu consulta a ISABELLA AI..."
  className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
/>`,
    previewType: 'input'
  },
  {
    chapterNum: 7,
    id: 'cap-07',
    title: 'Capítulo 07: Tarjetas Sin AI Slop & Profundidad Plana',
    category: 'Componentes UI',
    summary: 'Prohibición explícita de tarjetas anidadas infinitas, sombras difusas brillantes no naturales y bordes de color lateral solos.',
    guidelines: [
      'No más de 1 nivel de tarjeta dentro de otra.',
      'Radio de esquina máximo de 16px a 24px.',
      'Uso de divisores discretos border-slate-800/80 en lugar de sombras pesadas.'
    ],
    tailwindTokens: ['bg-slate-900', 'border-slate-800', 'rounded-2xl', 'p-5', 'space-y-3'],
    codeSnippet: `<div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-3">
  <h4 className="text-base font-bold text-white font-serif">Mina de Acosta</h4>
  <p className="text-xs text-slate-300">Recorrido histórico subterráneo a 2,760 msnm.</p>
</div>`,
    previewType: 'card'
  },
  {
    chapterNum: 8,
    id: 'cap-08',
    title: 'Capítulo 08: Badges, Tags & Chips de Estado en 1 Sola Línea',
    category: 'Componentes UI',
    summary: 'Badges compactos con texto en white-space:nowrap, sin rupturas de línea ni truncamiento deforme.',
    guidelines: [
      'Los textos en badges nunca se dividen en dos líneas.',
      'Padding ajustado proporcional al tamaño del texto.',
      'Uso de fuentes monoespaciadas para valores numéricos o hashes.'
    ],
    tailwindTokens: ['px-2.5', 'py-0.5', 'rounded-full', 'text-[10px]', 'font-bold', 'whitespace-nowrap'],
    codeSnippet: `<span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 whitespace-nowrap">
  ✓ Paste Auténtico Verificado
</span>`,
    previewType: 'badge'
  },
  {
    chapterNum: 9,
    id: 'cap-09',
    title: 'Capítulo 09: Estructura Macro de Navegación & Ticker Superior',
    category: 'Patrones de Eje',
    summary: 'Barra superior fija con ticker de estado del Nodo Cero, indicador de neblina real, selector de rol y cambio de pilar.',
    guidelines: [
      'Ticker en gradiente oscuro superior con pulso en vivo verde.',
      'Conmutador de 6 pilares navegable con teclado y tacto.',
      'Acceso rápido al Carrito Cattleya Pay en todo momento.'
    ],
    tailwindTokens: ['sticky', 'top-0', 'z-40', 'backdrop-blur-md', 'bg-slate-900/95', 'border-b'],
    codeSnippet: `<header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
  <div className="flex justify-between px-4 py-1 text-xs">
    <span>🟢 Nodo Cero: Activo</span>
    <span>11°C • Neblina Tradicional</span>
  </div>
</header>`,
    previewType: 'layout'
  },
  {
    chapterNum: 10,
    id: 'cap-10',
    title: 'Capítulo 10: Modales, Overlays & Comprobantes Cattleya Pay',
    category: 'Patrones de Eje',
    summary: 'Modales centrados con fondo desenfocado (backdrop-blur-md), cierre seguro por tecla Escape o click exterior y recibo auditable.',
    guidelines: [
      'Fondo oscuro al 80% con blur de 12px.',
      'Demostración transparente del Hash criptográfico y retención patrimonial.',
      'Copia con 1 click del hash de la transacción.'
    ],
    tailwindTokens: ['fixed', 'inset-0', 'bg-slate-950/80', 'backdrop-blur-md', 'rounded-3xl', 'shadow-2xl'],
    codeSnippet: `<div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
  <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-xl w-full">
    <h3>Comprobante Cattleya Pay</h3>
  </div>
</div>`,
    previewType: 'modal'
  },
  {
    chapterNum: 11,
    id: 'cap-11',
    title: 'Capítulo 11: RDM Información (InfoMesh) Layout Specs',
    category: 'Patrones de Eje',
    summary: 'Diseño tipo periódico digital histórico con portada principal, alerta meteorológica de neblina, filtro por etiquetas y archivo histórico.',
    guidelines: [
      'Alerta climática destacada en la parte superior.',
      'Artículos en grid asimétrico 2/3 y 1/3 para crónicas y notas breves.',
      'Documentos históricos con referencias de archivo de 1824.'
    ],
    tailwindTokens: ['grid-cols-1', 'lg:grid-cols-12', 'col-span-8', 'col-span-4'],
    codeSnippet: `<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
  <div className="lg:col-span-8 space-y-6">/* Artículos Principales */</div>
  <div className="lg:col-span-4 space-y-6">/* Archivo Histórico */</div>
</div>`,
    previewType: 'layout'
  },
  {
    chapterNum: 12,
    id: 'cap-12',
    title: 'Capítulo 12: RDM Turismo (GeoExplorer) Map & Route Specs',
    category: 'Patrones de Eje',
    summary: 'Mapa interactivo canvas con líneas topográficas, marcador pulsante de altitud (2,760 msnm) e itinerarios autoguiados.',
    guidelines: [
      'Fondo canvas oscuro con rejilla radial verde/dorada.',
      'Proyección de coordenadas geográficas en el contenedor.',
      'Gráfica de perfil de elevación de rutas en m.s.n.m.'
    ],
    tailwindTokens: ['h-[420px]', 'bg-slate-950', 'relative', 'overflow-hidden', 'animate-pulse'],
    codeSnippet: `<div className="relative h-[420px] bg-slate-950 rounded-2xl border border-slate-800">
  {/* Mapa Canvas con Marcadores Georreferenciados */}
</div>`,
    previewType: 'chart'
  },
  {
    chapterNum: 13,
    id: 'cap-13',
    title: 'Capítulo 13: RDM Comercio (TradeNode) Marketplace Specs',
    category: 'Patrones de Eje',
    summary: 'Directorio de artesanos verificados, insignias de autenticidad, catálogo de productos con porcentaje para el Fondo Patrimonial.',
    guidelines: [
      'Insignia "Verificado RDM" en verde esmeralda con escudo.',
      'Desglose del % destinado a la restauración de chimeneas mineras.',
      'Botonera directa de compra con Cattleya Pay.'
    ],
    tailwindTokens: ['grid-cols-1', 'md:grid-cols-3', 'bg-emerald-500/20', 'text-amber-400'],
    codeSnippet: `<div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
  <span className="text-amber-400 font-mono font-bold">$28 MXN</span>
  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">+3% Fondo Patrimonial</span>
</div>`,
    previewType: 'card'
  },
  {
    chapterNum: 14,
    id: 'cap-14',
    title: 'Capítulo 14: ISABELLA AI Terminal & Capa 4 Specs',
    category: 'Patrones de Eje',
    summary: 'Asistente civilizacional en tiempo real impulsado por Gemini 3.6 Flash con sugerencias de prompts rápidos y simulación streaming.',
    guidelines: [
      'Burbujas diferenciadas: Usuario (Dorado/Amber) vs ISABELLA (Púrpura/Slate).',
      'Prompt del sistema enriquecido con historia local e hiper-localización.',
      'Scroll automático suave al nuevo mensaje.'
    ],
    tailwindTokens: ['bg-purple-600', 'bg-purple-950/50', 'border-purple-500/30', 'h-[520px]'],
    codeSnippet: `<div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 h-[520px] flex flex-col justify-between">
  {/* Mensajes del Chat e Input Terminal */}
</div>`,
    previewType: 'input'
  },
  {
    chapterNum: 15,
    id: 'cap-15',
    title: 'Capítulo 15: TAMV Kernel OS 7-Layers Specs',
    category: 'Patrones de Eje',
    summary: 'Visualización de la arquitectura federada de 7 capas, stream de eventos auditables en tiempo real con hash SHA-256.',
    guidelines: [
      'Tarjetas de capa con estado OPERATIONAL / PILOT / HARDENING.',
      'Monitor de bus de eventos con simulación interactiva.',
      'Copia de hashes de auditoría.'
    ],
    tailwindTokens: ['font-mono', 'text-[11px]', 'bg-slate-950', 'border-indigo-500/50'],
    codeSnippet: `<div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs">
  <span className="text-amber-400 font-bold">TOURIST_INTERACTION_PING</span>
  <span className="text-emerald-400">#a8f902b1c4</span>
</div>`,
    previewType: 'layout'
  },
  {
    chapterNum: 16,
    id: 'cap-16',
    title: 'Capítulo 16: Gobernanza & Readiness Dashboard Specs',
    category: 'Patrones de Eje',
    summary: 'Indicador global del 73% de readiness del piloto, matriz de ownership (PO, Tech Lead, SRE) y roadmap estratégico.',
    guidelines: [
      'Barra de progreso tricolor (Dorado, Esmeralda, Índigo).',
      'Desglose por 6 áreas técnicas clave.',
      'Bloque de declaración canónica copiante.'
    ],
    tailwindTokens: ['bg-gradient-to-r', 'from-amber-500', 'via-emerald-500', 'to-indigo-500'],
    codeSnippet: `<div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden">
  <div className="h-full bg-gradient-to-r from-amber-500 via-emerald-500 to-indigo-500 rounded-full w-[73%]" />
</div>`,
    previewType: 'chart'
  },
  {
    chapterNum: 17,
    id: 'cap-17',
    title: 'Capítulo 17: Visualización de Datos — Mapas Georreferenciados',
    category: 'Visualización de Datos',
    summary: 'Lineamientos para representar elevaciones, curvas de nivel y rutas mineras con Leaflet/SVG y contraste accesible.',
    guidelines: [
      'Líneas de contorno con opacidad 15-20% para no saturar.',
      'Puntos de interés con animación ping en selección.',
      'Colores por categoría: Minas (Dorado), Gastronomía (Ámbar), Naturaleza (Verde).'
    ],
    tailwindTokens: ['stroke-emerald-500', 'stroke-amber-400', 'stroke-dasharray-4', 'animate-ping'],
    codeSnippet: `<svg className="absolute inset-0 w-full h-full opacity-20">
  <path d="M 20 50 Q 150 20 300 80" stroke="#10b981" strokeWidth="2" fill="none" />
</svg>`,
    previewType: 'chart'
  },
  {
    chapterNum: 18,
    id: 'cap-18',
    title: 'Capítulo 18: Visualización de Datos — Gráficas Recharts & Afluencia',
    category: 'Visualización de Datos',
    summary: 'Gráficas de área y líneas que muestran la interacción estacional entre el flujo de visitantes, venta de pastes y días de neblina.',
    guidelines: [
      'Gradientes suaves bajo las curvas (fillOpacity 0.3).',
      'Tooltips oscuros con bordes dorados e información contextual.',
      'Punto álgido en octubre (Festival Internacional del Paste).'
    ],
    tailwindTokens: ['stroke-amber-400', 'stroke-emerald-400', 'fill-amber-400/20'],
    codeSnippet: `<AreaChart data={VISITOR_FLOW_DATA}>
  <Area type="monotone" dataKey="turistas" stroke="#facc15" fill="#facc1533" />
</AreaChart>`,
    previewType: 'chart'
  },
  {
    chapterNum: 19,
    id: 'cap-19',
    title: 'Capítulo 19: Visualización de Datos — Heatmaps de Densidad Peatonal',
    category: 'Visualización de Datos',
    summary: 'Monitoreo horario de caminantes por ruta para prevenir saturación en el Panteón Inglés o el Centro Histórico.',
    guidelines: [
      'Escala de color de verde suave (baja afluencia) a dorado intenso (pico horario).',
      'Actualización horaria en tiempo real desde nodos Edge.',
      'Sugerencias de rutas alternativas en horas pico.'
    ],
    tailwindTokens: ['bg-emerald-500/20', 'bg-amber-500/40', 'bg-rose-500/60'],
    codeSnippet: `<BarChart data={HOURLY_HEATMAP_DATA}>
  <Bar dataKey="peatonesCentro" fill="#facc15" />
</BarChart>`,
    previewType: 'chart'
  },
  {
    chapterNum: 20,
    id: 'cap-20',
    title: 'Capítulo 20: Visualización de Datos — Tableros de Reputación',
    category: 'Visualización de Datos',
    summary: 'Indicadores de confianza, ratings de 5 estrellas y distribución del Fondo de Conservación del Patrimonio.',
    guidelines: [
      'Gráfica Donut / Pie para distribución del 3-5% del fondo.',
      'Desglose transparente del capital reincorporado al Panteón Inglés.',
      'Verificación cívica abierta a auditoría.'
    ],
    tailwindTokens: ['text-amber-400', 'font-mono', 'bg-slate-900', 'border-slate-800'],
    codeSnippet: `<PieChart>
  <Pie data={HERITAGE_DISTRIBUTION_DATA} dataKey="monto" innerRadius={40} outerRadius={70} />
</PieChart>`,
    previewType: 'chart'
  },
  {
    chapterNum: 21,
    id: 'cap-21',
    title: 'Capítulo 21: Motion System, Easing & Micro-Interacciones',
    category: 'Motion & Accesibilidad',
    summary: 'Transiciones sobrias de 150ms a 250ms con ease-out, evitando animaciones bruscas o mareos en el mapa.',
    guidelines: [
      'Transición de entrada FadeIn suave (150ms).',
      'Escalado hover contenido al 102% - 105%.',
      'Respeto absoluto a la preferencia reduced-motion del sistema.'
    ],
    tailwindTokens: ['transition-all', 'duration-200', 'ease-out', 'hover:scale-105', 'animate-fadeIn'],
    codeSnippet: `<div className="transition-all duration-200 ease-out hover:scale-105 hover:border-amber-400">
  {/* Tarjeta con respuesta táctil sobria */}
</div>`,
    previewType: 'motion'
  },
  {
    chapterNum: 22,
    id: 'cap-22',
    title: 'Capítulo 22: Skeletons & Estados de Carga Sin Layout Shifts',
    category: 'Motion & Accesibilidad',
    summary: 'Skeletons de carga oscuros con animación pulse suave para preservar el espacio exacto de tarjetas y tablas durante peticiones API.',
    guidelines: [
      'Color base del Skeleton: Slate-800 con pulso a Slate-700.',
      'Sin saltos de maquetación (Zero Layout Shift).',
      'Mensajes de fallback amigables en caso de falla de red.'
    ],
    tailwindTokens: ['animate-pulse', 'bg-slate-800', 'rounded-xl', 'h-4', 'w-full'],
    codeSnippet: `<div className="space-y-2 animate-pulse">
  <div className="h-4 bg-slate-800 rounded-lg w-3/4"></div>
  <div className="h-3 bg-slate-800/60 rounded-lg w-1/2"></div>
</div>`,
    previewType: 'card'
  },
  {
    chapterNum: 23,
    id: 'cap-23',
    title: 'Capítulo 23: Accesibilidad WCAG AA & Modo Dual Atmosférico',
    category: 'Motion & Accesibilidad',
    summary: 'Garantía de contraste mínimo de 4.5:1 en texto principal, etiquetas ARIA completas y soporte para modo nocturno minero y blanco cálido neblina.',
    guidelines: [
      'Contraste de texto sobre fondo validado > 4.5:1.',
      'Soporte completo de navegación por teclado (Tab / Shift+Tab).',
      'Modo Dual: Nocturno Minero (#020617) vs Blanco Cálido Neblina (#F8FAFC).'
    ],
    tailwindTokens: ['text-slate-100', 'text-slate-900', 'bg-slate-950', 'bg-slate-50', 'focus:ring-2'],
    codeSnippet: `<button aria-label="Navegar a Turismo" className="focus:outline-none focus:ring-2 focus:ring-amber-400">
  RDM Turismo
</button>`,
    previewType: 'token'
  },
  {
    chapterNum: 24,
    id: 'cap-24',
    title: 'Capítulo 24: Lineamientos de Contenido Multimedia & ReferrerPolicy',
    category: 'Especificaciones Técnicas',
    summary: 'Normas estrictas para la carga de imágenes históricas, audios en directo y protección contra fallas de iFrame.',
    guidelines: [
      'Imágenes con atributo referrerPolicy="no-referrer".',
      'Audios en formato comprimido web (WebM / MP3 de alta densidad).',
      'Textos alt obligatorios y descriptivos del patrimonio minero.'
    ],
    tailwindTokens: ['object-cover', 'rounded-xl', 'overflow-hidden', 'relative'],
    codeSnippet: `<img
  src={document.imageUrl}
  alt={document.title}
  referrerPolicy="no-referrer"
  className="w-full h-48 object-cover rounded-2xl"
/>`,
    previewType: 'token'
  },
  {
    chapterNum: 25,
    id: 'cap-25',
    title: 'Capítulo 25: Tokens Exportables de Tailwind & Configuración JSON',
    category: 'Especificaciones Técnicas',
    summary: 'Especificación completa de los tokens CSS y la configuración del Design System lista para exportarse e importarse en proyectos React + Vite.',
    guidelines: [
      'Exportación directa de variables CSS y paleta Tailwind v4.',
      'Sincronización con el repositorio RDM Digital Hub LDTOCS.',
      'Auditoría constante del paquete de diseño.'
    ],
    tailwindTokens: ['theme', 'colors', 'fontFamily', 'borderRadius', 'boxShadow'],
    codeSnippet: `{
  "name": "RDM Digital Design System",
  "version": "2.4.0",
  "tokens": {
    "color": {
      "base": "#020617",
      "gold": "#facc15",
      "emerald": "#10b981",
      "sky": "#38bdf8"
    }
  }
}`,
    previewType: 'token'
  }
];
