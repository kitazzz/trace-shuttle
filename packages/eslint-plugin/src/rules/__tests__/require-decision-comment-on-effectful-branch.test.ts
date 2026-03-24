import { RuleTester } from "@typescript-eslint/rule-tester";
import { describe, it, afterAll } from "vitest";
import { requireDecisionCommentOnEffectfulBranch } from "../require-decision-comment-on-effectful-branch.js";

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester();

ruleTester.run(
  "require-decision-comment-on-effectful-branch",
  requireDecisionCommentOnEffectfulBranch,
  {
    valid: [
      {
        name: "effectful call in branch with @decision",
        code: `
/* @decision SPEC-001 must persist for audit */
if (valid) {
  db.save(record);
}
`,
      },
      {
        name: "effectful call in branch with @impl",
        code: `
/* @impl SPEC-002 */
if (eligible) {
  api.post(data);
}
`,
      },
      {
        name: "effectful call outside a branch (not in scope)",
        code: `
db.save(record);
`,
      },
      {
        name: "non-effectful call in branch (no annotation needed)",
        code: `
if (valid) {
  console.log("ok");
}
`,
      },
      {
        name: "@needs-human-review escape hatch",
        code: `
/* @needs-human-review */
if (valid) {
  db.delete(record);
}
`,
      },
    ],
    invalid: [
      {
        name: "effectful call in branch without annotation",
        code: `
if (valid) {
  db.save(record);
}
`,
        errors: [{ messageId: "missingDecision" }],
      },
      {
        name: "delete call in branch without annotation",
        code: `
if (shouldRemove) {
  db.delete(item);
}
`,
        errors: [{ messageId: "missingDecision" }],
      },
    ],
  },
);
