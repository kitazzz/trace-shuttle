import { ESLintUtils } from "@typescript-eslint/utils";
import {
  isBusinessLikeCondition,
  describeCondition,
} from "../utils/branch-detection.js";
import { getAnnotationsBefore } from "../utils/comment-utils.js";

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/spec-shuttle/spec-shuttle#${name}`,
);

export const requireSpecRefOnBusinessBranch = createRule({
  name: "require-spec-ref-on-business-branch",
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Require @impl or @needs-human-review annotation on business logic branches",
    },
    messages: {
      missingSpecRef: `This branch at line {{line}} appears to contain business logic (condition: \`{{conditionText}}\`), but has no spec annotation.

Required fix:
1. Find the matching spec ID from your docs/ directory.
2. Add \`/* @impl <spec-id> */\` above this branch.
3. If no matching spec exists, add \`/* @needs-human-review */\` instead.`,
    },
    schema: [
      {
        type: "object",
        properties: {
          businessProperties: {
            type: "array",
            items: { type: "string" },
          },
          businessPrefixes: {
            type: "array",
            items: { type: "string" },
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [{}],
  create(context) {
    const options = context.options[0] ?? {};
    const sourceCode = context.sourceCode;

    function checkBranch(
      node:
        | import("@typescript-eslint/utils").TSESTree.IfStatement
        | import("@typescript-eslint/utils").TSESTree.SwitchStatement,
    ): void {
      const condition =
        node.type === "IfStatement" ? node.test : node.discriminant;

      if (!isBusinessLikeCondition(condition, options)) {
        return;
      }

      const annotations = getAnnotationsBefore(sourceCode, node);
      const hasAnchor = annotations.some(
        (a) => a.type === "impl" || a.type === "needs-human-review",
      );

      if (!hasAnchor) {
        context.report({
          node,
          messageId: "missingSpecRef",
          data: {
            line: String(node.loc.start.line),
            conditionText: describeCondition(condition),
          },
        });
      }
    }

    return {
      IfStatement: checkBranch,
      SwitchStatement: checkBranch,
    };
  },
});
