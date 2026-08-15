# Plan de Continuidad — Nodo Cero (YUN BE)

Alcance, arquitectura, responsabilidades y simulacros del Bastión de Emergencia.
Documentos relacionados: `docs/emergency-runbook.md`,
`docs/reconciliation-protocol.md`, `docs/rto-rpo-matrix.md`, ADR-0004.

## 1. Alcance

El plan cubre la **continuidad de las funciones constitucionales** del Nodo Cero
cuando el primario no puede responder: identidad de sesión, decisiones críticas,
integridad de eventos y recuperación ordenada. **No** reemplaza la plataforma en
tiempo real: YUN BE degrada o deniega antes que simular normalidad.

## 2. Arquitectura

```text
                ┌────────────────────────────────────────────┐
                │              PRIMARIO (Nodo Cero)           │
                └────────────────────────────────────────────┘
                                ▲ heartbeats firmados
                                │ lease de líder
                ┌───────────────┴────────────────────────────┐
                │              YUN BE (Bastión)              │
                │  sentinel · lease/fencing · journal ·      │
                │  outbox · máquina de estados · recovery    │
                └────────────────────────────────────────────┘
                                ▲ intenciones
                                │ recibos (replay idempotente)
```

Componentes (todos en `lib/continuity/`):

- **Máquina de estados** — `DORMANT → READY → SUSPECT → ISOLATED →
  ACTIVE_ISLAND → RECOVERY_PENDING → RECONCILING → DORMANT`.
- **Sentinel** — quórum de ≥2 señales independientes (ventana 90 s).
- **Lease + fencing** — época creciente; escritores antiguos inválidos.
- **Journal** — append-only, hash-chain SHA-256, idempotente.
- **Outbox** — intenciones idempotentes para reconciliar.
- **Recovery** — protocolo de 8 pasos con aprobación dual.

## 3. Responsabilidades

| Rol | Responsabilidad |
| --- | --- |
| Sentinel | Detectar señales de fallo y mantener quórum. |
| Lease manager | Emitir épocas y fencing tokens; invalidar primarios antiguos. |
| Journal | Preservar toda intención aceptada/denegada con integridad. |
| Continuity guard | Aplicar disposiciones fail-closed por modo y clasificación. |
| Recovery orchestrator | Ejecutar el protocolo de 8 pasos y emitir el reporte. |
| Operador + Seguridad | Aprobación dual para cerrar incidentes. |

## 4. Dependencias del entorno

| Variable | Uso |
| --- | --- |
| `CROWN_API_KEY` | Autentica rutas de operación (`activate`, `isolate-primary`, `reconcile`, `journal`). |
| `CROWN_EMERGENCY_KEY` | Llave de emergencia CROWN (arm/disarm del dead-man-switch). |
| `CROWN_HEARTBEAT_TTL_MS` | TTL del latido CROWN. |
| `BUILD_SEAL_KEY` | Sello de integridad del build (anti-tampering del bundle). |

## 5. Umbrales por defecto

| Parámetro | Valor | Dónde |
| --- | --- | --- |
| Ventana de señales | 90 s | `sentinel.ts` |
| Quórum de promoción | 2 fuentes | `sentinel.ts` |
| Lease del primario | 60 s | `lease-manager.ts` |
| Tamaño máximo de nonces | 20k, TTL 5 min | `lib/security/nonce.ts` |

## 6. Simulacros

Ver `docs/rto-rpo-matrix.md` §5. Al menos uno por trimestre con acta y
evidencia del journal.

## 7. Limitaciones

- Journal y outbox son **en memoria**: para producción deben persistirse en
  almacenamiento WORM y firmarse checkpoints con clave fuera del nodo.
- La aprobación dual es una convención de operación: en producción debe
  respaldarse con MFA y un canal de registro externo.
