# YUN Blueprint – Arquitectura lógica, física, despliegue, seguridad y datos

**Versión:** v1.1  
**Fecha:** 2026-07-13  
**Ámbito:** TAMV Online, Nodo Cero, RDM Digital, Isabella, 7 Federaciones, ISA-API

---

## 1. Arquitectura lógica

### 1.1 Componentes principales

- **Gateway YUN**
  - Punto único de entrada para tráfico externo.
  - Termina TLS, valida JWT, aplica rate limiting y filtros de seguridad.
  - Encaminiza solicitudes según federación y dominio.

- **Data Fabric / Orchestrator**
  - Coordina llamadas a dominios.
  - Ejecuta sagas distribuidas.
  - Aplica timeouts, reintentos, circuit breakers.
  - Publica y consume eventos.

- **Dominios**
  - Identity Domain.
  - Commerce Domain.
  - Knowledge Domain.
  - Telemetry Domain.
  - Gameplay Domain.

- **Bus de eventos**
  - Canal para eventos de negocio, salud, seguridad y federación.

- **Coordinadores de federación**
  - Servicios que gestionan el estado y las políticas de cada federación (Fed1–Fed7).

- **Servicios de Isabella**
  - Conjunto de microservicios que interpretan datos, ontologías y estados federados.

- **Sistema de gestión de secretos**
  - Servicio centralizado para manejar credenciales, claves y tokens.

### 1.2 Relaciones lógicas

- El Gateway se comunica solo con el Fabric y el sistema de identidad.
- El Fabric se comunica con:
  - Dominios (por contratos),
  - Bus de eventos,
  - Coordinadores de federación,
  - Servicios de Isabella.
- Los Dominios:
  - Se comunican con sus bases,
  - Publican eventos,
  - Responden a solicitudes del Fabric.
- El Bus de eventos:
  - Entrega mensajes a consumidores suscritos (dominios, federaciones, telemetría, Isabella).
- Telemetry:
  - Recibe eventos, logs y métricas desde todos los componentes.
- El sistema de secretos:
  - Provee credenciales a Gateway, Fabric, dominios y servicios internos.

---

## 2. Arquitectura física

### 2.1 Persistencia por dominio

| Dominio | Base | Uso |
|---------|------|-----|
| **Identity** | Supabase Postgres | Autenticación, perfiles, roles, badges, estado base |
| **Commerce** | Neon Postgres | Pagos, suscripciones, facturas, negocios, eventos de Stripe |
| **Knowledge** | Turso / libSQL | Foro, contribuciones territoriales, ontologías, IA |
| **Telemetry** | Cloudflare D1 | Logs, métricas, auditoría, salud federada, seguridad |
| **Gameplay** | Upstash Redis | Puntos, XP, rachas, sesiones, caché |

### 2.2 Infraestructura de servicios

- **Gateway YUN:** Desplegado como servicio altamente disponible (mínimo dos instancias).
- **Data Fabric:** Conjunto de servicios coordinados, capaz de escalar horizontalmente.
- **Dominios:** Cada dominio se despliega como uno o más servicios backend, con acceso controlado a su base.
- **Bus de eventos:** Cluster de mensajería confiable, con topics por dominio y federación.
- **Servicios de Isabella:** Microservicios detrás del Fabric.
- **Telemetría y observabilidad:** Stack independiente para logs, métricas y trazas.

---

## 3. Arquitectura de despliegue

### 3.1 Estrategias de despliegue

- **Servicios críticos (Gateway, Fabric, Identity, Commerce):** Rolling updates controlados. Posibilidad de blue/green para cambios mayores. Validación automática de salud post-deploy.
- **Servicios no críticos (Gameplay, partes de Knowledge):** Rolling updates con mayor frecuencia.

### 3.2 Pipelines de entrega

- Cada servicio tiene pipeline CI/CD que:
  - Ejecuta pruebas unitarias y de integración mínimas.
  - Ejecuta checks de cumplimiento de estándares YUN.
  - Despliega sólo si los checks se cumplen.

### 3.3 Versionado de servicios

- Los servicios relevantes se versionan por contrato: `/v1/*`, `/v2/*`.
- Las migraciones deben mantener compatibilidad durante ventanas definidas y documentarse en ADR.

---

## 4. Arquitectura de seguridad

### 4.1 Capa perimetral

- TLS obligatorio.
- Validación de identidad (JWT, OAuth2).
- WAF básico con filtros anti-inyección.
- Rate limiting por usuario, federación y origen.

### 4.2 Capa de aplicación

- Autorización por rol y dominio.
- Timeouts para llamadas descendentes.
- Circuit breakers para dominios problemáticos.
- Validación de entrada en cada endpoint.
- Consultas parametrizadas.

### 4.3 Capa de datos

- Principio de mínimo privilegio.
- Cifrado en reposo donde sea necesario.
- Auditoría de accesos y operaciones críticas.

### 4.4 Capa de secretos

- Distribución centralizada de credenciales.
- Rotación periódica de claves.
- Auditoría de acceso a secretos.

### 4.5 Capa de observabilidad

- Logs de seguridad.
- Métricas de errores.
- Trazas de incidentes.

---

## 5. Arquitectura de datos

### 5.1 Dominios y sus responsabilidades

- **Identity:** Datos de usuario, roles, reputación base, actividad.
- **Commerce:** Datos financieros, suscripciones, facturas, pagos.
- **Knowledge:** Contenido generado, contribuciones, ontologías.
- **Telemetry:** Información de operación, auditoría, seguridad, salud.
- **Gameplay:** Estado efímero de juego, puntos, rachas, sesiones.

### 5.2 Data Catalog

Tabla `data_catalog` en Telemetry con campos:
- `entity`
- `domain`
- `federation_scope`
- `database`
- `table_or_key`
- `owner`
- `purpose`
- `retention_policy`
- `sensitivity`
- `encryption`

### 5.3 Replicación y cachés

- Replicación lógica mediante eventos (CDC event-driven).
- Redis y Turso se usan como caché para lecturas frecuentes.
- **Regla:** Ningún caché puede considerarse fuente de verdad.

---

## 6. Vínculo con otros documentos YUN

- La Constitución YUN define los principios que este Blueprint debe respetar.
- El Security & Data Standard detalla los controles de seguridad y datos.
- El Event Standard define el modelo de eventos que este Blueprint utiliza.
- El Operations Manual describe cómo operar y recuperar este diseño en producción.
- La Isabella Layer define la capa cognitiva y los motores.
- Los ISA-API Contracts definen la interfaz cognitiva.

---

## 7. Ejes L0–L10 y P0–P10

### 7.1 Eje L0–L10 (Technical Maturity Layers)

Cada federación implementa hasta 11 capas técnicas:

| Nivel | Nombre | Descripción |
|-------|--------|-------------|
| L0 | Conectividad | Mesh CITEMESH, nodo físico |
| L1 | Transporte | Enrutamiento federado, relay |
| L2 | Identidad | JWT, OAuth2, DID |
| L3 | Mensajería | GEMET event bus, topics |
| L4 | Agentes | Mesh de agentes (ANUBIS, HORUS, OJO DE RA) |
| L5 | Ontología | SOPHIA, grafo de conocimiento |
| L6 | Almacenamiento | SDMD-7 (federado) |
| L7 | Ledger | MSR BLOCKCHAIN (gobernanza) |
| L8 | Orquestación | QUETZALCOATL, data fabric |
| L9 | Cognición | Isabella, ORION, LUMEN |
| L10 | Soberanía | Políticas, ADR, triple bloqueo |

### 7.2 Eje P0–P10 (Process Maturity Levels)

Cada federación evalúa su madurez de procesos:

| Nivel | Nombre | Descripción |
|-------|--------|-------------|
| P0 | Inicial | Sin procesos formales |
| P1 | Gestionado | Operación documentada |
| P2 | Definido | Estándares por federación |
| P3 | Integrado | Eventos cross-federación |
| P4 | Medido | KPIs, telemetría, auditoría |
| P5 | Optimizado | Mejora continua |
| P6 | Predictivo | Anomalías anticipadas |
| P7 | Autónomo | Auto-recuperación parcial |
| P8 | Resiliente | Degradación controlada |
| P9 | Soberano | Independencia operativa total |
| P10 | Constitucional | Ciclo completo de gobernanza |

---

## 8. Patrón hexagonal de doble pipeline

### 8.1 Pipeline de ingesta
- Eventos entran por GEMET.
- SOPHIA ontologiza y clasifica.
- LUMEN evalúa contra políticas.
- SDMD-7 persiste.

### 8.2 Pipeline de proyección
- ANUBIS orquesta agentes.
- HORUS monitorea telemetría.
- OJO DE RA aplica seguridad.
- QUETZALCOATL fabrica datos entre dominios.

Ambos pipelines operan en paralelo y se realimentan. Este patrón es la arquitectura por defecto para todo nuevo dominio o federación.
