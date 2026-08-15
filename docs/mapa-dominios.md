# Mapa de dominios

Mapeo entre dominios de la plataforma, su código y su federación YUN.

## Gemelo Digital (`/twins` · Núcleo de Experiencia)

- `lib/twins/twin-store.ts` — modelos, instancias, grafo, simulación.
- `lib/twins/twin-graph.ts` — consultas al grafo de gemelos.
- Health: `twin-store.getTwinInstances`.

## Ciudad Inteligente (`/city` · Núcleo de Operación)

- `lib/city/city-event-bus.ts` — incidentes y bus de eventos urbanos.
- `lib/city/city-scorecard.ts` — scorecard urbano, triage, ranking.
- Health: `city-event-bus.listIncidents`.

## Gestión de Activos (`/assets` · Núcleo de Operación)

- `lib/assets/asset-registry.ts` — registro, salud, mantenimiento, órdenes.
- Health: `asset-registry.listAssets`.

## Red Soberana (`/grid` · Núcleo de Resiliencia)

- `lib/grid/grid-network.ts` — nodos de energía y agua, balance, alertas.
- Health: `grid-network.seedPowerNodes` + `seedWaterNodes`.

## Marketplace (`/marketplace` · Núcleo de Operación)

- `lib/marketplace/marketplace-store.ts` — ofertas, licencias, suscripción.
- Health: `marketplace-store.listListings`.

## Isabella / C.R.O.W.N. (Núcleo de Decisión)

- `lib/isabella/isa-core.ts` — **núcleo soberano** (offline, determinístico).
- `lib/isabella/mexa-api.ts` — firmas MSR-P256.
- `lib/isabella/crown-gateway.ts` — flota federada opcional.
- `lib/isabella/http.ts` — enforceTrust (cadena Zero Trust completa).
- Health: `crown-gateway.getGatewayStatus`.

## Gamificación (Núcleo de Experiencia)

- `lib/gamification/store.ts` — sesiones, leaderboard, estadísticas.
- `lib/gamification/events.ts` + `anti-cheat` — eventos server-authoritative.
- Health: `gamification.store.getGamificationStats`.

## Observabilidad (transversal)

- `lib/monitoring/*` + `/api/monitor/*` — Monitor General (ADR-0003).

## Seguridad (transversal)

- `lib/security/zero-trust.ts` — 7 capas (ADR-0002).
- `lib/security/keys.ts` — key vault interno (rotación `_V2/_V3`).

## Resiliencia (transversal)

- `lib/resilience/*` — retry, circuit breaker, bulkhead.

## Tiempo real y latencia (transversal)

- `lib/notifications` · `lib/messaging` · `lib/geo` · `lib/features` — notificaciones
  con sonido, mensajería por tópicos e inbox, geolocalización (RDM_CENTER) y
  gamificación → notificación.
- `lib/system/cache.ts` — TTL cache (1500 ms) · `lib/system/planes.ts` — planos
  first/warm/third (tercer plano programado para mantenimiento pesado).

## Gobernanza (transversal)

- `lib/governance/contracts.ts` — catálogo de contratos (ver `catalogo-apis.md`).
