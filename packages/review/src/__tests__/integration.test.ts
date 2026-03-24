import { describe, it, expect, beforeEach } from "vitest";
import { join } from "node:path";
import { aggregate } from "../aggregator.js";
import { formatJson } from "../formatters/json.js";
import { formatMarkdown } from "../formatters/markdown.js";
import { clearSpecIndexCache } from "@spec-shuttle/core";

const EXAMPLES_DIR = join(__dirname, "../../../../examples");
const SIMPLE_DIR = join(EXAMPLES_DIR, "scenarios/simple");
const DOCS_DIR = join(SIMPLE_DIR, "docs");
const SRC_DIR = join(SIMPLE_DIR, "src");
const TESTS_DIR = join(SIMPLE_DIR, "tests");
const COMPLEX_DIR = join(EXAMPLES_DIR, "scenarios/complex");
const COMPLEX_DOCS_DIR = join(COMPLEX_DIR, "docs");
const COMPLEX_SRC_DIR = join(COMPLEX_DIR, "src");
const COMPLEX_TESTS_DIR = join(COMPLEX_DIR, "tests");

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

describe("review aggregator: complex examples", () => {
  it("captures mixed coverage states in a larger scenario", async () => {
    const result = await aggregate(COMPLEX_DOCS_DIR, [
      COMPLEX_SRC_DIR,
      COMPLEX_TESTS_DIR,
    ]);

    expect(result.totalSpecs).toBe(6);
    expect(result.implemented).toBe(4);
    expect(result.tested).toBe(4);
    expect(result.orphaned).toBe(1);

    const json = JSON.parse(formatJson(result));
    expect(json.links).toHaveLength(6);
    expect(
      json.links.find((link: { specId: string }) =>
        link.specId === "SPEC-CHECKOUT-AUDIT"
      ),
    ).toBeDefined();

    const md = formatMarkdown(result);
    expect(md).toContain("SPEC-CHECKOUT-EXPRESS");
    expect(md).toContain("SPEC-CHECKOUT-GIFT-WRAP");
    expect(md).toContain("[IMPL]");
    expect(md).toContain("[TEST]");
    expect(md).toContain("[NONE]");
  });
});
