import { describe, expect, it, vi } from "vitest";

import { FixedClock } from "@/core/engine/deterministic-clock";
import { EventBus } from "@/core/infra/event-bus";
import { LRUCache } from "@/core/geo/lru-cache";
import type { TuristaEstado } from "@/core/models";
import { ExperienceOrchestrator } from "@/orchestrator/experience.orchestrator";

function mkTourist(now: number): TuristaEstado {
  return {
    id: "t-1",
    coords: { lat: 20.14, lng: -98.672 },
    prevCoords: { lat: 20.1398, lng: -98.6721 },
    stayTimeHours: 2,
    activityTimestamps: {
      lastInteractionAt: new Date(now - 40 * 60_000),
    },
  };
}

describe("ExperienceOrchestrator", () => {
  it("emite decision cuando el score supera umbral", () => {
    const now = Date.UTC(2026, 2, 18, 12, 0, 0);
    const clock = new FixedClock(now);
    const bus = new EventBus(10);
    const spy = vi.fn();
    bus.on("isabella:decision", spy);

    const orch = new ExperienceOrchestrator([{ lat: 20.14, lng: -98.6721 }], {
      clock,
      eventBus: bus,
      throttleMs: 1_000,
    });

    const decision = orch.evaluar(mkTourist(now));

    expect(decision).toBeTruthy();
    expect(decision?.level).toBe("CRITICO");
    expect(spy).toHaveBeenCalledTimes(1);
    expect(decision?.traceId).toBeTypeOf("string");
  });

  it("aplica throttling por turista", () => {
    const now = Date.UTC(2026, 2, 18, 12, 0, 0);
    const clock = new FixedClock(now);

    const orch = new ExperienceOrchestrator([{ lat: 20.14, lng: -98.6721 }], {
      clock,
      throttleMs: 60_000,
    });

    const tourist = mkTourist(now);
    const first = orch.evaluar(tourist);
    const second = orch.evaluar(tourist);

    expect(first).toBeTruthy();
    expect(second).toBeNull();

    clock.advance(60_000);
    const third = orch.evaluar(tourist);
    expect(third).toBeTruthy();
  });
});

describe("Protecciones técnicas", () => {
  it("backpressure descarta eventos al saturarse", () => {
    const bus = new EventBus(2);
    bus.emit("evt", { a: 1 });
    bus.emit("evt", { a: 2 });
    const ok = bus.emit("evt", { a: 3 });

    expect(ok).toBe(false);
    expect(bus.getDroppedCount()).toBe(1);
  });

  it("expira entradas del cache por TTL", () => {
    let now = 1000;
    const cache = new LRUCache<string, number>(2, 100, () => now);

    cache.set("a", 1);
    expect(cache.get("a")).toBe(1);

    now += 101;
    expect(cache.get("a")).toBeUndefined();
  });
});
