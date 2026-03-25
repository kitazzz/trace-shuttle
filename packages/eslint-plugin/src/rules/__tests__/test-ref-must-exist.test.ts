import { RuleTester } from "@typescript-eslint/rule-tester";
import { describe, it, afterAll, beforeEach } from "vitest";
import { testRefMustExist } from "../test-ref-must-exist.js";
import { setSpecIndexSync } from "../../utils/spec-index-accessor.js";
import type { IndexedSpecIndex } from "@trace-shuttle/core";

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester();

beforeEach(() => {
  const index: IndexedSpecIndex = {
    requirements: new Map(),
    specs: new Map([
      [
        "SPEC-001",
        {
          id: "SPEC-001",
          requirementId: "REQ-001",
          filePath: "docs/test.md",
          line: 1,
          rawText: "",
        },
      ],
    ]),
    specsByRequirement: new Map(),
    implsBySpec: new Map(),
    testsBySpec: new Map(),
    refsByFile: new Map(),
    allNodes: [],
  };
  setSpecIndexSync(index);
});

ruleTester.run("test-ref-must-exist", testRefMustExist, {
  valid: [
    {
      name: "@trace[test] with existing spec ID",
      code: `// @trace[test spec=SPEC-001]\nconst x = 1;`,
    },
    {
      name: "no annotations at all",
      code: `const x = 1;`,
    },
  ],
  invalid: [
    {
      name: "@trace[test] with non-existing spec ID",
      code: `// @trace[test spec=SPEC-999]\nconst x = 1;`,
      errors: [{ messageId: "unknownSpec" }],
    },
  ],
});
