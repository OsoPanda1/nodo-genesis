import { EventEmitter } from "node:events";
import { publishEvent } from "./event-bus";
import type { CivicEvent } from "./types";

export interface DomainService {
  name: string;
  handle(event: CivicEvent): Promise<void> | void;
}

export class TamvOSKernel {
  private readonly bus = new EventEmitter({ captureRejections: true });
  private readonly services = new Map<string, DomainService>();
  private started = false;

  register(service: DomainService) {
    this.services.set(service.name, service);
    this.bus.on("event", async (event: CivicEvent) => {
      await service.handle(event);
    });
  }

  async emit(event: Partial<CivicEvent>, streamId?: string) {
    if (!this.started) {
      throw new Error("Kernel is not started");
    }

    const persisted = await publishEvent(event, {
      streamId: streamId ?? "tamv-kernel",
      actorId: "tamv-os-kernel",
      causationId: event.correlationId,
    });

    this.bus.emit("event", persisted);
    return persisted;
  }

  start() {
    this.started = true;
  }

  stop() {
    this.started = false;
    this.bus.removeAllListeners("event");
  }

  status() {
    return {
      started: this.started,
      services: [...this.services.keys()],
    };
  }
}
