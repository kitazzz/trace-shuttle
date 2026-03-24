import type { SpecIndex } from "./types.js";

export interface ValidationIssue {
  type: "orphan-impl" | "orphan-test" | "orphan-decision" | "missing-requirement";
  message: string;
  filePath: string;
  line: number;
}

/**
 * Validate referential integrity of a SpecIndex.
 */
export function validateSpecIndex(index: SpecIndex): ValidationIssue[] {
  const specIds = new Set(index.specs.map((s) => s.id));
  const reqIds = new Set(index.requirements.map((r) => r.id));
  const issues: ValidationIssue[] = [];

  for (const impl of index.implRefs) {
    if (!specIds.has(impl.specId)) {
      issues.push({
        type: "orphan-impl",
        message: `@impl references unknown spec "${impl.specId}"`,
        filePath: impl.filePath,
        line: impl.line,
      });
    }
  }

  for (const test of index.testRefs) {
    if (!specIds.has(test.specId)) {
      issues.push({
        type: "orphan-test",
        message: `@test references unknown spec "${test.specId}"`,
        filePath: test.filePath,
        line: test.line,
      });
    }
  }

  for (const decision of index.decisionRefs) {
    if (decision.specId && !specIds.has(decision.specId)) {
      issues.push({
        type: "orphan-decision",
        message: `@decision references unknown spec "${decision.specId}"`,
        filePath: decision.filePath,
        line: decision.line,
      });
    }
  }

  for (const spec of index.specs) {
    if (!reqIds.has(spec.requirementId)) {
      issues.push({
        type: "missing-requirement",
        message: `@spec "${spec.id}" references unknown requirement "${spec.requirementId}"`,
        filePath: spec.filePath,
        line: spec.line,
      });
    }
  }

  return issues;
}
