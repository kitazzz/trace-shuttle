import type { ImplRef, TestRef, DecisionRef } from "../model/types.js";
import type { SourceComment } from "./parser.js";

const IMPL_RE = /^@impl\s+(\S+)/;
const TEST_RE = /^@test\s+(\S+)/;
const DECISION_RE = /^@decision(?:\s+(\S+))?\s*(.*)?$/s;
const NEEDS_HUMAN_REVIEW_RE = /^@needs-human-review/;

export interface ParsedAnnotation {
  type: "impl" | "test" | "decision" | "needs-human-review";
  specId: string | null;
  description: string;
  line: number;
}

/**
 * Parse a single comment for spec-shuttle annotations.
 */
export function parseAnnotation(
  comment: SourceComment,
): ParsedAnnotation | null {
  const value = comment.value.replace(/^\*\s*/, "").trim();

  if (NEEDS_HUMAN_REVIEW_RE.test(value)) {
    return {
      type: "needs-human-review",
      specId: null,
      description: "",
      line: comment.line,
    };
  }

  const implMatch = value.match(IMPL_RE);
  if (implMatch) {
    return {
      type: "impl",
      specId: implMatch[1],
      description: "",
      line: comment.line,
    };
  }

  const testMatch = value.match(TEST_RE);
  if (testMatch) {
    return {
      type: "test",
      specId: testMatch[1],
      description: "",
      line: comment.line,
    };
  }

  const decisionMatch = value.match(DECISION_RE);
  if (decisionMatch) {
    return {
      type: "decision",
      specId: decisionMatch[1] || null,
      description: decisionMatch[2]?.trim() ?? "",
      line: comment.line,
    };
  }

  return null;
}

/**
 * Extract all impl, test, and decision refs from a list of source comments.
 */
export function extractTsAnnotations(
  comments: SourceComment[],
  filePath: string,
): {
  implRefs: ImplRef[];
  testRefs: TestRef[];
  decisionRefs: DecisionRef[];
} {
  const implRefs: ImplRef[] = [];
  const testRefs: TestRef[] = [];
  const decisionRefs: DecisionRef[] = [];

  for (const comment of comments) {
    const annotation = parseAnnotation(comment);
    if (!annotation) continue;

    switch (annotation.type) {
      case "impl":
        implRefs.push({
          specId: annotation.specId!,
          filePath,
          line: annotation.line,
          nodeDescription: "",
        });
        break;
      case "test":
        testRefs.push({
          specId: annotation.specId!,
          filePath,
          line: annotation.line,
          testName: "",
        });
        break;
      case "decision":
        decisionRefs.push({
          specId: annotation.specId,
          description: annotation.description,
          filePath,
          line: annotation.line,
        });
        break;
    }
  }

  return { implRefs, testRefs, decisionRefs };
}
