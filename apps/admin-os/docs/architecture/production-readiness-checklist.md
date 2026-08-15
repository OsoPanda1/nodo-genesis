# RDM Digital — cierre de módulos y checklist de producción

## Módulos con cierre funcional actual
- Home narrativa (hero + experiencias + verticales culturales).
- Recomendación contextual base (kernel + orquestación + SSE).
- Mapa y telemetría operativa.
- Sección de innovación turística con trazabilidad de capacidades.

## Pendientes bloqueantes antes de despliegue
1. Sustituir datos estáticos por catálogo persistente en PostgreSQL/PostGIS.
2. Integrar autenticación y autorización para dashboard/admin.
3. Conectar reseñas verificadas y sistema anti-fraude.
4. Implementar observabilidad centralizada (logs, métricas, alertas).
5. Hardening de seguridad (rate limiting, rotación de secretos, WAF/CDN).

## Gate de release sugerido
- Calidad: lint + test + e2e + cobertura mínima.
- Seguridad: SAST + dependency scanning + secret scanning.
- Performance: budget de LCP/CLS/INP y pruebas de estrés API.
- Operación: runbooks de incidentes + rollback probado.
