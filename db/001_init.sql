-- ==================================================================
-- YUN QUANTUM SEMANTIC CORE — Esquema de persistencia
-- ==================================================================
-- Espejo del blueprint `001_init.sql` del Quantum Semantic Core.
-- Requiere la extensión pgcrypto (uuid) y el esquema `yun`.
-- ==================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SCHEMA IF NOT EXISTS yun;

-- ------------------------------------------------------------------
-- Salud de la heptafederación (Fed1..Fed7)
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS yun.federation_health (
    federation_id  TEXT PRIMARY KEY,
    status         TEXT NOT NULL CHECK (status IN ('HEALTHY', 'DEGRADED', 'DOWN')),
    latency_ms     BIGINT,
    detail         TEXT,
    last_checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_yun_federation_health_status
    ON yun.federation_health (status);

-- ------------------------------------------------------------------
-- Eventos de dominio YUN (auditoría del Quantum Semantic Core)
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS yun.yun_events (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type    TEXT NOT NULL,
    source        TEXT NOT NULL,
    domain        TEXT NOT NULL DEFAULT 'yun',
    severity      TEXT NOT NULL DEFAULT 'info',
    trace_id      TEXT,
    correlation_id TEXT,
    federation_id TEXT,
    data          JSONB NOT NULL DEFAULT '{}'::jsonb,
    occurred_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_yun_events_type_occurred
    ON yun.yun_events (event_type, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_yun_events_trace
    ON yun.yun_events (trace_id);

-- ------------------------------------------------------------------
-- Auditoría semántica (sobres sellados / verificados)
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS yun.yun_semantic_audit (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id        TEXT NOT NULL,
    trace_id          TEXT NOT NULL,
    correlation_id    TEXT,
    producer          TEXT NOT NULL,
    sensitivity       TEXT NOT NULL,
    domain            TEXT NOT NULL,
    federation_id     TEXT,
    entity_type       TEXT,
    entity_id         TEXT,
    ontology          TEXT,
    retention_policy  TEXT,
    confidence        NUMERIC,
    integrity_hash    TEXT NOT NULL,
    cipher_suite_kem  TEXT NOT NULL,
    cipher_suite_aead TEXT NOT NULL,
    signature_classical TEXT NOT NULL,
    signature_post_quantum TEXT NOT NULL,
    sealed            BOOLEAN NOT NULL DEFAULT FALSE,
    action            TEXT NOT NULL, -- 'create' | 'seal' | 'verify' | 'deny'
    outcome           TEXT NOT NULL, -- 'ok' | 'invalid' | 'denied'
    occurred_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_yun_semantic_audit_occurred
    ON yun.yun_semantic_audit (occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_yun_semantic_audit_message
    ON yun.yun_semantic_audit (message_id);
