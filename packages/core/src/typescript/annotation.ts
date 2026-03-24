import type { ImplRef, TestRef } from "../model/types.js";
import type { SourceComment } from "./parser.js";
import { parseTrace } from "../trace/parse-trace.js";

export interface ParsedAnnotation {
  type: "impl" | "test" | "needs-review";
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
  const node = parseTrace(comment.value, "", comment.line);
  if (!node) return null;

  switch (node.kind) {
    case "impl":
      return {
        type: "impl",
        specId: node.attrs["spec"] ?? null,
        description: "",
        line: comment.line,
      };
    case "test":
      return {
        type: "test",
        specId: node.attrs["spec"] ?? null,
        description: "",
        line: comment.line,
      };
    case "needs-review":
      return {
        type: "needs-review",
        specId: null,
        description: "",
        line: comment.line,
      };
    default:
      return null;
  }
}

/**
 * Extract all impl and test refs from a list of source comments.
 */
export function extractTsAnnotations(
  comments: SourceComment[],
  filePath: string,
): {
  implRefs: ImplRef[];
  testRefs: TestRef[];
} {
  const implRefs: ImplRef[] = [];
  const testRefs: TestRef[] = [];

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
    }
  }

  return { implRefs, testRefs };
}
