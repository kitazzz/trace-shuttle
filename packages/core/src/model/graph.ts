import type {
  IndexedSpecIndex,
  SpecLink,
  Requirement,
  Spec,
  TraceNode,
} from "./types.js";

/**
 * SpecGraph resolves the relationships in an IndexedSpecIndex into SpecLink objects,
 * enabling coverage analysis and orphan detection.
 */
export class SpecGraph {
  private readonly index: IndexedSpecIndex;

  constructor(index: IndexedSpecIndex) {
    this.index = index;
  }

  /**
   * Build SpecLink objects for every spec in the index.
   */
  buildLinks(): SpecLink[] {
    const links: SpecLink[] = [];
    for (const spec of this.index.specs.values()) {
      const requirement = this.index.requirements.get(spec.requirementId) ?? null;
      const implementations = this.index.implsBySpec.get(spec.id) ?? [];
      const tests = this.index.testsBySpec.get(spec.id) ?? [];
      links.push({
        spec,
        requirement,
        implementations,
        tests,
        coverage: {
          hasImplementation: implementations.length > 0,
          hasTest: tests.length > 0,
        },
      });
    }
    return links;
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
    return new Set(this.index.specs.keys());
  }

  /**
   * Find all trace nodes in a given file.
   */
  findRefsByFile(filePath: string): TraceNode[] {
    return this.index.refsByFile.get(filePath) ?? [];
  }

  /**
   * Find all specs defined in a given file.
   */
  findSpecsByFile(filePath: string): Spec[] {
    const nodes = this.findRefsByFile(filePath);
    const specs: Spec[] = [];
    for (const node of nodes) {
      if (node.kind === "spec" && node.attrs["id"]) {
        const spec = this.index.specs.get(node.attrs["id"]);
        if (spec) specs.push(spec);
      }
    }
    return specs;
  }

  /**
   * Find the requirement associated with a given spec ID.
   */
  findRequirementBySpecId(specId: string): Requirement | null {
    const spec = this.index.specs.get(specId);
    if (!spec) return null;
    return this.index.requirements.get(spec.requirementId) ?? null;
  }

  /**
   * Find the full SpecLink for a given spec ID.
   */
  findLinkBySpecId(specId: string): SpecLink | null {
    const links = this.buildLinks();
    return links.find((l) => l.spec.id === specId) ?? null;
  }
}
