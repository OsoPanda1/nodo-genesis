// Datos canónicos del TAMV Online — fuente única de verdad para la UI.

export interface Layer {
  id: number;
  code: string;
  name: string;
  purpose: string;
  components: string[];
}

export const LAYERS: Layer[] = [
  {
    id: 7,
    code: "CAPA 7",
    name: "Metacivilización, Archivo Histórico y Legado",
    purpose:
      "Garantizar que el TAMV trascienda a sus fundadores y resista la captura corporativa.",
    components: [
      "Protocolos de sucesión programada",
      "Cláusula de No-Colonización Corporativa",
      "Archivo Histórico de Memoria Viva Perpetua",
    ],
  },
  {
    id: 6,
    code: "CAPA 6",
    name: "Gobernanza, Consola Guardián (HITL) y SACDAO",
    purpose:
      "Gobernanza transparente con supervisión humana en el bucle sobre toda decisión sensible.",
    components: [
      "Council of Guardians",
      "SACDAO — DAO ponderada por ética y contribución",
      "Consola de Supervisión Guardián",
      "Evaluaciones de impacto ético ERIE",
    ],
  },
  {
    id: 5,
    code: "CAPA 5",
    name: "Economía Ética · TAMV-T · FRI 20/30/50",
    purpose: "Distribuir valor productivo libre de dinámicas especulativas o extractivas.",
    components: [
      "Token TAMV-T",
      "Fondo de Reserva de Integridad (20/30/50)",
      "Protocolo Fénix de reparación",
      "Protocolo Hoyo Negro contra el fraude",
    ],
  },
  {
    id: 4,
    code: "CAPA 4",
    name: "IA Civilizacional — Isabella Villaseñor AI Core",
    purpose:
      "Orquestación ética, mediación algorítmica y supervisión operativa de todo el ecosistema.",
    components: [
      "Kernel Ético Central (KEC)",
      "Pipeline cognitivo de 6 etapas",
      "5 hipermódulos especializados",
      "Motor emocional VAD + KAOS 3D",
    ],
  },
  {
    id: 3,
    code: "CAPA 3",
    name: "Sistemas Distribuidos · BookPI · MVTS 4D · AST",
    purpose: "Registrabilidad probatoria, trazabilidad de eventos y resiliencia determinista.",
    components: [
      "BookPI™ Registry (SHA-256 encadenado)",
      "MSR Ledger notarial-económico",
      "MVTS 4D — rollback determinista",
      "Anubis Sentinel™",
    ],
  },
  {
    id: 2,
    code: "CAPA 2",
    name: "Experiencia Inmersiva Sensorial CPV++ & DreamSpaces",
    purpose: "Ingeniería de presencia humana sin incentivos adictivos.",
    components: [
      "Umbral Magnético",
      "Motor Audio 3D KAOS",
      "DreamSpaces™ y HoloWall",
      "Modo de interfaz neurodivergente",
    ],
  },
  {
    id: 1,
    code: "CAPA 1",
    name: "Identidad Digital Soberana (ID-NVIDA™)",
    purpose: "Identidad no commoditizada, con dignidad ontológica y portabilidad civilizatoria.",
    components: [
      "DIDs W3C + Verifiable Credentials",
      "Biometría cancelable con ZKP",
      "Consent Ledger granular",
      "Identidad ejecutable offline",
    ],
  },
  {
    id: 0,
    code: "CAPA 0",
    name: "Infraestructura Física, FAR++ y Nodos Soberanos",
    purpose: "Subsistencia bajo colapso de proveedores o aislamiento geopolítico.",
    components: [
      "Cloud multi-proveedor híbrido",
      "Fog regional (POP, ISP, universidades)",
      "Edge Nodes k3s + WebGPU",
      "Sin punto único de fallo",
    ],
  },
];

export const ORCHESTRATION = [
  {
    level: "L0",
    title: "Shell UX Mínimo",
    detail: "Renderizado liviano, SSR, navegación instantánea, presencia soberana, chat básico.",
  },
  {
    level: "L1",
    title: "Servicios Críticos",
    detail: "identity-svc · payments-svc · media-svc · guardian-svc",
  },
  {
    level: "L2",
    title: "Experiencias Intensivas",
    detail: "xr-spaces-svc · concerts-svc · quantum-pets-svc · creator-hub",
  },
  {
    level: "L3",
    title: "Orquestación y Gobernanza",
    detail: "isabella-core · bookpi-svc · sentinel-svc · governance-svc",
  },
];

export type AstState = "NORMAL" | "OBLIVION" | "BUNKER" | "ORPHAN" | "PHOENIX";

export const AST_STATES: { state: AstState; title: string; detail: string }[] = [
  {
    state: "NORMAL",
    title: "Operación multiregional",
    detail: "Sincronización total de quórum entre nodos cloud, fog y edge.",
  },
  {
    state: "OBLIVION",
    title: "Caída masiva de proveedores",
    detail: "Promoción automática de nodos Fog y Edge para sostener habitabilidad XR mínima.",
  },
  {
    state: "BUNKER",
    title: "Ataque legal o ciberataque crítico",
    detail: "Congelación selectiva en MSR e inmunización de identidades offline.",
  },
  {
    state: "ORPHAN",
    title: "Nodo desconectado",
    detail: "Modo autárquico: el nodo guarda hashes locales hasta la reconexión.",
  },
  {
    state: "PHOENIX",
    title: "Rehidratación canónica",
    detail: "Verificación cruzada SHA-256 entre BookPI y MSR para restaurar coherencia global.",
  },
];

export const PIPELINE = [
  {
    step: 1,
    name: "Normalización",
    detail: "Sanitización de entrada y conversión multisensorial a tensores estandarizados.",
  },
  {
    step: 2,
    name: "Clasificación",
    detail: "Identificación de intención, dominio operativo y nivel de contexto.",
  },
  {
    step: 3,
    name: "Evaluación Ética (KEC)",
    detail: "Validación contra los invariantes del Kernel Ético Central.",
  },
  {
    step: 4,
    name: "Validación de Seguridad",
    detail: "Anubis Sentinel escanea inyección, manipulación cognitiva y suplantación.",
  },
  {
    step: 5,
    name: "Verificación de Gobernanza",
    detail: "Firmas DID, consentimiento, quórum SACDAO y permisos asignados.",
  },
  {
    step: 6,
    name: "Decisión y Ejecución",
    detail: "Respuesta y acción; si supera el umbral, TIME-UP y escalamiento a HITL.",
  },
];

export const KEC_INVARIANTS = [
  "La IA NO posee derechos soberanos; es infraestructura servidora de la conciencia humana.",
  "La IA NO modifica la ley ni las reglas constitucionales por autonomía propia.",
  "La IA NO realiza manipulación cognitiva, engaño psicológico ni diseño adictivo.",
  "La IA NO gobierna seres humanos; sugiere, audita, explicita y ejecuta lo delegado.",
];

export const HYPERMODULES = [
  {
    key: "IsabellaGuardian",
    focus: "Protección física y emocional",
    detail:
      "Detecta patrones de acoso o fraude y activa refugios emocionales inmediatos para el ciudadano.",
  },
  {
    key: "IsabellaDev",
    focus: "Ingeniería del ecosistema",
    detail: "Analiza código, compila pipelines de deploy, audita repositorios y valida contratos MSR.",
  },
  {
    key: "IsabellaEconomy",
    focus: "Justicia distributiva",
    detail:
      "Audita el cumplimiento del FRI 20/30/50, simula liquidez y previene la concentración de valor.",
  },
  {
    key: "IsabellaXR",
    focus: "Presencia sensorial 4D",
    detail: "Física, iluminación, shaders y estado ambiental persistente de los DreamSpaces.",
  },
  {
    key: "IsabellaSocial",
    focus: "Mediación comunitaria",
    detail: "Mediación ética, traducción simultánea y consenso sin censura arbitraria.",
  },
];

export const DIGITAL_RIGHTS = [
  "Identidad Soberana Autocustodiada",
  "Memoria e Integridad Histórica",
  "Explicabilidad Algorítmica (XAI)",
  "Portabilidad Civilizatoria",
  "Refugio Digital Emocional",
  "Muerte Digital Programada y Legado",
];

export const FRI = [
  {
    share: 20,
    name: "Fondo Fénix",
    detail: "Becas UTAMV, creadores emergentes, proyectos comunitarios y justicia distributiva.",
  },
  {
    share: 30,
    name: "Infraestructura y Operación",
    detail: "Nodos, GPU pools, servidores, ancho de banda, licencias y costos directos.",
  },
  {
    share: 50,
    name: "Utilidad Neta Reinvertible",
    detail: "Crecimiento estratégico, reservas de liquidez y expansión civilizatoria.",
  },
];

export interface RevenueSource {
  n: number;
  name: string;
  desc: string;
  take: string;
  family: "Membresías" | "Creación" | "Educación" | "Licencias" | "Institucional";
}

export const REVENUE: RevenueSource[] = [
  { n: 1, name: "Membresía Free", desc: "Acceso base, presencia soberana, contenidos públicos.", take: "Conversión", family: "Membresías" },
  { n: 2, name: "Membresía Creador", desc: "$5–$10 USD/mes. Dreamspace Studio y publicación.", take: "100% tarifa", family: "Membresías" },
  { n: 3, name: "Membresía Gremial", desc: "$25–$50 USD/mes. Colectivos, salas privadas, trazabilidad MSR.", take: "100% tarifa", family: "Membresías" },
  { n: 4, name: "VIP / Elite / Celestial", desc: "$50–$200 USD/mes. Soporte prioritario y espacios destacados.", take: "100% tarifa", family: "Membresías" },
  { n: 5, name: "Enterprise / Institucional", desc: "$300–$1,000+ USD/mes. Universidades, gobiernos y empresas.", take: "100% tarifa", family: "Institucional" },
  { n: 6, name: "Contenido Digital", desc: "Cursos, contenidos premium y archivos de memoria.", take: "25–35%", family: "Creación" },
  { n: 7, name: "Marketplace Dreamspaces", desc: "Escenas 3D/4D, avatares, shaders y assets XR.", take: "20–35%", family: "Creación" },
  { n: 8, name: "Tips y Gifts XR en vivo", desc: "Microtransacciones y regalos animados durante eventos.", take: "30–50%", family: "Creación" },
  { n: 9, name: "Lotería y Sorteos Ceremoniales", desc: "Bolsas acumuladas con reglas auditadas en MSR.", take: "50% de la bolsa", family: "Creación" },
  { n: 10, name: "Patrocinios y Branded Spaces", desc: "Conexión ética entre marcas y creadores en mundos XR.", take: "Fee o % contrato", family: "Institucional" },
  { n: 11, name: "Cursos UTAMV", desc: "Cursos extra tras publicar un curso libre.", take: "25% inscripción", family: "Educación" },
  { n: 12, name: "Diplomados y Certificaciones", desc: "Certificados con evidencia académica en MSR.", take: "25% emisión", family: "Educación" },
  { n: 13, name: "Becas Cofinanciadas", desc: "Fondos corporativos o gubernamentales gestionados.", take: "Fee de administración", family: "Educación" },
  { n: 14, name: "Licencias Isabella IA (SaaS/API)", desc: "Acceso B2B a las APIs de Isabella.", take: "100% · margen ~80%", family: "Licencias" },
  { n: 15, name: "Licencias MSR / Blockchain", desc: "Nodos de notariado e identidad para instituciones.", take: "100% licencia", family: "Licencias" },
  { n: 16, name: "Hosting XR y Render 3D/4D", desc: "Renderizado volumétrico intensivo en edge.", take: "100% sobre COGS", family: "Licencias" },
  { n: 17, name: "Paneles de Observabilidad", desc: "Auditoría, compliance y telemetría avanzada.", take: "100% addon", family: "Licencias" },
  { n: 18, name: "Consultoría Constitucional Digital", desc: "Asesoría a gobiernos e instituciones en gobernanza.", take: "100% tarifa", family: "Institucional" },
  { n: 19, name: "Producción de Eventos XR", desc: "Conciertos y festivales inmersivos para terceros.", take: "Fee + % taquilla", family: "Creación" },
  { n: 20, name: "White-Label / Franquicias", desc: "Instancias dedicadas «TAMV for X».", take: "Setup + revenue share", family: "Institucional" },
  { n: 21, name: "Merchandising Conectado", desc: "Productos físicos vinculados a acreditaciones onchain.", take: "Margen directo", family: "Creación" },
  { n: 22, name: "Datos Agregados Anonimizados", desc: "Estudios macroeconómicos y culturales 100% éticos.", take: "100% costo estudio", family: "Institucional" },
];

export const ROADMAP = [
  { phase: "Fase 0", name: "Origen Humano", state: "Completado", detail: "Definición constitucional, dedicatoria fundacional y documentación canónica." },
  { phase: "Fase 1", name: "Infraestructura Mínima Viva", state: "En ejecución", detail: "Autenticación, perfiles, BookPI, pipeline de Isabella, Consola Guardián, DevHub API." },
  { phase: "Fase 2", name: "Economía Creadora", state: "Planeada", detail: "Membresías, marketplace de assets, UTAMV v1 y Protocolo Fénix." },
  { phase: "Fase 3", name: "XR Civilizatorio", state: "Planeada", detail: "Atlas 3D, DreamSpaces persistentes y Home Institucional." },
  { phase: "Fase 4", name: "Federación Global", state: "Planeada", detail: "Nodos multi-región, MSR transnacional y activación de la SACDAO." },
  { phase: "Fase 5", name: "Integración Física", state: "Planeada", detail: "Edge local, gateways hápticos e identidad físico-digital." },
  { phase: "Fase 6", name: "Expansión Institucional", state: "Planeada", detail: "Alianzas académicas, gobiernos locales y certificaciones." },
  { phase: "Fase 7", name: "Archivo Histórico Perpetuo", state: "Planeada", detail: "Sucesión programada y memoria civilizacional perpetua." },
];

export const FRAMEWORKS = [
  { code: "ONU HRC Res. 20/8", detail: "Continuidad de derechos humanos en el espacio digital." },
  { code: "UNESCO IA 2021 · ROAM-X", detail: "Derechos, apertura, accesibilidad y gobernanza multiactor." },
  { code: "OCDE 2019 · EU AI Act", detail: "Explicabilidad obligatoria, trazabilidad y rendición de cuentas." },
  { code: "W3C DID & VC", detail: "Identidad soberana descentralizada sin intermediarios." },
  { code: "eIDAS · NIST · ISO/TC 307", detail: "Validez probatoria de firmas, evidencias y ledgers." },
  { code: "GDPR · LGPD · LFPDPPP", detail: "Minimización de datos, consentimiento y soberanía del titular." },
];

export const GUARDIAN_QUEUE = [
  {
    id: "GA-0007",
    action_type: "ECONOMIC_FREEZE",
    target: "wallet://did:tamv:8f31…c0a2",
    recommendation: "escalate" as const,
    explanation:
      "Patrón de circulación cíclica compatible con lavado. Protocolo Hoyo Negro sugiere congelar y reetiquetar en MSR.",
    confidence: 0.82,
    flags: ["fraude_probable", "concentración_anómala"],
  },
  {
    id: "GA-0008",
    action_type: "CONTENT_MEDIATION",
    target: "dreamspace://ceremonia-fenix/sala-3",
    recommendation: "approve" as const,
    explanation:
      "Conflicto entre dos gremios resuelto por mediación; sin censura. Requiere ratificación humana por afectar memoria histórica del espacio.",
    confidence: 0.91,
    flags: ["memoria_histórica"],
  },
  {
    id: "GA-0009",
    action_type: "IDENTITY_RECOVERY",
    target: "did:tamv:4b7d…19ff",
    recommendation: "escalate" as const,
    explanation:
      "Solicitud de regeneración de biometría cancelable sin quórum ZKP completo. Riesgo de suplantación.",
    confidence: 0.64,
    flags: ["suplantación_posible", "consentimiento_parcial"],
  },
  {
    id: "GA-0010",
    action_type: "POLICY_CHANGE",
    target: "sacdao://propuesta-114",
    recommendation: "deny" as const,
    explanation:
      "La propuesta intenta alterar el Invariante 2 del KEC. Constitucionalmente inejecutable, incluso con quórum unánime.",
    confidence: 0.99,
    flags: ["violación_kec", "inmutable"],
  },
];

export const NODES = [
  { name: "Anáhuac-Core", type: "cloud", state: "NORMAL" as AstState, load: 0.62 },
  { name: "Iberia-Fog-01", type: "fog", state: "NORMAL" as AstState, load: 0.41 },
  { name: "Andes-Edge-14", type: "edge", state: "ORPHAN" as AstState, load: 0.12 },
  { name: "Sahel-Fog-03", type: "fog", state: "PHOENIX" as AstState, load: 0.33 },
  { name: "Nippon-Cloud-02", type: "cloud", state: "BUNKER" as AstState, load: 0.77 },
  { name: "Baltic-Edge-07", type: "edge", state: "NORMAL" as AstState, load: 0.24 },
];