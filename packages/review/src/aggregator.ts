import { getSpecIndex, SpecGraph } from "@spec-shuttle/core";
import type { SpecLink } from "@spec-shuttle/core";

export interface AggregateResult {
  links: SpecLink[];
  totalSpecs: number;
  implemented: number;
  tested: number;
  orphaned: number;
}

/**
 * Build the full SpecGraph and aggregate coverage statistics.
 */
export async function aggregate(
  docsDir: string,
  srcDirs: string[],
): Promise<AggregateResult> {
  const index = await getSpecIndex(docsDir, srcDirs);
  const graph = new SpecGraph(index);
  const links = graph.buildLinks();

  return {
    links,
    totalSpecs: links.length,
    implemented: links.filter((l) => l.coverage.hasImplementation).length,
    tested: links.filter((l) => l.coverage.hasTest).length,
    orphaned: graph.findOrphanSpecs().length,
  };
}
