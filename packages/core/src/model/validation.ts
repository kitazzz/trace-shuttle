import type { IndexedSpecIndex } from "./types.js";

export interface ValidationIssue {
  type: "orphan-impl" | "orphan-test" | "missing-requirement";
  message: string;
  filePath: string;
  line: number;
}

/**
 * Validate referential integrity of an IndexedSpecIndex.
 */
export function validateSpecIndex(
  index: IndexedSpecIndex,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const [specId, impls] of index.implsBySpec) {
    if (!index.specs.has(specId)) {
      for (const impl of impls) {
        issues.push({
          type: "orphan-impl",
          message: `@trace[impl] references unknown spec "${specId}"`,
          filePath: impl.filePath,
          line: impl.line,
        });
      }
    }
  }

  for (const [specId, tests] of index.testsBySpec) {
    if (!index.specs.has(specId)) {
      for (const test of tests) {
        issues.push({
          type: "orphan-test",
          message: `@trace[test] references unknown spec "${specId}"`,
          filePath: test.filePath,
          line: test.line,
        });
      }
    }
  }

  for (const spec of index.specs.values()) {
    if (!index.requirements.has(spec.requirementId)) {
      issues.push({
        type: "missing-requirement",
        message: `@trace[spec] "${spec.id}" references unknown requirement "${spec.requirementId}"`,
        filePath: spec.filePath,
        line: spec.line,
      });
    }
  }

  return issues;
}
