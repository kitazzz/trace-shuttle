import type { TSESTree } from "@typescript-eslint/utils";
import type { SourceCode } from "@typescript-eslint/utils/ts-eslint";

export interface ParsedAnnotation {
  type: "impl" | "test" | "decision" | "needs-human-review";
  specId: string | null;
  line: number;
}

const IMPL_RE = /^@impl\s+(\S+)/;
const TEST_RE = /^@test\s+(\S+)/;
const DECISION_RE = /^@decision(?:\s+(\S+))?/;
const NEEDS_HUMAN_REVIEW_RE = /^@needs-human-review/;

/**
 * Parse a comment string into a ParsedAnnotation if recognized.
 */
export function parseCommentText(
  text: string,
  line: number,
): ParsedAnnotation | null {
  const value = text.replace(/^\*\s*/, "").trim();

  if (NEEDS_HUMAN_REVIEW_RE.test(value)) {
    return { type: "needs-human-review", specId: null, line };
  }

  const implMatch = value.match(IMPL_RE);
  if (implMatch) {
    return { type: "impl", specId: implMatch[1], line };
  }

  const testMatch = value.match(TEST_RE);
  if (testMatch) {
    return { type: "test", specId: testMatch[1], line };
  }

  const decisionMatch = value.match(DECISION_RE);
  if (decisionMatch) {
    return { type: "decision", specId: decisionMatch[1] || null, line };
  }

  return null;
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
