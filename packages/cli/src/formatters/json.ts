import type { AggregateResult } from "../aggregator.js";

/**
 * Format the aggregate result as JSON.
 */
export function formatJson(result: AggregateResult): string {
  return JSON.stringify(
    {
      summary: {
        totalSpecs: result.totalSpecs,
        implemented: result.implemented,
        tested: result.tested,
        orphaned: result.orphaned,
      },
      links: result.links.map((link) => ({
        specId: link.spec.id,
        requirementId: link.spec.requirementId,
        requirement: link.requirement
          ? {
              id: link.requirement.id,
              category: link.requirement.category,
              file: link.requirement.filePath,
            }
          : null,
        implementations: link.implementations.map((i) => ({
          file: i.filePath,
          line: i.line,
        })),
        tests: link.tests.map((t) => ({
          file: t.filePath,
          line: t.line,
        })),
        coverage: link.coverage,
      })),
    },
    null,
    2,
  );
}
