import { describe, it, expect, beforeEach } from "vitest";
import {
  publishEvent,
  subscribe,
  onEvent,
  eventHistory,
  dlqCount,
  busStats,
  resetBusForTests,
  runWithTrace,
} from "./index";

describe("Bus de eventos TAMV", () => {
  beforeEach(() => {
    resetBusForTests();
  });

  it("publica un evento con envelope estándar", () => {
    const event = publishEvent({
      type: "bookpi.write",
      source: "tamv-core",
      domain: "bookpi",
      data: { id: "evt-1" },
    });
    expect(event.id).toMatch(/^evt-/);
    expect(event.type).toBe("bookpi.write");
    expect(event.traceId).toBeTruthy();
    expect(event.correlationId).toBeTruthy();
    expect(event.severity).toBe("info");
    expect(event.timestamp).toBeTruthy();
  });

  it("notifica a los listeners suscritos", () => {
    const seen: string[] = [];
    const off = onEvent("bookpi.write", (e) => seen.push(e.type));
    publishEvent({
      type: "bookpi.write",
      source: "tamv-core",
      domain: "bookpi",
      data: {},
    });
    off();
    publishEvent({
      type: "other.event",
      source: "x",
      domain: "y",
      data: {},
    });
    expect(seen).toEqual(["bookpi.write"]);
  });

  it("mueve a DLQ los eventos con listener fallido", () => {
    subscribe(() => {
      throw new Error("boom");
    });
    publishEvent({
      type: "broken.event",
      source: "x",
      domain: "y",
      data: {},
    });
    expect(dlqCount()).toBe(1);
  });

  it("hereda traceId/correlationId del contexto", () => {
    let traceId = "";
    runWithTrace({ traceId: "trace-abc", correlationId: "corr-abc" }, () => {
      const event = publishEvent({
        type: "in.context",
        source: "x",
        domain: "y",
        data: {},
      });
      traceId = event.traceId;
      expect(event.correlationId).toBe("corr-abc");
    });
    expect(traceId).toBe("trace-abc");
  });

  it("mantiene el historial acotado", () => {
    for (let i = 0; i < 20; i++) {
      publishEvent({
        type: "hist.event",
        source: "x",
        domain: "hist",
        data: { i },
      });
    }
    const history = eventHistory(10, { type: "hist.event" });
    expect(history).toHaveLength(10);
    expect(busStats().history).toBeGreaterThanOrEqual(20);
  });
});
