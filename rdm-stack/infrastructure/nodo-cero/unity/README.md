# RDM Arena — Zombies RDM Invasion (Unity)

Referencia de Unity WebGL para las visualizaciones 3D de la gamificación
del **RDM Digital Hub (Nodo Cero)**. El juego en 3D se compila a WebGL y se
sirve desde Next.js; mientras el build no esté publicado, la interfaz web
degrada automáticamente al motor 2D del navegador.

## Estructura

```
unity/
├── Assets/
│   ├── Editor/
│   │   ├── RDMArenaSceneSetup.cs   # genera la escena base (Tools > RDM > Create Arena Scene)
│   │   └── RDMWebGLBuilder.cs      # build WebGL (Tools > RDM > Build WebGL Arena)
│   ├── Plugins/WebGL/
│   │   └── RDMWebGL.jslib          # puente nativo C# ↔ host web (window.rdmUnityBridge)
│   ├── Scenes/                     # RDMArena.unity (se genera con el menú)
│   ├── Scripts/
│   │   ├── AntiCheat/              # integridad de cliente, movimiento, sesión
│   │   ├── GameCore/               # GameManager, ScoreClient, PlayerController, WaveManager, WebGLBridge, RDMArenaBootstrap
│   │   ├── Networking/             # AuthClient, SecureApiClient
│   │   ├── UI/                     # HUD, leaderboard, pausa, ajustes
│   │   └── Zombies/                # AI, spawner, config, salud
│   └── WebGLTemplates/RDM/         # plantilla con el puente al host
├── Packages/manifest.json
└── ProjectSettings/ProjectVersion.txt
```

## Flujo para publicar la arena 3D

1. Abre el proyecto `unity/` en Unity **2022.3 LTS** (WebGL habilitado).
2. `Tools > RDM > Create Arena Scene` — crea `Assets/Scenes/RDMArena.unity`.
   El `RDMArenaBootstrap` construye la jerarquía mínima en tiempo de
   ejecución (jugador, oleadas, spawner, sesión, bridge).
3. `Tools > RDM > Build WebGL Arena` — compila en `unity/Builds/WebGL/RDMArena`.
4. Copia el contenido del build a `public/unity/RDMArena/` del proyecto Next.js:
   - `RDMArena.loader.js`, `RDMArena.framework.js`, `RDMArena.data`,
     `RDMArena.wasm` y `StreamingAssets/`.
5. Verifica en `http://localhost:3000/#/gamificacion` → pestaña **Arena 3D**.

## Puente con el host (Next.js)

- **Unity → Web**: `WebGLBridge` emite eventos JSON (`session-started`,
  `kill`, `wave`, `combo`, `game-over`) a `window.rdmUnityBridge`.
- **Web → Unity**: el hook `hooks/use-unity-webgl.ts` expone `sendMessage`
  sobre los métodos públicos de `WebGLBridge` (`ConnectHost`, `PauseGame`,
  `EndSession`, `ResetArena`).
- **Sesión compartida**: la sesión server-authoritative la emite el backend
  (`/api/gamification/session`) y se entrega al motor con `ConnectHost`. El
  cliente nunca decide puntos finales: cada evento va firmado con
  `sessionId + token`.

## Anti-cheat

Los eventos del juego incluyen `sessionId`, `token` y `timestamp`; el
servidor valida coherencia (movimiento, cadencia de oleadas, límites de
puntos por sesión) antes de otorgar puntos. Ver `Assets/Scripts/AntiCheat/`.

## Notas

- `Builds/` y `Library/` están en `.gitignore`: el build WebGL no se
  versiona, se genera con Unity.
- La versión objetivo del editor es `2022.3 LTS` (ver `ProjectVersion.txt`).
