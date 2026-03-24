import type { SpecIndex, SpecLink, Requirement } from "./types.js";

/**
 * SpecGraph resolves the relationships in a SpecIndex into SpecLink objects,
 * enabling coverage analysis and orphan detection.
 */
export class SpecGraph {
  private readonly index: SpecIndex;
  private readonly reqMap: Map<string, Requirement>;

  constructor(index: SpecIndex) {
    this.index = index;
    this.reqMap = new Map(index.requirements.map((r) => [r.id, r]));
  }

  /**
   * Build SpecLink objects for every spec in the index.
   */
  buildLinks(): SpecLink[] {
    return this.index.specs.map((spec) => {
      const requirement = this.reqMap.get(spec.requirementId) ?? null;
      const implementations = this.index.implRefs.filter(
        (r) => r.specId === spec.id,
      );
      const tests = this.index.testRefs.filter((r) => r.specId === spec.id);
      const decisions = this.index.decisionRefs.filter(
        (r) => r.specId === spec.id,
      );

      return {
        spec,
        requirement,
        implementations,
        tests,
        decisions,
        coverage: {
          hasImplementation: implementations.length > 0,
          hasTest: tests.length > 0,
          hasDecision: decisions.length > 0,
        },
      };
    });
  }

  /**
   * Find specs that have no implementations and no tests.
   */
  findOrphanSpecs(): SpecLink[] {
    return this.buildLinks().filter(
      (link) => !link.coverage.hasImplementation && !link.coverage.hasTest,
    );
  }

  /**
   * Find specs that have implementations but no tests.
   */
  findUntestedSpecs(): SpecLink[] {
    return this.buildLinks().filter(
      (link) => link.coverage.hasImplementation && !link.coverage.hasTest,
    );
  }

  /**
   * Find specs that have no implementations.
   */
  findUnimplementedSpecs(): SpecLink[] {
    return this.buildLinks().filter(
      (link) => !link.coverage.hasImplementation,
    );
  }

  /**
   * Get all known spec IDs.
   */
  getSpecIds(): Set<string> {
    return new Set(this.index.specs.map((s) => s.id));
  }
}
