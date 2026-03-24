import { ESLintUtils } from "@typescript-eslint/utils";
import { getAllAnnotations } from "../utils/comment-utils.js";
import { getSpecIndexSync } from "../utils/spec-index-accessor.js";

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/spec-shuttle/spec-shuttle#${name}`,
);

export const testRefMustExist = createRule({
  name: "test-ref-must-exist",
  meta: {
    type: "problem",
    docs: {
      description: "Ensure @trace[test] references point to existing spec IDs",
    },
    messages: {
      unknownSpec: `@trace[test] references unknown spec "{{specId}}". Check your docs/ directory for valid spec IDs.`,
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.sourceCode;

    return {
      Program(): void {
        const specIndex = getSpecIndexSync();
        const specIds = specIndex.specs;

        const annotations = getAllAnnotations(sourceCode);
        for (const annotation of annotations) {
          if (annotation.type === "test" && annotation.specId) {
            if (!specIds.has(annotation.specId)) {
              const allComments = sourceCode.getAllComments();
              const comment = allComments.find(
                (c) => c.loc.start.line === annotation.line,
              );
              if (comment) {
                context.report({
                  loc: comment.loc,
                  messageId: "unknownSpec",
                  data: { specId: annotation.specId },
                });
              }
            }
          }
        }
      },
    };
  },
});
