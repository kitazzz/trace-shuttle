import { describe, it, expect } from "vitest";
import { extractAnnotations } from "../annotation.js";
import type { HtmlComment } from "../parser.js";

describe("extractAnnotations", () => {
  it("parses a @trace[requirement ...] comment", () => {
    const comments: HtmlComment[] = [
      { value: "@trace[requirement id=REQ-001 category=pricing]", line: 3 },
    ];
    const result = extractAnnotations(comments, "docs/pricing.md");
    expect(result.requirements).toHaveLength(1);
    expect(result.requirements[0]).toEqual({
      id: "REQ-001",
      category: "pricing",
      filePath: "docs/pricing.md",
      line: 3,
      rawText: "",
    });
  });

  it("parses a @trace[requirement ...] with text attr", () => {
    const comments: HtmlComment[] = [
      {
        value:
          '@trace[requirement id=REQ-002 category=auth text="Users must authenticate before checkout"]',
        line: 5,
      },
    ];
    const result = extractAnnotations(comments, "docs/auth.md");
    expect(result.requirements[0].rawText).toBe(
      "Users must authenticate before checkout",
    );
  });

  it("parses a @trace[spec ...] comment", () => {
    const comments: HtmlComment[] = [
      { value: "@trace[spec id=SPEC-001 req=REQ-001]", line: 10 },
    ];
    const result = extractAnnotations(comments, "docs/pricing.md");
    expect(result.specs).toHaveLength(1);
    expect(result.specs[0]).toEqual({
      id: "SPEC-001",
      requirementId: "REQ-001",
      filePath: "docs/pricing.md",
      line: 10,
      rawText: "",
    });
  });

  it("parses a @trace[spec ...] with text attr", () => {
    const comments: HtmlComment[] = [
      {
        value:
          '@trace[spec id=SPEC-002 req=REQ-001 text="Apply 10% discount for premium users"]',
        line: 15,
      },
    ];
    const result = extractAnnotations(comments, "docs/pricing.md");
    expect(result.specs[0].rawText).toBe(
      "Apply 10% discount for premium users",
    );
  });

  it("handles a mix of requirements, specs, and unknown comments", () => {
    const comments: HtmlComment[] = [
      { value: "@trace[requirement id=REQ-001 category=pricing]", line: 1 },
      { value: "just a regular comment", line: 5 },
      { value: "@trace[spec id=SPEC-001 req=REQ-001]", line: 10 },
      { value: "@trace[spec id=SPEC-002 req=REQ-001]", line: 15 },
    ];
    const result = extractAnnotations(comments, "docs/pricing.md");
    expect(result.requirements).toHaveLength(1);
    expect(result.specs).toHaveLength(2);
  });
});
