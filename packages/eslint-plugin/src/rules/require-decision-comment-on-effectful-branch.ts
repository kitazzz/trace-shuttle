import { ESLintUtils, AST_NODE_TYPES } from "@typescript-eslint/utils";
import type { TSESTree } from "@typescript-eslint/utils";
import { isEffectfulCall, describeEffect } from "../utils/effect-detection.js";
import { getAnnotationsBefore } from "../utils/comment-utils.js";

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/spec-shuttle/spec-shuttle#${name}`,
);

export const requireDecisionCommentOnEffectfulBranch = createRule({
  name: "require-decision-comment-on-effectful-branch",
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Require @decision or @impl on branches containing side-effectful calls",
    },
    messages: {
      missingDecision: `Side-effectful call \`{{effectName}}\` at line {{line}} is inside a branch without a @decision or @impl annotation.

Required fix:
1. Add \`/* @decision <spec-id> <rationale> */\` above the enclosing branch.
2. Or add \`/* @impl <spec-id> */\` if this effect is part of a spec.`,
    },
    schema: [
      {
        type: "object",
        properties: {
          effectPatterns: {
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

    return {
      CallExpression(node: TSESTree.CallExpression): void {
        if (!isEffectfulCall(node, options)) return;

        // Walk up to find enclosing IfStatement or SwitchStatement
        const branch = findEnclosingBranch(node);
        if (!branch) return;

        const annotations = getAnnotationsBefore(sourceCode, branch);
        const hasAnchor = annotations.some(
          (a) =>
            a.type === "decision" ||
            a.type === "impl" ||
            a.type === "needs-human-review",
        );

        if (!hasAnchor) {
          context.report({
            node,
            messageId: "missingDecision",
            data: {
              effectName: describeEffect(node),
              line: String(node.loc.start.line),
            },
          });
        }
      },
    };
  },
});

function findEnclosingBranch(
  node: TSESTree.Node,
): TSESTree.IfStatement | TSESTree.SwitchStatement | null {
  let current: TSESTree.Node | undefined = node.parent;
  while (current) {
    if (
      current.type === AST_NODE_TYPES.IfStatement ||
      current.type === AST_NODE_TYPES.SwitchStatement
    ) {
      return current;
    }
    current = current.parent;
  }
  return null;
}
