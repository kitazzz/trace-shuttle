import { Command } from "commander";
import { resolve } from "node:path";
import { aggregate } from "./aggregator.js";
import { formatJson } from "./formatters/json.js";
import { formatMarkdown } from "./formatters/markdown.js";

const program = new Command();

program
  .name("spec-shuttle")
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

program.parse();
