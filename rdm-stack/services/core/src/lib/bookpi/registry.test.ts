import { describe, it, expect, beforeEach } from "vitest";
import { sha256, sealWrite, verifyChain, sealBookPIEntry } from "./registry";
import { appendEntry, lastEntry, listEntries, resetBookpiForTests } from "./index";
import { BookPIEntry } from "../contracts";

describe("BookPI Registry", () => {
  beforeEach(() => {
    resetBookpiForTests();
  });

  it("genera un SHA-256 de 64 hex", () => {
    expect(sha256("hola")).toMatch(/^[a-f0-9]{64}$/);
  });

  it("sella una escritura encadenada", () => {
    const first = sealWrite({
      type: "bookpi.write",
      source: "tamv-core",
      domain: "bookpi",
      data: { n: 1 },
      prevHash: null,
    });
    expect(first.prevHash).toBeNull();
    expect(first.hash).toMatch(/^[a-f0-9]{64}$/);

    const second = sealWrite({
      type: "bookpi.write",
      source: "tamv-core",
      domain: "bookpi",
      data: { n: 2 },
      prevHash: first.hash,
    });
    expect(second.prevHash).toBe(first.hash);
  });

  it("verifica una cadena íntegra", () => {
    const first = sealWrite({
      type: "a",
      source: "s",
      domain: "d",
      data: { n: 1 },
      prevHash: null,
    });
    const second = sealWrite({
      type: "a",
      source: "s",
      domain: "d",
      data: { n: 2 },
      prevHash: first.hash,
    });
    const chain = [first, second];
    expect(verifyChain(chain)).toBe(true);
  });

  it("detecta una cadena manipulada", () => {
    const first = sealWrite({
      type: "a",
      source: "s",
      domain: "d",
      data: { n: 1 },
      prevHash: null,
    });
    const second = sealWrite({
      type: "a",
      source: "s",
      domain: "d",
      data: { n: 2 },
      prevHash: first.hash,
    });
    const tampered: BookPIEntry = { ...second, data: { n: 999 } };
    expect(verifyChain([first, tampered])).toBe(false);
  });

  it("mantiene el último y lista por dominio", () => {
    appendEntry(
      sealWrite({ type: "a", source: "s", domain: "bookpi", data: {}, prevHash: null }),
    );
    appendEntry(
      sealWrite({ type: "b", source: "s", domain: "guardian", data: {}, prevHash: lastEntry()?.hash ?? null }),
    );
    expect(lastEntry()?.domain).toBe("guardian");
    expect(listEntries(10, "bookpi")).toHaveLength(1);
    expect(listEntries(10)).toHaveLength(2);
  });

  it("sealBookPIEntry es determinista", () => {
    const input = {
      id: "evt-1",
      type: "a",
      source: "s",
      domain: "d",
      timestamp: "2026-08-14T00:00:00.000Z",
      data: { x: 1 },
      prevHash: null,
    };
    expect(sealBookPIEntry(input)).toBe(sealBookPIEntry(input));
  });
});
