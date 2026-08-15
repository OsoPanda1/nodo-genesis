import { createHash } from "node:crypto";
import { Pool, type PoolClient } from "pg";
import type { CivicEvent } from "./types";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export interface AppendEventOptions {
  streamId: string;
  expectedVersion?: number;
  actorId?: string;
  causationId?: string;
  checksum?: string;
}

export interface StoredEvent<TPayload = unknown> extends CivicEvent<TPayload> {
  streamId: string;
  streamVersion: number;
  globalPosition: number;
  eventHash: string;
  recordedAt: string;
  metadata: {
    actorId?: string;
    causationId?: string;
    checksum?: string;
  };
}

let initialized = false;

function hashEventPayload(event: CivicEvent, streamId: string, streamVersion: number): string {
  const raw = JSON.stringify({
    id: event.id,
    type: event.type,
    federation: event.federation,
    payload: event.payload,
    occurredAt: event.occurredAt,
    source: event.source,
    correlationId: event.correlationId ?? null,
    streamId,
    streamVersion,
  });
  return createHash("sha256").update(raw).digest("hex");
}

async function ensureSchema() {
  if (initialized) return;

  await pool.query(`
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

    CREATE INDEX IF NOT EXISTS idx_tamv_event_store_stream
      ON tamv_event_store(stream_id, stream_version);

    CREATE INDEX IF NOT EXISTS idx_tamv_event_store_occurred_at
      ON tamv_event_store(occurred_at);
  `);

  initialized = true;
}

async function nextStreamVersion(client: PoolClient, streamId: string): Promise<number> {
  await client.query(`SELECT pg_advisory_xact_lock(hashtext($1))`, [streamId]);

  const versionResult = await client.query<{ version: number }>(
    `SELECT COALESCE(MAX(stream_version), 0) AS version
      FROM tamv_event_store
      WHERE stream_id = $1`,
    [streamId],
  );

  return Number(versionResult.rows[0]?.version ?? 0) + 1;
}

export async function appendEvent(
  event: CivicEvent,
  options: AppendEventOptions,
): Promise<StoredEvent> {
  await ensureSchema();

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const streamVersion = await nextStreamVersion(client, options.streamId);

    if (typeof options.expectedVersion === "number" && streamVersion !== options.expectedVersion + 1) {
      throw new Error(
        `Optimistic concurrency violation in stream ${options.streamId}: expected ${options.expectedVersion}, actual ${streamVersion - 1}`,
      );
    }

    const eventHash = hashEventPayload(event, options.streamId, streamVersion);

    const insertResult = await client.query<StoredEvent>(
      `INSERT INTO tamv_event_store
        (event_id, stream_id, stream_version, event_type, federation, payload, occurred_at, source, correlation_id, event_hash, metadata)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING
        global_position as "globalPosition",
        event_id as id,
        stream_id as "streamId",
        stream_version as "streamVersion",
        event_type as type,
        federation,
        payload,
        occurred_at as "occurredAt",
        source,
        correlation_id as "correlationId",
        event_hash as "eventHash",
        metadata,
        recorded_at as "recordedAt"`,
      [
        event.id,
        options.streamId,
        streamVersion,
        event.type,
        event.federation,
        JSON.stringify(event.payload),
        event.occurredAt,
        event.source,
        event.correlationId ?? null,
        eventHash,
        JSON.stringify({
          actorId: options.actorId,
          causationId: options.causationId,
          checksum: options.checksum,
        }),
      ],
    );

    await client.query("COMMIT");

    return insertResult.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function loadStream(streamId: string, fromVersion = 1): Promise<StoredEvent[]> {
  await ensureSchema();
  const result = await pool.query<StoredEvent>(
    `SELECT
      global_position as "globalPosition",
      event_id as id,
      stream_id as "streamId",
      stream_version as "streamVersion",
      event_type as type,
      federation,
      payload,
      occurred_at as "occurredAt",
      source,
      correlation_id as "correlationId",
      event_hash as "eventHash",
      metadata,
      recorded_at as "recordedAt"
    FROM tamv_event_store
    WHERE stream_id = $1
      AND stream_version >= $2
      AND is_deleted = false
    ORDER BY stream_version ASC`,
    [streamId, fromVersion],
  );

  return result.rows;
}

export async function verifyStreamIntegrity(streamId: string): Promise<{ valid: boolean; failedAtVersion?: number }> {
  const events = await loadStream(streamId);

  for (const event of events) {
    const recomputed = hashEventPayload(event, event.streamId, event.streamVersion);
    if (recomputed !== event.eventHash) {
      return { valid: false, failedAtVersion: event.streamVersion };
    }
  }

  return { valid: true };
}

export async function replayStream<TState>(
  streamId: string,
  reducer: (state: TState, event: StoredEvent) => TState,
  initialState: TState,
): Promise<TState> {
  const events = await loadStream(streamId);
  return events.reduce(reducer, initialState);
}
