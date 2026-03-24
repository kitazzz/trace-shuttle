import type { Requirement, Spec } from "../model/types.js";
import type { HtmlComment } from "./parser.js";
import { parseTrace } from "../trace/parse-trace.js";
import {
  traceNodeToRequirement,
  traceNodeToSpec,
} from "../trace/trace-to-model.js";

/**
 * Try to parse a comment as a @trace[requirement ...] annotation.
 */
export function parseRequirement(
  comment: HtmlComment,
  filePath: string,
): Requirement | null {
  const node = parseTrace(comment.value, filePath, comment.line);
  if (!node) return null;
  return traceNodeToRequirement(node);
}

/**
 * Try to parse a comment as a @trace[spec ...] annotation.
 */
export function parseSpec(
  comment: HtmlComment,
  filePath: string,
): Spec | null {
  const node = parseTrace(comment.value, filePath, comment.line);
  if (!node) return null;
  return traceNodeToSpec(node);
}

/**
 * Extract all requirements and specs from a list of HTML comments.
 */
export function extractAnnotations(
  comments: HtmlComment[],
  filePath: string,
): { requirements: Requirement[]; specs: Spec[] } {
  const requirements: Requirement[] = [];
  const specs: Spec[] = [];

  for (const comment of comments) {
    const req = parseRequirement(comment, filePath);
    if (req) {
      requirements.push(req);
      continue;
    }
    const spec = parseSpec(comment, filePath);
    if (spec) {
      specs.push(spec);
    }
  }

  return { requirements, specs };
}
