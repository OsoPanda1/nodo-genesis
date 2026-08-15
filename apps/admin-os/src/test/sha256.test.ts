import { describe, expect, it } from "vitest";
import { sha256Hex } from "@/lib/crypto/sha256";

/* Vectores validados contra node:crypto (SHA-256 FIPS 180-4). */
const VECTORS: Array<[string, string]> = [
  ["", "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"],
  ["abc", "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"],
  ["hola mundo", "0b894166d3336435c800bea36ff21b29eaa801a52f584c006c49289a0dcf6e2f"],
  ["Real del Monte, Hidalgo", "c9add1349b237c2f144b8edb5d5f906186a51fa6e51d910503a8b7f8fc7927f9"],
];

describe("sha256Hex", () => {
  it("coincide con vectores conocidos", () => {
    for (const [input, expected] of VECTORS) {
      expect(sha256Hex(input)).toBe(expected);
    }
  });

  it("es determinista y estable con UTF-8", () => {
    const input = "ñáéíóú — Real del Monte ✓";
    expect(sha256Hex(input)).toBe(sha256Hex(input));
    expect(sha256Hex(input)).toMatch(/^[a-f0-9]{64}$/);
  });

  it("difiere ante cambios mínimos en la entrada", () => {
    expect(sha256Hex("a")).toBe("ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb");
    expect(sha256Hex("b")).toBe("3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d");
    expect(sha256Hex("a")).not.toBe(sha256Hex("b"));
  });
});
