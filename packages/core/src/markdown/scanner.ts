import { readFile } from "node:fs/promises";
import { globby } from "globby";
import type { Requirement, Spec } from "../model/types.js";
import { parseMarkdownComments } from "./parser.js";
import { extractAnnotations } from "./annotation.js";

export interface MarkdownScanResult {
  requirements: Requirement[];
  specs: Spec[];
}

/**
 * Scan a directory for markdown files and extract all spec annotations.
 */
export async function scanMarkdownDir(
  docsDir: string,
): Promise<MarkdownScanResult> {
  const files = await globby("**/*.md", { cwd: docsDir, absolute: true });
  const requirements: Requirement[] = [];
  const specs: Spec[] = [];

  for (const filePath of files) {
    const content = await readFile(filePath, "utf-8");
    const comments = parseMarkdownComments(content);
    const annotations = extractAnnotations(comments, filePath);
    requirements.push(...annotations.requirements);
    specs.push(...annotations.specs);
  }

  return { requirements, specs };
}
