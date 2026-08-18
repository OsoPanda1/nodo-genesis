# RDM Smart City OS + TAMV Civilizational Core

Plataforma soberana para operacion territorial de **Real del Monte, Hidalgo (Mexico)**, ahora fusionada con el **Civilizational Core** de TAMV Online.

## Fusion de Repositorios

Este proyecto integra:
- **rdm-smart-city-os**: Sistema operativo territorial con experiencia ciudadana/turistica
- **civilizational-core**: Infraestructura civilizatoria digital soberana TAMV

Combina:
- Experiencia ciudadana/turistica (portal frontend)
- Nucleo de eventos (TAMV OS Kernel)
- Motor de decisiones (ISABELLA AI)
- Economia transaccional (Cattleya Pay + Protocolo Fenix)
- Atlas de Federacion (monitoreo de nodos)
- Guardian Console (HITL - Human in the Loop)
- DevHub (API Gateway DM-X7)

Todo bajo un modelo **event-driven** con trazabilidad y arquitectura federada de 7 capas.

---

## Arquitectura Federada de 7 Capas (TAMV)

```
+-------------------------------------------------------------+
|  CAPA 7 - Metacivilizacion y Legado                         |
+-------------------------------------------------------------+
|  CAPA 6 - Gobernanza, Legalidad y Compliance                |
+-------------------------------------------------------------+
|  CAPA 5 - Economia Digital Etica (TAMV-T & FRI)             |
+-------------------------------------------------------------+
|  CAPA 4 - Inteligencia Artificial Civilizacional (Isabella) |
+-------------------------------------------------------------+
|  CAPA 3 - Arquitectura de Sistemas Distribuidos             |
+-------------------------------------------------------------+
|  CAPA 2 - Experiencia XR & Arquitectura Sensorial           |
+-------------------------------------------------------------+
|  CAPA 1 - Identidad Digital Soberana (ID-NVIDA)             |
+-------------------------------------------------------------+
|  CAPA 0 - Infraestructura Fisica y Soberania Tecnica        |
+-------------------------------------------------------------+
```

---

## 1) Que es este proyecto?

`rdm-smart-city-os` es un sistema operativo territorial digital que unifica contenido, decisiones y operaciones para un destino inteligente.

Su objetivo es pasar de una app informativa a un **sistema operable en producción** con:
- event sourcing real,
- decisiones explicables,
- orquestación desacoplada de frontend,
- y control económico auditable.

---

## 2) ¿Qué hace?

### Capacidades principales

1. **Experiencia digital del destino**
   - Portal con rutas de turismo, cultura, gastronomía, comunidad y dashboard.
2. **Kernel territorial (TAMV OS)**
   - Ingesta y emisión de eventos cívicos con persistencia y versionado por stream.
3. **ISABELLA Decision Engine**
   - Evalúa estados territoriales (geo + comportamiento) y emite decisiones de retención/experiencia.
4. **Economía (Cattleya Pay)**
   - Manejo de sesiones de pago con ledger e idempotencia.
5. **Observabilidad**
   - Métricas y endpoints internos para seguimiento técnico/operativo.

---

## 3) ¿Cómo lo hace? (Arquitectura operativa)

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
 ├── ECONOMY ENGINE (CATTLEYA PAY)
 ├── GEO ENGINE
       ↓
[ ORCHESTRATOR ]
       ↓
[ SERVICES ]
       ↓
[ FRONTEND / PORTAL ]
```

### Principios implementados

- **Inmutabilidad**: los eventos se agregan (append-only).
- **Versionado por stream**: control de concurrencia optimista (`expectedVersion`).
- **Auditabilidad**: hash por evento + metadata de causalidad.
- **Reproducibilidad**: replay de streams para reconstruir estado.
- **No caja negra en IA**: explainability + semilla determinista parcial.
- **Resiliencia operacional**: retries, circuit breaker, idempotencia.

---

## 4) Funciones/módulos integrados actualmente

## Núcleo de eventos (`core/tamv-os-kernel`)
- `event-store.ts`
  - esquema de persistencia de eventos con `stream_id`, `stream_version`, `event_hash`, `metadata`, `recorded_at`.
  - APIs: `appendEvent`, `loadStream`, `verifyStreamIntegrity`, `replayStream`.
- `event-bus.ts`
  - publicación a Kafka con retry exponencial y circuit breaker.
- `kernel.ts`
  - runtime `TamvOSKernel` independiente de frontend para registrar servicios y orquestar eventos.

## Decisiones (ISABELLA)
- `src/orchestrator/experience.orchestrator.ts`
  - scoring territorial con contexto geoespacial.
  - emisión de decisiones con `traceId`.
  - explainability estructurada (`ruleVersion`, factores, notas) + seed determinista.
- `src/orchestrator/decision.store.ts`
  - ledger de decisiones versionado con hash de auditoría.
  - consultas de trazabilidad por `traceId`.

## Economía (Cattleya Pay)
- `economy/cattleya-pay/src/payment.service.ts`
  - ledger SQL transaccional (`cattleya_payment_ledger`).
  - idempotencia por `operationId`.
  - retry de llamadas a Stripe y registro de fallos.

## API / Frontend
- Portal React + Vite + TypeScript.
- Rutas internas tipo API en `src/app/api/*` (métricas, stream, feedback).
- Integración Supabase (cliente y edge functions).

### Tipos de eventos canónicos

## 5) Estado actual de avance a producción (estimado)

> Evaluación técnica interna a fecha **2026-03-24** (estimado de madurez, no auditoría externa certificada).

| Dominio | Estado | Avance estimado |
|---|---|---:|
| Frontend/UX portal | Funcional y amplio | 85% |
| Event Store/Event Bus | Endurecido con base sólida | 80% |
| Isabella Decision Engine | Explainable + trazable | 78% |
| Economy Engine (pagos) | Transaccional + idempotente | 72% |
| Observabilidad | Métricas base + trazas | 68% |
| Seguridad/compliance | Parcial, faltan controles avanzados | 55% |
| Operación cloud/k8s | Base de despliegue presente | 70% |

### Índice global de readiness

**73% listo para producción controlada** (piloto real con SLOs y guardrails),
**no 100% listo para escala masiva regulada** sin hardening adicional de seguridad, DR, QA y compliance.

### Índice global de readiness

## 6) Despliegue y operación

## Entornos sugeridos
- **Dev**: local con Vite + servicios mock.
- **Staging**: integración completa (DB, Kafka, Stripe test, Supabase).
- **Prod**: Kubernetes + observabilidad + política de secretos.

## Pasos base

```bash
npm install
npm run dev
npm test
npm run build
```

### Infra disponible en repo
- `infra/docker/`
- `infra/kubernetes/`
- `api-gateway/edge-kernel/`

---

## 7) Stack tecnológico

### Core
- TypeScript / Node.js
- PostgreSQL (`pg`)
- Kafka (`kafkajs`)
- Stripe

### Frontend
- React 18
- Vite
- Tailwind + Radix + shadcn

### Data / Integraciones
- Supabase (cliente + functions)
- SQL migrations/seeds

---

## 8) Posicionamiento Tech

Este proyecto se posiciona como:

1. **Smart City Operating System (verticalizado)**
2. **Destination Intelligence Platform (turismo + territorio)**
3. **Event-Driven Digital Public Infrastructure (DPI local)**
4. **Civic Experience + Decision Intelligence Platform**

### Categoría sugerida de mercado
- **GovTech / CivicTech**
- **TravelTech / Tourism Intelligence**
- **Urban Data Platform**

---

## 9) Datos del desarrollador / ownership técnico

## Identidad técnica registrada en el repositorio
- Último commit registrado por: `Codex <codex@openai.com>`.

## Ownership recomendado para operación real
- **Product Owner**: Municipio / Secretaría de Turismo local.
- **Tech Lead**: Arquitectura TAMV OS.
- **Data/AI Lead**: Gobierno de decisiones ISABELLA.
- **SRE/DevOps**: Operación y resiliencia en producción.
- **Security Lead**: cumplimiento, secretos, auditoría y respuesta a incidentes.

> Si deseas, puedo convertir esta sección en una **ficha formal de equipo** con nombres, roles, contacto, SLA de guardia y matriz RACI.

---

## 10) Roadmap inmediato recomendado (para pasar de 73% a >90%)

1. **Seguridad avanzada**: RBAC estricto, rotación de secretos, hardening de gateway y políticas de datos.
2. **DR/BCP**: backups verificables, restore drills, runbooks de contingencia.
3. **QA automatizado**: integración, contrato, carga y caos engineering en flujos críticos.
4. **Observabilidad profunda**: tracing distribuido completo + alertas SLO por dominio.
5. **Compliance**: bitácora de auditoría consolidada y políticas de retención de datos.
6. **Economía crítica**: conciliación automática, anti-fraude y reportes regulatorios.

---

## 11) Resumen ejecutivo

RDM Smart City OS ya opera como una base sólida de sistema soberano orientado a eventos.

Hoy está en una fase de **producción controlada/piloto avanzado** con madurez suficiente para operación real supervisada, y con ruta clara para escalar a nivel enterprise-gobierno.
