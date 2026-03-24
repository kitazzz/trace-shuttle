import { describe, it, expect } from "vitest";
import { join } from "node:path";
import { SpecGraph } from "../model/graph.js";
import {
  getSpecIndex,
  clearSpecIndexCache,
} from "../cache/spec-index.js";
import { validateSpecIndex } from "../model/validation.js";

const EXAMPLES_DIR = join(__dirname, "../../../../examples");
const SIMPLE_DIR = join(EXAMPLES_DIR, "scenarios/simple");
const DOCS_DIR = join(SIMPLE_DIR, "docs");
const SRC_DIR = join(SIMPLE_DIR, "src");
const TESTS_DIR = join(SIMPLE_DIR, "tests");
const COMPLEX_DIR = join(EXAMPLES_DIR, "scenarios/complex");
const COMPLEX_DOCS_DIR = join(COMPLEX_DIR, "docs");
const COMPLEX_SRC_DIR = join(COMPLEX_DIR, "src");
const COMPLEX_TESTS_DIR = join(COMPLEX_DIR, "tests");
const BROKEN_DIR = join(EXAMPLES_DIR, "scenarios/broken-links");
const BROKEN_DOCS_DIR = join(BROKEN_DIR, "docs");
const BROKEN_SRC_DIR = join(BROKEN_DIR, "src");
const BROKEN_TESTS_DIR = join(BROKEN_DIR, "tests");

describe("integration: IndexedSpecIndex via getSpecIndex", () => {
  it("scans examples and builds an IndexedSpecIndex", async () => {
    clearSpecIndexCache();
    const index = await getSpecIndex(DOCS_DIR, [SRC_DIR, TESTS_DIR]);

    // Requirements
    expect(index.requirements.size).toBeGreaterThanOrEqual(1);
    expect(index.requirements.has("REQ-PRICING")).toBe(true);

    // Specs
    expect(index.specs.size).toBeGreaterThanOrEqual(3);
    expect(index.specs.has("SPEC-DISCOUNT-PREMIUM")).toBe(true);
    expect(index.specs.has("SPEC-DISCOUNT-BULK")).toBe(true);
    expect(index.specs.has("SPEC-DISCOUNT-STACK")).toBe(true);

    // Impl refs
    expect(index.implsBySpec.get("SPEC-DISCOUNT-PREMIUM")?.length).toBeGreaterThanOrEqual(1);
    expect(index.implsBySpec.get("SPEC-DISCOUNT-BULK")?.length).toBeGreaterThanOrEqual(1);
    expect(index.implsBySpec.get("SPEC-DISCOUNT-STACK")?.length).toBeGreaterThanOrEqual(1);

    // Test refs
    expect(index.testsBySpec.get("SPEC-DISCOUNT-PREMIUM")?.length).toBeGreaterThanOrEqual(1);
    expect(index.testsBySpec.get("SPEC-DISCOUNT-BULK")?.length).toBeGreaterThanOrEqual(1);
    expect(index.testsBySpec.get("SPEC-DISCOUNT-STACK")?.length).toBeGreaterThanOrEqual(1);
  });

  it("builds a SpecGraph from IndexedSpecIndex", async () => {
    clearSpecIndexCache();
    const index = await getSpecIndex(DOCS_DIR, [SRC_DIR, TESTS_DIR]);
    const graph = new SpecGraph(index);
    const links = graph.buildLinks();

    expect(links.length).toBe(3);

    for (const link of links) {
      expect(link.coverage.hasImplementation).toBe(true);
      expect(link.coverage.hasTest).toBe(true);
      expect(link.requirement?.id).toBe("REQ-PRICING");
    }

    expect(graph.findOrphanSpecs()).toHaveLength(0);
  });
});

describe("integration: complex example scenario", () => {
  it("indexes nested docs, source files, and tests across multiple domains", async () => {
    clearSpecIndexCache();
    const index = await getSpecIndex(COMPLEX_DOCS_DIR, [
      COMPLEX_SRC_DIR,
      COMPLEX_TESTS_DIR,
    ]);
    const graph = new SpecGraph(index);

    expect(index.requirements.size).toBe(3);
    expect(index.specs.size).toBe(6);
    expect(index.implsBySpec.get("SPEC-BILLING-PREMIUM")).toHaveLength(1);
    expect(index.implsBySpec.get("SPEC-CHECKOUT-EXPRESS")).toHaveLength(1);
    expect(index.testsBySpec.get("SPEC-CHECKOUT-GIFT-WRAP")).toHaveLength(2);

    const checkoutDocPath = join(
      COMPLEX_DOCS_DIR,
      "checkout/fulfillment.md",
    );
    const shippingFilePath = join(
      COMPLEX_SRC_DIR,
      "checkout/flows/shipping.ts",
    );

    expect(graph.findSpecsByFile(checkoutDocPath)).toHaveLength(3);
    expect(graph.findRequirementBySpecId("SPEC-CHECKOUT-EXPRESS")?.id).toBe(
      "REQ-CHECKOUT-FULFILLMENT",
    );

    const fileRefs = graph.findRefsByFile(shippingFilePath);
    expect(fileRefs.some((ref) => ref.kind === "impl")).toBe(true);
    expect(fileRefs.some((ref) => ref.kind === "needs-review")).toBe(true);

    const orphanSpecs = graph.findOrphanSpecs().map((link) => link.spec.id);
    expect(orphanSpecs).toEqual(["SPEC-CHECKOUT-AUDIT"]);

    const untestedSpecs = graph.findUntestedSpecs().map((link) => link.spec.id);
    expect(untestedSpecs).toEqual(["SPEC-CHECKOUT-EXPRESS"]);

    const unimplementedSpecs = graph
      .findUnimplementedSpecs()
      .map((link) => link.spec.id)
      .sort();
    expect(unimplementedSpecs).toEqual([
      "SPEC-CHECKOUT-AUDIT",
      "SPEC-CHECKOUT-GIFT-WRAP",
    ]);
  });
});

describe("integration: broken-links example scenario", () => {
  it("detects orphan references and missing requirements", async () => {
    clearSpecIndexCache();
    const index = await getSpecIndex(BROKEN_DOCS_DIR, [
      BROKEN_SRC_DIR,
      BROKEN_TESTS_DIR,
    ]);
    const issues = validateSpecIndex(index);

    expect(issues).toHaveLength(4);
    expect(issues.map((issue) => issue.type).sort()).toEqual([
      "missing-requirement",
      "orphan-impl",
      "orphan-test",
      "orphan-test",
    ]);

    const commandFilePath = join(BROKEN_SRC_DIR, "orders/commands.ts");
    expect(
      index.refsByFile
        .get(commandFilePath)
        ?.some((node) => node.kind === "needs-review"),
    ).toBe(true);
  });
});
