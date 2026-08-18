-- TAMV Online canonical event core + Cattleya Pay ledger

CREATE TABLE IF NOT EXISTS tamv_event_store (
  global_position BIGSERIAL PRIMARY KEY,
  event_id UUID NOT NULL UNIQUE,
  stream_id TEXT NOT NULL,
  stream_version INTEGER NOT NULL,
  event_type TEXT NOT NULL,
  federation TEXT NOT NULL,
  payload JSONB NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source TEXT NOT NULL,
  correlation_id UUID,
  event_hash TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE(stream_id, stream_version)
);

CREATE TABLE IF NOT EXISTS tamv_event_dead_letter (
  id UUID PRIMARY KEY,
  stream_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  attempts INTEGER NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tamv_stream_snapshot (
  stream_id TEXT NOT NULL,
  stream_version INTEGER NOT NULL,
  state_hash TEXT NOT NULL,
  state_payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY(stream_id, stream_version)
);

CREATE INDEX IF NOT EXISTS idx_tamv_event_store_stream
  ON tamv_event_store(stream_id, stream_version);

CREATE INDEX IF NOT EXISTS idx_tamv_event_store_occurred_at
  ON tamv_event_store(occurred_at);

CREATE TABLE IF NOT EXISTS cattleya_payment_ledger (
  id BIGSERIAL PRIMARY KEY,
  operation_id TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL,
  amount_cents BIGINT NOT NULL,
  currency TEXT NOT NULL,
  description TEXT NOT NULL,
  stripe_session_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('INITIATED','SESSION_CREATED','AUTHORIZED','CAPTURED','SETTLED','FAILED','REFUNDED')),
  failure_reason TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cattleya_payment_ledger_user
  ON cattleya_payment_ledger(user_id, created_at DESC);
