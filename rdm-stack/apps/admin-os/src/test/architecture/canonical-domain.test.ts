import { describe, expect, it } from "vitest";
import { resolveNextState } from "../../../core/tamv-os-kernel/src/domain/canonical-domain";

describe("canonical-domain transitions", () => {
  it("allows canonical payment lifecycle transition", () => {
    const next = resolveNextState("PAYMENT_ORDER", "PAYMENT_SESSION_CREATED", "INITIATED");
    expect(next).toBe("SESSION_CREATED");
  });

  it("rejects invalid canonical transition", () => {
    expect(() =>
      resolveNextState("PAYMENT_ORDER", "PAYMENT_SETTLED", "INITIATED"),
    ).toThrow(/Invalid canonical transition/);
  });
});
