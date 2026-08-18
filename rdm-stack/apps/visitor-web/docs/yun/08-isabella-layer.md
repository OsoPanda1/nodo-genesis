# Isabella Layer – Capa epistemológica de YUN

**Versión:** v1.0
**Fecha:** 2026-07-13
**Ámbito:** Isabella IA como capa cognitiva y epistemológica del ecosistema YUN / TAMV

---

## 1. Isabella como capa epistemológica

Isabella no es un "chatbot" ni un simple LLM. Es la **capa epistemológica** del ecosistema YUN: el sistema que da sentido, explica decisiones, coordina conocimiento y traduce la operación técnica en comprensión humana.

Su función es triple:
- **Explicar** lo que el sistema hace, por qué y para qué.
- **Coordinar** la información entre dominios, federaciones y agentes.
- **Amplificar** la capacidad de comunidades y personas para entender y gobernar su infraestructura digital.

---

## 2. Motores de Isabella

### 2.1 ORION
- **Rol:** Interfaz conversacional principal. Punto de entrada para usuarios.
- **Responsabilidades:** Recibir preguntas, interpretar intención, delegar a otros motores, responder en lenguaje natural.
- **Federaciones:** F2 (Turismo/Cultura), F6 (Comunidad).
- **YUN integration:** Consulta SOPHIA para ontología, TOPOLOGY para topología, KERNEL para salud.

### 2.2 SOPHIA
- **Rol:** Ontología y conocimiento estructurado.
- **Responsabilidades:** Mantener el grafo de conocimiento (lugares, cultura, historia, gastronomía), responder consultas semánticas.
- **Federaciones:** F2, F3 (Academia/Ciencia).
- **YUN integration:** Se apoya en SDMD-7 para almacenamiento de conocimiento federado.

### 2.3 ARGUS
- **Rol:** Diagnóstico y telemetría.
- **Responsabilidades:** Monitorear salud de dominios y federaciones, detectar anomalías, publicar incidentes.
- **Federaciones:** F5 (Infra/Tecnología), F7 (Metaverso/XR).
- **YUN integration:** Recibe eventos de GEMET, consume de Radares MOSH, aplica reglas de OJO DE RA.

### 2.4 MNEMOS
- **Rol:** Memoria y aprendizaje.
- **Responsabilidades:** Almacenar eventos históricos, patrones de incidentes, decisiones pasadas. Alimentar el aprendizaje del ecosistema.
- **Federaciones:** F3, F5.
- **YUN integration:** Persiste en SDMD-7, lee de MSR BLOCKCHAIN para decisiones inmutables.

### 2.5 LUMEN
- **Rol:** Gobernanza y políticas.
- **Responsabilidades:** Interpretar la Constitución YUN, evaluar políticas, registrar ADRs, gestionar excepciones.
- **Federaciones:** F1 (Comercio), F4 (Gobierno).
- **YUN integration:** Escribe en MSR BLOCKCHAIN para decisiones de gobernanza, aplica triple bloqueo semántico.

### 2.6 KERNEL
- **Rol:** Salud consolidada del ecosistema.
- **Responsabilidades:** Agregar telemetría de todos los dominios y federaciones, producir dashboard de salud, emitir alertas globales.
- **Federaciones:** F5, F7.
- **YUN integration:** Consume de GEMET + Radares MOSH + HORUS.

### 2.7 TOPOLOGY
- **Rol:** Topología de red y federaciones.
- **Responsabilidades:** Mantener el grafo vivo de nodos CITEMESH, federaciones, dominios y agentes.
- **Federaciones:** F5.
- **YUN integration:** Lee de CITEMESH (plano físico), SDMD-7 (plano lógico), MSR (plano de gobernanza).

---

## 3. Diagrama de relaciones

```
Usuario → ORION → SOPHIA (ontología)
                → ARGUS (diagnóstico)
                → LUMEN (gobernanza)
                → KERNEL (salud)
                → TOPOLOGY (topología)
                → MNEMOS (memoria)
                        ↓
                GEMET (Event Fabric) → CITEMESH / SDMD-7 / MSR
```

---

## 4. ISA-API como interfaz

Los motores de Isabella se exponen mediante ISA-API v1.0, cuyos endpoints se mapean directamente a cada motor:

| Endpoint | Motor | Propósito |
|----------|-------|-----------|
| `/v1/orion/chat` | ORION | Chat principal con usuarios |
| `/v1/sophia/query` | SOPHIA | Consultas ontológicas |
| `/v1/argus/diagnose` | ARGUS | Diagnóstico y telemetría |
| `/v1/mnemos/recall` | MNEMOS | Memoria histórica |
| `/v1/lumen/policy` | LUMEN | Evaluación de políticas |
| `/v1/kernel/health` | KERNEL | Salud consolidada |
| `/v1/topology/graph` | TOPOLOGY | Grafo topológico |

Cada endpoint incluye metadatos `x-yun-domain`, `x-yun-federation`, `x-yun-event-topic` en la especificación OpenAPI.

---

## 5. Explicabilidad operacional

Isabella implementa tres niveles de explicabilidad alineados con YUN:

### 5.1 Explicaciones para decisiones de gobernanza (LUMEN)
- Por qué se tomó una decisión de política.
- Qué alternativas fueron consideradas.
- Qué principios constitucionales aplican.
- Registro en MSR BLOCKCHAIN para auditabilidad.

### 5.2 Explicaciones para incidentes (ARGUS + MNEMOS)
- Qué ocurrió, cuándo, en qué federación/dominio.
- Por qué ocurrió (causa raíz).
- Qué acciones se tomaron y por qué.
- Eventos relacionados en GEMET.

### 5.3 Explicaciones para usuarios finales (ORION/SOPHIA/KERNEL)
- Respuestas en lenguaje natural.
- Contexto territorial y cultural de Real del Monte.
- Traducción de métricas técnicas a impacto social.

---

## 6. Integración con YUN

| Componente YUN | Integración con Isabella |
|----------------|--------------------------|
| **Constitución YUN** | LUMEN la interpreta y aplica |
| **GEMET** | Todos los motores consumen/publican eventos |
| **CITEMESH** | TOPOLOGY lee topología de red |
| **SDMD-7** | SOPHIA, MNEMOS almacenan conocimiento |
| **MSR BLOCKCHAIN** | LUMEN registra decisiones, ARGUS registra incidentes |
| **ANUBIS** | ORquestador maestro que despliega motores |
| **HORUS** | KERNEL consume telemetría de HORUS |
| **OJO DE RA** | ARGUS aplica triple bloqueo semántico |
| **Triple Bloqueo Semántico** | Endpoints críticos de ISA-API lo aplican |
