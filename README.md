# 🏛️ RDM Digital Hub — Nodo Cero

> Sistema Operativo Territorial para turismo, patrimonio, participación comunitaria y servicios digitales locales en Real del Monte, Hidalgo, México.

[![Estado](https://img.shields.io/badge/estado-en%20desarrollo-F59E0B?style=flat-square)](#estado-del-proyecto)
[![Next.js](https://img.shields.io/badge/Next.js-App%20Router-000000?style=flat-square&logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Licencia](https://img.shields.io/badge/licencia-CROWN%20Sovereign-8B1E3F?style=flat-square)](#licencia)
[![Sitio](https://img.shields.io/badge/sitio-visitarealdelmonte.online-0F766E?style=flat-square)](https://www.visitarealdelmonte.online)
[![Vitest](https://img.shields.io/badge/tests-Vitest-6E9F18?style=flat-square&logo=vitest&logoColor=white)](https://vitest.dev/)
[![Repositorio](https://img.shields.io/badge/GitHub-OsoPanda1%2Fnodo--cero-181717?style=flat-square&logo=github)](https://github.com/OsoPanda1/nodo-cero)

---

**Nodo Cero** es el nodo inicial de una plataforma territorial orientada a fortalecer la identidad cultural, la economía local y la gestión digital de Real del Monte. Su arquitectura prioriza modularidad, trazabilidad, seguridad y evolución gradual hacia una red federada de territorios.

---

> Plataforma digital territorial para turismo, patrimonio cultural, economía local y participación comunitaria en Real del Monte, Hidalgo, México.


**Nodo Cero** es una plataforma territorial en desarrollo para visibilizar el patrimonio, las experiencias turísticas, la gastronomía, los negocios locales y las iniciativas comunitarias de Real del Monte.

Su diseño técnico plantea módulos independientes para turismo, comercio local, gamificación, cartografía, gestión territorial, identidad y conocimiento. Los módulos avanzados se encuentran en distintas etapas de implementación y no deben considerarse disponibles en producción salvo que se indique expresamente.

- 🌐 Sitio: [visitarealdelmonte.online](https://www.visitarealdelmonte.online)
- 🐙 Repositorio: [github.com/OsoPanda1/nodo-cero](https://github.com/OsoPanda1/nodo-cero)
- 📚 Documentación técnica: [`/docs`](./docs)
- 📍 Territorio: Real del Monte, Hidalgo, México

---

## Contenido

- [Propósito](#propósito)
- [Estado real del proyecto](#estado-real-del-proyecto)
- [Ámbitos funcionales](#ámbitos-funcionales)
- [Arquitectura](#arquitectura)
- [Stack tecnológico](#stack-tecnológico)
- [Inicio rápido](#inicio-rápido)
- [Variables de entorno](#variables-de-entorno)
- [Calidad local](#calidad-local)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Despliegue](#despliegue)
- [Seguridad](#seguridad)
- [Contribución](#contribución)
- [Reporte de vulnerabilidades](#reporte-de-vulnerabilidades)
- [Documentación](#documentación)
- [Licencia](#licencia)
- [Contacto](#contacto)

---

## Propósito

Nodo Cero busca construir una presencia digital territorial que conecte cuatro dimensiones:

- **Turismo y patrimonio:** lugares, rutas, historia, gastronomía, leyendas y experiencias.
- **Economía local:** directorio y visibilidad para negocios, servicios, artesanos y anfitriones.
- **Participación comunitaria:** retos, reconocimientos, contenido local y mecanismos de interacción.
- **Capacidades territoriales:** bases técnicas para mapas, datos, incidentes, activos e integración gradual de servicios.

La plataforma adopta una arquitectura modular para que cada dominio pueda evolucionar sin acoplar innecesariamente la interfaz, la lógica de negocio, los contratos de datos y los mecanismos de persistencia.

---

## Estado real del proyecto

> **Estado general: desarrollo activo. No se declara listo para producción integral.**

El repositorio contiene una aplicación Next.js con componentes, dominios, scripts internos, pruebas y configuraciones de persistencia. Sin embargo, la disponibilidad productiva de cada módulo depende de que cuente con implementación funcional, pruebas reproducibles, configuración segura, monitoreo y proceso de despliegue verificable.

### Base existente

- Estructura de aplicación con Next.js y App Router.
- Componentes de interfaz, layouts y módulos visuales.
- Código organizado por dominios en `lib/`.
- Scripts internos de auditoría, validación de entorno y revisión de contratos.
- Configuración de TypeScript, ESLint y Vitest.
- Integraciones y dependencias para PostgreSQL, Prisma, Supabase y Redis.
- Dependencias para mapas, visualización 3D, gráficas y formularios.
- Configuración inicial de Vercel.

### En desarrollo

- Experiencias turísticas y contenidos territoriales.
- Mapas, puntos de interés y visualización geográfica.
- Directorio o marketplace de negocios locales.
- Flujos de gamificación, puntos, retos y reconocimientos.
- APIs por dominio y persistencia de información.
- Cobertura de pruebas funcionales e integración.
- Consolidación de modelos de datos y migraciones.

### Planeado o sujeto a validación

- Asistente cognitivo Isabella.
- Centro de operaciones territorial.
- Gemelo digital e integraciones de sensores.
- Federación de nodos mediante CITEMESH.
- Grafo de conocimiento e integridad mediante GEMET.
- Continuidad operativa, recuperación y reconciliación.
- Pagos, identidad avanzada y mecanismos de credenciales.

> No se deben presentar los módulos planeados como servicios disponibles, auditados o desplegados hasta contar con evidencia técnica verificable.

---

## Ámbitos funcionales

| Dominio | Propósito | Situación |
|---|---|---|
| Turismo y patrimonio | Lugares, historias, rutas, gastronomía y cultura local | En desarrollo |
| Mapas y geografía | Puntos de interés, rutas y exploración del territorio | En desarrollo |
| Marketplace | Directorio y futura conexión entre negocios locales y visitantes | En desarrollo |
| Gamificación | Retos, puntos, badges y participación territorial | En desarrollo |
| Isabella | Interfaz y lógica para asistente cognitivo contextual | Diseño e integración gradual |
| Ciudad | Bases para incidentes, servicios y visualización operativa | Diseño / desarrollo parcial |
| Gemelo territorial | Modelado de activos, lugares y datos territoriales | Diseño / desarrollo parcial |
| Identidad | Acceso, autorización y credenciales por alcance | Diseño e implementación gradual |
| CITEMESH | Comunicación y federación entre nodos | Investigación y diseño |
| GEMET | Integridad, conocimiento y trazabilidad de registros | Investigación y diseño |
| Continuidad | Journal, respaldo, recuperación y reconciliación | Diseño inicial |

---

## Arquitectura

La aplicación separa la experiencia de usuario, las rutas HTTP, la lógica de dominio y los componentes transversales.

```text
┌───────────────────────────────────────────────────────────┐
│ Experiencia                                               │
│ Next.js · React · Tailwind · Componentes · Planos UX      │
├───────────────────────────────────────────────────────────┤
│ Aplicación y API                                          │
│ Route Handlers · Validación · Contratos · Respuestas HTTP │
├───────────────────────────────────────────────────────────┤
│ Dominios                                                  │
│ Turismo · Ciudad · Marketplace · Gamificación · Isabella  │
├───────────────────────────────────────────────────────────┤
│ Núcleo transversal                                        │
│ Configuración · Eventos · Seguridad · Utilidades          │
├───────────────────────────────────────────────────────────┤
│ Datos e integraciones                                     │
│ PostgreSQL ·Prisma · Supabase · Redis · Servicios externos│
└───────────────────────────────────────────────────────────┘
```

### Principios técnicos

- **Separación por dominios:** cada módulo define responsabilidades y contratos claros.
- **Validación en los límites:** uso de esquemas para datos de entrada, salida y configuración.
- **Tipado estricto:** TypeScript como base de seguridad y mantenibilidad.
- **Interfaces reutilizables:** componentes y patrones visuales compartidos.
- **Evolución incremental:** capacidades críticas solo se habilitan tras pruebas, revisión y operación verificable.
- **Seguridad por diseño:** autenticación, autorización, validación y protección de secretos deben centralizarse.

---

## Stack tecnológico

| Capa | Tecnologías presentes |
|---|---|
| Framework web | Next.js 16 con App Router |
| Interfaz | React 19 y TypeScript 5.9 |
| Estilos | Tailwind CSS 4, CVA, `clsx`, `tailwind-merge` |
| Formularios | React Hook Form y resolvers |
| Validación | Zod |
| Persistencia | PostgreSQL, Prisma y Supabase |
| Caché / datos rápidos | Upstash Redis |
| Cartografía | Leaflet |
| 3D | Three.js, React Three Fiber y Drei |
| Visualización | Recharts |
| Pruebas | Vitest |
| Calidad | ESLint, TypeScript y scripts internos |
| Analítica | Vercel Analytics |
| Despliegue | Configuración inicial para Vercel |

Las versiones exactas están definidas en [`package.json`](./package.json).

---

## Inicio rápido

### Requisitos

- Node.js 20 o superior.
- npm 10 o superior.
- Git.
- Acceso a las variables de entorno necesarias, si se usan integraciones externas.

### Clonar e instalar

```bash
git clone https://github.com/OsoPanda1/nodo-cero.git
cd nodo-cero
npm install
```

> Si la instalación requiere `--legacy-peer-deps`, resuelve la incompatibilidad de dependencias antes de considerar un despliegue de producción. Para builds reproducibles, el objetivo es utilizar `npm ci` con un `package-lock.json` sano.

### Configurar entorno

```bash
cp .env.example .env.local
```

Edita `.env.local` con las credenciales y URLs requeridas por tu entorno local.

### Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

### Build local

```bash
npm run build
npm run start
```

---

## Variables de entorno

Las variables de entorno deben validarse antes de iniciar servicios dependientes de datos, autenticación, caché o APIs externas.

Buenas prácticas:

- Mantén `.env.local` fuera del control de versiones.
- Nunca expongas secretos en variables con prefijo `NEXT_PUBLIC_`.
- Usa valores distintos para desarrollo, preview, staging y producción.
- Rota credenciales cuando exista sospecha de exposición.
- Documenta cada variable en `.env.example` sin incluir valores reales.
- Ejecuta la validación del proyecto antes de desplegar:

```bash
npm run check:env
```

---

## Calidad local

El repositorio incluye scripts para validar diferentes aspectos del proyecto.

```bash
# Auditoría de consistencia interna
npm run audit

# Validación de variables de entorno
npm run check:env

# Revisión de contratos y route guards
npm run check:contracts

# Lint
npm run lint

# Verificación de tipos
npx tsc --noEmit

# Pruebas
npm test

# Suite local completa
npm run quality

# Build de producción
npm run build
```

Antes de abrir un pull request, ejecuta:

```bash
npm run quality
npm run build
```

> La validación local no sustituye una integración continua. Antes de declarar producción, estos comandos deben ejecutarse automáticamente en cada pull request y antes de cualquier despliegue a `main`.

---

## Estructura del repositorio

```text
app/
├── api/                        # Rutas HTTP y recursos de aplicación
├── (planos)/                   # Experiencias y secciones principales
├── globals.css                 # Estilos globales
└── layout.tsx                  # Layout raíz

components/
├── design-system/              # Componentes reutilizables
├── layout/                     # Navegación y estructura visual
├── hero/                       # Secciones de presentación
├── tourism/                    # Turismo y patrimonio
├── marketplace/                # Negocios y comercio local
├── gamification/               # Retos, puntos y badges
├── isabella/                   # Interfaz del asistente
├── map/                        # Mapas y geografía
├── twins/                      # Visualización territorial
└── city/                       # Experiencias urbanas y operativas

lib/
├── core/                       # Entorno, eventos, contratos y utilidades
├── security/                   # Seguridad, confianza e identidad
├── isabella/                   # Lógica del asistente
├── tourism/                    # Dominio turístico
├── city/                       # Dominio territorial y urbano
├── twins/                      # Gemelo territorial
├── marketplace/                # Dominio comercial
├── gamification/               # Dominio de participación
├── citemesh/                   # Federación de nodos
├── gemet/                      # Conocimiento e integridad
├── continuity/                 # Continuidad operativa
└── archive/                    # Archivo y preservación

db/                             # Acceso, esquemas o utilidades de datos
prisma/                         # Configuración y esquema Prisma
supabase/migrations/            # Migraciones de Supabase/PostgreSQL
scripts/                        # Automatización y verificaciones
tests/                          # Pruebas automatizadas
types/                          # Tipos compartidos
public/                         # Recursos estáticos
unity/                          # Recursos o integración Unity WebGL
docs/                           # Documentación técnica
```

> La coexistencia de `prisma/`, `db/` y `supabase/migrations/` requiere una estrategia explícita de migraciones y una fuente de verdad para el esquema de datos antes de operar con información de usuarios o transacciones.

---

## Despliegue

El repositorio incluye configuración inicial para Vercel. Antes de desplegar a un entorno público, verifica lo siguiente:

```text
[ ] npm ci funciona desde un clon limpio
[ ] npm run quality termina correctamente
[ ] npm run build termina correctamente
[ ] Las variables de producción están configuradas y validadas
[ ] Las migraciones de base de datos están aplicadas y comprobadas
[ ] Existen backups y se ha probado una restauración
[ ] El dominio usa HTTPS
[ ] Existen logs y monitoreo de errores
[ ] Hay una estrategia de rollback
[ ] Se validaron rutas públicas y manejo de errores
[ ] No se exponen secretos en cliente, repositorio o logs
```

### Estrategia recomendada

1. **Development:** ejecución local con datos de prueba.
2. **Preview:** despliegue automático por pull request.
3. **Staging:** entorno aislado con configuración equivalente a producción.
4. **Production:** despliegue desde `main` solo después de controles de calidad y revisión.

Para un lanzamiento inicial, limita el alcance a contenido turístico público, mapas y directorio informativo. No habilites pagos, datos sensibles, credenciales, APIs públicas, telemetría municipal o procesos automatizados críticos sin controles adicionales.

---

## Seguridad

Nodo Cero busca aplicar seguridad en capas, particularmente en módulos que manejan datos, identidad, automatización o integraciones externas.

Los controles esperados incluyen:

- Validación de entrada mediante esquemas.
- Autorización por usuario, rol o scope.
- Control de acceso a información por propiedad y contexto.
- Gestión segura de secretos mediante variables de entorno.
- Rate limiting en endpoints expuestos.
- Cabeceras HTTP de seguridad.
- Registro estructurado de errores y acciones críticas.
- Revisión de dependencias y análisis de vulnerabilidades.
- Pruebas de autorización y aislamiento de datos.
- Backups, restauración y procedimientos de rollback.

### Alcance de seguridad

No se deben declarar como operativos, auditados o resistentes a amenazas específicas los mecanismos que no cuenten con:

1. Implementación revisable.
2. Pruebas automatizadas y reproducibles.
3. Configuración activa en el entorno de producción.
4. Documentación técnica y operativa.
5. Evidencia de monitoreo y respuesta a incidentes.

---

## Contribución

Las contribuciones son bienvenidas en áreas como:

- Contenido cultural e histórico verificable.
- Accesibilidad y experiencia de usuario.
- Pruebas automatizadas.
- Componentes de interfaz.
- Cartografía y datos abiertos.
- Rendimiento web.
- Documentación técnica.
- Seguridad y observabilidad.

### Flujo de trabajo

```bash
# 1. Haz un fork y clona tu copia
git clone https://github.com/TU_USUARIO/nodo-cero.git

# 2. Crea una rama descriptiva
git checkout -b feature/nombre-descriptivo

# 3. Instala dependencias
npm install

# 4. Ejecuta validaciones
npm run quality
npm run build
```

Después:

1. Describe el objetivo y alcance del cambio.
2. Incluye pruebas cuando modifiques lógica de negocio.
3. Mantén los cambios acotados y documentados.
4. No incluyas secretos, archivos `.env` ni credenciales.
5. Abre un pull request con evidencia de validación.

Consulta [`AGENTS.md`](./AGENTS.md), si está disponible, y los documentos en [`/docs`](./docs).

---

## Reporte de vulnerabilidades

**No publiques vulnerabilidades, secretos, tokens ni detalles explotables en issues públicos.**

Reporta vulnerabilidades de manera responsable a:

```text
security@visitarealdelmonte.online
```

Incluye:

- Descripción del problema.
- Componente, ruta o versión afectada.
- Pasos para reproducir.
- Impacto potencial.
- Evidencia mínima necesaria.
- Sugerencia de mitigación, si existe.

---

## Documentación

| Documento | Ubicación |
|---|---|
| Arquitectura | [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) |
| Guía de desarrollo | [`docs/guia-desarrollador.md`](./docs/guia-desarrollador.md) |
| Guía de modularización | [`docs/guia-modularizacion.md`](./docs/guia-modularizacion.md) |
| Decisiones arquitectónicas | [`docs/`](./docs) |
| Contratos API | [`docs/openapi-yun.yaml`](./docs/openapi-yun.yaml) |
| Gobernanza / RFC | [`RFC-0001.md`](./RFC-0001.md) |

Elimina o corrige cualquier enlace que no exista aún en el repositorio.

---

## Licencia

La licencia aplicable debe estar definida de forma explícita en el archivo [`LICENSE`](./LICENSE).

Si se adopta la **CROWN Sovereign License**, el texto legal completo, versionado y revisable debe existir en el repositorio antes de utilizarla como condición de uso, redistribución o contribución.

---

## Contacto

- Sitio web: [visitarealdelmonte.online](https://www.visitarealdelmonte.online)
- Repositorio: [github.com/OsoPanda1/nodo-cero](https://github.com/OsoPanda1/nodo-cero)
- Contacto general: `contacto@visitarealdelmonte.online`
- Seguridad: `security@visitarealdelmonte.online`

---

<p align="center">
  <strong>Nodo Cero</strong><br />
  Real del Monte, Hidalgo, México<br />
  Tecnología territorial, cultura viva y participación local.
</p>
