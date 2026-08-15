# Arena 3D Unity (build WebGL publicado)

Esta carpeta recibe el **build WebGL** de `unity/Builds/WebGL/RDMArena`
compilado desde el proyecto `unity/`:

1. Abre `unity/` en Unity 2022.3 LTS.
2. `Tools > RDM > Build WebGL Arena`.
3. Copia aquí el contenido generado:
   - `RDMArena.loader.js`
   - `RDMArena.framework.js`
   - `RDMArena.data`
   - `RDMArena.wasm`
   - `StreamingAssets/` (si existe)

El componente `UnityInvasion3D` detecta `RDMArena.loader.js`; si no está,
la página muestra automáticamente el motor 2D de emergencia. Detalles en
`unity/README.md`.
