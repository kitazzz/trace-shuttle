// @trace[test spec=SPEC-ORDER-CANCEL]
// @trace[test spec=SPEC-NOT-DEFINED]

import { describe, expect, it } from "vitest";

describe("runOrderCommand", () => {
  it("supports cancellation", () => {
    // @trace[test spec=SPEC-ORDER-CANCEL]
    expect(true).toBe(true);
  });

  it("has an orphan test reference for regression coverage", () => {
    // @trace[test spec=SPEC-NOT-DEFINED]
    expect(true).toBe(true);
  });
});
