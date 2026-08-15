# Matriz RTO/RPO — Nodo Cero (YUN BE)

Define los objetivos de recuperación por dominio y la política de datos que el
bastión aplica durante un incidente. La política vigente vive en el runtime del
bastión (`policyVersion` / `policyDigest`) y el contrato de entorno valida las
variables de emergencia (`CROWN_EMERGENCY_KEY`, `CROWN_HEARTBEAT_TTL_MS`).

## Objetivos

| Dominio | RTO objetivo | RPO objetivo | Política de datos |
| --- | --- | --- | --- |
| Política constitucional | 5 min | 1 min | Replicada y firmada; cambios solo vía intenciones clasificadas. |
| Eventos (bus) | 5 min | 0–1 min | Journal hash-chain; replay por idempotencia. |
| Comercio | 30 min | 0 min (lógico) | Outbox de intenciones idempotentes; nunca last-write-wins. |
| Isabella (razonamiento) | 15 min | sin tool write | Modo local-solo-lectura; cero egress en lockdown. |

## Política de datos por modo

| Modo | Lectura | Escritura | Comercio | Isabella | Gamificación |
| --- | --- | --- | --- | --- | --- |
| `DORMANT` | sí | full | normal | full | full |
| `READY` | sí | full | normal | full | full |
| `SUSPECT` | sí | full (vigilado) | normal | full | full |
| `ISOLATED` | sí | queued | solo lectura | local-readonly | degraded |
| `ACTIVE_ISLAND` | sí | queued | solo intenciones | local-readonly | degraded |
| `RECOVERY_PENDING` | sí | queued | solo intenciones | local-readonly | degraded |
| `RECONCILING` | sí | queued | cerrado hasta cierre | local-readonly | degraded |

Las capacidades derivadas se exponen en `GET /api/continuity/status` →
`capabilities` y se computan en `lib/continuity/continuity-guard.ts`.

## Disposiciones en modo isla

| Evento | Disposición |
| --- | --- |
| `commerce.order.requested` | `QUEUED` |
| `knowledge.cell.proposed` | `QUEUED` |
| `federation.state.change.requested` | `QUEUED` |
| `policy.changed` | `DENIED` |
| `identity.role.changed` / `identity.privilege.granted` | `DENIED` |
| `payment.executed` / `payout.executed` | `DENIED` |
| `deployment.started` / `migration.applied` | `DENIED` |
| Cualquier evento `RESTRICTED`/`SOVEREIGN` | `DENIED` |
| Resto sin clasificar | `DENIED` (fail-closed) |

## Ejercicios (simulacros)

1. **Simulacro trimestral — fallo de proveedor**: retirar el health check del
   primario y verificar que el quórum NO se alcanza con una sola señal.
2. **Simulacro mensual — split-brain**: mantener el lease activo e intentar
   `activate`; debe fallar con `error: lease activo`.
3. **Simulacro de reconciliación**: generar intenciones `QUEUED` en isla,
   "recuperar" el primario y cerrar con recibos `APPLIED` + aprobación dual.
4. **Prueba de denegación**: en `ACTIVE_ISLAND` confirmar que
   `payment.executed` y las clasificaciones `RESTRICTED` se deniegan siempre.
