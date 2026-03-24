import { describe, it, expect } from "vitest";
import { buildIndexedSpecIndex } from "../build-index.js";
import type { TraceNode } from "../../model/types.js";

describe("buildIndexedSpecIndex", () => {
  const nodes: TraceNode[] = [
    {
      kind: "requirement",
      attrs: { id: "REQ-001", category: "pricing" },
      filePath: "docs/pricing.md",
      line: 1,
    },
    {
      kind: "spec",
      attrs: { id: "SPEC-001", req: "REQ-001" },
      filePath: "docs/pricing.md",
      line: 5,
    },
    {
      kind: "spec",
      attrs: { id: "SPEC-002", req: "REQ-001" },
      filePath: "docs/pricing.md",
      line: 10,
    },
    {
      kind: "impl",
      attrs: { spec: "SPEC-001" },
      filePath: "src/pricing.ts",
      line: 20,
    },
    {
      kind: "test",
      attrs: { spec: "SPEC-001" },
      filePath: "tests/pricing.test.ts",
      line: 5,
    },
    {
      kind: "needs-review",
      attrs: {},
      filePath: "src/pricing.ts",
      line: 25,
    },
  ];

  it("builds requirement map", () => {
    const index = buildIndexedSpecIndex(nodes);
    expect(index.requirements.size).toBe(1);
    expect(index.requirements.get("REQ-001")?.category).toBe("pricing");
  });

  it("builds spec map", () => {
    const index = buildIndexedSpecIndex(nodes);
    expect(index.specs.size).toBe(2);
    expect(index.specs.has("SPEC-001")).toBe(true);
    expect(index.specs.has("SPEC-002")).toBe(true);
  });

  it("builds specsByRequirement map", () => {
    const index = buildIndexedSpecIndex(nodes);
    expect(index.specsByRequirement.get("REQ-001")).toHaveLength(2);
  });

  it("builds implsBySpec map", () => {
    const index = buildIndexedSpecIndex(nodes);
    expect(index.implsBySpec.get("SPEC-001")).toHaveLength(1);
    expect(index.implsBySpec.get("SPEC-002")).toBeUndefined();
  });

  it("builds testsBySpec map", () => {
    const index = buildIndexedSpecIndex(nodes);
    expect(index.testsBySpec.get("SPEC-001")).toHaveLength(1);
  });

  it("retains all nodes in allNodes", () => {
    const index = buildIndexedSpecIndex(nodes);
    expect(index.allNodes).toHaveLength(6);
  });

  it("groups by file in refsByFile including needs-review", () => {
    const index = buildIndexedSpecIndex(nodes);
    const srcRefs = index.refsByFile.get("src/pricing.ts");
    expect(srcRefs).toHaveLength(2);
    expect(srcRefs?.some((n) => n.kind === "needs-review")).toBe(true);
    expect(srcRefs?.some((n) => n.kind === "impl")).toBe(true);
  });

  it("groups docs file refs", () => {
    const index = buildIndexedSpecIndex(nodes);
    const docRefs = index.refsByFile.get("docs/pricing.md");
    expect(docRefs).toHaveLength(3); // 1 req + 2 specs
  });
});
