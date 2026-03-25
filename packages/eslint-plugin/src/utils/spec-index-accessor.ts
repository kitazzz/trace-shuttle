import type { IndexedSpecIndex } from "@kitazzz/trace-shuttle-core";
import {
  emptyIndexedSpecIndex,
  getSpecIndex,
} from "@kitazzz/trace-shuttle-core";

/**
 * Retrieve the docsDir from ESLint settings.
 */
export function getDocsDir(settings: Record<string, unknown>): string | null {
  const docsDir = settings["trace-shuttle/docsDir"];
  return typeof docsDir === "string" ? docsDir : null;
}

/**
 * Retrieve srcDirs from ESLint settings.
 */
export function getSrcDirs(settings: Record<string, unknown>): string[] {
  const srcDirs = settings["trace-shuttle/srcDirs"];
  if (Array.isArray(srcDirs)) {
    return srcDirs.filter((d): d is string => typeof d === "string");
  }
  return [];
}

// Synchronous cache for ESLint rules (populated asynchronously beforehand)
let syncCache: IndexedSpecIndex | null = null;

/**
 * Set the IndexedSpecIndex cache synchronously (for use in ESLint rules).
 */
export function setSpecIndexSync(index: IndexedSpecIndex): void {
  syncCache = index;
}

/**
 * Get the IndexedSpecIndex synchronously from cache.
 * Returns an empty index if not cached.
 */
export function getSpecIndexSync(): IndexedSpecIndex {
  return syncCache ?? emptyIndexedSpecIndex();
}

/**
 * Populate the spec index cache. Call this from the plugin's processor or config.
 */
export async function populateSpecIndex(
  settings: Record<string, unknown>,
): Promise<IndexedSpecIndex> {
  const docsDir = getDocsDir(settings);
  if (!docsDir) return emptyIndexedSpecIndex();

  const srcDirs = getSrcDirs(settings);
  const index = await getSpecIndex(docsDir, srcDirs);
  setSpecIndexSync(index);
  return index;
}
