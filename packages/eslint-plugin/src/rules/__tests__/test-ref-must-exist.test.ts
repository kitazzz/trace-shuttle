import { RuleTester } from "@typescript-eslint/rule-tester";
import { describe, it, afterAll, beforeEach } from "vitest";
import { testRefMustExist } from "../test-ref-must-exist.js";
import { setSpecIndexSync } from "../../utils/spec-index-accessor.js";

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester();

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

ruleTester.run("test-ref-must-exist", testRefMustExist, {
  valid: [
    {
      name: "@test with existing spec ID",
      code: `// @test SPEC-001\nconst x = 1;`,
    },
    {
      name: "no @test annotations at all",
      code: `const x = 1;`,
    },
  ],
  invalid: [
    {
      name: "@test with non-existing spec ID",
      code: `// @test SPEC-999\nconst x = 1;`,
      errors: [{ messageId: "unknownSpec" }],
    },
  ],
});
