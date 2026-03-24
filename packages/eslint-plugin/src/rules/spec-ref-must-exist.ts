import { ESLintUtils } from "@typescript-eslint/utils";
import { getAllAnnotations } from "../utils/comment-utils.js";
import { getSpecIndexSync } from "../utils/spec-index-accessor.js";

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/spec-shuttle/spec-shuttle#${name}`,
);

export const specRefMustExist = createRule({
  name: "spec-ref-must-exist",
  meta: {
    type: "problem",
    docs: {
      description: "Ensure @impl references point to existing spec IDs",
    },
    messages: {
      unknownSpec: `@impl references unknown spec "{{specId}}". Check your docs/ directory for valid spec IDs.`,
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.sourceCode;

    return {
      Program(): void {
        const specIndex = getSpecIndexSync();
        const specIds = new Set(specIndex.specs.map((s) => s.id));

        const annotations = getAllAnnotations(sourceCode);
        for (const annotation of annotations) {
          if (annotation.type === "impl" && annotation.specId) {
            if (!specIds.has(annotation.specId)) {
              // Report on the comment location
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
