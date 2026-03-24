import { describe, it, expect } from "vitest";
import { SpecGraph } from "../graph.js";
import type { SpecIndex } from "../types.js";

function makeIndex(overrides: Partial<SpecIndex> = {}): SpecIndex {
  return {
    requirements: [
      {
        id: "REQ-001",
        category: "pricing",
        filePath: "docs/pricing.md",
        line: 1,
        rawText: "",
      },
    ],
    specs: [
      {
        id: "SPEC-001",
        requirementId: "REQ-001",
        filePath: "docs/pricing.md",
        line: 5,
        rawText: "",
      },
      {
        id: "SPEC-002",
        requirementId: "REQ-001",
        filePath: "docs/pricing.md",
        line: 10,
        rawText: "",
      },
    ],
    implRefs: [
      {
        specId: "SPEC-001",
        filePath: "src/pricing.ts",
        line: 20,
        nodeDescription: "",
      },
    ],
    testRefs: [
      {
        specId: "SPEC-001",
        filePath: "tests/pricing.test.ts",
        line: 5,
        testName: "",
      },
    ],
    decisionRefs: [
      {
        specId: "SPEC-001",
        description: "10% rate",
        filePath: "src/pricing.ts",
        line: 22,
      },
    ],
    ...overrides,
  };
}

describe("SpecGraph", () => {
  it("buildLinks resolves all relationships", () => {
    const graph = new SpecGraph(makeIndex());
    const links = graph.buildLinks();
    expect(links).toHaveLength(2);

    const link1 = links.find((l) => l.spec.id === "SPEC-001")!;
    expect(link1.requirement?.id).toBe("REQ-001");
    expect(link1.implementations).toHaveLength(1);
    expect(link1.tests).toHaveLength(1);
    expect(link1.decisions).toHaveLength(1);
    expect(link1.coverage.hasImplementation).toBe(true);
    expect(link1.coverage.hasTest).toBe(true);

    const link2 = links.find((l) => l.spec.id === "SPEC-002")!;
    expect(link2.implementations).toHaveLength(0);
    expect(link2.tests).toHaveLength(0);
    expect(link2.coverage.hasImplementation).toBe(false);
    expect(link2.coverage.hasTest).toBe(false);
  });

  it("findOrphanSpecs returns specs with no impl and no tests", () => {
    const graph = new SpecGraph(makeIndex());
    const orphans = graph.findOrphanSpecs();
    expect(orphans).toHaveLength(1);
    expect(orphans[0].spec.id).toBe("SPEC-002");
  });

  it("findUntestedSpecs returns specs with impl but no tests", () => {
    const graph = new SpecGraph(
      makeIndex({
        testRefs: [], // no tests at all
      }),
    );
    const untested = graph.findUntestedSpecs();
    expect(untested).toHaveLength(1);
    expect(untested[0].spec.id).toBe("SPEC-001");
  });

  it("findUnimplementedSpecs returns specs with no impl", () => {
    const graph = new SpecGraph(makeIndex());
    const unimpl = graph.findUnimplementedSpecs();
    expect(unimpl).toHaveLength(1);
    expect(unimpl[0].spec.id).toBe("SPEC-002");
  });

  it("getSpecIds returns all spec IDs", () => {
    const graph = new SpecGraph(makeIndex());
    expect(graph.getSpecIds()).toEqual(new Set(["SPEC-001", "SPEC-002"]));
  });
});
