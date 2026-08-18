# video-animacion — Sprites animados de Zombies RDM Invasion

Carpeta del pipeline visual del juego **Zombies RDM Invasion** (sección `components/gamification/`).

## Convención

- **Formato:** MP4, **3–5 segundos**, con **fondo transparente** (códec alpha, e.g. ProRes 4444 / VP9 + alpha o H.265 + alpha).
- **Nombrado:** `zombie-<arquetipo>.mp4` (minúsculas, guiones).
  - `zombie-minero.mp4` — Caminero del Socavón / Barrenero / Pastelero
  - `zombie-espectro.mp4` — Custodio del Panteón Inglés / Cornish / Llorona
  - `zombie-jefe.mp4` — Polvorín del Monte / El Conde de Regla
- **Optimización:** transcodificar a ~512–1024px de ancho para que el bundle del hub siga liviano; usar un solo archivo por arquetipo.

## Cómo se integra

En `lib/data/zombies-data.ts`, cada arquetipo (`ZombieArchetype`) acepta `spriteVideo`:

```ts
{
  id: 'z-caminero',
  name: 'Caminero del Socavón',
  // ...
  spriteVideo: '/video-animacion/zombie-minero.mp4', // o la ruta pública que prefieras
}
```

El componente `components/gamification/ZombieSprite.tsx` detecta `spriteVideo` y lo reproduce
(`autoplay`, `loop`, `muted`, `playsInline`) sobre la arena de combate y el bestiario, con
`drop-shadow` del color del arquetipo. Si el video no existe o falla la carga, se dibuja un
**sprite SVG procedural animado** como respaldo automático.

> Si prefieres servirlos desde la carpeta estática de Next (`public/`), copia los MP4 a
> `public/images/zombies/` y apunta `spriteVideo` a esa ruta; el mecanismo es idéntico.
