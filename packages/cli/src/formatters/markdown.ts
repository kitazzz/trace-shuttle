import type { AggregateResult } from "../aggregator.js";

/**
 * Format the aggregate result as human-readable markdown.
 */
export function formatMarkdown(result: AggregateResult): string {
  const lines: string[] = [];

  lines.push("# Trace Shuttle Review");
  lines.push("");
  lines.push("## Coverage Summary");
  lines.push("");
  lines.push(`| Metric | Count |`);
  lines.push(`|--------|-------|`);
  lines.push(`| Total Specs | ${result.totalSpecs} |`);
  lines.push(`| Implemented | ${result.implemented} |`);
  lines.push(`| Tested | ${result.tested} |`);
  lines.push(`| Orphaned | ${result.orphaned} |`);
  lines.push("");

  if (result.links.length === 0) {
    lines.push("No specs found.");
    return lines.join("\n");
  }

  lines.push("## Spec Links");
  lines.push("");

  for (const link of result.links) {
    const status = getStatusEmoji(link.coverage);
    lines.push(`### ${status} ${link.spec.id}`);
    lines.push("");

    if (link.requirement) {
      lines.push(
        `- **Requirement:** ${link.requirement.id} (${link.requirement.category})`,
      );
    }

    lines.push(`- **Defined in:** ${link.spec.filePath}:${link.spec.line}`);
    lines.push("");

    if (link.implementations.length > 0) {
      lines.push("**Implementations:**");
      for (const impl of link.implementations) {
        lines.push(`- ${impl.filePath}:${impl.line}`);
      }
      lines.push("");
    }

    if (link.tests.length > 0) {
      lines.push("**Tests:**");
      for (const test of link.tests) {
        lines.push(`- ${test.filePath}:${test.line}`);
      }
      lines.push("");
    }
  }

  return lines.join("\n");
}

function getStatusEmoji(coverage: {
  hasImplementation: boolean;
  hasTest: boolean;
}): string {
  if (coverage.hasImplementation && coverage.hasTest) return "[FULL]";
  if (coverage.hasImplementation) return "[IMPL]";
  if (coverage.hasTest) return "[TEST]";
  return "[NONE]";
}
