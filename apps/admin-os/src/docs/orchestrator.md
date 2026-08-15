# Orchestrator

- `ExperienceOrchestrator` decide cuándo emitir señales territoriales.
- Inyección de `Clock`, `ScoringEngine`, `EventBus` para pruebas determinísticas.
- Throttle por turista vía `allowExecution` al inicio de evaluación.
- Persistencia de última decisión en `decision.store.ts` para consumo por UI/APIs.
