import { describe, it, expect, beforeEach } from "vitest";
import { join } from "node:path";
import { aggregate } from "../aggregator.js";
import { formatJson } from "../formatters/json.js";
import { formatMarkdown } from "../formatters/markdown.js";
import { clearSpecIndexCache } from "@spec-shuttle/core";

const EXAMPLES_DIR = join(__dirname, "../../../../examples");
const DOCS_DIR = join(EXAMPLES_DIR, "docs");
const SRC_DIR = join(EXAMPLES_DIR, "src");
const TESTS_DIR = join(EXAMPLES_DIR, "tests");

beforeEach(() => {
  clearSpecIndexCache();
});

describe("review aggregator", () => {
  it("aggregates example data into links", async () => {
    const result = await aggregate(DOCS_DIR, [SRC_DIR, TESTS_DIR]);
    expect(result.totalSpecs).toBe(3);
    expect(result.implemented).toBe(3);
    expect(result.tested).toBe(3);
    expect(result.orphaned).toBe(0);
  });
});

describe("review formatters", () => {
  it("formats as JSON", async () => {
    const result = await aggregate(DOCS_DIR, [SRC_DIR, TESTS_DIR]);
    const json = formatJson(result);
    const parsed = JSON.parse(json);
    expect(parsed.summary.totalSpecs).toBe(3);
    expect(parsed.links).toHaveLength(3);
    expect(parsed.links[0].specId).toBeDefined();
  });

  it("formats as markdown", async () => {
    const result = await aggregate(DOCS_DIR, [SRC_DIR, TESTS_DIR]);
    const md = formatMarkdown(result);
    expect(md).toContain("# Spec Shuttle Review");
    expect(md).toContain("SPEC-DISCOUNT-PREMIUM");
    expect(md).toContain("SPEC-DISCOUNT-BULK");
    expect(md).toContain("SPEC-DISCOUNT-STACK");
    expect(md).toContain("[FULL]");
  });
});
