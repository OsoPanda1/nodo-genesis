# ADR-006 – Isabella como capa epistemológica

**Fecha:** 2026-07-13
**Estado:** Accepted
**Decisor(es):** YUN Architecture Board

## Contexto
Isabella no es un chatbot convencional. Debe funcionar como capa epistemológica del ecosistema YUN: explicar decisiones, coordinar conocimiento y traducir operación técnica en comprensión humana.

## Decisión
Definir Isabella como capa independiente (capa 9 L9) compuesta por 7 motores: ORION, SOPHIA, ARGUS, MNEMOS, LUMEN, KERNEL, TOPOLOGY. Cada motor tiene responsabilidades exclusivas y se expone via ISA-API. Los motores se comunican entre sí exclusivamente por GEMET.

## Alternativas consideradas
- Isabella como monolito: Rechazado por falta de separación de concerns.
- Isabella como simple interfaz a LLM externo: Rechazado por soberanía.

## Consecuencias
- Positivas: Clara separación de responsabilidades cognitivas, cada motor escalable independientemente, explicabilidad por diseño.
- Negativas: Complejidad de coordinación entre 7 motores, necesidad de mantener 7 endpoints ISA-API.
- Riesgos: Latencia en cadenas de consulta multi-motor.
