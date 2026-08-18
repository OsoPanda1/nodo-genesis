# Protocolo de Reconciliación — YUN BE

Documenta los 8 pasos obligatorios de la reconciliación tras un incidente de
continuidad. Implementado en `lib/continuity/recovery-orchestrator.ts` y
expuesto en `POST /api/continuity/reconcile`.

**Regla de oro**: la reconciliación **nunca se cierra automáticamente al primer
200 OK**. Cada paso produce evidencia verificable antes de pasar al siguiente.

## Los 8 pasos

### 1. Confirmar la recuperación del primario

- Health desde ≥2 vantage points independientes.
- Política vigente coincidente con la que operó el bastión.
- Reloj sincronizado (evita ventanas de replay/fencing).
- Sin alertas activas de dependencias críticas.
- El primario renueva su lease sin conflicto de época.

### 2. Mantener el bastión aislado

- No se aceptan cambios de alto impacto mientras se compara el estado.
- El primario queda en modo lectura/degradado hasta terminar.

### 3. Congelar el journal

- Se cierra el segmento de emergencia y se firma un checkpoint.
- Verificación de integridad de la hash-chain (`journalIntegrity()`). Si está
  rota: **intervención humana obligatoria**, no se reproduce nada.

### 4. Reproducir por idempotencia

- Cada intención se reenvía al primario con el **mismo**
  `idempotency_key`, `event_id`, `trace_id` y `fencing_epoch`.
- El primario responde con un recibo; el bastión **no** asume éxito.

### 5. Validar recibos

Recibos aceptados:

- `APPLIED` — operación aplicada por el primario.
- `DUPLICATE` — el primario ya la tenía (idempotencia funcionó).
- `REJECTED` — rechazada por política del primario.
- `CONFLICT` — el primario aplicó algo incompatible.

### 6. Resolver conflictos (nunca last-write-wins)

En identidad, pagos, créditos, permisos y decisiones constitucionales, el
conflicto se resuelve con **compensación** (transacción reversible) o
**aprobación humana (HITL)**. El bastión marca la intención como `CONFLICT` y
la deja sin resolver en el reporte.

### 7. Conciliar la evidencia

- Comparar hash-chain del journal, conteos, snapshots y recibos.
- Verificar que el outbox quedó vacío para las intenciones confirmadas.
- Generar el reporte `ReconciliationReport` (frozen segment, replayed,
  outcomes, unresolved, closed).

### 8. Cerrar el incidente con aprobación dual

- Dos aprobaciones independientes: una de **operación**, una de **seguridad**.
- Solo con `dualApproval` y sin `unresolved` se transita de `RECONCILING` a
  `DORMANT`.
- Queda constancia en el journal del cierre.

## Condiciones de no-cierre

| Condición | Acción |
| --- | --- |
| Primario no recuperado | No se inicia; se reporta `note`. |
| Hash-chain rota | HITL; no se reproduce. |
| Recibos pendientes (`PENDING`) | Permanecen en outbox. |
| Conflictos sin resolver | `requiresDualApproval: true`. |
| Sin aprobación dual | El incidente permanece `RECONCILING`. |

## Verificación automática

```bash
npm test -- tests/continuity.test.ts
```

Cubre: integridad de hash-chain, máquina de estados, quórum del sentinel,
lease/fencing, journal idempotente, disposiciones fail-closed, outbox y cierre
con aprobación dual.
