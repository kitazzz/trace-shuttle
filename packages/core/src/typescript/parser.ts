import { parse, type TSESTree } from "@typescript-eslint/typescript-estree";

export interface SourceComment {
  value: string;
  line: number;
  type: "line" | "block";
}

/**
 * Parse a TypeScript/JavaScript source and extract all comments.
 */
export function parseTsComments(source: string): SourceComment[] {
  const ast = parse(source, {
    comment: true,
    loc: true,
    range: true,
    jsx: true,
  });

  const comments: SourceComment[] = [];
  for (const comment of ast.comments ?? []) {
    comments.push({
      value: comment.value.trim(),
      line: comment.loc.start.line,
      type: comment.type === "Line" ? "line" : "block",
    });
  }

  return comments;
}

/**
 * Parse a TypeScript source file and return the AST with comments.
 */
export function parseTsFile(source: string): TSESTree.Program {
  return parse(source, {
    comment: true,
    loc: true,
    range: true,
    jsx: true,
  });
}
