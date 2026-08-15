# ADR-0004 — YUN BE: Bastión de Emergencia y Continuidad del Nodo Cero

- **Estado:** Aceptado
- **Fecha:** 2026
- **Área:** Continuidad / Resiliencia / Licenciamiento

## Contexto

El Nodo Cero dependía de un razonamiento centralizado y de un proveedor único para ejecutar sus funciones constitucionales. Ante una caída del sistema primario, no existían un procedimiento formal de promoción, un journal de emergencia, mecanismos de *fencing* ni un protocolo de reconciliación verificable.

Como resultado, la recuperación era manual, expuesta a escenarios de *split-brain* y carente de evidencia auditable.

## Decisión

Se implementa **YUN BE**, el **Bastión de Emergencia**, como dominio nativo del Nodo Cero:

```text
lib/continuity/
app/api/continuity/*
```

YUN BE no reemplaza la plataforma primaria en tiempo real. Su función es preservar, durante una degradación, aislamiento o pérdida del primario:

- Funciones constitucionales mínimas
- Integridad y trazabilidad de eventos
- Identidad y continuidad de sesión
- Decisiones críticas autorizadas
- Intenciones pendientes de ejecución
- Evidencia verificable para recuperación
- Reconciliación ordenada entre isla y primario

## Principio rector

> **“Continuidad sin inventar estado.”**

Si YUN BE no puede demostrar autorización, integridad, versión de política, identidad, frescura de datos o resultado verificable, debe degradar o denegar.

YUN BE nunca debe:

- Simular normalidad
- Confirmar una operación sin recibo válido
- Transformar una intención registrada en una operación exitosa
- Resolver conflictos mediante `last-write-wins`
- Promoverse con una única señal de caída

## Invariantes constitucionales

1. Nunca pueden existir dos escritores activos para la misma función constitucional y época.
2. Todo escritor de una época anterior queda inválido después de una promoción.
3. Toda operación constitucional aceptada produce evidencia en el journal.
4. Toda intención termina en un resultado verificable o permanece en estado `UNKNOWN`.
5. La reconciliación no elimina, modifica ni sobrescribe evidencia histórica.
6. Un `200 OK` no constituye por sí solo prueba de ejecución exitosa.
7. Ningún conflicto se resuelve por orden temporal de escritura.
8. Ninguna promoción ocurre sin quorum, lease expirado, estado `READY` y token de fencing válido.
9. Los datos obsoletos, incompletos o criptográficamente inválidos no se presentan como estado actual.
10. Toda transición crítica queda autorizada, registrada y auditada.

## Máquina de estados

```text
DORMANT
  → READY
  → SUSPECT
  → ISOLATED
  → ACTIVE_ISLAND
  → RECOVERY_PENDING
  → RECONCILING
  → DORMANT
```

| Estado | Descripción |
|---|---|
| `DORMANT` | Bastión inactivo o sin capacidades suficientes |
| `READY` | Bastión validado y elegible para emergencia |
| `SUSPECT` | Señales anómalas presentes, sin evidencia suficiente para promover |
| `ISOLATED` | El primario está aislado o bajo procedimiento formal de aislamiento |
| `ACTIVE_ISLAND` | YUN BE opera capacidades constitucionales mínimas |
| `RECOVERY_PENDING` | El primario parece recuperado, pero permanece aislado |
| `RECONCILING` | Se valida evidencia, se reproducen intenciones y se resuelven conflictos |

La promoción a `ACTIVE_ISLAND` requiere simultáneamente:

- Dos fuentes de fallo independientes
- Lease del primario expirado
- Bastión en estado `READY`
- Token de fencing válido
- Aislamiento formal o evidencia equivalente de aislamiento del primario
- Política vigente y capacidades mínimas disponibles

## Componentes

### `state-machine.ts`

Gestiona las transiciones válidas del bastión:

```text
DORMANT → READY → SUSPECT → ISOLATED → ACTIVE_ISLAND → RECOVERY_PENDING → RECONCILING → DORMANT
```

Debe rechazar saltos de estado no autorizados y registrar toda transición crítica con:

```text
transition_id
from_state
to_state
actor
reason
fencing_epoch
policy_version
timestamp
signature
```

### `sentinel.ts`

Evalúa señales independientes dentro de una ventana máxima de 90 segundos:

```text
healthcheck
heartbeat
lease
dependency
operator
```

Una caída aislada no provoca promoción automática.

Cada señal debe incluir:

```text
signal_id
signal_type
source
observed_at
fresh_until
independence_group
signature_or_attestation
decision
```

Las señales deben clasificarse por grupos reales de independencia. Dos señales no son independientes si dependen de la misma red, región, proveedor, reloj, DNS, dependencia compartida o plano de control.

### `lease-manager.ts`

Administra el lease del primario y emite tokens de fencing:

```text
<epoch>.<instanceId>.<nonce>
```

Reglas:

- La `epoch` solo asciende mediante promociones válidas.
- Todo escritor rechaza tokens con una época menor.
- La época debe persistirse de forma atómica.
- El lease debe definir TTL, renovación y margen de seguridad.
- El reloj usado para el lease debe tener tolerancia de desfase documentada.
- Una respuesta ambigua no autoriza promoción ni escritura.
- La pérdida del lease debe degradar inmediatamente al escritor afectado.

### `journal.ts`

Implementa un journal `append-only` encadenado mediante SHA-256:

```text
previousHash + entryHash
```

Cada entrada debe incluir como mínimo:

```text
journal_id
sequence
event_id
trace_id
correlation_id
idempotency_key
fencing_epoch
actor
operation
policy_version
payload_digest
previous_hash
entry_hash
created_at
```

El journal debe detectar:

- Alteración de entradas
- Huecos de secuencia
- Duplicación de eventos
- Reproducción de operaciones
- Uso de épocas antiguas
- Cambios de política no declarados
- Timestamps inválidos
- Checkpoints no verificables

### `continuity-guard.ts`

Controla las operaciones permitidas durante el modo isla y aplica una política estricta de *fail-closed*.

Disposiciones válidas:

```text
ACCEPTED
QUEUED
DENIED
REPLAYED
CONFLICT
COMPENSATED
UNKNOWN
```

`UNKNOWN` es obligatorio cuando no existe evidencia suficiente para afirmar si una operación se ejecutó o no.

### `outbox.ts`

Registra intenciones idempotentes que deben reproducirse durante la recuperación.

Regla principal:

> **Intención registrada ≠ operación exitosa.**

Cada intención debe conservar:

```text
intention_id
idempotency_key
event_id
trace_id
fencing_epoch
operation
payload_digest
policy_version
created_at
disposition
receipt
attempts
last_error
```

Una intención no se elimina tras ser enviada. Solo puede marcarse como aplicada después de validar un recibo compatible con su identidad, payload, política y época.

### `recovery-orchestrator.ts`

Orquesta la recuperación en ocho pasos obligatorios:

1. Confirmar la recuperación del primario y de sus dependencias.
2. Mantener aislado el primario mientras se valida identidad, lease y epoch.
3. Congelar el journal de isla.
4. Reproducir intenciones por `idempotencyKey`, `event_id`, `trace_id` y `fencing_epoch`.
5. Validar recibos devueltos por el primario.
6. Clasificar y resolver conflictos sin `last-write-wins`.
7. Conciliar evidencia entre journal, outbox, primario y bastión.
8. Cerrar únicamente mediante aprobación dual y checkpoint final firmado.

La reconciliación nunca concluye automáticamente tras un `200 OK`.

## Estados de reconciliación

| Estado | Descripción |
|---|---|
| `PENDING` | Intención registrada pero no reproducida |
| `APPLIED` | Operación aplicada y confirmada mediante recibo válido |
| `REJECTED` | Rechazada por política, autorización o integridad |
| `CONFLICT` | Existe divergencia que requiere resolución explícita |
| `COMPENSATED` | Se aplicó y verificó una compensación |
| `UNKNOWN` | No existe evidencia suficiente para determinar el resultado |

Un estado `UNKNOWN` no debe convertirse automáticamente en `APPLIED` ni `REJECTED`.

## Superficie API

| Ruta | Método | Descripción |
|---|---:|---|
| `/api/continuity/status` | `GET` | Consulta modo, epoch, capacidades, sentinel, lease y estado del journal |
| `/api/continuity/journal` | `GET` | Consulta el journal y verifica integridad |
| `/api/continuity/journal` | `POST` | Registra una entrada inmutable |
| `/api/continuity/activate` | `POST` | Solicita promoción a `ACTIVE_ISLAND` |
| `/api/continuity/isolate-primary` | `POST` | Emite orden firmada de aislamiento del primario |
| `/api/continuity/reconcile` | `POST` | Ejecuta reconciliación de ocho pasos |
| `/api/intentions` | `POST` | Registra intenciones según el modo operativo |

Todas las rutas deben usar validación de contrato, autenticación, autorización, trazabilidad, rate limiting y política *fail-closed*.

## Persistencia y evidencia

La persistencia en memoria es válida únicamente para desarrollo o demostración. No constituye una garantía de continuidad en producción.

Para producción se requiere:

- Journal durable
- Outbox durable
- Almacenamiento WORM
- Replicación fuera del proceso
- Backups inmutables
- Pruebas documentadas de restauración
- Checkpoints firmados con claves externas al nodo
- Rotación y revocación de claves
- Retención legal y operativa
- Exportación verificable de evidencia

Cada checkpoint debe incluir:

```text
journal_id
first_sequence
last_sequence
last_entry_hash
fencing_epoch
policy_version
created_at
key_id
signature
```

## Observabilidad

El Monitor General del Nodo Cero consume:

```text
GET /api/continuity/status
```

Este endpoint funciona como health check de la cadena de continuidad y debe exponer:

- Estado actual
- Última transición
- Epoch vigente
- Estado del lease
- Frescura de señales
- Resultado de quorum
- Estado de aislamiento
- Capacidad del journal
- Integridad del último checkpoint
- Intenciones pendientes
- Operaciones `UNKNOWN`
- Conflictos abiertos
- Última aprobación dual
- Versión de política
- Último error constitucional

## Supuestos de fallo

YUN BE debe ser probado frente a:

- Caída total del primario
- Partición de red
- Split-brain
- Reinicio del bastión
- Lease expirado
- Relojes desincronizados
- Corrupción o truncamiento del journal
- Duplicación de eventos
- Pérdida de respuesta tras escritura
- Reproducción durante cambio de época
- Recuperación parcial del primario
- Respuestas contradictorias
- Caída de almacenamiento durable
- Compromiso o revocación de una clave
- Operador no disponible
- Dependencia externa caída

## Objetivos operativos

La implementación debe declarar por dominio:

- RTO
- RPO
- TTL máximo de datos aceptables
- Capacidad máxima del journal en modo isla
- Número máximo de reintentos
- Tiempo máximo permitido en `ACTIVE_ISLAND`
- Operaciones prohibidas durante aislamiento
- Criterios de degradación total

## Consecuencias

### Positivas

- Reduce el riesgo de *split-brain* mediante quorum, lease y fencing.
- Conserva evidencia auditable durante incidentes.
- Separa funciones constitucionales de funciones de tiempo real.
- Evita asumir éxito por una respuesta de red.
- Permite replay idempotente de intenciones.
- Expone conflictos e incertidumbre de forma explícita.
- Evita reconciliaciones destructivas.

### Negativas

- El modo isla ofrece capacidad limitada.
- La reconciliación requiere intervención humana y aprobación dual.
- WORM, firma externa y gestión de claves aumentan complejidad.
- La política *fail-closed* puede denegar operaciones legítimas sin evidencia suficiente.
- Los estados `UNKNOWN` pueden requerir investigación manual.
- La coordinación de lease, epoch y fencing exige pruebas distribuidas especializadas.

## Criterios de aceptación

YUN BE se considera apto para producción solo cuando:

- El journal sea durable, verificable y exportable.
- El outbox sea durable e idempotente.
- Los checkpoints estén firmados fuera del nodo.
- La epoch y el lease se persistan atómicamente.
- Todo escritor crítico valide fencing.
- El quorum tenga grupos de independencia documentados.
- El aislamiento del primario sea verificable.
- `UNKNOWN` funcione de extremo a extremo.
- La reconciliación no use `last-write-wins`.
- La aprobación dual quede registrada y firmada.
- El monitor consuma métricas de integridad y frescura.
- Existan pruebas de partición, reinicio, replay, duplicación y recuperación.
- Exista una prueba documentada de restauración.
- Exista un runbook de emergencia validado por un operador distinto al autor.
- Se complete la auditoría de licenciamiento, claves y permisos.

## Licenciamiento

YUN BE forma parte del Nodo Cero y queda sujeto al régimen de propiedad, identidad, arquitectura YUN, licencia y restricciones de uso del proyecto.

El uso comercial, despliegue público masivo, redistribución o explotación de la arquitectura requiere autorización expresa del titular correspondiente.

## Resolución

Se acepta YUN BE como dominio constitucional de continuidad del Nodo Cero.

La implementación adopta una política *fail-closed*, promoción condicionada por quorum y lease, fencing por epoch, journal encadenado, outbox idempotente, reconciliación no destructiva y cierre con aprobación dual.

La persistencia durable, checkpoints externos, quorum formal, validación de aislamiento y soporte de estado `UNKNOWN` son requisitos obligatorios para producción.
