import { statSync } from "node:fs";
import { globby } from "globby";
import type { SpecIndex } from "../model/types.js";
import { emptySpecIndex } from "../model/types.js";
import { scanMarkdownDir } from "../markdown/scanner.js";
import { parseTsComments } from "../typescript/parser.js";
import { extractTsAnnotations } from "../typescript/annotation.js";
import { readFileSync } from "node:fs";

interface CacheEntry {
  index: SpecIndex;
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
 * Get or build a SpecIndex from the given directories.
 * Uses a module-level singleton cache with mtime-based invalidation.
 */
export async function getSpecIndex(
  docsDir: string,
  srcDirs: string[],
): Promise<SpecIndex> {
  const mtimeKey = computeMtimeKey([docsDir, ...srcDirs]);

  if (
    cached &&
    cached.docsDir === docsDir &&
    cached.mtimeKey === mtimeKey &&
    JSON.stringify(cached.srcDirs) === JSON.stringify(srcDirs)
  ) {
    return cached.index;
  }

  const index = emptySpecIndex();

  // Scan markdown docs
  const mdResult = await scanMarkdownDir(docsDir);
  index.requirements.push(...mdResult.requirements);
  index.specs.push(...mdResult.specs);

  // Scan TypeScript/JavaScript source files
  for (const srcDir of srcDirs) {
    const files = await globby(["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"], {
      cwd: srcDir,
      absolute: true,
      ignore: ["**/*.d.ts", "**/node_modules/**"],
    });

    for (const filePath of files) {
      const source = readFileSync(filePath, "utf-8");
      const comments = parseTsComments(source);
      const annotations = extractTsAnnotations(comments, filePath);
      index.implRefs.push(...annotations.implRefs);
      index.testRefs.push(...annotations.testRefs);
      index.decisionRefs.push(...annotations.decisionRefs);
    }
  }

  cached = { index, docsDir, srcDirs, mtimeKey };
  return index;
}

/**
 * Clear the cached SpecIndex. Useful for testing.
 */
export function clearSpecIndexCache(): void {
  cached = null;
}
