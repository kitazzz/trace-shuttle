import { unified } from "unified";
import remarkParse from "remark-parse";
import { visit } from "unist-util-visit";
import type { Root, Html } from "mdast";

export interface HtmlComment {
  value: string;
  line: number;
}

/**
 * Parse a markdown string and extract all HTML comments (<!-- ... -->).
 */
export function parseMarkdownComments(content: string): HtmlComment[] {
  const tree = unified().use(remarkParse).parse(content) as Root;
  const comments: HtmlComment[] = [];

  visit(tree, "html", (node: Html) => {
    const match = node.value.match(/^<!--\s*([\s\S]*?)\s*-->$/);
    if (match) {
      comments.push({
        value: match[1].trim(),
        line: node.position?.start.line ?? 0,
      });
    }
  });

  return comments;
}
