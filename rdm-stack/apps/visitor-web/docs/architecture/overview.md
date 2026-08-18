# ARCHITECTURE — RDM Digital Hub LTOS

## Overview

RDM Digital Hub es un **Sistema Operativo Territorial Soberano (LDTOCS)** para Real del Monte, Hidalgo, México. Monorepo con frontend React/Vite, backend Supabase (auth, base de datos, edge functions) y despliegue Vercel.

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 19, Vite 7 |
| **UI** | shadcn/ui, Tailwind CSS v4, Framer Motion |
| **Data** | Supabase (PostgreSQL, Auth, Edge Functions, Storage) |
| **Build** | Vite 7, TypeScript 5.8 |
| **Deploy** | Vercel (Edge Functions for API routes) |
| **State** | TanStack React Query + Zustand |

## Topología actual

```
┌──────────────────────────────────────────────────────────┐
│                   Vercel (SPA)                           │
│         src/pages  src/components  (Vite + React)        │
└─────────────┬──────────────────────────┬─────────────────┘
              │ publishable key          │ user JWT
              ▼                          ▼
        ┌──────────────────────────────────────┐
        │            Supabase                  │
        │  Auth · Postgres (RLS) · Storage     │
        │  Realtime · Edge Functions (Deno)    │
        └──────────┬───────────────────────────┘
                   │ service_role (server-only)
                   ▼
        ┌──────────────────────────────────────┐
        │  server/ (Express + Prisma)          │
        │  tools/nodo-cero/ (Python daemon)    │
        │  IA · Eventos · Analytics            │
        └──────────────────────────────────────┘
```

## Directory Structure

```
├── api/                          # Vercel Edge Functions
│   ├── _shared/                  # Shared helpers
│   ├── cron/                     # Cron jobs
│   ├── isa-ai.ts                 # ISA-AI autónomo
│   └── ...
├── src/                          # Frontend React
│   ├── components/               # Componentes UI
│   ├── pages/                    # 117 páginas
│   ├── isabella/                 # Isabella AI engine
│   ├── core/                     # YUN kernel, territorial, twins
│   └── ...
├── server/                       # Express + Prisma backend
├── supabase/                     # Migraciones + Edge Functions
├── docs/                         # Documentación canónica
│   ├── architecture/             # Arquitectura
│   ├── policies/                 # Seguridad, privacidad, datos
│   └── yun/                      # Especificación YUN
├── tools/                        # Utilidades
│   ├── nodo-cero/                # Python daemon (NetFlowX + Isabella)
│   ├── hw/                       # Hardware utilities
│   └── rdmx-sync.ts              # Orchestrator
└── scripts/                      # Automatización
    ├── image-optimizer.js
    └── ...
```

## Trust boundaries

1. **Browser ↔ Supabase**: publishable key + RLS. Nunca service_role.
2. **Browser ↔ Edge Functions**: JWT del usuario, validado por la función.
3. **Edge Function ↔ Postgres**: service_role solo cuando se requiere bypass de RLS.
4. **CI ↔ Vercel/Supabase**: tokens OIDC efímeros, nunca PATs.

## Datos sensibles

- PII de visitantes (email, teléfono) → tabla `profiles`, RLS por `auth.uid()`.
- Roles → tabla `user_roles` separada.
- Logs de IA → anonimizados a las 24 h.

## Dominios

| Dominio            | Path                       | Estado |
|--------------------|----------------------------|--------|
| IA conversacional  | src/isabella, api/isa-ai   | beta   |
| Gemelo territorial | src/core/territorial       | alpha  |
| Economía local     | src/pages/Comercios*       | alpha  |
| Cultura            | src/pages/Cultura*         | beta   |
| Analytics          | src/core/observability     | alpha  |
| Sensores IoT       | tools/nodo-cero/           | alpha  |
