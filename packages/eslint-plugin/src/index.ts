import { getSpecIndex } from "@trace-shuttle/core";
import tsParser from "@typescript-eslint/parser";
import { resolve } from "node:path";
import { requireSpecRefOnBusinessBranch } from "./rules/require-spec-ref-on-business-branch.js";
import { specRefMustExist } from "./rules/spec-ref-must-exist.js";
import { testRefMustExist } from "./rules/test-ref-must-exist.js";
import { effectMustBeAnchored } from "./rules/effect-must-be-anchored.js";
import { setSpecIndexSync } from "./utils/spec-index-accessor.js";

export { setSpecIndexSync, getSpecIndexSync } from "./utils/spec-index-accessor.js";

const rules = {
  "require-spec-ref-on-business-branch": requireSpecRefOnBusinessBranch,
  "spec-ref-must-exist": specRefMustExist,
  "test-ref-must-exist": testRefMustExist,
  "effect-must-be-anchored": effectMustBeAnchored,
};

const plugin = {
  meta: {
    name: "@trace-shuttle/eslint-plugin",
    version: "0.1.0",
  },
  rules,
  configs: {} as Record<string, import("@typescript-eslint/utils/ts-eslint").FlatConfig.Config>,
};

// Define recommended config after plugin object exists (self-referencing)
plugin.configs.recommended = {
  plugins: {
    "trace-shuttle": plugin as unknown as Record<string, import("@typescript-eslint/utils/ts-eslint").AnyRuleModule>,
  },
  rules: {
    "trace-shuttle/require-spec-ref-on-business-branch": "warn",
    "trace-shuttle/spec-ref-must-exist": "error",
    "trace-shuttle/test-ref-must-exist": "error",
    "trace-shuttle/effect-must-be-anchored": "warn",
  },
};

export interface CreateShuttleConfigOptions {
  files: string[];
  docsDir: string;
  srcDirs: string[];
}

export async function createShuttleConfig(
  options: CreateShuttleConfigOptions,
): Promise<import("@typescript-eslint/utils/ts-eslint").FlatConfig.Config[]> {
  const docsDir = resolve(options.docsDir);
  const srcDirs = options.srcDirs.map((dir) => resolve(dir));
  const index = await getSpecIndex(docsDir, srcDirs);
  setSpecIndexSync(index);

  return [
    {
      files: options.files,
      ...plugin.configs.recommended,
      languageOptions: {
        parser: tsParser,
        sourceType: "module",
        ecmaVersion: "latest",
      },
      settings: {
        "trace-shuttle/docsDir": docsDir,
        "trace-shuttle/srcDirs": srcDirs,
      },
    },
  ];
}

export default plugin;
export { plugin };
export { rules };
