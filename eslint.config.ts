import shuttle from "@spec-shuttle/eslint-plugin";
import { resolve } from "node:path";

export default [
  {
    files: ["examples/scenarios/simple/src/**/*.ts"],
    ...shuttle.configs.recommended,
    settings: {
      "shuttle/docsDir": resolve("examples/scenarios/simple/docs"),
      "shuttle/srcDirs": [resolve("examples/scenarios/simple/src")],
    },
  },
];
