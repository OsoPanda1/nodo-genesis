# TAMV OS × RDM Smart City — Entregable Unificado

Este documento consolida la arquitectura objetivo para continuar la unificación hacia `tamv-digital-nexus`.

## Dominios soberanos (boundary estrictos)

- `territorio.geo`: indexación espacial, rutas, geocercas y contexto de movilidad.
- `economia`: pagos, ledger, antifraude y conciliación contable.
- `identidad`: actor, sesión, permisos, firma de eventos y trazas.
- `experiencia`: portal, recomendaciones, contenido y canal ciudadano.
- `decisiones`: score territorial, modelos híbridos, explainability y feedback.

## System Brain Map (control explícito)

```text
[ EDGE KERNEL ]
       ↓
[ API GATEWAY ]
       ↓
[ TAMV OS KERNEL ]
       ↓
 ├── EVENT BUS
 ├── EVENT STORE
 ├── DECISION ENGINE (ISABELLA)
 ├── ECONOMY ENGINE
 ├── GEO ENGINE
       ↓
[ ORCHESTRATOR ]
       ↓
[ SERVICES ]
       ↓
[ FRONTEND / PORTAL ]
```

### Flujo canónico de control por eventos

1. Edge/Gateway recibe intención de usuario o sistema.
2. TAMV Kernel agrega metadatos de causalidad y persistencia inmutable.
3. Event Store versiona por stream (`stream_id`, `stream_version`) y audita con `event_hash`.
4. Event Bus distribuye hacia motores de decisión/economía/geo.
5. Orchestrator materializa efectos con idempotencia por `operation_id`.
6. Frontend consume estados proyectados, nunca lógica crítica.

## Integraciones implementadas en este repo

1. Event store inmutable y versionado por stream con verificación de integridad y replay.
2. Event bus con retry exponencial, idempotencia por `event_id` y circuit breaker.
3. Kernel ejecutable de forma independiente (`TamvOSKernel`) sin dependencia del frontend.
4. ISABELLA con trazabilidad, explainability y semilla determinista parcial por decisión.
5. Cattleya Pay con transacción SQL, idempotencia (`operation_id`) y ledger auditable.

## Hardening operacional requerido

- **Retries** en publicación de eventos y en proveedores externos (Stripe).
- **Circuit breaker** en event bus para evitar cascadas durante fallas.
- **Idempotencia** en eventos y pagos (`event_id`, `operation_id`).
- **Tolerancia a fallos** con degradación controlada en gateway/orchestrator.

## Telemetría profunda

- **Tracing distribuido** por `traceId`, `correlationId`, `causationId`.
- **Métricas por dominio**: decisión, geo, economía, experiencia.
- **Logs estructurados** con contexto de versión de reglas y hash de decisión.
