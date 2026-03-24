import type { TraceNode } from "../model/types.js";

const TRACE_RE = /^@trace\[(\S+)((?:\s+\w+=(?:"[^"]*"|\S+))*)\s*\]$/;
const KV_RE = /(\w+)=(?:"([^"]*)"|(\S+))/g;

/**
 * Parse a raw annotation string into a TraceNode.
 * Strips leading `*` (block comment prefix) and trims before matching.
 */
export function parseTrace(
  raw: string,
  filePath: string,
  line: number,
): TraceNode | null {
  const value = raw.replace(/^\*\s*/, "").trim();
  const match = value.match(TRACE_RE);
  if (!match) return null;

  const kind = match[1] as TraceNode["kind"];
  const validKinds = new Set([
    "requirement",
    "spec",
    "impl",
    "test",
    "needs-review",
  ]);
  if (!validKinds.has(kind)) return null;

  const attrs: Record<string, string> = {};
  const kvStr = match[2];
  if (kvStr) {
    let kvMatch: RegExpExecArray | null;
    while ((kvMatch = KV_RE.exec(kvStr)) !== null) {
      attrs[kvMatch[1]] = kvMatch[2] ?? kvMatch[3];
    }
  }

  return { kind, attrs, filePath, line };
}
