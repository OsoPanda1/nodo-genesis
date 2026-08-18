# ISA-API Contracts – Integración con YUN

**Versión:** v1.0
**Fecha:** 2026-07-13
**Ámbito:** Contratos de integración entre ISA-API v1.0 y YUN

---

## 1. Propósito

Este documento define los contratos de integración entre ISA-API v1.0 y el ecosistema YUN. Cada endpoint de ISA-API se mapea a dominios, federaciones y eventos de YUN mediante metadatos `x-yun-*`.

---

## 2. Metadatos YUN en ISA-API

Cada endpoint crítico en la especificación OpenAPI DEBE incluir:

```yaml
x-yun-domain: <domain>
x-yun-federation: <F1-F7>
x-yun-event-topic: <event_topic>
```

### 2.1 Dominios YUN

| Dominio | Descripción |
|---------|-------------|
| identity | Identidad, autenticación, perfiles |
| commerce | Comercio, pagos, suscripciones |
| knowledge | Conocimiento, ontologías, contribuciones |
| telemetry | Telemetría, logs, auditoría |
| governance | Gobernanza, políticas, ADR |
| security | Seguridad, incidentes, triple bloqueo |
| federation | Estado y políticas federadas |

### 2.2 Federaciones YUN (F1-F7)

| ID | Nombre | Ámbito |
|----|--------|--------|
| F1 | Comercio | Economía local, pagos, marketplace |
| F2 | Turismo/Cultura | Turismo, cultura, historia, gastronomía |
| F3 | Academia/Ciencia | Conocimiento abierto, investigación |
| F4 | Gobierno | Gobernanza cívica, políticas públicas |
| F5 | Infra/Tecnología | Infraestructura, red, CITEMESH, operación |
| F6 | Comunidad/ONG | Comunidad, organización social |
| F7 | Metaverso/XR | Realidad extendida, experiencias inmersivas |

---

## 3. Mapeo endpoints ISA-API → YUN

### 3.1 ORION – Chat principal

| Propiedad | Valor |
|-----------|-------|
| Endpoint | `POST /v1/orion/chat` |
| x-yun-domain | knowledge |
| x-yun-federation | F2, F6 |
| x-yun-event-topic | isabella.orion.chat |
| Motores internos | SOPHIA, ARGUS, KERNEL, TOPOLOGY |
| Triple bloqueo | No (solo validación de identidad) |

### 3.2 SOPHIA – Ontología

| Propiedad | Valor |
|-----------|-------|
| Endpoint | `POST /v1/sophia/query` |
| x-yun-domain | knowledge |
| x-yun-federation | F2, F3 |
| x-yun-event-topic | isabella.sophia.query |
| Almacenamiento | SDMD-7 (federaciones F2, F3) |

### 3.3 ARGUS – Diagnóstico

| Propiedad | Valor |
|-----------|-------|
| Endpoint | `POST /v1/argus/diagnose` |
| x-yun-domain | telemetry, security |
| x-yun-federation | F5, F7 |
| x-yun-event-topic | isabella.argus.diagnose |
| Eventos que publica | SecurityIncident, HealthDegraded, AnomalyDetected |
| Triple bloqueo | Sí (operación crítica) |

### 3.4 MNEMOS – Memoria

| Propiedad | Valor |
|-----------|-------|
| Endpoint | `POST /v1/mnemos/recall` |
| x-yun-domain | knowledge |
| x-yun-federation | F3, F5 |
| x-yun-event-topic | isabella.mnemos.recall |
| Almacenamiento | SDMD-7 + MSR BLOCKCHAIN (para decisiones inmutables) |

### 3.5 LUMEN – Gobernanza

| Propiedad | Valor |
|-----------|-------|
| Endpoint | `POST /v1/lumen/policy` |
| x-yun-domain | governance |
| x-yun-federation | F1, F4 |
| x-yun-event-topic | isabella.lumen.policy |
| Ledger | MSR BLOCKCHAIN para decisiones |
| Triple bloqueo | Sí (operación crítica) |
| Publica | GovernanceDecision, PolicyUpdated, ADRCreated |

### 3.6 KERNEL – Salud

| Propiedad | Valor |
|-----------|-------|
| Endpoint | `GET /v1/kernel/health` |
| x-yun-domain | telemetry |
| x-yun-federation | F5, F7 |
| x-yun-event-topic | isabella.kernel.health |
| Fuentes | GEMET, Radares MOSH, HORUS |

### 3.7 TOPOLOGY – Topología

| Propiedad | Valor |
|-----------|-------|
| Endpoint | `GET /v1/topology/graph` |
| x-yun-domain | federation |
| x-yun-federation | F5 |
| x-yun-event-topic | isabella.topology.graph |
| Fuentes | CITEMESH, SDMD-7, MSR |

---

## 4. Esquema de eventos ISA-API → YUN

### 4.1 SecurityIncident (publicado por ARGUS)

```json
{
  "event_type": "isabella.security.incident",
  "domain": "security",
  "federation_id": "F5",
  "entity_id": "node_f5_infra_01",
  "trace_id": "trc_abc123",
  "timestamp": "2026-07-13T12:00:00Z",
  "severity": "critical",
  "payload": {
    "incident_type": "oao_de_ra_neutralization",
    "threat_level": 8,
    "action_taken": "quarantine",
    "source": "mosh_radar_external"
  }
}
```

### 4.2 GovernanceDecision (publicado por LUMEN)

```json
{
  "event_type": "isabella.governance.decision",
  "domain": "governance",
  "federation_id": "F4",
  "entity_id": "adr_005",
  "trace_id": "trc_def456",
  "timestamp": "2026-07-13T14:00:00Z",
  "severity": "info",
  "payload": {
    "decision": "approved",
    "policy": "data_retention_v2",
    "constitutional_articles": ["2.1", "2.3"],
    "msr_tx_hash": "0xabc123def456"
  }
}
```

---

## 5. Triple Bloqueo Semántico en ISA-API

Los endpoints críticos (ARGUS diagnose, LUMEN policy) DEBEN pasar por el triple bloqueo semántico antes de ejecutar:

1. **Firma criptográfica de identidad** – Verifica quién hace la solicitud.
2. **Validación de sintaxis contra la Constitución y estándares** – Verifica qué se solicita.
3. **Comprobación semántica por IA** – Isabella (ORION o LUMEN) evalúa intención, contexto y congruencia.

---

## 6. Panteón de Orquestación

### 6.1 ANUBIS – Orchestrator Master & Constitutional Executor
- Responsable del ciclo de vida, despliegue, GC/deprecación, asignación de recursos.
- Debe cumplir las reglas del Policy Engine y la Constitución.
- Se comunica con LUMEN para decisiones de gobernanza.

### 6.2 HORUS – Telemetry & Panopticon
- Responsable de observabilidad y salud.
- Recibe eventos de Radares MOSH, KERNEL, Telemetry.
- Alimenta a KERNEL y ARGUS.

### 6.3 OJO DE RA – Active Neutralization & Security Engine
- Aplica triple bloqueo semántico, zero trust, cuarentenas.
- Publica SecurityIncident a GEMET.
- ARGUS consume sus decisiones para diagnóstico.

### 6.4 QUETZALCOATL – Data Fabric Orchestrator
- Conecta Event Fabric (GEMET), Knowledge & Memory (SOPHIA, MNEMOS) y Storage (SDMD-7 / MSR).
- Orquesta flujos de datos entre federaciones.

### 6.5 DEKATEOTL / AZTEK GODS / TENOCHTITLAN
- Clústeres de IA y nodos guardianes localizados en F2, F4, F5/F6.

### 6.6 Radares Gemelos MOSH
- 2 agentes de escaneo continuo (interno/externo).
- Alimentan a ARGUS y HORUS.

---

## 7. Guardianías

- Se codifican como nodos/roles dentro del meta-modelo YUN.
- Responsabilidades reflejadas en matriz RACI.
- Si una Guardianía se compromete, GEMET desencadena aislamiento automático y cambio de estado (Domain/FederationHealthChanged).
- Decisiones sobre Guardianías se registran en ADR y MSR BLOCKCHAIN.
