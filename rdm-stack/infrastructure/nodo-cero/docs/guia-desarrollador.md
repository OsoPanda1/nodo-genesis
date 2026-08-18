# Guía de desarrollador

## Setup

```bash
npm install
cp .env.example .env.local   # completa claves opcionales
npm run dev
```

Scripts: `npm test` (vitest), `npx tsc --noEmit`, `npm run lint`, `npm run build`,
`npm run audit` (consistencia), `npm run check:env` (entorno), `npm run check:contracts`
(adopción del route-guard) y `npm run quality` (todo en cadena).

## Convenciones

- **Idioma:** código y comentarios en español; identificadores en inglés.
- **Rutas internas:** alias `@/` → raíz del proyecto (config en `vitest.config.mts`
  y `tsconfig.json`).
- **Sin comentarios** salvo cabeceras de módulo y bloques de sección del estilo
  existente (`/* ========================================================== */`).
- **Estilo visual:** tema Nocturno Minero en `app/globals.css` + `lib/design/tokens.ts`
  (paleta `--gold`, `--terracotta`, `--emerald`, `--neblina`, …). Usar variables,
  `.glass-panel`, `.miner-border`; fuentes `--font-playfair` (títulos) y
  `--font-dm-sans` (UI). No reintroducir el tema holográfico cian/púrpura.
- **Núcleo transversal:** todo lo genérico vive en `lib/core/` (utils, eventos,
  entorno, contratos). La capa de trust canónica vive en `lib/security/trust.ts`
  (lib/isabella/trust.ts es barril de compatibilidad).

## Cómo añadir un dominio

1. Crear el store en `lib/<dominio>/` (síncrono, importable sin efectos de lado).
2. Exponer rutas en `app/api/<dominio>/` con el route-guard único:
   `import { guardedRoute } from '@/app/api/_shared/route-guard'`.
   Ver `docs/guia-modularizacion.md` para el patrón.
3. Registrar un health check de solo lectura en
   `app/api/monitor/health/route.ts` con `monitor.registerHealth(name, fn)`
   (imports estáticos; nunca `require()` ni re-siembra de estado).
4. Registrar el contrato en `lib/governance/contracts.ts` (semver + lifecycle).
5. Añadir tests en `tests/<dominio>.test.ts`.

## Cómo añadir una API de Isabella

1. Si es razonamiento → extender `lib/isabella/isa-core.ts` (dominio, keywords,
   fuentes, plantilla). Nunca una llamada externa obligatoria.
2. Si firma artefactos → `lib/isabella/mexa-api.ts` (MSR-P256, opcional).
3. Exponerla vía `lib/isabella/http.ts` (aplica `enforceTrust` con la cadena 7
   capas automáticamente).

## Cómo usar resiliencia

```ts
registerStrategy('dominio', { retry: { maxAttempts: 3 }, failureThreshold: 5 });
await withResilience('dominio', async () => { /* trabajo */ });
```

Estados del circuit breaker se emiten como eventos/métricas del Monitor.

## Cómo usar caché y planos

```ts
await domainCache.getOrSetAsync('mapa', async () => await loadMap());
scheduleThirdPlane({ id: 'poda', plane: 'third', intervalMs: 60_000, run: podar });
stopThirdPlane('poda');
```

## Zero Trust y claves

- `enforceZeroTrustHeaders(headers, options)` evalúa las 7 capas; con
  `requiresSignature: true` exige `x-rdm-signature` (HMAC con `hmacSecret`).
- Claves internas en `.env` con rotación `_V2/_V3`; nunca se registran.
- El route-guard (`app/api/_shared/route-guard.ts`) aplica la cadena completa
  (server-only → origen → rate limit → Zero Trust → método → JSON → contrato)
  y emite telemetría al bus unificado (`lib/core/events`).

## Documentos

- `RFC-0001.md` — manifiesto C.R.O.W.N. y gobernanza.
- `docs/adr-0001..0003` — decisiones (ISA soberano, Zero Trust, observabilidad).
- `docs/c4-contexto.md` — arquitectura. `docs/catalogo-apis.md` — contratos.
- `docs/mapa-dominios.md` — dominios ↔ código ↔ federación.
