import { describe, it, expect } from "vitest";
import { parseAnnotation, extractTsAnnotations } from "../annotation.js";
import type { SourceComment } from "../parser.js";

describe("parseAnnotation", () => {
  it("parses @impl annotation", () => {
    const result = parseAnnotation({
      value: "@impl SPEC-001",
      line: 5,
      type: "line",
    });
    expect(result).toEqual({
      type: "impl",
      specId: "SPEC-001",
      description: "",
      line: 5,
    });
  });

  it("parses @impl from block comment with *", () => {
    const result = parseAnnotation({
      value: "* @impl SPEC-002",
      line: 10,
      type: "block",
    });
    expect(result).toEqual({
      type: "impl",
      specId: "SPEC-002",
      description: "",
      line: 10,
    });
  });

  it("parses @test annotation", () => {
    const result = parseAnnotation({
      value: "@test SPEC-001",
      line: 3,
      type: "line",
    });
    expect(result).toEqual({
      type: "test",
      specId: "SPEC-001",
      description: "",
      line: 3,
    });
  });

  it("parses @decision with spec ID and description", () => {
    const result = parseAnnotation({
      value: "@decision SPEC-001 Use 10% for initial launch",
      line: 20,
      type: "block",
    });
    expect(result).toEqual({
      type: "decision",
      specId: "SPEC-001",
      description: "Use 10% for initial launch",
      line: 20,
    });
  });

  it("parses @decision without spec ID", () => {
    const result = parseAnnotation({
      value: "@decision General architectural choice",
      line: 30,
      type: "block",
    });
    // The regex captures first word after @decision as specId
    expect(result?.type).toBe("decision");
  });

  it("parses @needs-human-review", () => {
    const result = parseAnnotation({
      value: "@needs-human-review",
      line: 7,
      type: "line",
    });
    expect(result).toEqual({
      type: "needs-human-review",
      specId: null,
      description: "",
      line: 7,
    });
  });

  it("returns null for unrecognized comments", () => {
    const result = parseAnnotation({
      value: "TODO: fix this later",
      line: 1,
      type: "line",
    });
    expect(result).toBeNull();
  });
});

describe("extractTsAnnotations", () => {
  it("extracts all annotation types", () => {
    const comments: SourceComment[] = [
      { value: "@impl SPEC-001", line: 5, type: "line" },
      { value: "@test SPEC-002", line: 10, type: "line" },
      { value: "@decision SPEC-001 rate choice", line: 15, type: "block" },
      { value: "regular comment", line: 20, type: "line" },
    ];

    const result = extractTsAnnotations(comments, "src/pricing.ts");
    expect(result.implRefs).toHaveLength(1);
    expect(result.implRefs[0].specId).toBe("SPEC-001");
    expect(result.testRefs).toHaveLength(1);
    expect(result.testRefs[0].specId).toBe("SPEC-002");
    expect(result.decisionRefs).toHaveLength(1);
    expect(result.decisionRefs[0].specId).toBe("SPEC-001");
  });
});
