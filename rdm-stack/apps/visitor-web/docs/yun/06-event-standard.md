# YUN Event Standard – Modelo de eventos y sistema nervioso

**Versión:** v1.1  
**Fecha:** 2026-07-13  
**Ámbito:** Eventos de negocio, salud, seguridad, federación y panteón en YUN, incluyendo GEMET

---

## 1. Objetivo

Este documento define el estándar de eventos de YUN: el sistema nervioso que comunica dominios, federaciones, telemetría e Isabella sin acoplamiento directo.

---

## 2. Topics base

Cada dominio y área tiene su topic principal:

| Topic | Dominio | Propósito |
|-------|---------|-----------|
| `identity.events` | Identity | Creación, actualización, eliminación de usuarios, roles, sesiones |
| `commerce.events` | Commerce | Pagos, suscripciones, facturas, eventos de Stripe |
| `knowledge.events` | Knowledge | Publicaciones, contribuciones, ontologías |
| `telemetry.events` | Telemetry | Métricas de operación, auditoría |
| `gameplay.events` | Gameplay | Puntos, niveles, logros, sesiones de juego |
| `federations.events` | Federaciones | Salud, políticas, incidentes de Fed1–Fed7 |
| `security.events` | Seguridad | Alertas, intentos de ataque, incidentes |

---

## 3. Esquema mínimo de evento

Todo evento debe incluir:

```json
{
  "event_type": "string",
  "domain": "string",
  "federation_id": "string | null",
  "entity_id": "string",
  "trace_id": "string",
  "timestamp": "ISO 8601",
  "severity": "info | warn | error | critical",
  "payload": "object"
}
```

### 3.1 Campos obligatorios

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `event_type` | string | Tipo de evento (ej. `user.created`, `payment.completed`) |
| `domain` | string | Dominio de origen |
| `federation_id` | string \| null | Federación afectada (si aplica) |
| `entity_id` | string | ID de la entidad afectada |
| `trace_id` | string | ID de trazabilidad para correlación |
| `timestamp` | string | Momento del evento en ISO 8601 |
| `severity` | string | Nivel de severidad |
| `payload` | object | Datos específicos del evento |

---

## 4. Reglas de eventos

### 4.1 Generación
- Toda operación relevante genera evento.
- Los eventos se emiten de forma asíncrona después de la operación exitosa.

### 4.2 Contenido
- Ningún evento debe contener información sensible sin cifrado o anonimización.
- El `payload` debe seguir un esquema controlado por dominio.

### 4.3 Consumo
- Todos los consumidores deben poder ignorar eventos que no les correspondan sin fallar.
- Los consumidores deben ser idempotentes: procesar el mismo evento dos veces no debe causar efectos duplicados.

### 4.4 Orden y resiliencia
- El orden de eventos dentro de un mismo `entity_id` debe preservarse.
- El sistema debe tolerar reordenamiento entre diferentes entidades.

---

## 5. Ejemplo de evento

```json
{
  "event_type": "user.gamification.xp_gained",
  "domain": "gameplay",
  "federation_id": "PHOENIX",
  "entity_id": "usr_abc123",
  "trace_id": "trc_789xyz",
  "timestamp": "2026-07-04T12:00:00Z",
  "severity": "info",
  "payload": {
    "points": 150,
    "quest_code": "RDM-002",
    "new_level": 3,
    "total_xp": 1500
  }
}
```

---

## 6. GEMET – Global Event Mutator & Executor Tracker

GEMET es el bus de eventos canónico de YUN. Es el sistema nervioso que transporta, muta y trackea eventos entre federaciones, dominios y agentes.

### 6.1 Responsabilidades
- Transporte de eventos entre federaciones F1–F7.
- Mutación de eventos según políticas de transformación (EOCT).
- Trazabilidad de cada evento desde origen hasta consumidor final.
- Replay de eventos para recuperación y rehidratación.

### 6.2 Eventos de panteón

Además de los eventos de negocio por dominio, el panteón de agentes publica eventos específicos:

| Event Type | Publicado por | Propósito |
|------------|--------------|-----------|
| `pantheon.anubis.deployment.started` | ANUBIS | Inicio de despliegue de agente/nodo |
| `pantheon.anubis.deployment.completed` | ANUBIS | Despliegue exitoso |
| `pantheon.horus.health.changed` | HORUS | Cambio en estado de salud de un nodo |
| `pantheon.horus.anomaly.detected` | HORUS | Anomalía detectada en telemetría |
| `pantheon.oao_de_ra.security.incident` | OJO DE RA | Incidente de seguridad neutralizado |
| `pantheon.oao_de_ra.threat.blocked` | OJO DE RA | Amenaza bloqueada en perímetro |
| `pantheon.quetzalcoatl.data.sync` | QUETZALCOATL | Sincronización de datos entre dominios |
| `pantheon.quetzalcoatl.fabric.state` | QUETZALCOATL | Estado del data fabric |
| `pantheon.mosh.scan.completed` | MOSH | Escaneo de radar completado |
| `pantheon.mosh.threat.found` | MOSH | Amenaza encontrada en escaneo |

### 6.3 x-yun-event-topic

Cada evento DEBE especificar su topic YUN via el campo `event_type` con el formato `x.yun.<topic>`. Los topics canónicos son:

| Topic YUN | Propósito |
|-----------|-----------|
| `x.yun.identity` | Eventos de identidad |
| `x.yun.commerce` | Eventos de comercio |
| `x.yun.knowledge` | Eventos de conocimiento |
| `x.yun.telemetry` | Eventos de telemetría |
| `x.yun.governance` | Eventos de gobernanza |
| `x.yun.security` | Eventos de seguridad |
| `x.yun.federation` | Eventos de federación |
| `x.yun.pantheon` | Eventos del panteón de agentes |
| `x.yun.isabella` | Eventos de la capa cognitiva |

---

## 7. Vínculo con otros documentos YUN

- La Constitución YUN exige que todo cambio significativo genere un evento (principio 2.2).
- El Blueprint define el bus de eventos como componente central.
- El Operations Manual usa eventos para detectar y recuperar fallos.
- La Isabella Layer consume y publica eventos de los motores.
- Los ISA-API Contracts mapean eventos a endpoints con x-yun-event-topic.
- El Data Catalog registra qué entidades generan eventos y con qué propósito.
