# RDM Digital Hub — Presentación (Primera Capa)

> Capa de presentación editorial del Ecosistema Territorial SOBERANO de Real del Monte, Hidalgo, México.

## Qué es

Esta es la **primera capa de presentación** del proyecto: una landing editorial de alto diseño (ultra-minimalismo / brutalismo sofisticado) que muestra la visión del ecosistema antes de entrar a la plataforma funcional.

Actúa como **primer plano**; las capas posteriores (turismo, gobernanza, economía, observabilidad) viven en los módulos del stack:

1. **Presentación** ← esta capa
2. **visitor-web** — interfaz pública de turismo, cultura y comunidad
3. **admin-os** — gestión y operación territorial (Kernel TAMV OS)
4. **nodo-cero** — Sistema Operativo Territorial (API real, 97 rutas)
5. **core** — motor TAMV (contratos zod, eventos, BookPI)

## Estructura

```
presentacion/
├── index.html    # Página editorial (hero, galería, audio, mapa, dashboard, contacto)
├── styles.css    # Estilo de alta gama (alabastro + obsidiana + oro viejo)
├── app.js        # Pasaporte de identidad, visualizadores de audio, dashboard animado
├── assets/       # Imágenes territoriales reales (5 escenas)
└── audio/        # Audio-guías (colocar ep01-cerro.mp3 y ep02-plata.mp3 aquí)
```

> Rutas de recursos **relativas** (`assets/…`, `audio/…`): la página funciona
> abierta con `file://`, servida en la raíz o bajo una subruta.

## Características

- **Pasaporte de identidad** (Huésped / Local·Comunero) con persistencia tolerante a fallos en `localStorage` — la misma idea de las dos capas del ecosistema.
- **Scroll-spy** con `IntersectionObserver` que resalta la sección activa en la navegación.
- **Navegación móvil** con menú accesible (toggle con `aria-expanded`, cierre con `Escape`).
- **Visualizadores de audio** con Web Audio API y canvas, tolerantes a fallos (fallback claro cuando el audio no está disponible).
- **Panel de indicadores** con animación de números (easing) vía `IntersectionObserver`, etiquetado honestamente como datos de demostración.
- **Galería asimétrica** editorial con las cinco escenas reales del territorio.
- **Mapa minimalista** de Real del Monte embebido (OpenStreetMap en escala de grises).
- **Accesibilidad**: skip-link, foco visible, etiquetas de formulario, roles ARIA y respeto a `prefers-reduced-motion`.
- Tipografía de dos familias (Fraunces editorial + Plus Jakarta Sans) y lazy loading de imágenes.

## Uso

Abrir `index.html` directamente en el navegador o servir la carpeta con cualquier estático:

```bash
python -m http.server 8080 --directory presentacion
```

> Nota: los audios (`audio/ep01-cerro.mp3`, `audio/ep02-plata.mp3`) son de ejemplo; coloca los archivos reales en `audio/` cuando estén disponibles.
