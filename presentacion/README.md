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
├── assets/       # Imágenes territoriales reales (webp optimizadas)
└── audio/        # Audio-guías (colocar ep01-cerro.mp3 y ep02-plata.mp3 aquí)
```

## Características

- **Pasaporte de identidad** (HUÉSPED / LOCAL·COMUNERO) con persistencia en `localStorage` — la misma idea de las dos capas del ecosistema.
- **Scroll-spy** nativo CSS con fallback JS.
- **Visualizadores de audio** con Web Audio API y canvas (waveforms en tiempo real).
- **Dashboard de telemetría** con animación de números vía Intersection Observer.
- **Galería asimétrica** editorial con imágenes reales del territorio.
- **Mapa minimalista** de Real del Monte embebido (OpenStreetMap en escala de grises).
- Lazy loading de imágenes y performance optimizada.

## Uso

Abrir `index.html` directamente en el navegador o servir la carpeta con cualquier estático:

```bash
python -m http.server 8080 --directory presentacion
```

> Nota: los audios (`audio/ep01-cerro.mp3`, `audio/ep02-plata.mp3`) son de ejemplo; coloca los archivos reales en `audio/` cuando estén disponibles.
