import type { TSESTree } from "@typescript-eslint/utils";
import type { SourceCode } from "@typescript-eslint/utils/ts-eslint";
import { parseTrace } from "@spec-shuttle/core";

export interface ParsedAnnotation {
  type: "impl" | "test" | "needs-review";
  specId: string | null;
  line: number;
}

/**
 * Parse a comment string into a ParsedAnnotation if recognized.
 */
export function parseCommentText(
  text: string,
  line: number,
): ParsedAnnotation | null {
  const node = parseTrace(text, "", line);
  if (!node) return null;

  switch (node.kind) {
    case "impl":
      return { type: "impl", specId: node.attrs["spec"] ?? null, line };
    case "test":
      return { type: "test", specId: node.attrs["spec"] ?? null, line };
    case "needs-review":
      return { type: "needs-review", specId: null, line };
    default:
      return null;
  }
}

/**
 * Get parsed annotations from comments immediately before a node.
 */
export function getAnnotationsBefore(
  sourceCode: SourceCode,
  node: TSESTree.Node,
): ParsedAnnotation[] {
  const comments = sourceCode.getCommentsBefore(node);
  const annotations: ParsedAnnotation[] = [];
  for (const comment of comments) {
    const parsed = parseCommentText(
      comment.value,
      comment.loc.start.line,
    );
    if (parsed) annotations.push(parsed);
  }
  return annotations;
}

/**
 * Get all annotations in the entire file.
 */
export function getAllAnnotations(
  sourceCode: SourceCode,
): ParsedAnnotation[] {
  const allComments = sourceCode.getAllComments();
  const annotations: ParsedAnnotation[] = [];
  for (const comment of allComments) {
    const parsed = parseCommentText(
      comment.value,
      comment.loc.start.line,
    );
    if (parsed) annotations.push(parsed);
  }
  return annotations;
}
