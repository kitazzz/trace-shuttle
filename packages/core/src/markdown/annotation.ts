import type { Requirement, Spec } from "../model/types.js";
import type { HtmlComment } from "./parser.js";

const REQUIREMENT_RE =
  /^@requirement\s+id:\s*(\S+)\s+category:\s*(\S+)(?:\s+(.*))?$/s;
const SPEC_RE =
  /^@spec\s+id:\s*(\S+)\s+requirement:\s*(\S+)(?:\s+(.*))?$/s;

/**
 * Try to parse a comment as a @requirement annotation.
 */
export function parseRequirement(
  comment: HtmlComment,
  filePath: string,
): Requirement | null {
  const match = comment.value.match(REQUIREMENT_RE);
  if (!match) return null;
  return {
    id: match[1],
    category: match[2],
    filePath,
    line: comment.line,
    rawText: match[3]?.trim() ?? "",
  };
}

/**
 * Try to parse a comment as a @spec annotation.
 */
export function parseSpec(
  comment: HtmlComment,
  filePath: string,
): Spec | null {
  const match = comment.value.match(SPEC_RE);
  if (!match) return null;
  return {
    id: match[1],
    requirementId: match[2],
    filePath,
    line: comment.line,
    rawText: match[3]?.trim() ?? "",
  };
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
