import { describe, it, expect } from "vitest";
import { SpecGraph } from "../graph.js";
import type { IndexedSpecIndex } from "../types.js";
import { buildIndexedSpecIndex } from "../../trace/build-index.js";
import type { TraceNode } from "../types.js";

function makeIndexedIndex(): IndexedSpecIndex {
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
  return buildIndexedSpecIndex(nodes);
}

describe("SpecGraph", () => {
  it("buildLinks resolves all relationships", () => {
    const graph = new SpecGraph(makeIndexedIndex());
    const links = graph.buildLinks();
    expect(links).toHaveLength(2);

    const link1 = links.find((l) => l.spec.id === "SPEC-001")!;
    expect(link1.requirement?.id).toBe("REQ-001");
    expect(link1.implementations).toHaveLength(1);
    expect(link1.tests).toHaveLength(1);
    expect(link1.coverage.hasImplementation).toBe(true);
    expect(link1.coverage.hasTest).toBe(true);

    const link2 = links.find((l) => l.spec.id === "SPEC-002")!;
    expect(link2.implementations).toHaveLength(0);
    expect(link2.tests).toHaveLength(0);
    expect(link2.coverage.hasImplementation).toBe(false);
    expect(link2.coverage.hasTest).toBe(false);
  });

  it("findOrphanSpecs returns specs with no impl and no tests", () => {
    const graph = new SpecGraph(makeIndexedIndex());
    const orphans = graph.findOrphanSpecs();
    expect(orphans).toHaveLength(1);
    expect(orphans[0].spec.id).toBe("SPEC-002");
  });

  it("findUntestedSpecs returns specs with impl but no tests", () => {
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
        line: 20,
      },
    ];
    const graph = new SpecGraph(buildIndexedSpecIndex(nodes));
    const untested = graph.findUntestedSpecs();
    expect(untested).toHaveLength(1);
    expect(untested[0].spec.id).toBe("SPEC-001");
  });

  it("findUnimplementedSpecs returns specs with no impl", () => {
    const graph = new SpecGraph(makeIndexedIndex());
    const unimpl = graph.findUnimplementedSpecs();
    expect(unimpl).toHaveLength(1);
    expect(unimpl[0].spec.id).toBe("SPEC-002");
  });

  it("getSpecIds returns all spec IDs", () => {
    const graph = new SpecGraph(makeIndexedIndex());
    expect(graph.getSpecIds()).toEqual(new Set(["SPEC-001", "SPEC-002"]));
  });

  it("findRefsByFile returns trace nodes for a file", () => {
    const graph = new SpecGraph(makeIndexedIndex());
    const refs = graph.findRefsByFile("src/pricing.ts");
    expect(refs).toHaveLength(2);
    expect(refs.some((r) => r.kind === "impl")).toBe(true);
    expect(refs.some((r) => r.kind === "needs-review")).toBe(true);
  });

  it("findSpecsByFile returns specs for a file", () => {
    const graph = new SpecGraph(makeIndexedIndex());
    const specs = graph.findSpecsByFile("docs/pricing.md");
    expect(specs).toHaveLength(2);
  });

  it("findRequirementBySpecId returns the linked requirement", () => {
    const graph = new SpecGraph(makeIndexedIndex());
    expect(graph.findRequirementBySpecId("SPEC-001")?.id).toBe("REQ-001");
    expect(graph.findRequirementBySpecId("SPEC-999")).toBeNull();
  });

  it("findLinkBySpecId returns the full link", () => {
    const graph = new SpecGraph(makeIndexedIndex());
    const link = graph.findLinkBySpecId("SPEC-001");
    expect(link?.spec.id).toBe("SPEC-001");
    expect(link?.implementations).toHaveLength(1);

    expect(graph.findLinkBySpecId("SPEC-999")).toBeNull();
  });
});
