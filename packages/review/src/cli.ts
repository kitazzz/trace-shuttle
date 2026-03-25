import { Command } from "commander";
import { resolve } from "node:path";
import { aggregate } from "./aggregator.js";
import { formatJson } from "./formatters/json.js";
import { formatMarkdown } from "./formatters/markdown.js";
import {
  getSpecIndex,
  SpecGraph,
  validateSpecIndex,
} from "@trace-shuttle/core";

export function createProgram(): Command {
  const program = new Command();

  program
    .name("trace-shuttle")
    .description("Spec anchoring review tool")
    .version("0.1.0");

  program
    .command("review")
    .description("Generate a spec coverage report")
    .requiredOption("--docs <dir>", "Path to docs directory")
    .option("--src <dirs...>", "Paths to source directories", [])
    .option("--format <format>", "Output format (json | markdown)", "markdown")
    .action(async (opts) => {
      const docsDir = resolve(opts.docs);
      const srcDirs = (opts.src as string[]).map((d: string) => resolve(d));
      const format = opts.format as string;

      const result = await aggregate(docsDir, srcDirs);

      if (format === "json") {
        console.log(formatJson(result));
      } else {
        console.log(formatMarkdown(result));
      }
    });

  const listCmd = program.command("list").description("List resources");

  listCmd
    .command("specs")
    .description("List all specs with coverage status")
    .requiredOption("--docs <dir>", "Path to docs directory")
    .option("--src <dirs...>", "Paths to source directories", [])
    .action(async (opts) => {
      const docsDir = resolve(opts.docs);
      const srcDirs = (opts.src as string[]).map((d: string) => resolve(d));
      const index = await getSpecIndex(docsDir, srcDirs);
      const graph = new SpecGraph(index);
      const links = graph.buildLinks();

      for (const link of links) {
        const impl = link.coverage.hasImplementation ? "+" : "-";
        const test = link.coverage.hasTest ? "+" : "-";
        console.log(`${link.spec.id}  impl:${impl}  test:${test}`);
      }
    });

  const findCmd = program.command("find").description("Find resources");

  findCmd
    .command("spec <id>")
    .description("Show details for a specific spec")
    .requiredOption("--docs <dir>", "Path to docs directory")
    .option("--src <dirs...>", "Paths to source directories", [])
    .action(async (id: string, opts) => {
      const docsDir = resolve(opts.docs);
      const srcDirs = (opts.src as string[]).map((d: string) => resolve(d));
      const index = await getSpecIndex(docsDir, srcDirs);
      const graph = new SpecGraph(index);
      const link = graph.findLinkBySpecId(id);

      if (!link) {
        console.error(`Spec "${id}" not found.`);
        process.exitCode = 1;
        return;
      }

      console.log(`Spec: ${link.spec.id}`);
      console.log(`File: ${link.spec.filePath}:${link.spec.line}`);
      if (link.requirement) {
        console.log(
          `Requirement: ${link.requirement.id} (${link.requirement.category})`,
        );
      }
      console.log(`Implemented: ${link.coverage.hasImplementation}`);
      console.log(`Tested: ${link.coverage.hasTest}`);

      if (link.implementations.length > 0) {
        console.log("Implementations:");
        for (const impl of link.implementations) {
          console.log(`  ${impl.filePath}:${impl.line}`);
        }
      }

      if (link.tests.length > 0) {
        console.log("Tests:");
        for (const t of link.tests) {
          console.log(`  ${t.filePath}:${t.line}`);
        }
      }
    });

  findCmd
    .command("file <path>")
    .description("Show all annotations in a file")
    .requiredOption("--docs <dir>", "Path to docs directory")
    .option("--src <dirs...>", "Paths to source directories", [])
    .action(async (filePath: string, opts) => {
      const docsDir = resolve(opts.docs);
      const srcDirs = (opts.src as string[]).map((d: string) => resolve(d));
      const resolvedPath = resolve(filePath);
      const index = await getSpecIndex(docsDir, srcDirs);
      const graph = new SpecGraph(index);
      const refs = graph.findRefsByFile(resolvedPath);

      if (refs.length === 0) {
        console.log(`No annotations found in ${filePath}`);
        return;
      }

      for (const ref of refs) {
        const attrsStr = Object.entries(ref.attrs)
          .map(([k, v]) => `${k}=${v}`)
          .join(" ");
        console.log(`  L${ref.line}: @trace[${ref.kind}${attrsStr ? " " + attrsStr : ""}]`);
      }
    });

  program
    .command("validate")
    .description("Check referential integrity")
    .requiredOption("--docs <dir>", "Path to docs directory")
    .option("--src <dirs...>", "Paths to source directories", [])
    .action(async (opts) => {
      const docsDir = resolve(opts.docs);
      const srcDirs = (opts.src as string[]).map((d: string) => resolve(d));
      const index = await getSpecIndex(docsDir, srcDirs);
      const issues = validateSpecIndex(index);

      if (issues.length === 0) {
        console.log("No issues found.");
        return;
      }

      for (const issue of issues) {
        console.log(`[${issue.type}] ${issue.filePath}:${issue.line} — ${issue.message}`);
      }
      process.exitCode = 1;
    });

  return program;
}
