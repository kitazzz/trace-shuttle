import { describe, it, expect } from "vitest";
import {
  traceNodeToRequirement,
  traceNodeToSpec,
  traceNodeToImplRef,
  traceNodeToTestRef,
  partitionTraceNodes,
} from "../trace-to-model.js";
import type { TraceNode } from "../../model/types.js";

describe("traceNodeToRequirement", () => {
  it("converts a requirement node", () => {
    const node: TraceNode = {
      kind: "requirement",
      attrs: { id: "REQ-001", category: "pricing" },
      filePath: "docs/pricing.md",
      line: 3,
    };
    expect(traceNodeToRequirement(node)).toEqual({
      id: "REQ-001",
      category: "pricing",
      filePath: "docs/pricing.md",
      line: 3,
      rawText: "",
    });
  });

  it("returns null for wrong kind", () => {
    const node: TraceNode = {
      kind: "impl",
      attrs: { spec: "SPEC-001" },
      filePath: "src/x.ts",
      line: 1,
    };
    expect(traceNodeToRequirement(node)).toBeNull();
  });

  it("returns null if id missing", () => {
    const node: TraceNode = {
      kind: "requirement",
      attrs: { category: "pricing" },
      filePath: "docs/x.md",
      line: 1,
    };
    expect(traceNodeToRequirement(node)).toBeNull();
  });
});

describe("traceNodeToSpec", () => {
  it("converts a spec node", () => {
    const node: TraceNode = {
      kind: "spec",
      attrs: { id: "SPEC-001", req: "REQ-001" },
      filePath: "docs/pricing.md",
      line: 7,
    };
    expect(traceNodeToSpec(node)).toEqual({
      id: "SPEC-001",
      requirementId: "REQ-001",
      filePath: "docs/pricing.md",
      line: 7,
      rawText: "",
    });
  });
});

describe("traceNodeToImplRef", () => {
  it("converts an impl node", () => {
    const node: TraceNode = {
      kind: "impl",
      attrs: { spec: "SPEC-001" },
      filePath: "src/pricing.ts",
      line: 10,
    };
    expect(traceNodeToImplRef(node)).toEqual({
      specId: "SPEC-001",
      filePath: "src/pricing.ts",
      line: 10,
      nodeDescription: "",
    });
  });
});

describe("traceNodeToTestRef", () => {
  it("converts a test node", () => {
    const node: TraceNode = {
      kind: "test",
      attrs: { spec: "SPEC-002" },
      filePath: "tests/pricing.test.ts",
      line: 5,
    };
    expect(traceNodeToTestRef(node)).toEqual({
      specId: "SPEC-002",
      filePath: "tests/pricing.test.ts",
      line: 5,
      testName: "",
    });
  });
});

describe("partitionTraceNodes", () => {
  it("partitions a mixed array of nodes", () => {
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
        kind: "impl",
        attrs: { spec: "SPEC-001" },
        filePath: "src/pricing.ts",
        line: 10,
      },
      {
        kind: "test",
        attrs: { spec: "SPEC-001" },
        filePath: "tests/pricing.test.ts",
        line: 3,
      },
      {
        kind: "needs-review",
        attrs: {},
        filePath: "src/pricing.ts",
        line: 20,
      },
    ];

    const result = partitionTraceNodes(nodes);
    expect(result.requirements).toHaveLength(1);
    expect(result.specs).toHaveLength(1);
    expect(result.implRefs).toHaveLength(1);
    expect(result.testRefs).toHaveLength(1);
    // needs-review is not included in any legacy partition
  });
});
