import { describe, it, expect } from "vitest";
import { parseMarkdownComments } from "../parser.js";

describe("parseMarkdownComments", () => {
  it("extracts a single HTML comment", () => {
    const md = `# Title\n\n<!-- @requirement id: REQ-001 category: pricing -->\n\nSome text.`;
    const comments = parseMarkdownComments(md);
    expect(comments).toHaveLength(1);
    expect(comments[0].value).toBe(
      "@requirement id: REQ-001 category: pricing",
    );
    expect(comments[0].line).toBe(3);
  });

  it("extracts multiple comments", () => {
    const md = `<!-- @requirement id: REQ-001 category: pricing -->
# Pricing

<!-- @spec id: SPEC-001 requirement: REQ-001 -->

Details here.

<!-- @spec id: SPEC-002 requirement: REQ-001 -->
`;
    const comments = parseMarkdownComments(md);
    expect(comments).toHaveLength(3);
  });

  it("ignores non-comment HTML", () => {
    const md = `<div>not a comment</div>\n\n<!-- valid comment -->`;
    const comments = parseMarkdownComments(md);
    expect(comments).toHaveLength(1);
    expect(comments[0].value).toBe("valid comment");
  });

  it("handles multiline comments", () => {
    const md = `<!--
  @requirement id: REQ-002
  category: auth
  User must be authenticated
-->`;
    const comments = parseMarkdownComments(md);
    expect(comments).toHaveLength(1);
    expect(comments[0].value).toContain("@requirement id: REQ-002");
  });

  it("returns empty for markdown without comments", () => {
    const md = `# Just a title\n\nSome paragraph.`;
    expect(parseMarkdownComments(md)).toHaveLength(0);
  });
});
