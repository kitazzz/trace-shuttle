import { describe, it, expect } from "vitest";
import { parseAnnotation, extractTsAnnotations } from "../annotation.js";
import type { SourceComment } from "../parser.js";

describe("parseAnnotation", () => {
  it("parses @trace[impl ...] annotation", () => {
    const result = parseAnnotation({
      value: "@trace[impl spec=SPEC-001]",
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

  it("parses @trace[impl ...] from block comment with *", () => {
    const result = parseAnnotation({
      value: "* @trace[impl spec=SPEC-002]",
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

  it("parses @trace[test ...] annotation", () => {
    const result = parseAnnotation({
      value: "@trace[test spec=SPEC-001]",
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

  it("parses @trace[needs-review]", () => {
    const result = parseAnnotation({
      value: "@trace[needs-review]",
      line: 7,
      type: "line",
    });
    expect(result).toEqual({
      type: "needs-review",
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
  it("extracts impl and test annotations", () => {
    const comments: SourceComment[] = [
      { value: "@trace[impl spec=SPEC-001]", line: 5, type: "line" },
      { value: "@trace[test spec=SPEC-002]", line: 10, type: "line" },
      { value: "regular comment", line: 20, type: "line" },
    ];

    const result = extractTsAnnotations(comments, "src/pricing.ts");
    expect(result.implRefs).toHaveLength(1);
    expect(result.implRefs[0].specId).toBe("SPEC-001");
    expect(result.testRefs).toHaveLength(1);
    expect(result.testRefs[0].specId).toBe("SPEC-002");
  });
});
