# TAMV Core
> **Territorio Autónomo de Memoria Viva**  
> **Entregable Canónico y Reporte Maestro de Arquitectura**  
> *Isabella Villaseñor AI™ · MD-X4*

![Estado](https://img.shields.io/badge/Estado-Blueprint%20Ejecutable-0f766e)
![Arquitectura](https://img.shields.io/badge/Arquitectura-L0--L3%20%2B%207%20Capas-4f46e5)
![Seguridad](https://img.shields.io/badge/Modelo-Zero--Trust%20%2B%20HITL-7c3aed)
![Stack](https://img.shields.io/badge/Stack-Bun%20%7C%20TanStack%20Start%20%7C%20Vite%20%7C%20TypeScript-f59e0b)

> **Estado documental:** Canónico · Federado · Auditable  
> **Autoridad creadora:** Edwin Oswaldo Castillo Trejo *(Anubis Villaseñor)*  
> **Sello de origen:** `VERSION_GENESIS_1.3_BLINDAJE_JURIDICO_INTERNACIONAL_TOTAL`  
> **Fecha canónica:** 13 de agosto de 2026  
> **ORCID:** `0009-0008-5050-1539`

---

## Propósito

**TAMV Online** significa **Territorio Autónomo de Memoria Viva**: una arquitectura digital federada orientada a identidad soberana, memoria verificable, experiencias XR, economía ética y gobernanza humana verificable.

TAMV no se define como una red social comercial ni como un metaverso especulativo. Su propósito es construir infraestructura de presencia digital continua, donde el valor no dependa de la extracción conductual, la vigilancia o la concentración de poder.

> **Axioma Cero:** si una persona siente que “entra” o “se conecta” a TAMV, el diseño ha fallado. La presencia debe ser continua, orgánica, accesible y no transaccional.

---

## Dedicatoria

Este ecosistema está dedicado a **Reina Trejo Serrano**.

> “A ti que me educaste con el ejemplo y jamás con palabras vacías. A ti que dejaste de vivir tu vida para darle alas a la mía. A ti que renunciaste a la felicidad por verme sonreír. A ti que durante años fuiste escudo recibiendo golpes dirigidos hacia mí.”
>
> *Este logro es el fruto de la lucha en solitario de tu Oveja Negra.*

---

## Principios constitucionales

- **Identidad soberana:** toda persona conserva control sobre su identidad, consentimiento, memoria y portabilidad.
- **Minimización de datos:** se recolecta únicamente la información necesaria para una finalidad declarada.
- **Memoria verificable:** los eventos relevantes producen evidencias con trazabilidad criptográfica.
- **Explicabilidad:** las decisiones automatizadas relevantes deben poder explicarse, auditarse y, cuando aplique, impugnarse.
- **No manipulación:** quedan prohibidos los patrones adictivos, la persuasión encubierta, los feeds infinitos y los rankings opacos.
- **Supervisión humana:** las acciones de alto impacto requieren revisión Human-in-the-Loop (HITL).
- **Resiliencia federada:** ninguna región, proveedor o actor debe convertirse en punto único de fallo.
- **IA servidora:** Isabella asiste, analiza, audita y ejecuta acciones delegadas; no gobierna seres humanos ni modifica la constitución por iniciativa propia.

---

## Arquitectura general

TAMV usa dos mapas complementarios:

1. **Jerarquía técnica L0-L3**, que organiza experiencia, servicios, cargas intensivas y orquestación.
2. **Siete capas federadas**, que organizan la infraestructura desde el hardware hasta el legado histórico.

```text
┌───────────────────────────────────────────────────────────────┐
│ CAPA 7 · Metacivilización, Archivo Histórico y Legado          │
├───────────────────────────────────────────────────────────────┤
│ CAPA 6 · Gobernanza, Consola Guardián, SACDAO y HITL           │
├───────────────────────────────────────────────────────────────┤
│ CAPA 5 · Economía Ética, TAMV-T, FRI y protocolos antifraude  │
├───────────────────────────────────────────────────────────────┤
│ CAPA 4 · Isabella Villaseñor AI™ y Kernel Ético Central       │
├───────────────────────────────────────────────────────────────┤
│ CAPA 3 · BookPI, MSR, MVTS 4D, Sentinel y resiliencia         │
├───────────────────────────────────────────────────────────────┤
│ CAPA 2 · CPV++, DreamSpaces y experiencia XR                  │
├───────────────────────────────────────────────────────────────┤
│ CAPA 1 · ID-NVIDA™, consentimiento e identidad soberana       │
├───────────────────────────────────────────────────────────────┤
│ CAPA 0 · FAR++, nodos cloud, fog, edge e infraestructura      │
└───────────────────────────────────────────────────────────────┘
```

### Niveles L0-L3

| Nivel | Dominio | Responsabilidades |
|---|---|---|
| **L0** | Shell de presencia | SSR, navegación, cliente de identidad, interfaz mínima y chat base |
| **L1** | Servicios críticos | `identity-svc`, `payments-svc`, `media-svc`, `guardian-svc` |
| **L2** | Experiencias intensivas | `xr-spaces-svc`, conciertos, Creator Hub, Quantum Pets |
| **L3** | Orquestación | `isabella-core`, `bookpi-svc`, `sentinel-svc`, `governance-svc` |

### Las siete capas federadas

| Capa | Nombre | Responsabilidad central |
|---|---|---|
| **0** | FAR++ | Infraestructura híbrida, multi-proveedor, fog y edge |
| **1** | ID-NVIDA™ | DID, credenciales verificables, consentimiento y privacidad |
| **2** | CPV++ | Experiencia inmersiva, accesible, no adictiva y persistente |
| **3** | Sistemas distribuidos | BookPI, MSR, MVTS 4D y Anubis Sentinel™ |
| **4** | IA civilizacional | Isabella Villaseñor AI™, KEC y módulos especializados |
| **5** | Economía ética | TAMV-T, FRI 20/30/50, Fénix y Hoyo Negro |
| **6** | Gobernanza | SACDAO, Consola Guardián, ERIE y revisión HITL |
| **7** | Legado | Archivo histórico, sucesión y resistencia a captura corporativa |

---

## Isabella Villaseñor AI™

**Isabella Villaseñor AI™** es el núcleo de inteligencia multimodal de TAMV. No es un bot convencional: actúa como orquestadora de intención, mediadora contextual, auditora ética y puente entre ciudadanos, instituciones y servicios federados.

### Pipeline cognitivo

```text
Entrada multimodal
(texto, voz, imagen, XR, eventos)
            │
            ▼
1. Normalización y sanitización
            │
            ▼
2. Clasificación de intención y dominio
            │
            ▼
3. Evaluación ética mediante KEC
            │
            ▼
4. Validación de seguridad con Anubis Sentinel™
            │
            ▼
5. Verificación de identidad, consentimiento y gobernanza
            │
            ├── Riesgo aceptable ──► Ejecución delegada
            │
            └── Riesgo alto ───────► Consola Guardián / HITL
```

### Kernel Ético Central

El **Kernel Ético Central (KEC)** opera como un conjunto de invariantes que cualquier implementación debe respetar:

1. Isabella no posee soberanía ni derechos políticos sobre las personas.
2. Isabella no puede modificar por sí misma la constitución, reglas de gobernanza o políticas fundamentales.
3. Isabella no debe manipular, engañar, perfilar de forma abusiva ni emplear diseño adictivo.
4. Isabella no gobierna: recomienda, explica, audita y ejecuta únicamente acciones autorizadas.
5. Las acciones de alto impacto deben poder escalarse a revisión humana.

### Hipermódulos

| Módulo | Función |
|---|---|
| **IsabellaGuardian** | Detección de riesgo, fraude, acoso y activación de mecanismos de protección |
| **IsabellaDev** | Auditoría de código, análisis técnico, CI/CD y validación de contratos |
| **IsabellaEconomy** | Revisión de FRI, simulación de liquidez y prevención de concentración |
| **IsabellaXR** | Estado ambiental, shaders, iluminación, física y presencia en DreamSpaces |
| **IsabellaSocial** | Mediación comunitaria, traducción, consenso y moderación basada en reglas |

### Estado emocional VAD

La respuesta contextual puede modelarse con un vector VAD:

| Componente | Rango | Significado |
|---|---:|---|
| **Valence** | `-1.0` a `1.0` | Positividad o negatividad afectiva |
| **Arousal** | `0.0` a `1.0` | Activación, energía o urgencia |
| **Dominance** | `0.0` a `1.0` | Control, firmeza o solemnidad |

El vector VAD puede orientar tono, síntesis de voz, audio espacial y comportamiento visual del avatar, sin sustituir consentimiento, control de usuario ni supervisión humana.

---

## Identidad y privacidad

### ID-NVIDA™

ID-NVIDA™ es la capa de identidad soberana de TAMV. Está diseñada para soportar:

- Identificadores descentralizados compatibles con DID.
- Credenciales verificables.
- Consentimiento granular y revocable.
- Identificadores derivados por dominio para reducir correlación.
- Pruebas de conocimiento cero donde sea viable.
- Operación degradada y verificable en escenarios offline.
- Exportación y portabilidad de datos bajo control de la persona titular.

### Carta de derechos digitales

- Derecho a la identidad autocustodiada.
- Derecho a la memoria e integridad histórica.
- Derecho a la explicabilidad algorítmica.
- Derecho a la portabilidad.
- Derecho al refugio digital emocional.
- Derecho a definir el ciclo de vida, transferencia o eliminación de legado digital.

> La implementación jurídica, biométrica, financiera o de datos personales debe validarse por asesoría profesional competente en cada jurisdicción aplicable.

---

## Evidencia y resiliencia

### BookPI™ Registry

BookPI™ registra eventos relevantes mediante encadenamiento criptográfico verificable:

```text
hash_n = SHA-256(
  hash_(n-1) +
  event_type +
  canonical_metadata +
  timestamp
)
```

El hash por sí solo no convierte un registro en evidencia legal universal. La fuerza probatoria depende de la cadena de custodia, firmas, controles operativos, legislación aplicable y mecanismos de preservación utilizados.

### MSR Ledger

El **MSR Ledger** funciona como capa de registro notarial-económico y de sincronización para contratos, eventos de gobernanza y operaciones económicas. Su objetivo es proporcionar trazabilidad, auditoría y consistencia interservicios.

### Anubis Sentinel™

Anubis Sentinel™ monitorea integridad, anomalías, intentos de inyección, corrupción de estado y señales operativas. Ante un incidente debe:

1. Registrar un `IntegrityEvent`.
2. Restringir la operación afectada o activar `SAFE_MODE`.
3. Preservar evidencia técnica.
4. Notificar a la Consola Guardián cuando el impacto requiera decisión humana.
5. Facilitar recuperación verificable desde BookPI y MSR.

### Motor AST

El **Autonomous Survival Engine (AST)** gestiona degradación y recuperación federada:

```text
NORMAL ── ataque / partición ──► OBLIVION
  │                                │
  ├── amenaza legal o ciberataque ─► BUNKER
  │                                │
  └── aislamiento de nodo ─────────► ORPHAN
                                     │
                                     ▼
                                  PHOENIX
                       rehidratación y verificación
```

| Estado | Comportamiento |
|---|---|
| **NORMAL** | Operación multi-región y sincronización estándar |
| **OBLIVION** | Promoción de nodos fog/edge ante caída de proveedores |
| **BUNKER** | Restricción de acciones sensibles y preservación de identidad offline |
| **ORPHAN** | Operación local autónoma con conservación de hashes y eventos |
| **PHOENIX** | Reconciliación, validación cruzada y recuperación de coherencia |

---

## Economía ética

### Fondo de Reserva de Integridad

La distribución operativa propuesta por el **FRI 20/30/50** es:

```text
Utilidad operativa neta distribuible
├── 20% · Fondo Fénix
├── 30% · Infraestructura y operación
└── 50% · Reinversión, reservas y crecimiento
```

| Porción | Uso |
|---:|---|
| **20%** | Becas, reparación comunitaria, apoyo a creadores y acceso educativo |
| **30%** | Cloud, nodos, GPU, ancho de banda, seguridad, licencias y operación |
| **50%** | Reservas, expansión estratégica, investigación y sostenibilidad |

### Protocolos

- **Fénix:** canaliza recursos de reparación, becas, acceso educativo y apoyo a creadores.
- **Hoyo Negro:** protocolo de contención ante fraude, abuso o comportamiento financiero anómalo; debe incluir revisión humana, bitácora, debido proceso y controles regulatorios aplicables.

### Fuentes de sostenibilidad

| Dominio | Ejemplos |
|---|---|
| Membresías | Creador, gremial, institucional, soporte premium |
| Economía creadora | Cursos, contenido digital, marketplace XR, certificaciones |
| Infraestructura | Render XR, hosting, observabilidad y nodos institucionales |
| IA y software | Licencias Isabella, APIs, integraciones y white-label |
| Servicios profesionales | Eventos XR, consultoría, implementación y formación |
| Investigación | Estudios agregados con consentimiento, anonimización y controles éticos |

> Todo producto de cómputo intensivo debe tener límites de uso, créditos o tarifas que cubran su costo real. Ningún modelo económico elimina obligaciones regulatorias, fiscales, de consumo, prevención de fraude o protección de datos.

---

## Experiencia XR

### CPV++

La **Capa Primordial Visual** define una experiencia de presencia que evita mecánicas de captura de atención:

- Sin feeds infinitos.
- Sin rankings sociales opacos.
- Sin contadores de popularidad como métrica central.
- Con accesibilidad y modos neurodivergentes.
- Con espacios persistentes que registran historia bajo reglas de privacidad.
- Con carga progresiva de activos, WebGPU y degradación elegante.

### DreamSpaces™

Los DreamSpaces™ son entornos 3D/XR persistentes con reglas de presencia, iluminación dinámica, audio espacial y lógica de eventos. Su “4D” se refiere al modelado de tiempo, memoria verificable y evolución contextual del espacio, no a una afirmación física extraordinaria.

```text
4D TAMV = Tiempo + Memoria verificable + Contexto colectivo
```

---

## Gobernanza

### SACDAO y Consola Guardián

La gobernanza combina participación federada con supervisión humana. La **Consola Guardián** presenta acciones sensibles para aprobación, edición, rechazo o escalamiento.

Una ponderación conceptual puede considerar:

```text
peso_de_gobernanza =
  contribución verificable × ética × coherencia histórica
```

Los tokens o recursos económicos no deben otorgar poder absoluto ni permitir alterar garantías fundamentales de dignidad, seguridad, privacidad y debido proceso.

### Evaluaciones ERIE

Las evaluaciones **ERIE** deben realizarse antes de desplegar automatizaciones de alto impacto:

- Riesgo de discriminación o exclusión.
- Riesgo de daño económico, emocional o reputacional.
- Impacto sobre privacidad, seguridad y derechos.
- Capacidad de explicación, apelación y reversión.
- Necesidad de revisión humana.

---

## Contratos TypeScript

```ts
export interface ZeroTrustSession {
  clientDid: string;
  sessionNonce: string;
  signature: string;
  issuedAt: number;
  expiresAt: number;
}

export interface BookPIEntry {
  id: string;
  eventType: string;
  userId: string;
  hash: string;
  previousHash: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface IsabellaRequest {
  intent: string;
  context: Record<string, unknown>;
  userId: string;
  session: ZeroTrustSession;
}

export interface IsabellaResponse {
  decision: "approve" | "deny" | "escalate";
  explanation: string;
  confidence: number;
  ethicalFlags: string[];
  requiresHitl: boolean;
  actionPayload?: Record<string, unknown>;
}

export interface IntegrityEvent {
  type: "CORRUPTION_DETECTED" | "SAFE_MODE_ENTERED" | "INTEGRITY_RESTORED";
  nodeId: string;
  severity: "low" | "medium" | "high" | "critical";
  metadata: Record<string, unknown>;
  msrHash: string;
  timestamp: string;
}
```

---

## Modelo de datos

Ejemplo de entidades principales en PostgreSQL/Supabase:

```sql
CREATE TABLE guardian_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type TEXT NOT NULL,
  target_id UUID,
  target_type TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'denied', 'escalated')),
  guardian_id UUID REFERENCES profiles(id),
  isabella_recommendation TEXT,
  explanation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE economic_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID REFERENCES profiles(id),
  to_user_id UUID REFERENCES profiles(id),
  amount NUMERIC(18, 8) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'TAMV-T',
  transaction_type TEXT NOT NULL,
  fee_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0,
  fee_amount NUMERIC(18, 8) NOT NULL DEFAULT 0,
  msr_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE federated_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_name TEXT NOT NULL,
  node_type TEXT NOT NULL CHECK (node_type IN ('edge', 'fog', 'cloud')),
  status TEXT NOT NULL DEFAULT 'active',
  ast_state TEXT NOT NULL DEFAULT 'NORMAL'
    CHECK (ast_state IN ('NORMAL', 'OBLIVION', 'BUNKER', 'ORPHAN', 'PHOENIX')),
  last_heartbeat TIMESTAMPTZ NOT NULL DEFAULT now(),
  metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE bookpi_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id),
  hash TEXT NOT NULL UNIQUE,
  previous_hash TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE guardian_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE economic_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE federated_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookpi_entries ENABLE ROW LEVEL SECURITY;
```

> Habilitar RLS no basta: agrega políticas explícitas, separación de funciones, registros de auditoría, pruebas de autorización y validaciones del lado del servidor.

---

## Roadmap

| Fase | Estado | Entregable |
|---|---|---|
| **0 · Origen humano** | Completada | Constitución, dedicatoria y arquitectura canónica |
| **1 · Infraestructura mínima viva** | En ejecución | Auth, perfiles, BookPI, Isabella, Guardián y DevHub |
| **2 · Economía creadora** | Planeada | Membresías, marketplace, UTAMV y Fondo Fénix |
| **3 · XR civilizatorio** | Planeada | Atlas 3D, DreamSpaces y experiencia institucional |
| **4 · Federación global** | Planeada | Nodos multi-región, MSR y SACDAO |
| **5 · Integración física** | Planeada | Edge, gateways hápticos e identidad físico-digital |
| **6 · Expansión institucional** | Planeada | Universidades, municipios y certificaciones |
| **7 · Archivo perpetuo** | Planeada | Sucesión programada y memoria histórica distribuida |

### Backlog inmediato

1. Implementar `bookpi-write` con canonicalización, hash SHA-256, idempotencia, firma y control de autorización.
2. Desplegar `isabella-chat` con sanitización, KEC, evaluación de riesgo, memoria vectorial y trazabilidad.
3. Construir `/guardian` con colas de aprobación HITL, roles, bitácora y mecanismos de apelación.
4. Publicar DevHub/OpenAPI para verificación de DIDs, credenciales y hashes de BookPI.
5. Definir políticas RLS, pruebas de aislamiento multitenant y auditoría de accesos.
6. Incorporar CI/CD con análisis estático, pruebas, escaneo de secretos, SBOM y firma de artefactos.

---

## Desarrollo local

El repositorio está construido con **Bun**, **TanStack Start**, **Vite** y **TypeScript**.

### Requisitos

- Bun reciente.
- Node.js solo si alguna integración o herramienta complementaria lo requiere.
- Variables de entorno para los proveedores que se integren: base de datos, autenticación, almacenamiento, modelos de IA y observabilidad.

### Instalación

```bash
git clone https://github.com/TAMV-ONLINE-NET/tamv-core.git
cd tamv-core
bun install
bun run dev
```

### Comandos habituales

```bash
bun run dev
bun run build
bun run lint
bun run test
```

> Consulta `package.json` para confirmar los scripts disponibles en la versión actual del proyecto.

---

## Seguridad

Antes de operar con datos reales, pagos, biometría, identidad verificable o modelos de IA:

- Realiza análisis de amenazas y pruebas de penetración.
- Implementa gestión de secretos, rotación de claves y firmas verificables.
- Separa entornos de desarrollo, pruebas y producción.
- Define retención de datos, exportación, borrado y respuesta a incidentes.
- Audita dependencias, imágenes, artefactos y configuraciones de despliegue.
- Establece revisión legal y regulatoria por jurisdicción.
- Mantén aprobación humana para acciones irreversibles o de alto impacto.

Consulta reportes de vulnerabilidades mediante los canales de seguridad configurados para la organización o repositorio.

---

## Declaración canónica

> TAMV es una arquitectura de memoria, dignidad, justicia técnica y presencia soberana.  
> La ley y los derechos humanos deben orientar al código.  
> La memoria no debe ser un privilegio corporativo.  
> La inteligencia artificial debe permanecer al servicio de la conciencia humana.

---

## Autoría

**Edwin Oswaldo Castillo Trejo**  
*Anubis Villaseñor*  
ORCID: `0009-0008-5050-1539`

---

## Nota de alcance

Este documento describe una visión arquitectónica y un blueprint técnico. No constituye por sí mismo asesoría legal, garantía de cumplimiento regulatorio, certificación de seguridad, patente concedida ni reconocimiento jurídico internacional. Cada afirmación de cumplimiento, evidencia, identidad, tokenización, biometría, sorteo o servicio financiero requiere implementación verificable y revisión profesional independiente.
