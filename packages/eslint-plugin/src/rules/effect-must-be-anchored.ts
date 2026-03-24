import { ESLintUtils, AST_NODE_TYPES } from "@typescript-eslint/utils";
import type { TSESTree } from "@typescript-eslint/utils";
import { isEffectfulCall, describeEffect } from "../utils/effect-detection.js";
import { getAnnotationsBefore } from "../utils/comment-utils.js";

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/spec-shuttle/spec-shuttle#${name}`,
);

export const effectMustBeAnchored = createRule({
  name: "effect-must-be-anchored",
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Side-effectful calls must be inside an anchored branch or have a direct annotation",
    },
    messages: {
      unanchoredEffect: `Side-effectful call \`{{effectName}}\` at line {{line}} is not anchored to any spec.

Required fix:
1. Add \`/* @trace[impl spec=<spec-id>] */\` above this call or its enclosing branch.
2. Or add \`/* @trace[needs-review] */\` if no spec exists yet.`,
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

        // Check direct annotations on the call's expression statement
        const exprStmt = getExpressionStatement(node);
        if (exprStmt) {
          const directAnnotations = getAnnotationsBefore(sourceCode, exprStmt);
          if (
            directAnnotations.some(
              (a) =>
                a.type === "impl" ||
                a.type === "needs-review",
            )
          ) {
            return;
          }
        }

        // Check enclosing branches for anchors
        if (hasAnchoredAncestor(node, sourceCode)) return;

        context.report({
          node,
          messageId: "unanchoredEffect",
          data: {
            effectName: describeEffect(node),
            line: String(node.loc.start.line),
          },
        });
      },
    };
  },
});

function getExpressionStatement(
  node: TSESTree.Node,
): TSESTree.ExpressionStatement | null {
  if (node.parent?.type === AST_NODE_TYPES.ExpressionStatement) {
    return node.parent;
  }
  // Handle await expression: `await fetch(...)`
  if (
    node.parent?.type === AST_NODE_TYPES.AwaitExpression &&
    node.parent.parent?.type === AST_NODE_TYPES.ExpressionStatement
  ) {
    return node.parent.parent;
  }
  return null;
}

function hasAnchoredAncestor(
  node: TSESTree.Node,
  sourceCode: import("@typescript-eslint/utils/ts-eslint").SourceCode,
): boolean {
  let current: TSESTree.Node | undefined = node.parent;
  while (current) {
    if (
      current.type === AST_NODE_TYPES.IfStatement ||
      current.type === AST_NODE_TYPES.SwitchStatement
    ) {
      const annotations = getAnnotationsBefore(sourceCode, current);
      if (
        annotations.some(
          (a) =>
            a.type === "impl" ||
            a.type === "needs-review",
        )
      ) {
        return true;
      }
    }
    current = current.parent;
  }
  return false;
}
