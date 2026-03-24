import { RuleTester } from "@typescript-eslint/rule-tester";
import { describe, it, afterAll, beforeEach } from "vitest";
import { specRefMustExist } from "../spec-ref-must-exist.js";
import { setSpecIndexSync } from "../../utils/spec-index-accessor.js";

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester();

// Set up a mock spec index before tests
beforeEach(() => {
  setSpecIndexSync({
    requirements: [],
    specs: [
      {
        id: "SPEC-001",
        requirementId: "REQ-001",
        filePath: "docs/test.md",
        line: 1,
        rawText: "",
      },
    ],
    implRefs: [],
    testRefs: [],
    decisionRefs: [],
  });
});

ruleTester.run("spec-ref-must-exist", specRefMustExist, {
  valid: [
    {
      name: "@impl with existing spec ID",
      code: `// @impl SPEC-001\nconst x = 1;`,
    },
    {
      name: "no @impl annotations at all",
      code: `const x = 1;`,
    },
  ],
  invalid: [
    {
      name: "@impl with non-existing spec ID",
      code: `// @impl SPEC-999\nconst x = 1;`,
      errors: [{ messageId: "unknownSpec" }],
    },
  ],
});
