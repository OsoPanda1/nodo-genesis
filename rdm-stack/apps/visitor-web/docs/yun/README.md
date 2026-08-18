# YUN Documentation Suite – Always by your side

Este directorio contiene la familia documental oficial de **YUN v1.0**, el Sistema Operativo Constitucional Soberano diseñado por **Edwin Oswaldo Castillo Trejo (Anubis Villaseñor)** para ecosistemas territoriales como TAMV ONLINE e Isabella IA.

---

## 1. Estructura de archivos

| Archivo | Propósito |
|---------|-----------|
| `00-manifesto.md` | Manifiesto fundacional, propósito y filosofía de soberanía |
| `01-constitution.md` | Constitución YUN: principios inmutables y reglas duras |
| `02-governance.md` | Gobernanza, Architecture Board, RACI y procesos formales |
| `03-blueprint.md` | Blueprint arquitectónico (capas, heptafederación, L0–L10, P0–P10) |
| `04-security-data-standards.md` | Estándar de seguridad y datos (P0/P1/P2, triple bloqueo semántico) |
| `05-data-standard.md` | Estándar de datos: dominios, catálogo, fragmentación y roles de gobierno |
| `06-event-standard.md` | Modelo de eventos y Event Fabric (GEMET, best practices, panteón) |
| `07-operations-manual.md` | Manual de operaciones (modos Normal/Degradado/Recuperación) |
| `08-adr-index.md` | Índice de Architecture Decision Records (ADRs) |
| `08-isabella-layer.md` | Capa epistemológica: Isabella IA y sus motores |
| `09-isa-api-contracts.md` | Contratos ISA-API, integración con YUN |
| `rfc/RFC-0001-YUN-System-Constitutional-Spec.md` | Especificación constitucional MUST/SHOULD/MAY |
| `audits/yun_audit_checklist.csv` | Checklist de auditoría tipo ISO |
| `audits/YUN_Audit_Report_Template.md` | Plantilla de reporte post-despliegue |

---

## 2. Cómo leer esta documentación

### 2.1 Para arquitectos y devs
- Empezar por `01-constitution.md` y `rfc/RFC-0001-YUN-System-Constitutional-Spec.md` para principios no negociables.
- Usar `03-blueprint.md` para diseñar dominios, federaciones y servicios (incluye ejes L0–L10 y P0–P10).
- Consultar `04-security-data-standards.md`, `05-data-standard.md` y `06-event-standard.md` al definir datos y eventos.

### 2.2 Para gobernanza y liderazgo
- Revisar `00-manifesto.md` para el contexto filosófico, soberanía y canonización.
- Profundizar en `02-governance.md` para roles, procesos y RACI.
- Ver `08-adr-index.md` para el historial de decisiones.

### 2.3 Para SRE / Operaciones
- Usar `07-operations-manual.md` como guía de operación diaria, incidentes y recuperación.
- Coordinar con `06-event-standard.md` y la topología de CITEMESH/GEMET.

### 2.4 Para IA / capa cognitiva
- Partir de `08-isabella-layer.md`.
- Usar `09-isa-api-contracts.md` y el archivo OpenAPI de ISA-API v1.0.

---

## 3. Conformidad y auditoría

La conformidad con YUN se evalúa mediante:
- RFC-0001 (constitucional).
- Checklist de auditoría (CSV) en `audits/yun_audit_checklist.csv`.
- Procesos de gobernanza documentados en `02-governance.md`.

Ningún despliegue se considera "YUN compatible" si no pasa la auditoría mínima.

---

## 4. Archivos complementarios

| Ruta | Propósito |
|------|-----------|
| `docs/isa-api/openapi-v1.0.yaml` | Especificación OpenAPI de ISA-API v1.0 con metadatos x-yun-* |
| `docs/isa-api/` | Documentación adicional de ISA-API |
| `01-blueprint.md` | Vista arquitectónica en inglés (capas Identity, Knowledge, Commerce, Community, Governance) |

## 5. Ecosistema integrado

YUN = **Constitución Operativa**.
Ecosistema atómico (GEMET, EOCT, CITEMESH, SDMD-7, MSR BLOCKCHAIN, ANUBIS, HORUS, OJO DE RA, QUETZALCOATL) = **cuerpo vivo** que implementa la Constitución.
ISA-API + Isabella = **capa cognitiva** que explica, coordina y amplifica.
Heptafederación F1–F7, L0–L10, P0–P10 = **topología obligatoria**.

---

## 6. Cómo proponer cambios
1. Crear issue y branch.
2. Redactar ADR en `adr/ADR-xxx-*.md`.
3. Actualizar el archivo relevante.
4. Someter a revisión del Architecture Board (ver `02-governance.md`).
5. Registrar decisión en MSR BLOCKCHAIN cuando aplique.

---

## 7. Licenciamiento y soberanía
YUN está diseñado como arquitectura soberana. Cualquier reutilización debe respetar la atribución al autor (Anubis Villaseñor), la misión de soberanía territorial y protección de comunidades, y la obligación de mantener la Constitución YUN como referencia central.
