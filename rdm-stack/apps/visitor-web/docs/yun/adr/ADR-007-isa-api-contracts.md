# ADR-007 – ISA-API contratos de integración

**Fecha:** 2026-07-13
**Estado:** Accepted
**Decisor(es):** YUN Architecture Board

## Contexto
Cada endpoint de ISA-API necesita metadatos YUN (dominio, federación, evento) para integración con GEMET, políticas y auditoría.

## Decisión
Todo endpoint crítico en la especificación OpenAPI DEBE incluir los metadatos `x-yun-domain`, `x-yun-federation`, `x-yun-event-topic`. El mapeo completo se documenta en `docs/yun/09-isa-api-contracts.md`.

## Alternativas consideradas
- Metadatos en headers HTTP en lugar de spec: Rechazado por falta de documentación contractual.
- Sin metadatos YUN: Rechazado por imposibilidad de integración automática con GEMET.

## Consecuencias
- Positivas: Contratos auto-documentados, integración automática con event fabric, trazabilidad por diseño.
- Negativas: Mantenimiento adicional de metadatos en spec OpenAPI.
- Riesgos: Bajo (metadatos en spec, validables por CI).
