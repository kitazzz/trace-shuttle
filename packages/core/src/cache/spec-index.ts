import { statSync } from "node:fs";
import type { IndexedSpecIndex } from "../model/types.js";
import { emptyIndexedSpecIndex } from "../model/types.js";
import { scanAll } from "../trace/scanner.js";
import { buildIndexedSpecIndex } from "../trace/build-index.js";

interface CacheEntry {
  index: IndexedSpecIndex;
  docsDir: string;
  srcDirs: string[];
  mtimeKey: string;
}

let cached: CacheEntry | null = null;

function computeMtimeKey(dirs: string[]): string {
  const mtimes: string[] = [];
  for (const dir of dirs) {
    try {
      const stat = statSync(dir);
      mtimes.push(`${dir}:${stat.mtimeMs}`);
    } catch {
      mtimes.push(`${dir}:missing`);
    }
  }
  return mtimes.join("|");
}

/**
 * Get or build an IndexedSpecIndex from the given directories.
 * Uses a module-level singleton cache with mtime-based invalidation.
 */
export async function getSpecIndex(
  docsDir: string,
  srcDirs: string[],
): Promise<IndexedSpecIndex> {
  const mtimeKey = computeMtimeKey([docsDir, ...srcDirs]);

  if (
    cached &&
    cached.docsDir === docsDir &&
    cached.mtimeKey === mtimeKey &&
    JSON.stringify(cached.srcDirs) === JSON.stringify(srcDirs)
  ) {
    return cached.index;
  }

  const nodes = await scanAll(docsDir, srcDirs);
  const index = buildIndexedSpecIndex(nodes);

  cached = { index, docsDir, srcDirs, mtimeKey };
  return index;
}

/**
 * Clear the cached index. Useful for testing.
 */
export function clearSpecIndexCache(): void {
  cached = null;
}
