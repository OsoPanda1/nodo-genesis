# Modelo de Dominio Canónico TAMV Online

Este documento define el lenguaje federado oficial del sistema para asegurar coherencia técnica y documental.

## 1. Entidades raíz

1. **TERRITORY**: unidad territorial soberana operada por TAMV.
2. **TERRITORY_SESSION**: sesión contextual de interacción con visitantes/ciudadanía.
3. **DECISION_CASE**: expediente de decisión generado por ISABELLA con trazabilidad.
4. **PAYMENT_ORDER**: orden económica crítica gestionada por Cattleya Pay.
5. **GEO_FENCE**: artefacto de control geoespacial para orquestación y seguridad.

## 2. Eventos canónicos

### Territorio
- `TERRITORY_REGISTERED`
- `TERRITORY_ACTIVATED`
- `TERRITORY_DEGRADED`
- `TERRITORY_RECOVERED`
- `TERRITORY_SUSPENDED`

### Sesión
- `SESSION_STARTED`
- `SESSION_INTERACTION_RECORDED`
- `SESSION_AT_RISK_DETECTED`
- `SESSION_RETAINED`
- `SESSION_CLOSED`

### Decisión
- `DECISION_EVALUATED`
- `DECISION_ACTION_DISPATCHED`
- `DECISION_REVIEWED`

### Economía
- `PAYMENT_INITIATED`
- `PAYMENT_SESSION_CREATED`
- `PAYMENT_AUTHORIZED`
- `PAYMENT_CAPTURED`
- `PAYMENT_SETTLED`
- `PAYMENT_FAILED`
- `PAYMENT_REFUNDED`

### Geo
- `GEOFENCE_DEFINED`
- `GEOFENCE_ENFORCED`
- `GEOFENCE_TRIGGERED`
- `GEOFENCE_ARCHIVED`

## 3. Estados válidos

- **TERRITORY**: `INITIALIZING`, `ACTIVE`, `DEGRADED`, `MAINTENANCE`, `SUSPENDED`
- **TERRITORY_SESSION**: `CREATED`, `INTERACTING`, `AT_RISK_EXIT`, `RETAINED`, `CLOSED`
- **DECISION_CASE**: `PENDING_EVIDENCE`, `EVALUATED`, `ACTIONED`, `REVIEWED`
- **PAYMENT_ORDER**: `INITIATED`, `SESSION_CREATED`, `AUTHORIZED`, `CAPTURED`, `SETTLED`, `FAILED`, `REFUNDED`
- **GEO_FENCE**: `DEFINED`, `ENFORCED`, `TRIGGERED`, `ARCHIVED`

## 4. Reglas de transición

Las reglas de transición se mantienen en código (`canonical-domain.ts`) y no deben duplicarse de forma inconsistente.

### Principio institucional

Toda transición de estado debe cumplir:

```text
(aggregateType, currentState, eventType) -> nextState
```

Si no existe regla válida, la transición se considera inválida.

## 5. Implementación técnica federada

- **Contrato canónico**: `core/tamv-os-kernel/src/domain/canonical-domain.ts`
- **Tipos de evento federados**:
  - `core/tamv-os-kernel/src/types.ts`
  - `core/tamv-os-kernel/src/domain/events.ts`
- **Validación de transición en persistencia**:
  - `core/tamv-os-kernel/src/event-store.ts`
- **Aplicación en motor económico**:
  - `economy/cattleya-pay/src/payment.service.ts`

## 6. Gobernanza doctrinal TAMV Online

1. Ningún microservicio puede inventar eventos o estados fuera del modelo canónico sin RFC de dominio.
2. Todo nuevo evento canónico debe incluir:
   - motivo de negocio,
   - entidad raíz afectada,
   - transición permitida,
   - impacto de auditoría/telemetría.
3. El README y documentación de arquitectura deben reflejar siempre la versión vigente del dominio canónico.
