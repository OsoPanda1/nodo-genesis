# Runbook de Emergencia — YUN BE (Bastión de Continuidad)

Guía operativa para los estados del bastión. Complementa el plan de continuidad
(`docs/continuity-plan.md`) y el protocolo de reconciliación
(`docs/reconciliation-protocol.md`).

## Detección de señales

| Señal | Fuente | Significado |
| --- | --- | --- |
| `healthcheck` | 2 vantage points del monitor | El primario no responde health checks. |
| `heartbeat` | Heartbeats firmados del primario | Ausencia de latido firmado. |
| `lease` | Lease del plano de control | El primario no renueva su lease de líder. |
| `dependency` | Errores sostenidos de dependencias | DB, Redis o proveedores caídos de forma sostenida. |
| `operator` | Confirmación manual MFA | Operador declara fallo (nunca es la única señal). |

**Regla**: el quórum de promoción exige **2 fuentes independientes** dentro de
una ventana de 90 s. Una única señal solo lleva a `SUSPECT` (observación).

## Ciclo de vida de un incidente

```text
DORMANT ──(≥2 señales)──► SUSPECT ──(quórum)──► ISOLATED ──(promoción)──► ACTIVE_ISLAND
                                                                                │
DORMANT ◄─(cierre aprobado)── RECONCILING ◄─(primario recuperado)── RECOVERY_PENDING
```

### 1. SOSPECHA — no actuar aún

- [ ] Verificar que haya ≥2 fuentes independientes (`GET /api/continuity/status`
      → `sentinel.independentSources`).
- [ ] Confirmar si el lease del primario sigue activo. Si está activo, **no**
      promover.
- [ ] Revisar si es una excepción aislada (deploy en curso, reinicio breve).
- [ ] Si se resuelve solo: volver a `DORMANT` y documentar.

### 2. AISLAR EL PRIMARIO (si la sospecha persiste)

```bash
curl -X POST https://<nodo>/api/continuity/isolate-primary \
  -H "x-rdm-api-key: <CROWN_API_KEY>" \
  -H "x-rdm-nonce: <nonce-unico>" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Sin heartbeat 90s y lease expirado"}'
```

El primario queda en `ISOLATED`: no acepta escrituras no esenciales.

### 3. PROMOVER EL BASTIÓN (solo con quórum + lease expirado + READY)

```bash
curl -X POST https://<nodo>/api/continuity/activate \
  -H "x-rdm-api-key: <CROWN_API_KEY>" \
  -H "x-rdm-nonce: <nonce-unico>" \
  -H "Content-Type: application/json" \
  -d '{"operatorConfirmed": true}'
```

- La respuesta incluye el **fencing token** de la época nueva. Guárdalo: los
  escritores del primario antiguo quedan inválidos con él.
- Si responde `ok:false`, lee `error` (quórum / lease / READY) y corrige antes
  de reintentar.

### 4. OPERAR EN ISLA

- Las disposiciones en `ACTIVE_ISLAND` son **fail-closed**:
  - `QUEUED`: `commerce.order.requested`, `knowledge.cell.proposed`,
    `federation.state.change.requested`.
  - `DENIED`: `policy.changed`, `identity.role.changed`,
    `identity.privilege.granted`, `payment.executed`, `payout.executed`,
    `deployment.started`, `migration.applied`, y todo lo clasificado
    `RESTRICTED`/`SOVEREIGN`.
- Las intenciones encoladas se registran en el outbox
  (`GET /api/continuity/journal`).

### 5. RECUPERACIÓN — validar antes de reconciliar

- [ ] El primario responde desde ≥2 puntos independientes.
- [ ] El lease puede renovarse con normalidad.
- [ ] No hay alertas activas de dependencias críticas.
- [ ] El reloj del primario está sincronizado (NTP).

### 6. RECONCILIAR (nunca automático)

Ejecuta el protocolo de 8 pasos (`docs/reconciliation-protocol.md`). Cierra con
**aprobación dual**: una persona de operación y una de seguridad.

```bash
curl -X POST https://<nodo>/api/continuity/reconcile \
  -H "x-rdm-api-key: <CROWN_API_KEY>" \
  -H "x-rdm-nonce: <nonce-unico>" \
  -H "Content-Type: application/json" \
  -d '{
    "primaryRecovered": true,
    "dualApproval": true,
    "replayReceipts": [
      {"idempotencyKey": "<ik>", "status": "APPLIED"}
    ]
  }'
```

- `closed:false` + `requiresDualApproval:true` → hay conflictos; resolverlos por
  compensación o HITL, **no** por last-write-wins.

## Referencia rápida de la API

| Acción | Ruta | Notas |
| --- | --- | --- |
| Estado | `GET /api/continuity/status` | Lectura pública con rate limit. |
| Journal | `GET /api/continuity/journal` | Exige `CROWN_API_KEY`. |
| Aislar | `POST /api/continuity/isolate-primary` | Exige `CROWN_API_KEY` + nonce. |
| Promover | `POST /api/continuity/activate` | Exige `CROWN_API_KEY` + nonce. |
| Reconciliar | `POST /api/continuity/reconcile` | Exige `CROWN_API_KEY` + nonce. |
| Intenciones | `POST /api/intentions` | Sin clave interna (rate limit). |
