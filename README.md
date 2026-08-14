# RDM Sovereign Stack — Nodo Génesis

> Orquestación y monorepo del ecosistema territorial digital de **Real del Monte, Hidalgo, México** (TAMV Online).

[![Estado](https://img.shields.io/badge/estado-en%20desarrollo-F59E0B?style=flat-square)](#avance-real-del-proyecto)
[![Stack](https://img.shields.io/badge/Stack-Docker%20Compose-2496ED?style=flat-square&logo=docker&logoColor=white)](rdm-stack/docker-compose.yml)
[![Gateway](https://img.shields.io/badge/Gateway-nginx-009639?style=flat-square&logo=nginx&logoColor=white)](rdm-stack/gateway/nginx.conf)
[![DB](https://img.shields.io/badge/DB-PostgreSQL%2016-336791?style=flat-square&logo=postgresql&logoColor=white)](rdm-stack/docker-compose.yml)
[![Repositorio](https://img.shields.io/badge/GitHub-OsoPanda1%2Fnodo--genesis-181717?style=flat-square&logo=github)](https://github.com/OsoPanda1/nodo-genesis)
[![Licencia](https://img.shields.io/badge/licencia-CROWN%20Sovereign-8B1E3F?style=flat-square)](#licencia)

---

Este repositorio es el **nodo génesis** de un sistema operativo territorial federado: unifica la infraestructura, la interfaz pública, la gestión administrativa y la API territorial de Real del Monte en un solo stack reproducible con Docker Compose.

El proyecto combina turismo, patrimonio, economía local, participación comunitaria y capacidades territoriales (mapas, gemelo digital, asistente IA) bajo principios de identidad soberana, memoria verificable, explicabilidad y gobernanza humana (HITL).

> **Estado real:** desarrollo activo. La infraestructura (Fase A) está restaurada y orquestada; cada módulo evoluciona de forma incremental y ninguno se declara listo para producción integral sin evidencia verificable.

---

## Contenido

- [Qué es y qué hace](#qué-es-y-qué-hace)
- [Arquitectura del stack](#arquitectura-del-stack)
- [Módulos](#módulos)
- [Avance real del proyecto](#avance-real-del-proyecto)
- [Inicio rápido](#inicio-rápido)
- [Variables de entorno](#variables-de-entorno)
- [Despliegue](#despliegue)
- [Operación (Makefile)](#operación-makefile)
- [Ruta de evolución](#ruta-de-evolución)
- [Seguridad](#seguridad)
- [Repositorios](#repositorios)
- [Documentación](#documentación)
- [Licencia](#licencia)

---

## Qué es y qué hace

El stack levanta **seis servicios orquestados** que juntos forman el sistema operativo territorial:

| Servicio | Rol | Ruta |
|---|---|---|
| `db` | Base de datos federada (PostgreSQL 16) | — |
| `core` | Motor TAMV (SSR TanStack Start / Bun) — brochure estático actualmente | `/` (proxy) |
| `admin-os` | SPA de gestión y operación territorial (Vite) | `/admin` |
| `visitor-web` | Interfaz pública de turismo, cultura y comunidad (Vite) | `/` |
| `nodo-cero` | **Sistema Operativo Territorial** — Next.js 16 con API real (97 rutas) | `/api`, `/ws` |
| `gateway` | Nginx: enrutador de tráfico del stack | `:80` / `:443` |

El gateway expone un único punto de entrada y enruta por prefijo:

- `/` → `visitor-web`
- `/admin` → `admin-os`
- `/api` y `/ws` → `nodo-cero` (API territorial real, no el core)
- `/health` → estado del gateway

---

## Arquitectura del stack

```text
                        ┌──────────────────────────┐
   :80 / :443           │  GATEWAY (nginx)         │
   ────────────────────►│  / → visitor-web         │
                        │  /admin → admin-os       │
                        │  /api, /ws → nodo-cero   │
                        └──────┬───────────────────┘
                               │ rdm-network
        ┌───────────┬──────────┴──────────┬──────────────┐
        ▼           ▼                     ▼              ▼
  ┌──────────┐ ┌──────────┐       ┌─────────────┐  ┌───────────┐
  │ visitor- │ │ admin-os │       │  nodo-cero  │  │   core    │
  │ web      │ │ (SPA)    │       │ (Next.js)   │  │ (SSR)     │
  │ :8080    │ │ :3000    │       │ :3000 int.  │  │ :8000     │
  └──────────┘ └──────────┘       └──────┬──────┘  └───────────┘
                                         │
                                   ┌─────┴────────┐
                                   ▼              ▼
                             ┌──────────┐   ┌────────────┐
                             │  db      │   │ Supabase   │
                             │ Postgres │   │ (externo)  │
                             └──────────┘   └────────────┘
```

- **Red interna:** `rdm-network` (bridge).
- **Persistencia:** volumen `postgres-data`.
- **Healthchecks** en todos los servicios; el gateway solo arranca cuando sus dependencias están sanas.
- **Build args Supabase** para las dos SPAs (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`).

---

## Módulos

| Módulo | Repositorio | Tecnología | Rol real |
|---|---|---|---|
| `services/core` | [TAMV-ONLINE-NET/tamv-core](https://github.com/TAMV-ONLINE-NET/tamv-core) | Bun · TanStack Start · SSR | **Brochure estático** (SSR). La API real vive en nodo-cero. Pendiente de convertir en backend real (Fase B). |
| `apps/visitor-web` | [OsoPanda1/visitarealdelmonte](https://github.com/OsoPanda1/visitarealdelmonte) | React · Vite · TypeScript | Interfaz pública: turismo, patrimonio, gamificación, gemelo digital 2D/3D. Es la app más madura (~105.8k líneas en `src/`). |
| `apps/admin-os` | [OsoPanda1/rdm-smart-city-os](https://github.com/OsoPanda1/rdm-smart-city-os) | React · Vite · TypeScript | SPA de gestión/operación territorial (Kernel TAMV OS, economía, observabilidad). |
| `infrastructure/nodo-cero` | [OsoPanda1/nodo-cero](https://github.com/OsoPanda1/nodo-cero) | Next.js 16 · React 19 · TypeScript | **Sistema Operativo Territorial**: 97 rutas API con route-guard, 254 archivos en `lib/`, ~44.8k líneas TS, 48 archivos de test. Es el backend real de facto. |

### Cifras de referencia (repositorio local)

| Módulo | Archivos | Líneas | Pruebas |
|---|---|---|---|
| `nodo-cero` (`lib/` + `app/api/`) | 408 `.ts` | ~44.8k | 48 `*.test.ts` |
| `visitor-web` (`src/`) | 614 | ~105.8k | Vitest + Playwright |
| `admin-os` (`src/`) | 224 | ~25.1k | — |
| `core` (`src/`) | 68 | ~9k | — |

> Las cifras son orientativas de la copia local y pueden variar ligeramente por commit.

---

## Avance real del proyecto

### ✅ Fase A — Infraestructura restaurada (completada)

- Docker Compose correcto: se eliminó el servicio fantasma de **MongoDB** (ningún repo lo consumía) y se reemplazó por **PostgreSQL 16** con healthcheck.
- Se quitó `version:` obsoleto del compose; nombres y redes normalizados (`rdm-stack`, `rdm-network`).
- Puertos corregidos (`core :8000`, `admin-os :3000`, `visitor-web :80→8080 host`, gateway `:80`).
- **Gateway nginx** reescrito (dev y prod): `/api` y `/ws` enrutan a **nodo-cero** (API territorial real), no al core.
- Dockerfiles de los 4 repos: versiones pinnadas (`bun:1.3.14-alpine`, `node:22-slim`), usuario no-root, `HEALTHCHECK`, `npm ci --legacy-peer-deps`.
- `.dockerignore` de los 4 repos: se excluyen `node_modules`, `.git`, `unity/`, `docs/`, `tests/`, logs y `.env*` para reducir el contexto de build.
- `.env` / `.env.production` alineados a PostgreSQL y Supabase real; se creó `.env.example`.
- `Makefile`: backups con `pg_dump`, targets de salud; `deploy-prod.sh` verifica `/api/yun/status`.
- **Seguridad:** el `.env` con credenciales de `admin-os` dejó de trackearse.
- Todos los repos actualizados y pusheados (`main` / `master`).

### 🔜 Fase B — Core como backend real

Convertir `services/core` (tamv-core) de brochure estático en el **motor TAMV** real: BookPI, MSR, MVTS 4D, Isabella (módulo de intención/ética) y Guardian (HITL), con contratos y pruebas reproducibles.

### 🔜 Fase C — Consolidar visitor-web

Consolidar `apps/visitor-web` como interfaz pública estable: turismo, patrimonio, gamificación y gemelo digital, alineada a los contratos de la API territorial de nodo-cero.

### ⏳ Fases posteriores

- **D** — Limpiar/consolidar `admin-os` (Kernel TAMV OS, economía, observabilidad).
- **E** — Nodo-cero hacia producción territorial (modelo de datos, RLS, monitoreo, RTO/RPO).
- **F** — Coherencia entre repos: contratos compartidos, versionado y una sola fuente de verdad.

---

## Inicio rápido

### Requisitos

- Docker + Docker Compose v2.
- Git.
- Acceso a las variables de entorno de Supabase si se usan las SPAs con datos reales.

### Levantar el stack

```bash
cd rdm-stack
cp .env.example .env        # edita los valores reales (Supabase, puertos)
docker compose up -d --build
```

### Verificar

```bash
curl http://localhost/health          # estado del gateway
curl http://localhost/api/yun/status  # salud de la API territorial (nodo-cero)
docker compose ps                     # estado de todos los servicios
```

### Detener

```bash
docker compose down            # detiene y elimina contenedores
docker compose down -v         # además elimina el volumen de datos (¡pérdida!)
```

---

## Variables de entorno

Se definen en `rdm-stack/.env` (desarrollo) y `rdm-stack/.env.production`. Todas están documentadas en `rdm-stack/.env.example`:

| Variable | Descripción |
|---|---|
| `ENVIRONMENT` | `development` / `production` |
| `DOMAIN` | Dominio del despliegue |
| `SSL_ENABLED` | Activa TLS en el gateway |
| `CORE_PORT` | Puerto del core (8000) |
| `ADMIN_OS_PORT` | Puerto de admin-os (3000) |
| `VISITOR_PORT` | Puerto de visitor-web (8080) |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | Credenciales de PostgreSQL |
| `DATABASE_URL` | Cadena de conexión (usada por nodo-cero) |
| `NODO_ID` | Identificador del nodo territorial |
| `VITE_SUPABASE_URL` | URL del proyecto Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Anon/publishable key de Supabase |
| `BASE_URL` / `API_URL` | URLs base del stack |

> **Nunca** se commitean credenciales reales. Los `.env` del stack contienen solo configuración; los secretos van en variables de entorno del host o del proveedor.

---

## Despliegue

Hay dos modos:

- **`docker-compose.yml`** — desarrollo local (puertos individuales expuestos + gateway en `:80`).
- **`docker-compose.prod.yml`** — producción (gateway `:80` + `:443` con certificados en `gateway/ssl/visitarealdelmonte.online/` y volumes para certbot).

Para producción:

```bash
cd rdm-stack
cp .env.production .env.production.local   # valores reales
docker compose -f docker-compose.prod.yml up -d --build
```

Antes de declarar producción:

- [ ] `npm ci` funciona desde un clon limpio en cada repo
- [ ] `npm run quality` + `npm run build` terminan correctamente
- [ ] Variables de producción validadas y rotadas
- [ ] Migraciones aplicadas y comprobadas
- [ ] Backups probados y restauración verificada
- [ ] Dominio con HTTPS (certbot)
- [ ] Logs y monitoreo de errores

---

## Operación (Makefile)

```bash
cd rdm-stack
make up          # levanta el stack
make down        # detiene el stack
make ps          # estado de servicios
make health      # healthcheck del gateway
make logs        # logs en vivo
make backup-prod # dump de PostgreSQL (pg_dump)
make restore-prod # restaura un dump (psql)
```

---

## Ruta de evolución

1. **Fase A — Infraestructura** ✅ Docker correcto, gateway a la API real, Postgres, seguridad básica.
2. **Fase B — Core real** en `services/core` (motor TAMV / Isabella / Guardian).
3. **Fase C — Visitor-web consolidado** como interfaz pública estable.
4. **Fase D — Admin-os limpio** (Kernel TAMV OS, economía, observabilidad).
5. **Fase E — Nodo-cero a producción** territorial.
6. **Fase F — Coherencia del ecosistema.**

---

## Seguridad

- Validación de entrada con esquemas (zod) en los límites.
- Autorización por usuario/rol/scope; route-guard único en la API de nodo-cero.
- Secretos fuera de control de versiones (`.env` saneado).
- Healthchecks y rate limiting en endpoints expuestos.
- Cabeceras HTTP de seguridad en el gateway.
- No declarar como operativos módulos sin: implementación revisable, pruebas reproducibles, configuración activa en producción y monitoreo.

Reporta vulnerabilidades a `security@visitarealdelmonte.online` (no en issues públicos).

---

## Repositorios

| Repo | Rama | Último commit (local) |
|---|---|---|
| [nodo-genesis](https://github.com/OsoPanda1/nodo-genesis) (raíz) | `master` | `a2e17fc` |
| [tamv-core](https://github.com/TAMV-ONLINE-NET/tamv-core) | `main` | `1e819e3` |
| [visitarealdelmonte](https://github.com/OsoPanda1/visitarealdelmonte) | `main` | `525e814` |
| [rdm-smart-city-os](https://github.com/OsoPanda1/rdm-smart-city-os) | `main` | `2ae4743` |
| [nodo-cero](https://github.com/OsoPanda1/nodo-cero) | `main` | `d4b5e65` |

---

## Documentación

| Tema | Ubicación |
|---|---|
| Orquestación / compose | [`rdm-stack/docker-compose.yml`](rdm-stack/docker-compose.yml) |
| Gateway (dev / prod) | [`rdm-stack/gateway/nginx.conf`](rdm-stack/gateway/nginx.conf) · [`nginx.prod.conf`](rdm-stack/gateway/nginx.prod.conf) |
| Config de entorno | [`rdm-stack/.env.example`](rdm-stack/.env.example) |
| Scripts de operación | [`rdm-stack/Makefile`](rdm-stack/Makefile) · [`rdm-stack/deploy-prod.sh`](rdm-stack/deploy-prod.sh) |
| Nodo-cero (API territorial) | [`infrastructure/nodo-cero/README.md`](rdm-stack/infrastructure/nodo-cero/README.md) · [`AGENTS.md`](rdm-stack/infrastructure/nodo-cero/AGENTS.md) |
| Visitor-web | [`apps/visitor-web/README.md`](rdm-stack/apps/visitor-web/README.md) · [`docs/`](rdm-stack/apps/visitor-web/docs/) |
| Admin-os | [`apps/admin-os/README.md`](rdm-stack/apps/admin-os/README.md) |
| Core TAMV | [`services/core/README.md`](rdm-stack/services/core/README.md) |

---

## Licencia

La licencia aplicable debe estar definida explícitamente en el archivo `LICENSE`. Si se adopta la **CROWN Sovereign License**, el texto legal completo, versionado y revisable debe existir en el repositorio antes de usarla como condición de uso, redistribución o contribución.

---

<p align="center">
  <strong>RDM Sovereign Stack — Nodo Génesis</strong><br />
  Real del Monte, Hidalgo, México<br />
  Tecnología territorial, cultura viva y participación local.
</p>
