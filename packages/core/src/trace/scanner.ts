import { readFile } from "node:fs/promises";
import { globby } from "globby";
import type { TraceNode } from "../model/types.js";
import { parseTrace } from "./parse-trace.js";

const MD_COMMENT_RE = /<!--\s*([\s\S]*?)\s*-->/g;

/**
 * Scan markdown docs for @trace[...] annotations.
 */
export async function scanDocsForTraceNodes(
  docsDir: string,
): Promise<TraceNode[]> {
  const files = await globby("**/*.md", { cwd: docsDir, absolute: true });
  const nodes: TraceNode[] = [];

  for (const filePath of files) {
    const content = await readFile(filePath, "utf-8");
    const lines = content.split("\n");

    let match: RegExpExecArray | null;
    while ((match = MD_COMMENT_RE.exec(content)) !== null) {
      const raw = match[1].trim();
      // Calculate line number
      const charIndex = match.index;
      const line =
        content.substring(0, charIndex).split("\n").length;
      const node = parseTrace(raw, filePath, line);
      if (node) nodes.push(node);
    }
  }

  return nodes;
}

const TS_LINE_COMMENT_RE = /\/\/\s*(.*)/g;
const TS_BLOCK_COMMENT_RE = /\/\*\s*([\s\S]*?)\s*\*\//g;

/**
 * Scan source directories for @trace[...] annotations in JS/TS files.
 */
export async function scanSourceForTraceNodes(
  srcDirs: string[],
): Promise<TraceNode[]> {
  const nodes: TraceNode[] = [];

  for (const srcDir of srcDirs) {
    const files = await globby(
      ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
      {
        cwd: srcDir,
        absolute: true,
        ignore: ["**/*.d.ts", "**/node_modules/**"],
      },
    );

    for (const filePath of files) {
      const content = await readFile(filePath, "utf-8");
      nodes.push(...extractTraceNodesFromSource(content, filePath));
    }
  }

  return nodes;
}

function extractTraceNodesFromSource(
  content: string,
  filePath: string,
): TraceNode[] {
  const nodes: TraceNode[] = [];

  // Line comments
  let match: RegExpExecArray | null;
  const lineRe = new RegExp(TS_LINE_COMMENT_RE.source, "g");
  while ((match = lineRe.exec(content)) !== null) {
    const line = content.substring(0, match.index).split("\n").length;
    const node = parseTrace(match[1], filePath, line);
    if (node) nodes.push(node);
  }

  // Block comments
  const blockRe = new RegExp(TS_BLOCK_COMMENT_RE.source, "gs");
  while ((match = blockRe.exec(content)) !== null) {
    const line = content.substring(0, match.index).split("\n").length;
    const node = parseTrace(match[1], filePath, line);
    if (node) nodes.push(node);
  }

  return nodes;
}

/**
 * Scan both docs and source directories for all @trace[...] annotations.
 */
export async function scanAll(
  docsDir: string,
  srcDirs: string[],
): Promise<TraceNode[]> {
  const [docNodes, srcNodes] = await Promise.all([
    scanDocsForTraceNodes(docsDir),
    scanSourceForTraceNodes(srcDirs),
  ]);
  return [...docNodes, ...srcNodes];
}
