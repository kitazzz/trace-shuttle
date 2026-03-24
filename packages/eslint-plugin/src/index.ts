import { requireSpecRefOnBusinessBranch } from "./rules/require-spec-ref-on-business-branch.js";
import { requireDecisionCommentOnEffectfulBranch } from "./rules/require-decision-comment-on-effectful-branch.js";
import { specRefMustExist } from "./rules/spec-ref-must-exist.js";
import { testRefMustExist } from "./rules/test-ref-must-exist.js";
import { effectMustBeAnchored } from "./rules/effect-must-be-anchored.js";

export { setSpecIndexSync, getSpecIndexSync } from "./utils/spec-index-accessor.js";

const rules = {
  "require-spec-ref-on-business-branch": requireSpecRefOnBusinessBranch,
  "require-decision-comment-on-effectful-branch":
    requireDecisionCommentOnEffectfulBranch,
  "spec-ref-must-exist": specRefMustExist,
  "test-ref-must-exist": testRefMustExist,
  "effect-must-be-anchored": effectMustBeAnchored,
};

const plugin = {
  meta: {
    name: "@spec-shuttle/eslint-plugin",
    version: "0.1.0",
  },
  rules,
  configs: {} as Record<string, import("@typescript-eslint/utils/ts-eslint").FlatConfig.Config>,
};

// Define recommended config after plugin object exists (self-referencing)
plugin.configs.recommended = {
  plugins: {
    shuttle: plugin as unknown as Record<string, import("@typescript-eslint/utils/ts-eslint").AnyRuleModule>,
  },
  rules: {
    "shuttle/require-spec-ref-on-business-branch": "warn",
    "shuttle/require-decision-comment-on-effectful-branch": "warn",
    "shuttle/spec-ref-must-exist": "error",
    "shuttle/test-ref-must-exist": "error",
    "shuttle/effect-must-be-anchored": "warn",
  },
};

export default plugin;
export { rules };
