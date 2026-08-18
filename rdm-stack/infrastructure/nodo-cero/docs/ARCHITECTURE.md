# Arquitectura del RDM Digital Hub — Nodo Cero

## Visión General

**RDM Digital Hub — Nodo Cero** es un Sistema Operativo Territorial Soberano (TOS) que implementa:

1. **Gemelo Digital Territorial** (DTDL + NGSI-LD + grafo de conocimiento)
2. **Centro de Operaciones Urbano (IOC)** (incidentes, movilidad, respuesta)
3. **Gestión de Activos y Mantenimiento (EAM/APM)**
4. **Redes Inteligentes (Smart Grid/Agua)**
5. **Marketplace Soberano** (licencias, datos, suscripción)
6. **Gamificación Territorial** (motor server-authoritative + arena 3D Unity WebGL)
7. **Identidad Soberana (IDENTITY YUN)** (API keys nativas sin proveedor externo)
8. **Malla Federada Autopoiética (CITEMESH)** (P2P con failover y degradación)
9. **Grafo de Conocimiento Federado (GEMET)** (checksum canónico + réplicas)
10. **Continuidad del Negocio** (journal inmutable + reconciliación)

## Stack Tecnológico

### Frontend
- **Framework:** Next.js 16 (App Router) con React 19
- **Lenguaje:** TypeScript 5.9 (strict mode)
- **Estilos:** Tailwind CSS 4, CVA, Tailwind Merge
- **UI:** Lucide React, Motion (animaciones), Recharts (gráficos)
- **Mapas:** Leaflet (OpenStreetMap + Carto)
- **3D:** Three.js + @react-three/fiber + @react-three/drei
- **Gamificación 3D:** Unity 2022.3 LTS compilado a WebGL

### Backend
- **Runtime:** Node.js (Next.js API Routes)
- **Persistencia:** 
  - **Primary:** Postgres + Supabase (con RLS)
  - **Replica:** Postgres + Neon (integración Vercel)
  - **Cache:** Redis (Upstash)
- **Validación:** Zod (JSON schema + tipos TypeScript)
- **Events:** Bus unificado con envelope traceId/correlationId
- **Observabilidad:** Prometheus/Grafana (futura), SLO/RED metrics

### Seguridad
- **Zero Trust:** 7 capas (origen verificado, rate limit, firma HMAC, etc.)
- **Criptografía Post-Cuántica:** CRYSTALS-Dilithium-5, CRYSTALS-Kyber-1024, Falcon-1024
- **API Keys Nativas:** IDENTITY YUN (scrypt hash, scopes, rotación/revocación)
- **Firma de Artefactos:** MSR-P256 (mexa-api.ts)

### Testing
- **Framework:** Vitest
- **Cobertura:** 42 archivos de tests por dominio
- **Herramientas:** TypeScript (`tsc --noEmit`), ESLint 9, auditor de consistencia

## Estructura del Código

```
app/                          # Next.js App Router
├── api/
│   ├── _shared/
│   │   └── route-guard.ts    # Route-guard único (Zero Trust, 7 capas)
│   └── <dominio>/*           # Rutas API por dominio
├── <dominio>/page.tsx        # Páginas: twins, city, assets, grid, etc.
└── page.tsx                  # Home (4 planos)

lib/                          # Lógica de dominio
├── core/                     # Núcleo transversal
│   ├── env/                  # Variables de entorno (zod)
│   ├── events/               # Bus de eventos
│   ├── contracts/            # Esquemas Zod por dominio
│   └── utils/                # Utilidades compartidas
├── security/                 # Trust, keys, tokens
│   └── trust.ts              # Trust canónica (source of truth)
├── <dominio>/                # Stacks de dominio
│   ├── isa-core.ts           # (Isabella) razonamiento
│   ├── mexa-api.ts           # (Isabella) firma de artefactos
│   └── http.ts               # (Isabella) exposición vía HTTP
├── citemesh/                 # Malla federada (P2P + failover)
├── gemet/                    # Grafo de conocimiento (checksum + réplicas)
├── continuity/               # Journal + reconciliación
└── archive/                  # Archivo histórico con checksums

components/                   # React (UI + gamificación)
hooks/                        # Custom hooks
tests/                        # Vitest (42 archivos)
docs/                         # ADRs, guías, C4, catálogo de APIs
```

## Dominios de la Plataforma

| Dominio | Responsabilidad | Código |
|---------|---|---|
| **Isabella** | Asistente cognitivo, razonamiento ISA, Mexa API, CROWN gateway | `lib/isabella/`, `app/api/isabella/*` |
| **City** | IOC urbano: incidentes, infraestructura, movilidad, respuesta | `app/api/city/*` |
| **Twins** | Gemelo territorial: DTDL, instancias, grafo, simulación | `app/api/twins/*` |
| **Assets** | EAM/APM: registro, salud, fallas, mantenimiento | `app/api/assets/*` |
| **Grid** | Redes de energía y agua: balance, topología, alertas | `app/api/grid/*` |
| **Marketplace** | Ofertas, licencias, modelos, publicación | `app/api/marketplace/*` |
| **Gamification** | Motor de puntos server-authoritative, arena 3D | `lib/gamification/`, `app/api/gamification/*` |
| **Identity (YUN)** | API keys nativas: emisión, rotación, revocación | `lib/security/identity/`, `app/api/identity/*` |
| **CITEMESH** | Malla federada P2P: registro de nodos, ruteo con failover | `lib/citemesh/`, `app/api/citemesh/*` |
| **GEMET** | Grafo federado: registros ontológicos con checksum | `lib/gemet/`, `app/api/gemet/*` |
| **Continuity** | Journal inmutable, reconciliación, aislamiento | `lib/continuity/`, `app/api/continuity/*` |
| **Archive** | Archivo histórico: búsqueda, checksums, curación | `lib/archive/`, `app/api/archive/*` |

## Cadena de Seguridad Zero Trust (7 capas)

```
Solicitud HTTP
    ↓
1. Origen verificado (Canonical Origins vs. Trusted Hosts)
    ↓
2. Rate limiting (por origen)
    ↓
3. Método HTTP permitido (GET, POST, PATCH, DELETE)
    ↓
4. Headers de seguridad (Content-Type, User-Agent)
    ↓
5. Firma HMAC (si requiresSignature: true)
    ↓
6. Validación de contrato Zod (body)
    ↓
7. Autorización (scope de la API key, RBAC)
    ↓
Handler ejecutado con contexto seguro
    ↓
Evento emitido al bus (traceId/correlationId)
```

**Route-guard único:** `@/app/api/_shared/route-guard.ts`  
Nunca duplicar `enforceTrust`; usar siempre el route-guard.

## Bus de Eventos Unificado

- **Envelope:** traceId + correlationId (trazabilidad distribuida)
- **Emisión:** `publishEvent(eventType, payload)` de `@/lib/core/events`
- **Suscriptores:** handlers registrados en `lib/core/events/subscribers.ts`
- **Anti-lazo:** detecta ciclos de eventos
- **Observabilidad:** cada evento se registra en logs y métricas

## Modelo de Datos

### Postgres (Supabase + Neon)
- **Tablas de Isabella:** sesiones, mensajes, memoria, decisiones, políticas
- **Dominios territoriales:** gemelos, activos, incidentes, nodos de red
- **RLS:** políticas de fila basadas en scopes de API key
- **Migraciones:** 001 (Isabella), 002 (dominios) con extensiones `postgis` + `pgcrypto`

### Redis (Upstash)
- Caché de sesiones
- Estado del motor de gamificación
- Contadores de rate limit
- TTL automático para degradación

## Experiencia de Usuario (4 Planos)

| Plano | Nombre | Contenido |
|---|---|---|
| **I** | Descubre | Turismo, cultura, patrimonio |
| **II** | Comercia | Negocios, pagos, suscripciones |
| **III** | Personaliza | Comunidad, cuenta, gamificación |
| **IV** | Gobierna | Gemelo digital, Smart City, IOC |

Navegación por: navbar superior "Explorar" (acordeón de 4 planos) + navbar contextual izquierda (retráctil).

## Gamificación Territorial

### Motor Server-Authoritative
- Sesión generada en backend (`/api/gamification/session`)
- Token HMAC-SHA256 firmado con `sessionId + timestamp`
- Anti-cheat: validación de eventos (cadencia, puntos, coherencia de movimiento)

### Arena 3D (Unity WebGL)
- Compilada a `public/unity/RDMArena/` (RDMArena.loader.js + .wasm)
- Puente C#-JS (`rdm-yun`): WebGLBridge → window.rdmUnityBridge
- Eventos: `session-started`, `kill`, `wave`, `combo`, `mission-completed`, `prize-claimed`
- Fallback 2D: si el build WebGL no está disponible, degrada a `ZombieInvasionFallback`

## Identidad Soberana (IDENTITY YUN)

- **Emisión:** `POST /api/identity/keys` (scope `admin:keys`)
- **Almacenamiento:** hash scrypt (NUNCA en claro)
- **Prefijo:** `rdm_live_*`
- **Scopes:** `turismo:read/write`, `archivo:read/write`, `gemelos:read/write`, etc.
- **Rotación:** `_V2`, `_V3` sin downtime
- **Autenticación:** cabecera `x-rdm-api-key` + route-guard

## Malla Federada (CITEMESH)

- **Topología:** celdas F1, F2, F3
- **Registro:** P2P con credencial derivada de `p2pPublicKey`
- **Ruteo:** paquetes firmados con failover automático
- **Degradación:** escalado de capacidad y aislamiento por falla

## Grafo Federado (GEMET)

- **Registros Ontológicos:** con checksum SHA256 canónico
- **Réplicas Remotas:** detección de manipulaciones
- **Caché Firmada:** validación antes de usar
- **Sincronización:** eventual consistency con confirmación de integridad

## Continuidad del Negocio

- **Journal Inmutable:** hash-chain con checksum
- **Reconciliación:** primario ↔ réplica automática
- **Aislamiento:** primary mode → isolated mode (en caso de falla)
- **Activación:** switchover a réplica con rollback en cascada
- **RTO/RPO:** matriz de tiempo de recuperación y pérdida de datos

## Despliegue

### Desarrollo Local
```bash
npm install --legacy-peer-deps
cp .env.example .env.local  # completar claves opcionales
npm run dev                 # http://localhost:3000
```

### Verificación de Calidad
```bash
npm run quality  # auditor + env + contracts + lint + tsc + test
```

### Producción (Vercel)
1. Variables de entorno en **Project Settings → Environment Variables**
2. Dominio canónico: `www.visitarealdelmonte.online`
3. El apex (`visitarealdelmonte.online`) redirige al canónico con **308 (permanent redirect)**
4. SSL/TLS automático + header de seguridad (CSP, HSTS, X-Frame, etc.)

## Convenciones de Código

- **Idioma:** Comentarios en español; identificadores en inglés
- **Archivos:** kebab-case
- **Rutas internas:** alias `@/` → raíz del proyecto
- **Cabecera de módulo:** bloque `/* ==== */` existente
- **Núcleo transversal:** `lib/core/`
- **Trust canónica:** `lib/security/trust.ts`
- **Route-guard:** ÚNICA implementación en `app/api/_shared/route-guard.ts`
- **Contratos Zod:** en `lib/core/contracts/` (nunca validación manual duplicada)
- **Eventos:** `publishEvent()` del bus (nunca emisión directa)
- **Variables de entorno:** tipadas con `getEnv()` de `lib/core/env/`
- **Tests:** Vitest, por dominio en `tests/<dominio>.test.ts`

## Referencias

- **RFC-0001.md** — Manifiesto CROWN y gobernanza
- **docs/ADRs/** — Decisiones arquitectónicas (ISA soberano, Zero Trust, observabilidad)
- **docs/c4-contexto.md** — Diagrama C4
- **docs/catalogo-apis.md** — Contrato de cada ruta API
- **docs/mapa-dominios.md** — Mapeo de dominios ↔ código ↔ federación
- **docs/guia-desarrollador.md** — Setup y convenciones
- **docs/guia-modularizacion.md** — Patrón de adición de dominios

---

**Nodo Cero** es el origen de la Heptafederación YUN que conecta los municipios de la Comarca Minera (Real del Monte, Pachuca, Mineral del Chico, Huasca, Omitlán).
