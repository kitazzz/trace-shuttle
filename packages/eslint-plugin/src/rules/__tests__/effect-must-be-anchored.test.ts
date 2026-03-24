import { RuleTester } from "@typescript-eslint/rule-tester";
import { describe, it, afterAll } from "vitest";
import { effectMustBeAnchored } from "../effect-must-be-anchored.js";

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester();

ruleTester.run("effect-must-be-anchored", effectMustBeAnchored, {
  valid: [
    {
      name: "effectful call with direct @impl annotation",
      code: `
/* @impl SPEC-001 */
db.save(record);
`,
    },
    {
      name: "effectful call inside anchored branch",
      code: `
/* @impl SPEC-001 */
if (valid) {
  db.save(record);
}
`,
    },
    {
      name: "effectful call with @needs-human-review",
      code: `
/* @needs-human-review */
db.delete(record);
`,
    },
    {
      name: "non-effectful call needs no annotation",
      code: `
console.log("hello");
`,
    },
    {
      name: "effectful call with @decision",
      code: `
/* @decision SPEC-001 persist for audit */
db.save(record);
`,
    },
  ],
  invalid: [
    {
      name: "unanchored effectful call",
      code: `
db.save(record);
`,
      errors: [{ messageId: "unanchoredEffect" }],
    },
    {
      name: "effectful call in unanchored branch",
      code: `
if (valid) {
  db.save(record);
}
`,
      errors: [{ messageId: "unanchoredEffect" }],
    },
    {
      name: "fetch call without anchor",
      code: `
fetch("/api/data");
`,
      errors: [{ messageId: "unanchoredEffect" }],
    },
  ],
});
