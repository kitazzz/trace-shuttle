import { describe, it, expect } from "vitest";
import { parseTrace } from "../parse-trace.js";

describe("parseTrace", () => {
  it("parses a requirement trace", () => {
    const node = parseTrace(
      '@trace[requirement id=REQ-001 category=pricing]',
      "docs/pricing.md",
      3,
    );
    expect(node).toEqual({
      kind: "requirement",
      attrs: { id: "REQ-001", category: "pricing" },
      filePath: "docs/pricing.md",
      line: 3,
    });
  });

  it("parses a spec trace", () => {
    const node = parseTrace(
      "@trace[spec id=SPEC-001 req=REQ-001]",
      "docs/pricing.md",
      7,
    );
    expect(node).toEqual({
      kind: "spec",
      attrs: { id: "SPEC-001", req: "REQ-001" },
      filePath: "docs/pricing.md",
      line: 7,
    });
  });

  it("parses an impl trace", () => {
    const node = parseTrace(
      "@trace[impl spec=SPEC-001]",
      "src/pricing.ts",
      10,
    );
    expect(node).toEqual({
      kind: "impl",
      attrs: { spec: "SPEC-001" },
      filePath: "src/pricing.ts",
      line: 10,
    });
  });

  it("parses a test trace", () => {
    const node = parseTrace(
      "@trace[test spec=SPEC-001]",
      "tests/pricing.test.ts",
      5,
    );
    expect(node).toEqual({
      kind: "test",
      attrs: { spec: "SPEC-001" },
      filePath: "tests/pricing.test.ts",
      line: 5,
    });
  });

  it("parses a needs-review trace", () => {
    const node = parseTrace(
      "@trace[needs-review]",
      "src/pricing.ts",
      15,
    );
    expect(node).toEqual({
      kind: "needs-review",
      attrs: {},
      filePath: "src/pricing.ts",
      line: 15,
    });
  });

  it("handles quoted values", () => {
    const node = parseTrace(
      '@trace[requirement id=REQ-001 category="user pricing"]',
      "docs/pricing.md",
      3,
    );
    expect(node?.attrs["category"]).toBe("user pricing");
  });

  it("strips block comment prefix (*)", () => {
    const node = parseTrace(
      "* @trace[impl spec=SPEC-001]",
      "src/pricing.ts",
      10,
    );
    expect(node?.kind).toBe("impl");
    expect(node?.attrs["spec"]).toBe("SPEC-001");
  });

  it("returns null for unrecognized kind", () => {
    const node = parseTrace(
      "@trace[unknown id=X]",
      "src/x.ts",
      1,
    );
    expect(node).toBeNull();
  });

  it("returns null for non-trace text", () => {
    const node = parseTrace("TODO: fix later", "src/x.ts", 1);
    expect(node).toBeNull();
  });

  it("returns null for old-style annotations", () => {
    expect(parseTrace("@impl SPEC-001", "src/x.ts", 1)).toBeNull();
    expect(parseTrace("@decision SPEC-001 rationale", "src/x.ts", 1)).toBeNull();
  });
});
