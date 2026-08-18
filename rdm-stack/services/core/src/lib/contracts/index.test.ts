import { describe, it, expect } from "vitest";
import {
  BookPIWriteRequestSchema,
  BookPIEntrySchema,
  IsabellaRequestSchema,
  IsabellaResponseSchema,
  GuardianResolveSchema,
  GuardianResolveResultSchema,
} from "./index";

describe("Contratos BookPI", () => {
  it("acepta una escritura válida", () => {
    const result = BookPIWriteRequestSchema.safeParse({
      type: "bookpi.write",
      source: "tamv-core",
      domain: "bookpi",
      data: { id: "x" },
    });
    expect(result.success).toBe(true);
  });

  it("rechaza una escritura sin tipo", () => {
    const result = BookPIWriteRequestSchema.safeParse({
      source: "tamv-core",
      domain: "bookpi",
      data: {},
    });
    expect(result.success).toBe(false);
  });

  it("valida el hash SHA-256 de una entrada", () => {
    const result = BookPIEntrySchema.safeParse({
      id: "evt-abc",
      type: "bookpi.write",
      source: "tamv-core",
      domain: "bookpi",
      timestamp: "2026-08-14T00:00:00.000Z",
      hash: "a".repeat(64),
      prevHash: null,
      data: {},
    });
    expect(result.success).toBe(true);
  });

  it("rechaza un hash mal formado", () => {
    const result = BookPIEntrySchema.safeParse({
      id: "evt-abc",
      type: "bookpi.write",
      source: "tamv-core",
      domain: "bookpi",
      timestamp: "2026-08-14T00:00:00.000Z",
      hash: "not-a-hash",
      prevHash: null,
      data: {},
    });
    expect(result.success).toBe(false);
  });
});

describe("Contratos Isabella", () => {
  it("acepta una petición con dominio por defecto", () => {
    const result = IsabellaRequestSchema.safeParse({ prompt: "Hola" });
    expect(result.success).toBe(true);
  });

  it("rechaza un prompt vacío", () => {
    const result = IsabellaRequestSchema.safeParse({ prompt: "" });
    expect(result.success).toBe(false);
  });

  it("rechaza un dominio no soportado", () => {
    const result = IsabellaRequestSchema.safeParse({ prompt: "Hola", domain: "politica" });
    expect(result.success).toBe(false);
  });

  it("valida la respuesta completa", () => {
    const result = IsabellaResponseSchema.safeParse({
      reply: "Hola",
      decision: "respond",
      confidence: 0.8,
      explanation: "explicación",
      flags: [],
      vad: { valence: 0.2, arousal: 0.4, dominance: 0.5 },
      hitl: false,
      pipelineStage: 6,
    });
    expect(result.success).toBe(true);
  });
});

describe("Contratos Guardian", () => {
  it("acepta una resolución válida", () => {
    const result = GuardianResolveSchema.safeParse({
      actionId: "GA-0007",
      decision: "ratificar",
      guardianId: "did:tamv:guardian-1",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza una decisión inválida", () => {
    const result = GuardianResolveSchema.safeParse({
      actionId: "GA-0007",
      decision: "quizas",
      guardianId: "did:tamv:guardian-1",
    });
    expect(result.success).toBe(false);
  });

  it("valida el resultado sellado", () => {
    const result = GuardianResolveResultSchema.safeParse({
      ok: true,
      actionId: "GA-0007",
      decision: "ratificar",
      sealed: true,
      hash: "b".repeat(64),
    });
    expect(result.success).toBe(true);
  });
});
