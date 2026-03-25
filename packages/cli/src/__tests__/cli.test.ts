import { describe, it, expect, beforeEach, vi } from "vitest";
import { join } from "node:path";
import { createProgram } from "../cli.js";
import { clearSpecIndexCache } from "@kitazzz/trace-shuttle-core";

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

beforeEach(() => {
  clearSpecIndexCache();
});

function captureOutput(
  fn: () => Promise<void>,
): Promise<{ stdout: string; stderr: string }> {
  const logs: string[] = [];
  const errs: string[] = [];
  const origLog = console.log;
  const origErr = console.error;
  console.log = (...args: unknown[]) => logs.push(args.join(" "));
  console.error = (...args: unknown[]) => errs.push(args.join(" "));
  return fn().then(
    () => {
      console.log = origLog;
      console.error = origErr;
      return { stdout: logs.join("\n"), stderr: errs.join("\n") };
    },
    (err) => {
      console.log = origLog;
      console.error = origErr;
      throw err;
    },
  );
}

describe("CLI: list specs", () => {
  it("lists all specs with coverage", async () => {
    const program = createProgram();
    const { stdout } = await captureOutput(() =>
      program.parseAsync([
        "node",
        "cli",
        "list",
        "specs",
        "--docs",
        DOCS_DIR,
        "--src",
        SRC_DIR,
        TESTS_DIR,
      ]),
    );
    expect(stdout).toContain("SPEC-DISCOUNT-PREMIUM");
    expect(stdout).toContain("SPEC-DISCOUNT-BULK");
    expect(stdout).toContain("SPEC-DISCOUNT-STACK");
    expect(stdout).toContain("impl:+");
    expect(stdout).toContain("test:+");
  });
});

describe("CLI: find spec", () => {
  it("shows details for a spec", async () => {
    const program = createProgram();
    const { stdout } = await captureOutput(() =>
      program.parseAsync([
        "node",
        "cli",
        "find",
        "spec",
        "SPEC-DISCOUNT-PREMIUM",
        "--docs",
        DOCS_DIR,
        "--src",
        SRC_DIR,
        TESTS_DIR,
      ]),
    );
    expect(stdout).toContain("Spec: SPEC-DISCOUNT-PREMIUM");
    expect(stdout).toContain("Requirement: REQ-PRICING");
    expect(stdout).toContain("Implemented: true");
    expect(stdout).toContain("Tested: true");
  });

  it("reports error for unknown spec", async () => {
    const program = createProgram();
    const { stderr } = await captureOutput(() =>
      program.parseAsync([
        "node",
        "cli",
        "find",
        "spec",
        "SPEC-UNKNOWN",
        "--docs",
        DOCS_DIR,
        "--src",
        SRC_DIR,
      ]),
    );
    expect(stderr).toContain("not found");
  });
});

describe("CLI: find file", () => {
  it("shows annotations for a source file", async () => {
    const program = createProgram();
    const filePath = join(SRC_DIR, "pricing/discount.ts");
    const { stdout } = await captureOutput(() =>
      program.parseAsync([
        "node",
        "cli",
        "find",
        "file",
        filePath,
        "--docs",
        DOCS_DIR,
        "--src",
        SRC_DIR,
      ]),
    );
    expect(stdout).toContain("@trace[impl");
  });

  it("shows mixed annotations including needs-review in complex examples", async () => {
    const program = createProgram();
    const filePath = join(COMPLEX_SRC_DIR, "checkout/flows/shipping.ts");
    const { stdout } = await captureOutput(() =>
      program.parseAsync([
        "node",
        "cli",
        "find",
        "file",
        filePath,
        "--docs",
        COMPLEX_DOCS_DIR,
        "--src",
        COMPLEX_SRC_DIR,
        COMPLEX_TESTS_DIR,
      ]),
    );
    expect(stdout).toContain("@trace[impl spec=SPEC-CHECKOUT-EXPRESS]");
    expect(stdout).toContain("@trace[needs-review]");
  });
});

describe("CLI: validate", () => {
  it("reports no issues for valid examples", async () => {
    const program = createProgram();
    const { stdout } = await captureOutput(() =>
      program.parseAsync([
        "node",
        "cli",
        "validate",
        "--docs",
        DOCS_DIR,
        "--src",
        SRC_DIR,
        TESTS_DIR,
      ]),
    );
    expect(stdout).toContain("No issues found");
  });

  it("reports broken references for invalid examples", async () => {
    const program = createProgram();
    const { stdout } = await captureOutput(() =>
      program.parseAsync([
        "node",
        "cli",
        "validate",
        "--docs",
        BROKEN_DOCS_DIR,
        "--src",
        BROKEN_SRC_DIR,
        BROKEN_TESTS_DIR,
      ]),
    );
    expect(stdout).toContain("[orphan-impl]");
    expect(stdout).toContain("[orphan-test]");
    expect(stdout).toContain("[missing-requirement]");
  });
});

describe("CLI: list specs", () => {
  it("shows mixed coverage states for complex examples", async () => {
    const program = createProgram();
    const { stdout } = await captureOutput(() =>
      program.parseAsync([
        "node",
        "cli",
        "list",
        "specs",
        "--docs",
        COMPLEX_DOCS_DIR,
        "--src",
        COMPLEX_SRC_DIR,
        COMPLEX_TESTS_DIR,
      ]),
    );
    expect(stdout).toContain("SPEC-CHECKOUT-EXPRESS  impl:+  test:-");
    expect(stdout).toContain("SPEC-CHECKOUT-GIFT-WRAP  impl:-  test:+");
    expect(stdout).toContain("SPEC-CHECKOUT-AUDIT  impl:-  test:-");
  });
});
