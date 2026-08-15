# AGENTS.md — Convenciones para agentes de IA

Guía para trabajar en este repositorio (RDM Digital Hub — Nodo Cero).
Complementa a `docs/guia-desarrollador.md` y `docs/guia-modularizacion.md`.

## Stack

Next.js 16 (App Router) + React 19 + TypeScript 5.9 (strict) + Tailwind 4.
Tests: Vitest (`npm test`). Validación de contratos: zod (ya instalado).

## Comandos de verificación (obligatorios antes de dar por terminada una tarea)

```bash
npx tsc --noEmit      # tipos
npm run lint          # eslint
npm test              # vitest (222+ tests)
npm run audit         # consistencia del código (bloquea as never / require())
npm run check:env     # entorno contra el contrato
npm run check:contracts  # adopción del route-guard
npm run quality       # todo en cadena
npm run build         # build de producción
```

## Reglas de código

- Comentarios y nombres de archivo en español; identificadores y código en
  inglés. Archivos en kebab-case.
- **Prohibido** `as never` y `require()` dinámico (el auditor los bloquea).
- Cabecera de módulo con el bloque `/* ==== */` existente.
- El núcleo transversal vive en `lib/core/`; la trust canónica en
  `lib/security/trust.ts`. `lib/isabella/trust.ts` es un barril de
  compatibilidad: no añadir lógica nueva allí.
- Las rutas API se escriben con el route-guard único
  (`@/app/api/_shared/route-guard`); nunca duplicar `enforceTrust`.
- La validación de cuerpos se hace con contratos zod en `lib/core/contracts`
  (o junto al dominio); nunca validación manual duplicada.
- Eventos de dominio se emiten con `publishEvent` de `@/lib/core/events`
  (envelope con traceId/correlationId). Los emisores de cliente usan
  `import()` dinámico (el bus depende de `node:async_hooks`).
- Variables de entorno: documentarlas en `lib/core/env/index.ts` y en
  `.env.example`; lectura tipada con `getEnv()`.
- No regenerar secretos, no committear `.env.local`, no añadir dependencias
  sin justificación (el contrato de entorno y zod ya cubren lo habitual).
- Tests por dominio en `tests/<dominio>.test.ts`.

## Estructura

- `lib/core/` — núcleo transversal (utils, events, env, contracts).
- `lib/security/` — trust, zero-trust, keys, tokens.
- `lib/<dominio>/` — stacks de dominio (isabella, city, assets, marketplace,
  gamification, twins, grid, monitoring, resilience, governance, ...).
- `app/api/` — rutas API (rutas de Next.js). `app/api/_shared/` — guard.
- `scripts/` — automatización (audit, check:env, check:contracts).
- `tests/` — pruebas de Vitest.

## Trabajo con dominio de Isabella

- Razonamiento → `lib/isabella/isa-core.ts`. Firma → `lib/isabella/mexa-api.ts`.
- Exposición vía `lib/isabella/http.ts` (aplica su propia cadena).
- El dead-man-switch y el gateway CROWN son soberanos: no añadir egress
  obligatorio.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
