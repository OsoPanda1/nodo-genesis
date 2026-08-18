# ADR-0003 — Monitor General Soberano y Observabilidad Operativa del Nodo Cero

- **Estado:** Aceptado
- **Fecha:** 2026
- **Área:** Observabilidad, Resiliencia y Gobernanza Operativa
- **Propietario arquitectónico:** Nodo Cero / Heptafederación YUN
- **Decisión vinculante:** Sí
- **Implementación canónica:** `lib/monitoring/`
- **Superficie de lectura:** `app/api/monitor/*`
- **Interdependencias:** ADR-0001 — Núcleo Soberano ISA; ADR-0002 — Zero Trust Heptafederado
- **Clasificación:** Plano soberano de evidencia, detección, trazabilidad y continuidad operativa

---

## 1. Declaración de principio

El Nodo Cero no podrá operar a ciegas.

Toda capacidad crítica deberá emitir evidencia operacional suficiente para conocer, verificar y auditar su salud, disponibilidad, latencia, carga, degradación, estado de resiliencia y eventos relevantes, sin exponer secretos, datos personales, contenido sensible ni conocimiento territorial protegido.

La observabilidad no es una consola decorativa, una función secundaria ni un mecanismo informal de depuración. Es una capacidad institucional de gobierno, detección temprana, respuesta ante incidentes, continuidad operativa y rendición de cuentas.

> **Lo que no puede observarse, correlacionarse y auditarse no puede gobernarse de forma segura.**

---

## 2. Contexto

El Nodo Cero integra capacidades territoriales, cognitivas, federadas, operativas y de seguridad: Isabella, gemelos territoriales, City IOC, activos EAM/APM, Grid, Marketplace, Gamification, Archive, CITEMESH, GEMET, Continuity, IDENTITY YUN y YUN QSC.

La ausencia de un plano unificado de observabilidad provocaba una operación fragmentada: no existían métricas centralizadas, trazas jerárquicas, correlación consistente de eventos, health checks homogéneos ni alertas evaluables sobre el estado vivo del sistema.

Esta condición generaba riesgos estructurales:

- Operación reactiva basada en síntomas aislados, logs dispersos o reportes manuales.
- Imposibilidad de correlacionar una petición con sus validaciones Zero Trust, eventos de dominio, cambios de resiliencia y resultado final.
- Falta de evidencia para determinar disponibilidad, latencia, saturación, tasa de fallos y degradación por dominio.
- Detección tardía de incidentes o dependencia excesiva de la percepción del usuario.
- Incapacidad de distinguir entre un servicio saludable, degradado, no saludable o desconocido.
- Riesgo de fuga de secretos, PII o conocimiento territorial si el logging se realiza sin sanitización.
- Dependencia potencial de terceros como única fuente de evidencia operacional.
- Confusión entre el estado efímero de una instancia y el estado agregado de un despliegue distribuido.

Por tanto, se establece un plano de observabilidad soberano, estructurado, sanitizado y compatible con Zero Trust, continuidad operativa e identidad soberana YUN.

---

## 3. Decisión

Se aprueba el **Monitor General del Nodo Cero** como subsistema canónico de observabilidad, centralizado en:

```text
lib/monitoring/
```

La implementación define un singleton de proceso:

```ts
SystemMonitor;
monitor;
```

El Monitor General integra los siguientes subsistemas en memoria:

```text
MetricsRegistry;
Tracer;
EventCorrelator;
AlertEngine;
```

La arquitectura inicial en memoria permite observabilidad inmediata y local del proceso. No constituye por sí misma un repositorio histórico, distribuido ni durable.

La exposición HTTP de lectura queda limitada a:

```text
GET /api/monitor/health
GET /api/monitor/events
GET /api/monitor/state
```

Todas las rutas de monitorización deberán atravesar:

```text
assertServerOnly();
@/app/api/_shared/route-guard;
cadena Zero Trust Heptafederada;
IDENTITY YUN;
scope monitor:read o privilegio administrativo equivalente;
```

El `route-guard` único aplica la cadena Zero Trust a las rutas API del Nodo Cero y evita que cada dominio replique criterios de seguridad divergentes. [page:1]

---

## 4. Invariantes constitucionales

### 4.1 Observabilidad por diseño

Toda capacidad crítica deberá incorporar observabilidad desde su diseño y no como actividad posterior al incidente.

Ningún dominio se considerará operacionalmente completo si carece de:

- Health check.
- Métricas mínimas de volumen, error, latencia y estado.
- Correlación de eventos.
- Trazabilidad para operaciones críticas.
- Señales de degradación o resiliencia.
- Política de sanitización de datos observables.

### 4.2 Soberanía de evidencia

El Nodo Cero deberá conservar una fuente de evidencia operacional bajo su propio control.

Se permite exportar, replicar o integrar señales con servicios externos aprobados, pero ninguna plataforma externa podrá convertirse en el único lugar de almacenamiento, correlación, alerta o auditoría de evidencia crítica.

### 4.3 Privacidad por defecto

Las señales observables deberán cumplir minimización de datos y sanitización obligatoria.

Queda prohibido registrar en métricas, spans, eventos, snapshots, alertas o respuestas del monitor:

- API keys, tokens, secretos, contraseñas o encabezados de autenticación.
- Firmas completas, claves privadas o material criptográfico.
- PII no anonimizada.
- Cuerpos completos de solicitudes o respuestas.
- Contexto de razonamiento interno de Isabella.
- Datos territoriales restringidos.
- Identificadores de sesión reutilizables.
- Detalles internos que faciliten evasión de controles de seguridad.

### 4.4 Correlación obligatoria

Toda solicitud, evento de dominio, operación crítica, decisión Zero Trust, transición de circuit breaker y comunicación federada deberá propagar o generar:

```ts
traceId;
correlationId;
```

Cuando una petición de bajo riesgo no presente estos identificadores, el sistema deberá asignarlos antes de emitir métricas, spans o eventos correlacionables.

### 4.5 Degradación segura

La indisponibilidad del Monitor General no deberá detener funciones territoriales esenciales, salvo cuando una política específica requiera evidencia previa para ejecutar una acción irreversible, administrativa, económica o de continuidad.

Ante degradación del monitor, los dominios deberán:

- Mantener la operación principal cuando sea seguro hacerlo.
- Conservar controles Zero Trust, integridad, autorización y egress.
- Evitar bloquear rutas públicas no críticas por telemetría no disponible.
- Emitir evidencia local mínima cuando sea posible.
- Denegar o degradar acciones que requieran auditoría obligatoria y no verificable.

### 4.6 Separación de responsabilidades

El Monitor General observa y reporta; no gobierna directamente los dominios.

Las rutas `/api/monitor/*` son estrictamente de lectura, diagnóstico y evidencia. No deberán emitir credenciales, modificar recursos, activar infraestructura, abrir circuit breakers, cambiar políticas, iniciar egress ni ejecutar comandos administrativos.

---

## 5. Arquitectura funcional

```text
Dominios del Nodo Cero
  → health checks, métricas, spans y eventos
  → lib/monitoring/
      → MetricsRegistry
      → Tracer
      → EventCorrelator
      → AlertEngine
  → SystemMonitor / monitor
  → API de lectura protegida
  → UI institucional /monitor
  → Persistencia soberana y exportación autorizada, cuando aplique
```

Los dominios deberán emitir señales mediante contratos comunes, sin acoplar su lógica de negocio a una interfaz concreta, proveedor de observabilidad externo o destino de almacenamiento específico.

---

## 6. MetricsRegistry

`MetricsRegistry` administra las métricas de proceso, seguridad, resiliencia y dominio.

Deberá soportar:

- **Counters:** valores acumulativos, como solicitudes, errores, rechazos, reintentos, denegaciones Zero Trust y transiciones de estado.
- **Gauges:** valores actuales, como sesiones activas, estado de circuit breaker, salud de dominio, capacidad disponible o profundidad de cola.
- **Histograms:** distribuciones de latencia, duración, tamaño, recuperación, procesamiento y tiempo de respuesta.
- **Tags:** dimensiones acotadas y revisadas.
- **Snapshots:** lecturas coherentes mediante `snapshot()`.

Las etiquetas deberán tener cardinalidad controlada. Queda prohibido utilizarlas para registrar:

- IDs únicos de usuario o sesión.
- Tokens, hashes sensibles o secretos.
- Direcciones IP completas.
- URLs arbitrarias enviadas por clientes.
- Mensajes completos de error.
- Payloads o valores libres de tamaño ilimitado.

Ejemplo de instrumentación válida:

```ts
monitor.metrics.increment("http_requests_total", {
  route: "/api/twins/query",
  method: "POST",
  outcome: "success",
});

monitor.metrics.observe("http_request_duration_ms", 128, {
  route: "/api/twins/query",
  method: "POST",
});

monitor.metrics.gauge("circuit_breaker_state", 1, {
  domain: "isabella",
  state: "open",
});
```

---

## 7. Tracer

`Tracer` registra spans estructurados para reconstruir la ejecución de solicitudes y operaciones críticas.

Cada span deberá preservar relación padre-hijo, tiempo de inicio, tiempo de finalización, duración, estado y atributos sanitizados.

```ts
type TraceSpan = {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  name: string;
  startedAt: string;
  endedAt?: string;
  durationMs?: number;
  status: "ok" | "error" | "cancelled" | "degraded";
  attributes?: Record<string, string | number | boolean>;
};
```

Los spans deberán representar, cuando aplique:

- Entrada y salida de solicitud.
- Evaluación de Zero Trust.
- Validación de contratos.
- Ejecución de lógica de dominio.
- Acceso a persistencia.
- Firma, verificación o cifrado.
- Operaciones ISA.
- Comunicación federada autorizada.
- Activación de fallback.
- Cambios de estado de resiliencia.

Los atributos deberán clasificarse y sanitizarse antes de persistirse. Los errores deberán expresarse mediante códigos y categorías, evitando almacenar indiscriminadamente stack traces, cuerpos de solicitud o secretos.

---

## 8. EventCorrelator

`EventCorrelator` conserva eventos estructurados vinculados por `correlationId` y, cuando corresponda, `traceId`.

```ts
type MonitoringEvent = {
  id: string;
  type: string;
  source: string;
  severity: "debug" | "info" | "warning" | "error" | "critical";
  occurredAt: string;
  correlationId?: string;
  traceId?: string;
  payload: Record<string, unknown>;
};
```

Los eventos deberán cubrir, como mínimo:

- Inicio y finalización de solicitudes.
- Denegaciones Zero Trust.
- Fallos o degradaciones de dependencias.
- Cambios de estado de circuit breakers.
- Activación de fallback.
- Eventos de continuidad.
- Operaciones federadas permitidas o bloqueadas.
- Incidentes de seguridad.
- Alertas y recuperaciones de salud.
- Cambios relevantes en dominios críticos.

Todo `payload` deberá ser sanitizado antes de ingresarlo al correlador. La correlación no autoriza retención ilimitada ni exposición de contenido sensible.

---

## 9. AlertEngine

`AlertEngine` evalúa reglas sobre métricas, estados y health checks en tiempo operativo.

Deberá soportar los operadores:

```text
gt
ge
lt
le
eq
```

Cada regla deberá declarar:

- Nombre único.
- Métrica, señal o health check observado.
- Operador y umbral.
- Ventana temporal, si corresponde.
- Severidad.
- Dominio responsable.
- Política de deduplicación.
- Condición de recuperación.
- Procedimiento de escalamiento autorizado.

Las severidades institucionales son:

| Severidad | Significado | Tratamiento mínimo |
|---|---|---|
| `info` | Señal informativa | Registrar y visualizar |
| `warning` | Degradación temprana | Correlacionar y vigilar |
| `error` | Fallo relevante | Crear incidente operativo |
| `critical` | Riesgo de continuidad, seguridad o integridad | Escalar y activar runbook |

Ninguna alerta podrá transmitir información sensible fuera del perímetro soberano. Cualquier integración de notificación deberá operar con datos mínimos, sanitizados y autorizados por política de egress.

---

## 10. Health checks

Los dominios deberán registrar verificaciones de salud mediante:

```ts
monitor.registerHealth(name, fn);
```

Las funciones podrán ser síncronas o asíncronas, pero deberán ser:

- Repetibles y libres de efectos mutativos.
- Acotadas mediante timeout.
- Proporcionales a la criticidad del dominio.
- Sanitizadas en sus detalles y mensajes.
- Capaces de distinguir fallo, degradación y desconocimiento.

Los dominios iniciales sujetos a verificación incluyen:

```text
twins
city-ioc
eam-assets
grid
marketplace
isabella
gamification
```

El catálogo deberá ampliarse progresivamente para incluir identidad, CITEMESH, GEMET, continuidad, archivo y YUN QSC.

```ts
type HealthStatus = {
  name: string;
  status: "healthy" | "degraded" | "unhealthy" | "unknown";
  checkedAt: string;
  latencyMs?: number;
  reason?: string;
};
```

La indisponibilidad de una dependencia externa deberá reflejarse como `degraded` cuando el dominio conserve una ruta soberana equivalente. El estado `unhealthy` se reservará para capacidades que no puedan cumplir sus garantías declaradas.

---

## 11. Resiliencia integrada

El módulo:

```text
lib/resilience/
```

deberá emitir métricas, spans y eventos hacia el Monitor General ante cualquier transición relevante.

Esto incluye:

- Apertura, cierre y estado intermedio de circuit breakers.
- Reintentos controlados.
- Activación de fallbacks.
- Cambio a modo degradado.
- Saturación de recursos.
- Recuperación de dependencias.
- Activación de mecanismos de continuidad.
- Reconciliación entre primario y réplica.
- Aislamiento de nodo o servicio.

Ejemplo conceptual:

```ts
monitor.metrics.gauge("circuit_breaker_state", 1, {
  domain: "gemet",
  state: "open",
});

monitor.events.emit({
  type: "resilience.circuit_breaker.opened",
  source: "gemet",
  severity: "warning",
  correlationId,
  payload: {
    reason: "dependency_failure_threshold_reached",
  },
});
```

La telemetría de resiliencia deberá reflejar el estado real. Queda prohibido ocultar un fallback activo o un modo degradado detrás de una respuesta aparentemente normal sin evidencia operacional.

---

## 12. Superficie HTTP

La superficie de lectura queda definida de la siguiente forma:

| Ruta | Propósito | Acceso mínimo |
|---|---|---|
| `GET /api/monitor/health` | Estado de salud por dominio | `monitor:read` |
| `GET /api/monitor/events` | Eventos correlacionados y sanitizados | `monitor:read` |
| `GET /api/monitor/state` | Snapshot consolidado del nodo | `monitor:read` |

Todas las rutas deberán:

- Aplicar `assertServerOnly()` como control de contexto.
- Atravesar el `route-guard` único.
- Cumplir ADR-0002 — Zero Trust en siete capas.
- Requerir identidad soberana YUN y el scope `monitor:read`, o privilegio administrativo explícito.
- Aplicar rate limits reforzados.
- Denegar acceso ante credenciales ausentes, inválidas, revocadas, expiradas o fuera de scope.
- No incluir secretos, PII, payloads, trazas sensibles ni detalles explotables de infraestructura.
- Emitir eventos sanitizados cuando exista consulta administrativa relevante.

`assertServerOnly()` es un control complementario de ejecución. No sustituye autenticación, autorización, scopes, Zero Trust ni política de egress.

---

## 13. Política de demostración

Los entornos de demostración podrán exponer una vista reducida del Monitor General únicamente si cumplen simultáneamente las siguientes condiciones:

- El entorno está identificado explícitamente como no productivo.
- La activación de demostración es intencional, verificable y registrada.
- No se exponen eventos detallados, trazas, secretos, credenciales, direcciones internas, topología sensible ni datos personales.
- Los health checks se reducen a estados agregados.
- La interfaz no permite modificación, administración ni ejecución de acciones.
- La exposición se limita por origen, rate limit y superficie mínima necesaria.

La ausencia de `MONITOR_API_KEY` no deberá habilitar acceso automáticamente.

En producción, la ausencia de credenciales válidas, configuración de identidad o scope `monitor:read` deberá producir denegación inmediata. No se admite una política *fail-open* en producción.

---

## 14. Interfaz institucional

La interfaz de observabilidad se publica en:

```text
/monitor
```

La UI deberá presentar información operacional priorizada y no deberá convertirse en fuente de verdad, mecanismo de autorización ni motor de decisiones.

Se aprueba la composición:

```text
LiveSystems: carga prioritaria
SystemMonitor: carga diferida mediante lazy loading y Suspense
```

La interfaz deberá mostrar, conforme a los permisos del actor:

- Salud agregada por dominio.
- Alertas activas y severidad.
- Tendencias de latencia y error.
- Eventos correlacionados sanitizados.
- Estado de circuit breakers y degradación.
- Señales de continuidad y conectividad federada.
- Indicadores de validación Zero Trust.
- Estado de disponibilidad y persistencia del monitor.

---

## 15. Persistencia y retención

El almacenamiento inicial en memoria se reconoce como mecanismo de diagnóstico local de proceso y no como evidencia histórica suficiente.

Las señales en memoria:

- Se pierden al reiniciar el proceso.
- No agregan automáticamente el estado de múltiples instancias.
- No sustituyen una bitácora inmutable de auditoría.
- No deben ser la única fuente de evidencia para incidentes críticos.
- Requieren evolución hacia una estrategia durable para operación distribuida.

Para producción multiinstancia, el Nodo Cero deberá persistir de forma soberana:

- Métricas agregadas.
- Eventos críticos.
- Alertas relevantes.
- Estados de salud.
- Trazas resumidas o muestras trazables.
- Transiciones de resiliencia y continuidad.

Los destinos permitidos podrán incluir:

```text
Postgres soberano
Redis institucional
Pushgateway autocustodiado
Almacenamiento institucional de series temporales
Journal de continuidad para eventos críticos
```

La persistencia deberá cumplir:

- Retención explícita por tipo de señal.
- Cifrado en tránsito y en reposo.
- Acceso controlado por scopes.
- Auditoría de lectura y exportación.
- Respaldo y recuperación.
- Anonimización, agregación o borrado conforme a política.
- Prohibición de almacenar secretos o payloads sensibles.

La exportación a servicios externos será opcional, estará sujeta a L7 de Zero Trust y no podrá ser requisito para la operación del Monitor General.

---

## 16. Obligaciones de implementación

Todo dominio nuevo o modificación crítica deberá:

1. Registrar al menos un health check proporcional a su responsabilidad.
2. Emitir métricas de volumen, error, latencia y estado cuando corresponda.
3. Propagar o generar `traceId` y `correlationId`.
4. Crear spans para operaciones críticas, costosas, sensibles o federadas.
5. Emitir eventos estructurados ante cambios relevantes.
6. Sanitizar toda señal antes de emitirla.
7. Declarar alertas para fallos o degradaciones previsibles.
8. Informar explícitamente cuando una respuesta se entregue en modo degradado.
9. No depender de un proveedor externo como única fuente de observabilidad.
10. Incluir pruebas de monitorización, sanitización y degradación segura.

---

## 17. Controles verificables

El cumplimiento de este ADR deberá demostrarse mediante pruebas automatizadas y auditorías periódicas.

Como mínimo, deberá verificarse que:

- `SystemMonitor` integra métricas, spans, eventos, alertas y health checks.
- `snapshot()` devuelve una vista coherente y sanitizada.
- Los counters, gauges e histogramas aceptan únicamente tags permitidos.
- Los spans conservan jerarquía padre-hijo, duración y estado.
- Los eventos se correlacionan mediante `correlationId` y `traceId`.
- `AlertEngine` evalúa correctamente `gt`, `ge`, `lt`, `le` y `eq`.
- Los health checks admiten funciones síncronas y asíncronas.
- Las transiciones de circuit breaker generan métricas y eventos.
- `/api/monitor/*` atraviesa el `route-guard` único.
- Las rutas de monitor requieren `monitor:read` en producción.
- La ausencia de `MONITOR_API_KEY` no habilita acceso productivo.
- Ninguna señal incluye secretos, tokens, firmas completas, PII o payloads sensibles.
- La caída del monitor no elimina Zero Trust, autorización ni protecciones de dominio.
- Las operaciones que requieren auditoría obligatoria fallan o se degradan de forma segura si no puede emitirse evidencia.
- El estado efímero en memoria se declara explícitamente cuando no existe persistencia durable.

---

## 18. Consecuencias

### Consecuencias positivas

- **Visibilidad operativa unificada:** los dominios territoriales, cognitivos, federados y de seguridad pueden observarse desde un plano común.
- **Correlación transversal:** solicitudes, eventos, alertas y decisiones de resiliencia se vinculan mediante `traceId` y `correlationId`.
- **Detección temprana:** métricas, health checks y alertas permiten identificar degradación antes de una interrupción sistémica.
- **Auditoría estructurada:** incidentes, fallos, denegaciones y cambios de continuidad dejan evidencia verificable.
- **Resiliencia visible:** circuit breakers, fallbacks y modos degradados dejan de ser comportamientos ocultos.
- **Privacidad operacional:** la sanitización reduce el riesgo de que logs o telemetría expongan información sensible.
- **Soberanía de evidencia:** el Nodo Cero conserva control sobre su evidencia operacional y no depende exclusivamente de terceros.
- **Evolución distribuida:** el modelo permite avanzar de memoria local a persistencia soberana sin romper contratos de dominio.

### Costos aceptados

- Cada dominio deberá instrumentar health checks, métricas, eventos y trazas.
- La sanitización y la gestión de cardinalidad requieren disciplina de diseño.
- La persistencia histórica requiere infraestructura, retención, respaldo y operación.
- Las alertas deben revisarse para evitar ruido, fatiga o falsos positivos.
- Los despliegues multiinstancia requieren agregación durable y consistente.
- Los equipos deberán tratar la telemetría como un activo protegido y no como texto libre de depuración.

Estos costos se aceptan porque una plataforma territorial soberana no puede garantizar continuidad, seguridad ni gobernanza si desconoce su propio estado.

---

## 19. Prohibiciones inquebrantables

Queda prohibido:

- Operar una capacidad crítica sin health check, métricas y trazabilidad mínima.
- Exponer `/api/monitor/*` públicamente en producción.
- Habilitar acceso productivo por ausencia de `MONITOR_API_KEY`.
- Registrar secretos, API keys, tokens, PII, firmas completas o payloads sensibles.
- Usar identificadores ilimitados o datos proporcionados por clientes como tags.
- Permitir que el Monitor General modifique recursos de dominio mediante rutas de lectura.
- Depender de un proveedor externo como único repositorio de evidencia.
- Ocultar estados degradados, circuit breakers abiertos o fallbacks activos.
- Bloquear operaciones esenciales por la caída de telemetría no crítica.
- Emitir alertas con contenido que facilite reconocimiento, evasión o exfiltración.
- Considerar el estado de una instancia en memoria como representación completa de un sistema distribuido.
- Usar el Monitor General como sustituto de auditoría inmutable, Zero Trust o continuidad del negocio.

---

## 20. Criterio de aceptación

Este ADR se considera cumplido cuando:

1. El Monitor General consolida métricas, spans, eventos, alertas y health checks.
2. Los dominios críticos reportan estado verificable y sanitizado.
3. Las operaciones pueden correlacionarse mediante `traceId` y `correlationId`.
4. Los circuit breakers y mecanismos de resiliencia emiten evidencia observable.
5. Las rutas `/api/monitor/*` aplican Zero Trust e identidad soberana en producción.
6. Las respuestas del monitor no exponen secretos, PII ni detalles explotables.
7. El sistema diferencia explícitamente entre `healthy`, `degraded`, `unhealthy` y `unknown`.
8. La indisponibilidad del monitor produce degradación segura y no elimina protecciones fundamentales.
9. El estado en memoria se reconoce como efímero y se establece una ruta de evolución a persistencia soberana.
10. Las pruebas validan métricas, trazas, correlación, alertas, seguridad, sanitización y degradación.

---

## 21. Mandato final

El Monitor General es el sistema nervioso operacional del Nodo Cero.

No sustituye la seguridad, la continuidad, la gobernanza ni la inteligencia territorial. Las vuelve visibles, correlacionables, verificables y auditables.

Su misión es garantizar que el Nodo Cero conozca su estado antes de que una degradación se convierta en un incidente, y que conserve evidencia suficiente para actuar con rigor institucional.

> **Un sistema soberano no solo debe decidir y resistir: debe poder demostrar, en todo momento, cómo está operando, qué está fallando y bajo qué condiciones continúa.**
