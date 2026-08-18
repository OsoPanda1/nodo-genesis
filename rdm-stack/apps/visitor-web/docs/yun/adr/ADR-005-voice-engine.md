# ADR-005 – Voice engine Isabella

**Fecha:** 2026-07-13
**Estado:** Accepted
**Decisor(es):** YUN Architecture Board

## Contexto
Isabella necesita capacidad de entrada y salida de voz para interacción natural con usuarios en federaciones F2 (Turismo/Cultura) y F6 (Comunidad/ONG).

## Decisión
Implementar voice engine como servicio independiente dentro del motor ORION. El voice engine convierte audio a texto (STT) y texto a audio (TTS) usando modelos locales FIRST. No depende de APIs externas de voz. Se integra via ISA-API endpoint `/v1/orion/voice`.

## Alternativas consideradas
- API externa (Google Cloud Speech-to-Text): Rechazada por violar principio de soberanía.
- Integración directa en ORION sin servicio separado: Rechazada por acoplamiento.

## Consecuencias
- Positivas: Soberanía total de voz, sin dependencias externas, latencia controlable.
- Negativas: Mayor consumo de recursos locales (GPU/TPU), necesidad de modelos entrenados para español y lenguas originarias.
- Riesgos: Calidad de reconocimiento inferior a APIs comerciales en etapas tempranas.
