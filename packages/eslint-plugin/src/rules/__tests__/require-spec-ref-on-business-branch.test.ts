import { RuleTester } from "@typescript-eslint/rule-tester";
import { describe, it, afterAll } from "vitest";
import { requireSpecRefOnBusinessBranch } from "../require-spec-ref-on-business-branch.js";

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester();

ruleTester.run(
  "require-spec-ref-on-business-branch",
  requireSpecRefOnBusinessBranch,
  {
    valid: [
      {
        name: "@trace[impl] annotation present on business branch",
        code: `
/* @trace[impl spec=SPEC-001] */
if (user.role === "admin") {
  doSomething();
}
`,
      },
      {
        name: "@trace[needs-review] present on business branch",
        code: `
/* @trace[needs-review] */
if (user.status === "active") {
  activate();
}
`,
      },
      {
        name: "non-business condition (null check) - no annotation needed",
        code: `
if (user != null) {
  doSomething();
}
`,
      },
      {
        name: "non-business condition (array length) - no annotation needed",
        code: `
if (items.length > 0) {
  process();
}
`,
      },
      {
        name: "@trace[impl] on switch statement",
        code: `
/* @trace[impl spec=SPEC-002] */
switch (user.tier) {
  case "gold": break;
  case "silver": break;
}
`,
      },
    ],
    invalid: [
      {
        name: "business branch without annotation (user.role)",
        code: `
if (user.role === "admin") {
  doSomething();
}
`,
        errors: [{ messageId: "missingSpecRef" }],
      },
      {
        name: "business branch without annotation (user.status)",
        code: `
if (user.status === "active") {
  activate();
}
`,
        errors: [{ messageId: "missingSpecRef" }],
      },
      {
        name: "switch on business property without annotation",
        code: `
switch (user.tier) {
  case "gold": break;
  case "silver": break;
}
`,
        errors: [{ messageId: "missingSpecRef" }],
      },
      {
        name: "business predicate call without annotation",
        code: `
if (isEligible(user)) {
  approve();
}
`,
        errors: [{ messageId: "missingSpecRef" }],
      },
    ],
  },
);
