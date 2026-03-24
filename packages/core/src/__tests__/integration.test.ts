import { describe, it, expect } from "vitest";
import { join } from "node:path";
import { scanMarkdownDir } from "../markdown/scanner.js";
import { SpecGraph } from "../model/graph.js";
import { parseTsComments } from "../typescript/parser.js";
import { extractTsAnnotations } from "../typescript/annotation.js";
import { readFileSync } from "node:fs";
import { emptySpecIndex } from "../model/types.js";
import { globby } from "globby";

const EXAMPLES_DIR = join(__dirname, "../../../../examples");
const DOCS_DIR = join(EXAMPLES_DIR, "docs");
const SRC_DIR = join(EXAMPLES_DIR, "src");
const TESTS_DIR = join(EXAMPLES_DIR, "tests");

describe("integration: markdown scanning", () => {
  it("scans example docs and finds requirements and specs", async () => {
    const result = await scanMarkdownDir(DOCS_DIR);
    expect(result.requirements.length).toBeGreaterThanOrEqual(1);
    expect(result.specs.length).toBeGreaterThanOrEqual(3);

    const reqIds = result.requirements.map((r) => r.id);
    expect(reqIds).toContain("REQ-PRICING");

    const specIds = result.specs.map((s) => s.id);
    expect(specIds).toContain("SPEC-DISCOUNT-PREMIUM");
    expect(specIds).toContain("SPEC-DISCOUNT-BULK");
    expect(specIds).toContain("SPEC-DISCOUNT-STACK");
  });
});

describe("integration: TypeScript scanning", () => {
  it("scans example source and finds impl/decision refs", async () => {
    const files = await globby(["**/*.ts"], {
      cwd: SRC_DIR,
      absolute: true,
    });

    const index = emptySpecIndex();
    for (const filePath of files) {
      const source = readFileSync(filePath, "utf-8");
      const comments = parseTsComments(source);
      const annotations = extractTsAnnotations(comments, filePath);
      index.implRefs.push(...annotations.implRefs);
      index.decisionRefs.push(...annotations.decisionRefs);
    }

    expect(index.implRefs.length).toBeGreaterThanOrEqual(3);
    const implSpecIds = index.implRefs.map((i) => i.specId);
    expect(implSpecIds).toContain("SPEC-DISCOUNT-PREMIUM");
    expect(implSpecIds).toContain("SPEC-DISCOUNT-BULK");
    expect(implSpecIds).toContain("SPEC-DISCOUNT-STACK");

    expect(index.decisionRefs.length).toBeGreaterThanOrEqual(1);
  });

  it("scans example tests and finds test refs", async () => {
    const files = await globby(["**/*.ts"], {
      cwd: TESTS_DIR,
      absolute: true,
    });

    const index = emptySpecIndex();
    for (const filePath of files) {
      const source = readFileSync(filePath, "utf-8");
      const comments = parseTsComments(source);
      const annotations = extractTsAnnotations(comments, filePath);
      index.testRefs.push(...annotations.testRefs);
    }

    expect(index.testRefs.length).toBeGreaterThanOrEqual(3);
    const testSpecIds = index.testRefs.map((t) => t.specId);
    expect(testSpecIds).toContain("SPEC-DISCOUNT-PREMIUM");
    expect(testSpecIds).toContain("SPEC-DISCOUNT-BULK");
    expect(testSpecIds).toContain("SPEC-DISCOUNT-STACK");
  });
});

describe("integration: SpecGraph", () => {
  it("builds links from example data", async () => {
    const mdResult = await scanMarkdownDir(DOCS_DIR);
    const index = emptySpecIndex();
    index.requirements.push(...mdResult.requirements);
    index.specs.push(...mdResult.specs);

    // Add impl refs from source
    const srcFiles = await globby(["**/*.ts"], {
      cwd: SRC_DIR,
      absolute: true,
    });
    for (const filePath of srcFiles) {
      const source = readFileSync(filePath, "utf-8");
      const comments = parseTsComments(source);
      const annotations = extractTsAnnotations(comments, filePath);
      index.implRefs.push(...annotations.implRefs);
      index.decisionRefs.push(...annotations.decisionRefs);
    }

    // Add test refs
    const testFiles = await globby(["**/*.ts"], {
      cwd: TESTS_DIR,
      absolute: true,
    });
    for (const filePath of testFiles) {
      const source = readFileSync(filePath, "utf-8");
      const comments = parseTsComments(source);
      const annotations = extractTsAnnotations(comments, filePath);
      index.testRefs.push(...annotations.testRefs);
    }

    const graph = new SpecGraph(index);
    const links = graph.buildLinks();

    expect(links.length).toBe(3);

    // All specs should have implementations
    for (const link of links) {
      expect(link.coverage.hasImplementation).toBe(true);
      expect(link.requirement?.id).toBe("REQ-PRICING");
    }

    // All specs should have tests
    for (const link of links) {
      expect(link.coverage.hasTest).toBe(true);
    }

    // SPEC-DISCOUNT-STACK should have a decision
    const stackLink = links.find(
      (l) => l.spec.id === "SPEC-DISCOUNT-STACK",
    );
    expect(stackLink?.decisions.length).toBeGreaterThanOrEqual(1);
  });
});
