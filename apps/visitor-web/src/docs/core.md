# Core (GEN-7)

- `geo/`: utilidades geoespaciales endurecidas (`withinBBox`, `fastDistance`, `LRUCache` TTL, `LinearSpatialIndex`).
- `behavior/`: filtro de movimiento EMA (`MovementFilter`), detector de patrón (`EXPLORING`, `EXITING`, `IDLE`) y `kalman-lite` de interfaz futura.
- `engine/`: scoring reproducible basado en reglas desacopladas (`ScoreRule`).
