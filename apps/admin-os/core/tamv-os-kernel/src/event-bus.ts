import { Kafka, type Producer } from "kafkajs";
import { randomUUID } from "node:crypto";
import { appendEvent, type AppendEventOptions, type StoredEvent } from "./event-store";
import type { CivicEvent } from "./types";

let producer: Producer | null = null;
let publishFailures = 0;
let circuitOpenedAt = 0;

const FAILURE_THRESHOLD = 5;
const CIRCUIT_COOLDOWN_MS = 30_000;

async function getProducer() {
  if (producer) return producer;

  const broker = process.env.KAFKA_BROKER;
  if (!broker) {
    throw new Error("KAFKA_BROKER is not configured");
  }

  const kafka = new Kafka({ clientId: "tamv-os", brokers: [broker] });
  producer = kafka.producer();
  await producer.connect();
  return producer;
}

function assertCircuitOpenState() {
  if (publishFailures < FAILURE_THRESHOLD) return;

  const now = Date.now();
  const elapsed = now - circuitOpenedAt;
  if (elapsed >= CIRCUIT_COOLDOWN_MS) {
    publishFailures = 0;
    circuitOpenedAt = 0;
    return;
  }

  throw new Error(`Event bus circuit breaker open. Retry in ${CIRCUIT_COOLDOWN_MS - elapsed}ms`);
}

async function sendWithRetry(event: StoredEvent, retries = 3): Promise<void> {
  const connectedProducer = await getProducer();
  let attempt = 0;

  while (attempt <= retries) {
    try {
      await connectedProducer.send({
        topic: "tamv-events",
        messages: [
          {
            key: event.streamId,
            value: JSON.stringify(event),
            headers: {
              "event-id": event.id,
              "stream-id": event.streamId,
              "stream-version": `${event.streamVersion}`,
              "global-position": `${event.globalPosition}`,
            },
          },
        ],
      });
      publishFailures = 0;
      return;
    } catch (error) {
      attempt += 1;
      if (attempt > retries) {
        publishFailures += 1;
        if (publishFailures === FAILURE_THRESHOLD) {
          circuitOpenedAt = Date.now();
        }
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, 50 * 2 ** attempt));
    }
  }
}

export async function publishEvent(
  event: Partial<CivicEvent>,
  options: AppendEventOptions & { streamId?: string } = { streamId: "tamv-global" },
): Promise<StoredEvent> {
  assertCircuitOpenState();

  if (!event.type || !event.federation || !event.source) {
    throw new Error("event.type, event.federation and event.source are required");
  }

  const enriched: CivicEvent = {
    id: event.id ?? randomUUID(),
    type: event.type,
    federation: event.federation,
    payload: event.payload ?? {},
    occurredAt: event.occurredAt ?? new Date().toISOString(),
    source: event.source,
    correlationId: event.correlationId,
    canonical: event.canonical,
  };

  const streamId = options.streamId ?? `${enriched.federation}:${enriched.type}`;
  const persisted = await appendEvent(enriched, {
    ...options,
    streamId,
  });

  await sendWithRetry(persisted);
  return persisted;
}
