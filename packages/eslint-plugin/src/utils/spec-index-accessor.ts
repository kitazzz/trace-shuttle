import type { SpecIndex } from "@spec-shuttle/core";
import { emptySpecIndex, getSpecIndex } from "@spec-shuttle/core";

/**
 * Retrieve the docsDir from ESLint settings.
 */
export function getDocsDir(settings: Record<string, unknown>): string | null {
  const docsDir = settings["shuttle/docsDir"];
  return typeof docsDir === "string" ? docsDir : null;
}

/**
 * Retrieve srcDirs from ESLint settings.
 */
export function getSrcDirs(settings: Record<string, unknown>): string[] {
  const srcDirs = settings["shuttle/srcDirs"];
  if (Array.isArray(srcDirs)) {
    return srcDirs.filter((d): d is string => typeof d === "string");
  }
  return [];
}

// Synchronous cache for ESLint rules (populated asynchronously beforehand)
let syncCache: SpecIndex | null = null;

/**
 * Set the SpecIndex cache synchronously (for use in ESLint rules).
 */
export function setSpecIndexSync(index: SpecIndex): void {
  syncCache = index;
}

/**
 * Get the SpecIndex synchronously from cache.
 * Returns an empty index if not cached.
 */
export function getSpecIndexSync(): SpecIndex {
  return syncCache ?? emptySpecIndex();
}

/**
 * Populate the spec index cache. Call this from the plugin's processor or config.
 */
export async function populateSpecIndex(
  settings: Record<string, unknown>,
): Promise<SpecIndex> {
  const docsDir = getDocsDir(settings);
  if (!docsDir) return emptySpecIndex();

  const srcDirs = getSrcDirs(settings);
  const index = await getSpecIndex(docsDir, srcDirs);
  setSpecIndexSync(index);
  return index;
}
