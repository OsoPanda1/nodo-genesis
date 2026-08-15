# RDM Digital — análisis crítico de arquitectura y plan de corrección

## 1) Diagnóstico severo (estado real vs objetivo)

### Desalineación estructural
- El repositorio actual opera como app React + Vite monolítica y no como monorepo `apps/* + packages/* + services/*`.
- Existen rutas tipo `src/app/api/*` de estilo Next.js, pero la app principal no corre en Next.js App Router.
- Se mezclan concerns de UI, lógica de dominio, APIs y experimentos de IA en el mismo árbol sin límites de contexto fuertes.

### Riesgos de producto
- La propuesta de valor (recomendación contextual y telemetría territorial) no está conectada de punta a punta con un pipeline de datos robusto.
- Falta capa operacional explícita para ingestión masiva, validación de datos y reintentos idempotentes.

### Riesgos técnicos
- Ejemplos de scoring comúnmente fallan por no normalizar correctamente magnitudes heterogéneas (distancia, tags, ratings).
- Uso de scoring proporcional a `1 / dist` puede explotar en infinito si distancia = 0.
- Falta un contrato de ranking explicable (`breakdown`) para auditar sesgos.

### Riesgos de seguridad
- Hashing SHA-256 no equivale a cifrado: sirve para integridad, no para confidencialidad.
- Ausencia de blueprint de seguridad transversal (rate limiting, signed requests, rotación de secretos, auditoría).

### Riesgos de datos
- Esquema de negocio sin constraints ni índices geoespaciales apropiados degrada consulta al crecer.
- Falta estrategia de embeddings/versionado en el modelo para el motor híbrido.

---

## 2) Correcciones implementadas en este ciclo

1. **Motor de recomendación híbrido robusto**
   - Scoring normalizado por factores (proximidad, afinidad, horario, tendencia).
   - Protección de edge cases (distancia cero, horas fuera de rango, preferencias vacías).
   - Salida explicable con `breakdown` por factor.

2. **Hook reusable de clustering geográfico**
   - `clusterGeoPoints` puro + `useGeoCluster` memoizado.
   - Filtrado de coordenadas inválidas.

3. **Pipeline de ingesta con resiliencia mínima**
   - Carga por lotes, reintentos con backoff y reporte de progreso.
   - Endpoint configurable por variable de entorno.

4. **Esquema SQL hardening para Postgres/PostGIS/pgvector**
   - Constraints, defaults, checks e índices geoespaciales/GIN.
   - Tabla preparada para embeddings y búsqueda híbrida.

5. **Infra local objetivo (docker-compose)**
   - PostGIS + Redis + Elasticsearch + placeholders de web/api.

---

## 3) Inconsistencias detectadas en la propuesta original

- **“Render zero-lag”** no es realista sin virtualización de capas, debouncing de viewport y estrategia de culling.
- **Cloudflare Worker** sin autenticación ni firma de origen abre vector de abuso/costo.
- **Gamification mutable in-place** (`user.routes.push`) puede romper consistencia en ambientes concurrentes.
- **Trust score lineal** favorece volumen de reviews sobre calidad/verificación y es vulnerable a manipulación.
- **POIs con `Math.random()` por render** causan jitter visual y mala UX.

---

## 4) Plan de cierre para Fase 1→3

1. Migrar frontend a Next.js 15 App Router en `apps/web`.
2. Levantar backend NestJS en `apps/api` con módulos `business`, `recommendation`, `geo`.
3. Conectar `services/recommendation-ai` al API con trazabilidad y evaluación offline.
4. Integrar Redis para cache de consultas geoespaciales y top-N por zona/hora.
5. Implementar búsquedas híbridas:
   - lexical + semantic (Elasticsearch + pgvector),
   - re-ranking contextual por preferencias y horario.
6. Endurecer seguridad:
   - JWT + rotating secrets,
   - request signing entre edge y core,
   - rate limiting por IP/user-key,
   - auditoría de decisiones y feedback loop.

